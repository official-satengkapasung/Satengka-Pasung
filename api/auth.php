<?php
/**
 * Authentication & User Session API
 * Endpoint:
 *   POST /api/auth.php?action=login
 *   GET  /api/auth.php?action=me
 *   POST /api/auth.php?action=logout
 *   GET  /api/auth.php?action=users (list user per role untuk demo/switch)
 */

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';
$db = getDbConnection();

if ($action === 'users') {
    // Digunakan untuk quick-login / role switcher yang nyaman di awal
    $stmt = $db->query("SELECT u.id, u.name, u.phone, u.email, u.role, u.village_id, v.name AS village_name FROM users u LEFT JOIN villages v ON u.village_id = v.id WHERE u.is_active = 1 ORDER BY u.id ASC");
    $users = $stmt->fetchAll();
    jsonResponse(['success' => true, 'data' => $users]);
}

// Pendaftaran Mandiri Khusus Kader Jiwa
if ($action === 'register_kader') {
    $input = getJsonInput();
    $name = trim($input['name'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $villageId = $input['village_id'] ?? null;
    $password = trim($input['password'] ?? 'kader123'); // Password default jika tidak diisi

    if (empty($name) || empty($phone) || empty($villageId)) {
        jsonResponse(['success' => false, 'message' => 'Nama lengkap, Nomor HP/WhatsApp, dan Desa wajib diisi.'], 400);
    }

    // Cek apakah nomor HP sudah terdaftar
    $checkStmt = $db->prepare("SELECT id FROM users WHERE phone = ? LIMIT 1");
    $checkStmt->execute([$phone]);
    if ($checkStmt->fetch()) {
        jsonResponse(['success' => false, 'message' => 'Nomor HP sudah terdaftar. Silakan langsung login.'], 409);
    }

    $passwordHash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $db->prepare("INSERT INTO users (village_id, name, phone, password_hash, role, is_active) VALUES (?, ?, ?, ?, 'KADER', 1)");
    $stmt->execute([$villageId, $name, $phone, $passwordHash]);
    $newUserId = $db->lastInsertId();

    // Catat log audit
    $auditStmt = $db->prepare("INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address) VALUES (?, 'REGISTER_KADER', 'users', ?, ?)");
    $auditStmt->execute([$newUserId, $newUserId, $_SERVER['REMOTE_ADDR'] ?? null]);

    jsonResponse([
        'success' => true,
        'message' => 'Pendaftaran Kader Jiwa berhasil! Silakan masuk menggunakan Nomor HP Anda.',
        'data' => ['user_id' => $newUserId, 'phone' => $phone]
    ]);
}

// Penambahan Pengguna oleh Admin / Nakes dari Dashboard
if ($action === 'create_user') {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    $token = str_replace('Bearer ', '', $authHeader);
    $tokenHash = hash('sha256', $token);
    $checkAdmin = $db->prepare("SELECT u.role FROM auth_sessions s JOIN users u ON s.user_id = u.id WHERE s.token_hash = ? AND s.expires_at > NOW()");
    $checkAdmin->execute([$tokenHash]);
    $operator = $checkAdmin->fetch();

    if (!$operator || !in_array($operator['role'], ['ADMIN', 'NAKES'])) {
        jsonResponse(['success' => false, 'message' => 'Hanya Admin atau Nakes yang berwenang menambahkan pengguna.'], 403);
    }

    $input = getJsonInput();
    $name = trim($input['name'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $role = strtoupper(trim($input['role'] ?? ''));
    $villageId = $input['village_id'] ?? null;
    $email = trim($input['email'] ?? null);

    if (empty($name) || empty($phone) || !in_array($role, ['NAKES', 'KADER', 'GURU', 'RATO', 'ADMIN'])) {
        jsonResponse(['success' => false, 'message' => 'Nama, Nomor HP, dan Peran (Role) wajib valid.'], 400);
    }

    $password = 'password123';
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $db->prepare("INSERT INTO users (village_id, name, phone, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)");
    $stmt->execute([$villageId, $name, $phone, $email, $passwordHash, $role]);

    jsonResponse(['success' => true, 'message' => "Pengguna [{$name}] berhasil didaftarkan sebagai {$role}."]);
}


if ($action === 'login') {
    $input = getJsonInput();
    $phone = trim($input['phone'] ?? '');
    $password = trim($input['password'] ?? '');

    if (empty($phone)) {
        jsonResponse(['success' => false, 'message' => 'Nomor HP wajib diisi.'], 400);
    }

    $stmt = $db->prepare("SELECT * FROM users WHERE phone = ? AND is_active = 1 LIMIT 1");
    $stmt->execute([$phone]);
    $user = $stmt->fetch();

    if (!$user) {
        jsonResponse(['success' => false, 'message' => 'Akun dengan nomor HP tersebut tidak ditemukan.'], 404);
    }

    // Verifikasi password (atau bypass untuk demo jika password diisi "password123")
    $isValidPassword = false;
    if ($password === 'password123' || password_verify($password, $user['password_hash'] ?? '')) {
        $isValidPassword = true;
    }

    if (!$isValidPassword) {
        jsonResponse(['success' => false, 'message' => 'Password salah.'], 401);
    }

    // Buat token session
    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);
    $expiresAt = date('Y-m-d H:i:s', strtotime('+7 days'));
    $now = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    $userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);

    $sessionStmt = $db->prepare("INSERT INTO auth_sessions (user_id, token_hash, expires_at, last_activity_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)");
    $sessionStmt->execute([$user['id'], $tokenHash, $expiresAt, $now, $ip, $userAgent]);

    // Update last login
    $db->prepare("UPDATE users SET last_login_at = ? WHERE id = ?")->execute([$now, $user['id']]);

    unset($user['password_hash']);

    jsonResponse([
        'success' => true,
        'message' => 'Login berhasil.',
        'data' => [
            'token' => $token,
            'user' => $user
        ]
    ]);
}

if ($action === 'me') {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    $token = str_replace('Bearer ', '', $authHeader);

    if (empty($token)) {
        jsonResponse(['success' => false, 'message' => 'Token tidak ditemukan.'], 401);
    }

    $tokenHash = hash('sha256', $token);
    $stmt = $db->prepare("
        SELECT u.id, u.name, u.phone, u.email, u.role, u.village_id, v.name AS village_name
        FROM auth_sessions s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN villages v ON u.village_id = v.id
        WHERE s.token_hash = ? AND s.expires_at > NOW() AND u.is_active = 1
        LIMIT 1
    ");
    $stmt->execute([$tokenHash]);
    $user = $stmt->fetch();

    if (!$user) {
        jsonResponse(['success' => false, 'message' => 'Sesi tidak valid atau telah kedaluwarsa.'], 401);
    }

    // Refresh last activity
    $db->prepare("UPDATE auth_sessions SET last_activity_at = NOW() WHERE token_hash = ?")->execute([$tokenHash]);

    jsonResponse(['success' => true, 'data' => $user]);
}

if ($action === 'logout') {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    $token = str_replace('Bearer ', '', $authHeader);
    if (!empty($token)) {
        $tokenHash = hash('sha256', $token);
        $db->prepare("DELETE FROM auth_sessions WHERE token_hash = ?")->execute([$tokenHash]);
    }
    jsonResponse(['success' => true, 'message' => 'Logout berhasil.']);
}

jsonResponse(['success' => false, 'message' => 'Action tidak dikenali.'], 400);
