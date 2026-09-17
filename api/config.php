<?php
/**
 * Database Configuration & Connection (PDO)
 * Optimized for Rumahweb Entry / Small (MySQL / MariaDB)
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Konfigurasi Database (Sesuaikan dengan data cPanel Rumahweb)
define('DB_HOST', 'localhost');
define('DB_NAME', 'malekkas_ews');     // Ubah sesuai nama DB cPanel
define('DB_USER', 'root');             // Ubah sesuai DB user cPanel
define('DB_PASS', '');                 // Ubah sesuai DB password cPanel
define('DB_CHARSET', 'utf8mb4');

function getDbConnection() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            // Timeout cepat agar ramah NPROC & memori 512MB
            PDO::ATTR_TIMEOUT            => 5,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Koneksi Database Gagal: ' . $e->getMessage()
            ]);
            exit;
        }
    }
    return $pdo;
}

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?: [];
}
