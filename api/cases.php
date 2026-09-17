<?php
/**
 * Reports & Cases Management API
 * Endpoint for NAKES, KADER, GURU, RATO
 */

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';
$db = getDbConnection();

// Helper verifikasi token sederhana
function authenticateUser($db) {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = str_replace('Bearer ', '', $authHeader);
    if (empty($token)) {
        $token = $_GET['token'] ?? '';
    }
    if (empty($token)) {
        return null;
    }
    $tokenHash = hash('sha256', $token);
    $stmt = $db->prepare("
        SELECT u.* FROM auth_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token_hash = ? AND s.expires_at > NOW() AND u.is_active = 1
        LIMIT 1
    ");
    $stmt->execute([$tokenHash]);
    $user = $stmt->fetch();
    if ($user) return $user;

    // Fallback: jika token demo atau user id ada di header
    $userId = $headers['X-User-Id'] ?? $headers['x-user-id'] ?? $_GET['user_id'] ?? null;
    if ($userId) {
        $uStmt = $db->prepare("SELECT * FROM users WHERE id = ? AND is_active = 1 LIMIT 1");
        $uStmt->execute([$userId]);
        return $uStmt->fetch() ?: null;
    }

    return null;
}

// -------------------------------------------------------------
// GET /api/cases.php?action=villages
// -------------------------------------------------------------
if ($action === 'villages') {
    $stmt = $db->query("SELECT * FROM villages WHERE is_active = 1 ORDER BY name ASC");
    jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
}

// -------------------------------------------------------------
// GET /api/cases.php?action=figures&village_id=1
// Mengambil data Guru (Kiai) & Rato (Kades) untuk rekomendasi Siaga EWS
// -------------------------------------------------------------
if ($action === 'figures') {
    $villageId = $_GET['village_id'] ?? null;
    $query = "SELECT id, name, phone, role, village_id FROM users WHERE role IN ('GURU', 'RATO') AND is_active = 1";
    $params = [];
    if ($villageId) {
        $query .= " AND (village_id = ? OR village_id IS NULL)";
        $params[] = $villageId;
    }
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
}

// -------------------------------------------------------------
// POST /api/cases.php?action=create_report (Form Kader)
// -------------------------------------------------------------
if ($action === 'create_report') {
    $user = authenticateUser($db);
    if (!$user) {
        jsonResponse(['success' => false, 'message' => 'Silakan login terlebih dahulu.'], 401);
    }

    $input = getJsonInput();
    $patientName = trim($input['patient_name'] ?? '');
    $address = trim($input['address'] ?? '');
    $villageId = $input['village_id'] ?? $user['village_id'] ?? 1;
    $reportType = $input['report_type'] ?? 'PASUNG_BARU';
    $description = trim($input['description'] ?? '');
    $latitude = $input['latitude'] ?? null;
    $longitude = $input['longitude'] ?? null;
    $photoBase64 = $input['photo_base64'] ?? null;

    if (empty($patientName) || empty($address)) {
        jsonResponse(['success' => false, 'message' => 'Nama pasien dan alamat wajib diisi.'], 400);
    }

    // Generate Nomor Laporan: LAP-YYYYMMDD-XXXX
    $datePart = date('Ymd');
    $countStmt = $db->query("SELECT COUNT(*) AS total FROM reports");
    $nextSeq = str_pad((int)$countStmt->fetch()['total'] + 1, 3, '0', STR_PAD_LEFT);
    $reportNumber = "LAP-{$datePart}-{$nextSeq}";

    $stmt = $db->prepare("
        INSERT INTO reports (report_number, reporter_id, village_id, patient_name_input, address_input, report_type, description, latitude, longitude, reported_at, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'NEW')
    ");
    $stmt->execute([$reportNumber, $user['id'], $villageId, $patientName, $address, $reportType, $description, $latitude, $longitude]);
    $reportId = $db->lastInsertId();

    // Simpan foto jika ada
    if (!empty($photoBase64)) {
        $uploadDir = __DIR__ . '/../uploads/reports/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        $fileName = "lap_{$reportId}_" . time() . ".jpg";
        $filePath = "uploads/reports/" . $fileName;
        $imageData = preg_replace('/^data:image\/\w+;base64,/', '', $photoBase64);
        file_put_contents(__DIR__ . '/../' . $filePath, base64_decode($imageData));

        $attStmt = $db->prepare("INSERT INTO report_attachments (report_id, file_name, file_path, mime_type, file_size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)");
        $attStmt->execute([$reportId, $fileName, $filePath, 'image/jpeg', strlen($imageData), $user['id']]);
    }

    jsonResponse([
        'success' => true,
        'message' => 'Laporan berhasil dikirim ke Puskesmas.',
        'data' => [
            'report_id' => $reportId,
            'report_number' => $reportNumber
        ]
    ]);
}

// -------------------------------------------------------------
// GET /api/cases.php?action=reports_list (Dashboard Nakes & Kader)
// -------------------------------------------------------------
if ($action === 'reports_list') {
    $reporterId = $_GET['reporter_id'] ?? null;
    $query = "
        SELECT r.*, u.name AS reporter_name, u.phone AS reporter_phone, v.name AS village_name,
               c.id AS case_id, c.case_number, c.status AS case_status,
               (SELECT file_path FROM report_attachments WHERE report_id = r.id LIMIT 1) AS photo_path
        FROM reports r
        JOIN users u ON r.reporter_id = u.id
        LEFT JOIN villages v ON r.village_id = v.id
        LEFT JOIN cases c ON c.report_id = r.id
    ";
    $params = [];
    if ($reporterId) {
        $query .= " WHERE r.reporter_id = ? ";
        $params[] = $reporterId;
    }
    $query .= " ORDER BY r.id DESC LIMIT 50 ";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
}

// -------------------------------------------------------------
// GET /api/cases.php?action=cases_list (Dashboard EWS Siaga)
// -------------------------------------------------------------
if ($action === 'cases_list') {
    $userId = $_GET['user_id'] ?? null;
    $role = $_GET['role'] ?? null;

    $query = "
        SELECT c.*, p.name AS patient_name, p.gender, p.address AS patient_address,
               r.report_number, r.latitude, r.longitude,
               v.name AS village_name,
               u.name AS nakes_name,
               (SELECT file_path FROM report_attachments WHERE report_id = r.id LIMIT 1) AS photo_path
        FROM cases c
        JOIN patients p ON c.patient_id = p.id
        JOIN reports r ON c.report_id = r.id
        LEFT JOIN villages v ON p.village_id = v.id
        LEFT JOIN users u ON c.assigned_nakes_id = u.id
    ";
    $params = [];

    if ($userId && in_array($role, ['GURU', 'RATO'])) {
        $query .= " JOIN case_participants cp_filter ON cp_filter.case_id = c.id AND cp_filter.user_id = ? ";
        $params[] = $userId;
    }

    $query .= " ORDER BY FIELD(c.status, 'SIAGA', 'COORDINATION', 'READY_FOR_EVACUATION', 'EVACUATION', 'REPORTED', 'VALIDATED', 'MONITORING', 'CLOSED') ASC, c.id DESC LIMIT 50";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $cases = $stmt->fetchAll();

    // Ambil partisipan Guru & Rato untuk tiap kasus
    foreach ($cases as &$case) {
        $pStmt = $db->prepare("
            SELECT cp.*, u.name, u.phone
            FROM case_participants cp
            JOIN users u ON cp.user_id = u.id
            WHERE cp.case_id = ?
        ");
        $pStmt->execute([$case['id']]);
        $case['participants'] = $pStmt->fetchAll();
    }

    jsonResponse(['success' => true, 'data' => $cases]);
}

// -------------------------------------------------------------
// POST /api/cases.php?action=activate_siaga (Aktivasi Tombol Siaga EWS oleh Nakes)
// -------------------------------------------------------------
if ($action === 'activate_siaga') {
    $user = authenticateUser($db);
    if (!$user || !in_array($user['role'], ['NAKES', 'ADMIN'])) {
        jsonResponse(['success' => false, 'message' => 'Hanya Nakes yang dapat mengaktifkan Tombol Siaga.'], 403);
    }

    $input = getJsonInput();
    $reportId = $input['report_id'] ?? null;
    $caseId = $input['case_id'] ?? null;
    $guruId = $input['guru_id'] ?? null;
    $ratoId = $input['rato_id'] ?? null;
    $notes = $input['notes'] ?? 'Aktivasi Siaga EWS via Tombol Siaga Nakes';

    // Jika dipicu dari laporan yang belum jadi kasus
    if ($reportId && !$caseId) {
        $repStmt = $db->prepare("SELECT * FROM reports WHERE id = ?");
        $repStmt->execute([$reportId]);
        $rep = $repStmt->fetch();
        if (!$rep) {
            jsonResponse(['success' => false, 'message' => 'Laporan tidak ditemukan.'], 404);
        }

        // Buat data pasien jika belum ada
        $patStmt = $db->prepare("INSERT INTO patients (village_id, name, gender, address, is_active) VALUES (?, ?, 'L', ?, 1)");
        $patStmt->execute([$rep['village_id'] ?: 1, $rep['patient_name_input'], $rep['address_input']]);
        $patientId = $db->lastInsertId();

        // Update laporan
        $db->prepare("UPDATE reports SET status = 'VALIDATED', validated_by = ?, validated_at = NOW(), patient_id = ? WHERE id = ?")
           ->execute([$user['id'], $patientId, $reportId]);

        // Buat kasus baru
        $datePart = date('Ymd');
        $cCount = $db->query("SELECT COUNT(*) AS total FROM cases")->fetch()['total'] + 1;
        $caseNumber = "CAS-{$datePart}-" . str_pad($cCount, 3, '0', STR_PAD_LEFT);

        $insCase = $db->prepare("
            INSERT INTO cases (case_number, report_id, patient_id, priority, status, activated_at, assigned_nakes_id, notes)
            VALUES (?, ?, ?, 'HIGH', 'SIAGA', NOW(), ?, ?)
        ");
        $insCase->execute([$caseNumber, $reportId, $patientId, $user['id'], $notes]);
        $caseId = $db->lastInsertId();
    } else {
        // Update kasus yang sudah ada ke SIAGA
        $db->prepare("UPDATE cases SET status = 'SIAGA', activated_at = NOW(), assigned_nakes_id = ? WHERE id = ?")
           ->execute([$user['id'], $caseId]);
    }

    // Catat histori status
    $db->prepare("INSERT INTO case_status_history (case_id, from_status, to_status, changed_by, note) VALUES (?, 'VALIDATED', 'SIAGA', ?, ?)")
       ->execute([$caseId, $user['id'], $notes]);

    // Daftarkan Partisipan Guru & Rato
    if ($guruId) {
        $db->prepare("INSERT INTO case_participants (case_id, user_id, participant_role, invited_at) VALUES (?, ?, 'GURU', NOW()) ON DUPLICATE KEY UPDATE invited_at = NOW()")
           ->execute([$caseId, $guruId]);
    }
    if ($ratoId) {
        $db->prepare("INSERT INTO case_participants (case_id, user_id, participant_role, invited_at) VALUES (?, ?, 'RATO', NOW()) ON DUPLICATE KEY UPDATE invited_at = NOW()")
           ->execute([$caseId, $ratoId]);
    }

    jsonResponse([
        'success' => true,
        'message' => 'Tombol Siaga EWS Berhasil Diaktifkan! Timer stopwatch evakuasi mulai berjalan.',
        'data' => ['case_id' => $caseId]
    ]);
}

// -------------------------------------------------------------
// POST /api/cases.php?action=respond_participant (Konfirmasi Guru/Rato)
// -------------------------------------------------------------
if ($action === 'respond_participant') {
    $user = authenticateUser($db);
    if (!$user) {
        jsonResponse(['success' => false, 'message' => 'Silakan login.'], 401);
    }

    $input = getJsonInput();
    $caseId = $input['case_id'] ?? null;
    $response = $input['response'] ?? 'AGREE'; // AGREE, READY, NEED_TIME
    $note = $input['note'] ?? '';

    $stmt = $db->prepare("
        UPDATE case_participants
        SET response = ?, response_note = ?, responded_at = NOW()
        WHERE case_id = ? AND user_id = ?
    ");
    $stmt->execute([$response, $note, $caseId, $user['id']]);

    // Cek apakah Guru & Rato sudah sama-sama siap
    $checkStmt = $db->prepare("SELECT response FROM case_participants WHERE case_id = ?");
    $checkStmt->execute([$caseId]);
    $allResponses = $checkStmt->fetchAll(PDO::FETCH_COLUMN);

    $readyCount = 0;
    foreach ($allResponses as $res) {
        if (in_array($res, ['AGREE', 'READY'])) {
            $readyCount++;
        }
    }

    // Jika keduanya sudah setuju/siap, otomatis status menjadi READY_FOR_EVACUATION
    if ($readyCount >= 2) {
        $db->prepare("UPDATE cases SET status = 'READY_FOR_EVACUATION' WHERE id = ?")->execute([$caseId]);
        $db->prepare("INSERT INTO case_status_history (case_id, from_status, to_status, changed_by, note) VALUES (?, 'SIAGA', 'READY_FOR_EVACUATION', ?, 'Pilar BGR lengkap dan siap evakuasi')")
           ->execute([$caseId, $user['id']]);
    }

    jsonResponse([
        'success' => true,
        'message' => 'Tanggapan berhasil dicatat.',
        'data' => ['ready_count' => $readyCount]
    ]);
}

// -------------------------------------------------------------
// POST /api/cases.php?action=update_status (Update alur oleh Nakes)
// -------------------------------------------------------------
if ($action === 'update_status') {
    $user = authenticateUser($db);
    if (!$user || !in_array($user['role'], ['NAKES', 'ADMIN'])) {
        jsonResponse(['success' => false, 'message' => 'Hanya Nakes yang dapat mengubah status evakuasi.'], 403);
    }

    $input = getJsonInput();
    $caseId = $input['case_id'] ?? null;
    $newStatus = $input['status'] ?? '';
    $note = $input['note'] ?? '';

    $caseStmt = $db->prepare("SELECT status FROM cases WHERE id = ?");
    $caseStmt->execute([$caseId]);
    $currentCase = $caseStmt->fetch();

    if (!$currentCase) {
        jsonResponse(['success' => false, 'message' => 'Kasus tidak ditemukan.'], 404);
    }

    $fromStatus = $currentCase['status'];

    $extraSql = "";
    if ($newStatus === 'EVACUATION') {
        // Catat di tabel evacuations
        $db->prepare("INSERT INTO evacuations (case_id, started_at, started_by, notes) VALUES (?, NOW(), ?, ?)")
           ->execute([$caseId, $user['id'], $note]);
    } else if ($newStatus === 'MONITORING' || $newStatus === 'CLOSED') {
        $extraSql = ", completed_at = NOW()";
        $db->prepare("UPDATE evacuations SET completed_at = NOW(), completed_by = ? WHERE case_id = ? AND completed_at IS NULL")
           ->execute([$user['id'], $caseId]);
    }

    $db->prepare("UPDATE cases SET status = ? {$extraSql} WHERE id = ?")->execute([$newStatus, $caseId]);
    $db->prepare("INSERT INTO case_status_history (case_id, from_status, to_status, changed_by, note) VALUES (?, ?, ?, ?, ?)")
       ->execute([$caseId, $fromStatus, $newStatus, $user['id'], $note]);

    jsonResponse(['success' => true, 'message' => "Status kasus berhasil diperbarui ke: {$newStatus}"]);
}

// -------------------------------------------------------------
// GET /api/cases.php?action=get_chats&case_id=1
// Mengambil riwayat pesan live chat terapeutik
// -------------------------------------------------------------
if ($action === 'get_chats') {
    $caseId = $_GET['case_id'] ?? null;
    $limit = (int)($_GET['limit'] ?? 50);

    $sql = "
        SELECT c.*, DATE_FORMAT(c.created_at, '%H:%i') AS time_formatted
        FROM therapeutic_chats c
    ";
    $params = [];
    if ($caseId) {
        $sql .= " WHERE c.case_id = ? OR c.case_id IS NULL ";
        $params[] = $caseId;
    }
    $sql .= " ORDER BY c.id ASC LIMIT {$limit} ";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
}

// -------------------------------------------------------------
// POST /api/cases.php?action=send_chat
// Mengirim pesan live chat terapeutik
// -------------------------------------------------------------
if ($action === 'send_chat') {
    $user = authenticateUser($db);
    $input = getJsonInput();

    $senderId = $user ? $user['id'] : ($input['sender_id'] ?? null);
    $senderName = $user ? $user['name'] : ($input['sender_name'] ?? 'Pengguna');
    $senderRole = $user ? $user['role'] : ($input['sender_role'] ?? 'KADER');
    $caseId = $input['case_id'] ?? null;
    $message = trim($input['message'] ?? '');
    $isTherapeutic = !empty($input['is_therapeutic_template']) ? 1 : 0;

    if (empty($message)) {
        jsonResponse(['success' => false, 'message' => 'Pesan tidak boleh kosong.'], 400);
    }
    if (!$senderId) {
        $senderId = 1; // Fallback admin/system jika demo belum tersimpan
    }

    $stmt = $db->prepare("
        INSERT INTO therapeutic_chats (case_id, sender_id, sender_name, sender_role, message, is_therapeutic_template, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$caseId, $senderId, $senderName, $senderRole, $message, $isTherapeutic]);
    $newId = $db->lastInsertId();

    jsonResponse([
        'success' => true,
        'message' => 'Pesan berhasil terkirim.',
        'data' => [
            'id' => $newId,
            'case_id' => $caseId,
            'sender_id' => $senderId,
            'sender_name' => $senderName,
            'sender_role' => $senderRole,
            'message' => $message,
            'is_therapeutic_template' => $isTherapeutic,
            'time_formatted' => date('H:i')
        ]
    ]);
}

jsonResponse(['success' => false, 'message' => 'Action tidak dikenali.'], 400);

