<?php
// ============================================================
//  api/courses.php  —  List departments & courses
// ============================================================
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? 'departments';

switch ($action) {
  case 'departments': get_departments(); break;
  case 'courses':     get_courses();     break;
  default:            err('Unknown action.');
}

function get_departments(): void {
  $rows = db()->query('SELECT d.id, d.name, d.code, d.icon, COUNT(DISTINCT c.id) AS course_count, COUNT(DISTINCT n.id) AS note_count FROM departments d LEFT JOIN courses c ON c.department_id = d.id LEFT JOIN notes n ON n.course_id = c.id AND n.is_approved = 1 GROUP BY d.id, d.name, d.code, d.icon ORDER BY d.name')->fetchAll();
  ok(['departments' => $rows]);
}

function get_courses(): void {
  $dept_id = (int)($_GET['dept_id'] ?? 0);
  if (!$dept_id) err('dept_id is required.');

  $st = db()->prepare(
    'SELECT id, name, code, credits, semester
     FROM courses WHERE department_id = ? ORDER BY semester, name'
  );
  $st->execute([$dept_id]);
  ok(['courses' => $st->fetchAll()]);
}
