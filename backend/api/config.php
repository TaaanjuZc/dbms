<?php
//  backend/api/config.php

define('DB_HOST',    'localhost');
define('DB_PORT',    3306);
define('DB_NAME',    'notown');
define('DB_USER',    'root');
define('DB_PASS',    '');
define('DB_CHARSET', 'utf8mb4');

define('UPLOAD_DIR', dirname(__DIR__) . '/uploads/');
define('MAX_FILE_SIZE', 100 * 1024 * 1024); // 100 MB
define('FREE_DOWNLOAD_LIMIT', 2);

define('ALLOWED_MIME', [
  'image/jpeg','image/png','image/gif','image/webp','image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain','text/html','text/css','text/javascript',
  'application/json','application/xml',
  'application/zip','application/x-rar-compressed',
  'application/x-tar','application/gzip',
  'application/x-ipynb+json',
]);

$allowed_origins = [
  'http://localhost',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (empty($origin) || in_array($origin, $allowed_origins) || str_contains($origin, 'infinityfreeapp.com') || str_contains($origin, 'xo.je')) {
  $send_origin = empty($origin) ? '*' : $origin;
} else {
  $send_origin = $origin; // allow all for now (tighten in production)
}

header("Access-Control-Allow-Origin: $send_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, Accept');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

function db(): PDO {
  static $pdo = null;
  if ($pdo === null) {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    try {
      $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
      ]);
    } catch (PDOException $e) {
      http_response_code(500);
      echo json_encode([
        'success' => false,
        'error'   => 'Database connection failed: ' . $e->getMessage()
      ]);
      exit;
    }
  }
  return $pdo;
}

function ok(array $d = []): void {
  echo json_encode(array_merge(['success' => true], $d));
  exit;
}

function err(string $msg, int $code = 400): void {
  http_response_code($code);
  echo json_encode(['success' => false, 'error' => $msg]);
  exit;
}

function require_auth(): array {
  sess();
  if (empty($_SESSION['user'])) {
    err('Authentication required.', 401);
  }
  return $_SESSION['user'];
}

function sess(): void {
  if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
      'lifetime' => 86400 * 7,  // 7 days
      'path'     => '/',
      'domain'   => '',
      'secure'   => false,      // false for localhost HTTP
      'httponly' => true,
      'samesite' => 'Lax',
    ]);
    session_start();
  }
}
