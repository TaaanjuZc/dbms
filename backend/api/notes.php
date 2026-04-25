<?php
//  backend/api/notes.php — No views, direct JOINs

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? 'list';

switch ($action) {
  case 'upload':       handle_upload();       break;
  case 'list':         handle_list();         break;
  case 'download':     handle_download();     break;
  case 'download_zip': handle_download_zip(); break;
  case 'delete':       handle_delete();       break;
  case 'user':         handle_user_notes();   break;
  default:             err('Unknown action.');
}

// Shared query fragment
function notes_select(): string {
  return '
    SELECT
      n.id, n.title, n.faculty_name, n.semester AS note_semester,
      n.file_name, n.file_size, n.file_type, n.file_ext,
      n.remarks, n.download_count, n.uploaded_at,
      u.username AS uploader_name, u.id AS uploader_id,
      c.name AS course_name, c.code AS course_code, c.id AS course_id,
      d.name AS dept_name, d.code AS dept_code, d.id AS dept_id
    FROM notes n
    JOIN users       u ON n.uploader_id   = u.id
    JOIN courses     c ON n.course_id     = c.id
    JOIN departments d ON c.department_id = d.id
    WHERE n.is_approved = 1';
}

// Upload 
function handle_upload(): void {
  $user = require_auth();

  $course_id = (int)($_POST['course_id']   ?? 0);
  $title     = trim($_POST['title']        ?? '');
  $faculty   = trim($_POST['faculty_name'] ?? '');
  $semester  = (int)($_POST['semester']    ?? 0);
  $remarks   = trim($_POST['remarks']      ?? '');

  if (!$course_id)          err('Course is required.');
  if (strlen($title) < 3)   err('Title must be at least 3 characters.');
  if (strlen($faculty) < 2) err('Faculty name is required.');
  if ($semester < 1 || $semester > 8) err('Semester must be 1-8.');

  if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK)
    err('File upload error: ' . ($_FILES['file']['error'] ?? 'no file'));

  $file  = $_FILES['file'];
  $fsize = $file['size'];
  $fname = basename($file['name']);
  $ftype = mime_content_type($file['tmp_name']);
  $fext  = strtolower(pathinfo($fname, PATHINFO_EXTENSION));

  if ($fsize > MAX_FILE_SIZE)           err('File exceeds 100 MB limit.');
  if (!in_array($ftype, ALLOWED_MIME))  err("File type '$ftype' is not allowed.");

  $st = db()->prepare('SELECT id FROM courses WHERE id = ?');
  $st->execute([$course_id]);
  if (!$st->fetch()) err('Invalid course.');

  if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);
  $stored = uniqid('notown_', true) . '.' . $fext;
  if (!move_uploaded_file($file['tmp_name'], UPLOAD_DIR . $stored))
    err('Failed to save file.', 500);

  $ins = db()->prepare(
    'INSERT INTO notes
       (uploader_id, course_id, title, faculty_name, semester,
        file_name, file_path, file_size, file_type, file_ext, remarks)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)'
  );
  $ins->execute([
    $user['id'], $course_id, $title, $faculty, $semester,
    $fname, $stored, $fsize, $ftype, $fext, $remarks ?: null
  ]);

  ok(['note_id' => (int)db()->lastInsertId(), 'message' => 'Notes uploaded successfully!']);
}

// List
function handle_list(): void {
  $dept_id   = (int)($_GET['dept_id']   ?? 0);
  $course_id = (int)($_GET['course_id'] ?? 0);
  $limit     = min((int)($_GET['limit'] ?? 20), 100);
  $offset    = (int)($_GET['offset'] ?? 0);

  $where = []; $params = [];
  if ($dept_id)   { $where[] = 'd.id = ?'; $params[] = $dept_id; }
  if ($course_id) { $where[] = 'c.id = ?'; $params[] = $course_id; }

  $extra = $where ? ' AND ' . implode(' AND ', $where) : '';
  $base  = notes_select() . $extra;

  // total count
  $cnt_sql = 'SELECT COUNT(*) FROM notes n
    JOIN courses c ON n.course_id = c.id
    JOIN departments d ON c.department_id = d.id
    WHERE n.is_approved = 1' . $extra;
  $cnt = db()->prepare($cnt_sql);
  $cnt->execute($params);
  $total = (int)$cnt->fetchColumn();

  // paginated results
  $params[] = $limit;
  $params[] = $offset;
  $st = db()->prepare($base . ' ORDER BY n.uploaded_at DESC LIMIT ? OFFSET ?');
  $st->execute($params);

  ok(['notes' => $st->fetchAll(), 'total' => $total]);
}

// Download single zip folder
function handle_download(): void {
  sess();

  $note_id = (int)($_GET['note_id'] ?? 0);
  if (!$note_id) err('note_id required.');

  $st = db()->prepare('SELECT * FROM notes WHERE id = ? AND is_approved = 1');
  $st->execute([$note_id]);
  $note = $st->fetch();
  if (!$note) err('Note not found.', 404);

  $user = $_SESSION['user'] ?? null;
  if (!$user) {
    $sess_courses = $_SESSION['downloaded_courses'] ?? [];
    if (!in_array($note['course_id'], $sess_courses)) {
      if (count($sess_courses) >= FREE_DOWNLOAD_LIMIT)
        err('Please log in to download from more than ' . FREE_DOWNLOAD_LIMIT . ' courses.', 401);
      $sess_courses[] = $note['course_id'];
      $_SESSION['downloaded_courses'] = $sess_courses;
    }
  }

  $file_path = UPLOAD_DIR . $note['file_path'];
  if (!file_exists($file_path)) err('File not found on server.', 404);
  if (!class_exists('ZipArchive'))  err('ZIP not available on server.', 500);

  $tmp = tempnam(sys_get_temp_dir(), 'notown_') . '.zip';
  $zip = new ZipArchive();
  if ($zip->open($tmp, ZipArchive::CREATE) !== true) err('Could not create ZIP.', 500);

  $zip->addFile($file_path, $note['file_name']);
  $zip->addFromString('INFO.txt',
    "notown — Resource Export\n" .
    "========================\n" .
    "Title   : {$note['title']}\n" .
    "Faculty : {$note['faculty_name']}\n" .
    "Semester: {$note['semester']}\n" .
    "File    : {$note['file_name']}\n" .
    "Size    : " . number_format($note['file_size']) . " bytes\n" .
    "Uploaded: {$note['uploaded_at']}\n"
  );
  $zip->close();

  $uid = $user['id'] ?? null;
  $ip  = $_SERVER['REMOTE_ADDR'] ?? null;
  db()->prepare('INSERT INTO downloads (user_id, note_id, ip_address) VALUES (?,?,?)')->execute([$uid, $note_id, $ip]);
  db()->prepare('UPDATE notes SET download_count = download_count + 1 WHERE id = ?')->execute([$note_id]);

  $zip_name = preg_replace('/[^a-zA-Z0-9_\-]/', '_', pathinfo($note['file_name'], PATHINFO_FILENAME)) . '.zip';
  header('Content-Type: application/zip');
  header('Content-Disposition: attachment; filename="' . $zip_name . '"');
  header('Content-Length: ' . filesize($tmp));
  header('Cache-Control: no-store');
  readfile($tmp);
  unlink($tmp);
  exit;
}

// Download multiple courses
function handle_download_zip(): void {
  sess();

  $body       = json_decode(file_get_contents('php://input'), true) ?? [];
  $course_ids = array_values(array_unique(array_filter(array_map('intval', $body['course_ids'] ?? []))));

  if (empty($course_ids))      err('No courses specified.');
  if (count($course_ids) > 20) err('Maximum 20 courses per download.');

  $user = $_SESSION['user'] ?? null;
  if (!$user && count($course_ids) > FREE_DOWNLOAD_LIMIT)
    err('Please log in to download from more than ' . FREE_DOWNLOAD_LIMIT . ' courses.', 401);

  if (!class_exists('ZipArchive')) err('ZIP not available on server.', 500);

  $ph  = implode(',', array_fill(0, count($course_ids), '?'));
  $st  = db()->prepare(
    "SELECT n.*, c.name AS course_name, c.code AS course_code,
            d.name AS dept_name, u.username AS uploader_name
     FROM notes n
     JOIN courses     c ON n.course_id      = c.id
     JOIN departments d ON c.department_id  = d.id
     JOIN users       u ON n.uploader_id    = u.id
     WHERE n.course_id IN ($ph) AND n.is_approved = 1
     ORDER BY c.code, n.uploaded_at DESC"
  );
  $st->execute($course_ids);
  $all = $st->fetchAll();
  if (empty($all)) err('No notes found for selected courses.', 404);

  $tmp = tempnam(sys_get_temp_dir(), 'notown_zip_') . '.zip';
  $zip = new ZipArchive();
  if ($zip->open($tmp, ZipArchive::CREATE) !== true) err('Could not create ZIP.', 500);

  $by_course = [];
  foreach ($all as $n) {
    $key = $n['course_code'] . ' — ' . $n['course_name'];
    $by_course[$key][] = $n;
  }

  $uid = $user['id'] ?? null;
  $ip  = $_SERVER['REMOTE_ADDR'] ?? null;
  $logged = [];
  $seen_names = [];

  foreach ($by_course as $folder => $notes) {
    $safe = preg_replace('/[\/\\\\:*?"<>|]/', '_', $folder);
    foreach ($notes as $n) {
      $fp = UPLOAD_DIR . $n['file_path'];
      if (!file_exists($fp)) continue;

      $fname = $n['file_name'];
      $key2  = $safe . '/' . $fname;
      if (isset($seen_names[$key2])) {
        $seen_names[$key2]++;
        $ext   = pathinfo($fname, PATHINFO_EXTENSION);
        $stem  = pathinfo($fname, PATHINFO_FILENAME);
        $fname = $stem . ' (' . $seen_names[$key2] . ').' . $ext;
      } else {
        $seen_names[$key2] = 0;
      }

      $zip->addFile($fp, $safe . '/' . $fname);

      if (!in_array($n['id'], $logged)) {
        db()->prepare('INSERT INTO downloads (user_id, note_id, ip_address) VALUES (?,?,?)')->execute([$uid, $n['id'], $ip]);
        db()->prepare('UPDATE notes SET download_count = download_count + 1 WHERE id = ?')->execute([$n['id']]);
        $logged[] = $n['id'];
      }
    }
    $manifest = "Course: {$notes[0]['course_code']} — {$notes[0]['course_name']}\n";
    $manifest .= "Dept  : {$notes[0]['dept_name']}\n\n";
    foreach ($notes as $i => $n) {
      $manifest .= ($i+1) . ". {$n['title']}\n   Faculty: {$n['faculty_name']}, Sem {$n['semester']}\n   By: {$n['uploader_name']}\n\n";
    }
    $zip->addFromString($safe . '/CONTENTS.txt', $manifest);
  }

  $root = "notown — Bulk Export\n====================\n";
  $root .= "Date   : " . date('Y-m-d H:i:s') . "\n";
  $root .= "Courses: " . count($by_course) . "\n\n";
  foreach (array_keys($by_course) as $c) $root .= "  - $c (" . count($by_course[$c]) . " files)\n";
  $zip->addFromString('README.txt', $root);
  $zip->close();

  $date = date('Y-m-d');
  header('Content-Type: application/zip');
  header('Content-Disposition: attachment; filename="notown_' . $date . '.zip"');
  header('Content-Length: ' . filesize($tmp));
  header('Cache-Control: no-store');
  readfile($tmp);
  unlink($tmp);
  exit;
}

// Delete
function handle_delete(): void {
  $user    = require_auth();
  $note_id = (int)($_GET['note_id'] ?? 0);
  if (!$note_id) err('note_id required.');

  $st = db()->prepare('SELECT uploader_id, file_path FROM notes WHERE id = ?');
  $st->execute([$note_id]);
  $note = $st->fetch();
  if (!$note) err('Note not found.', 404);
  if ($note['uploader_id'] != $user['id'] && $user['role'] !== 'admin')
    err('Permission denied.', 403);

  $fp = UPLOAD_DIR . $note['file_path'];
  if (file_exists($fp)) unlink($fp);
  db()->prepare('DELETE FROM notes WHERE id = ?')->execute([$note_id]);
  ok(['message' => 'Note deleted.']);
}

// User notes/downloads
function handle_user_notes(): void {
  $user = require_auth();
  $type = $_GET['type'] ?? 'uploads';

  if ($type === 'uploads') {
    $st = db()->prepare(
      'SELECT n.*, c.name AS course_name, c.code AS course_code, d.name AS dept_name
       FROM notes n
       JOIN courses c ON n.course_id = c.id
       JOIN departments d ON c.department_id = d.id
       WHERE n.uploader_id = ?
       ORDER BY n.uploaded_at DESC'
    );
    $st->execute([$user['id']]);
    ok(['notes' => $st->fetchAll()]);
  } else {
    $st = db()->prepare(
      'SELECT dl.downloaded_at,
              n.id, n.title, n.file_name, n.file_ext, n.file_size,
              c.name AS course_name, d.name AS dept_name
       FROM downloads dl
       JOIN notes n ON dl.note_id = n.id
       JOIN courses c ON n.course_id = c.id
       JOIN departments d ON c.department_id = d.id
       WHERE dl.user_id = ?
       ORDER BY dl.downloaded_at DESC
       LIMIT 100'
    );
    $st->execute([$user['id']]);
    ok(['downloads' => $st->fetchAll()]);
  }
}
