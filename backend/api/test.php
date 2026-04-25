<?php
// ── Quick connection test ─────────────────────────────────
// Visit: http://localhost/notown/backend/api/test.php
// Delete this file before going to production!
header('Content-Type: application/json');

$result = ['php' => PHP_VERSION, 'tests' => []];

// Test 1: DB connection
try {
  require_once __DIR__ . '/config.php';
  $pdo = db();
  $result['tests']['database'] = 'OK';
} catch (Exception $e) {
  $result['tests']['database'] = 'FAIL: ' . $e->getMessage();
}

// Test 2: departments table
try {
  $st = $pdo->query('SELECT COUNT(*) as c FROM departments');
  $row = $st->fetch();
  $result['tests']['departments'] = 'OK — ' . $row['c'] . ' rows';
} catch (Exception $e) {
  $result['tests']['departments'] = 'FAIL: ' . $e->getMessage();
}

// Test 3: uploads folder
$up = dirname(__DIR__) . '/uploads/';
$result['tests']['uploads_folder'] = is_dir($up) ? 'OK — exists' : 'MISSING — create the folder';
$result['tests']['uploads_writable'] = is_writable($up) ? 'OK — writable' : 'NOT WRITABLE — chmod 755';

// Test 4: ZipArchive
$result['tests']['zip_extension'] = class_exists('ZipArchive') ? 'OK' : 'MISSING — enable zip in php.ini';

echo json_encode($result, JSON_PRETTY_PRINT);
