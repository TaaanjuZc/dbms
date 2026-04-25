<?php
// ============================================================
//  api/reviews.php  —  Reviews & Complaints
// ============================================================
require_once __DIR__ . '/config.php';
sess();

$action = $_GET['action'] ?? 'list_reviews';

switch ($action) {
  case 'list_reviews':  list_reviews();  break;
  case 'add_review':    add_review();    break;
  case 'add_complaint': add_complaint(); break;
  default:              err('Unknown action.');
}

function list_reviews(): void {
  $st = db()->query(
    'SELECT r.id, r.rating, r.headline, r.body, r.created_at,
            u.username, u.avatar_color
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.is_visible = 1
     ORDER BY r.created_at DESC
     LIMIT 50'
  );
  ok(['reviews' => $st->fetchAll()]);
}

function add_review(): void {
  $user = require_auth();
  $body = json_decode(file_get_contents('php://input'), true) ?? $_POST;

  $rating   = (int)($body['rating']   ?? 5);
  $headline = trim($body['headline']  ?? '');
  $text     = trim($body['body']      ?? '');

  if ($rating < 1 || $rating > 5) err('Rating must be 1–5.');
  if (strlen($headline) < 3) err('Headline is too short.');
  if (strlen($text) < 10)    err('Review is too short (min 10 chars).');

  // one review per user
  $chk = db()->prepare('SELECT id FROM reviews WHERE user_id = ? LIMIT 1');
  $chk->execute([$user['id']]);
  if ($chk->fetch()) err('You have already submitted a review. Thank you!');

  db()->prepare(
    'INSERT INTO reviews (user_id, rating, headline, body) VALUES (?,?,?,?)'
  )->execute([$user['id'], $rating, $headline, $text]);

  ok(['message' => 'Review submitted — thank you!']);
}

function add_complaint(): void {
  sess();
  $body = json_decode(file_get_contents('php://input'), true) ?? $_POST;

  $type    = $body['type']        ?? 'other';
  $subject = trim($body['subject']     ?? '');
  $desc    = trim($body['description'] ?? '');

  $allowed_types = ['bug','content','suggestion','other'];
  if (!in_array($type, $allowed_types)) $type = 'other';
  if (strlen($subject) < 3) err('Subject is too short.');
  if (strlen($desc) < 10)   err('Description is too short (min 10 chars).');

  $uid = $_SESSION['user']['id'] ?? null;

  db()->prepare(
    'INSERT INTO complaints (user_id, type, subject, description) VALUES (?,?,?,?)'
  )->execute([$uid, $type, $subject, $desc]);

  ok(['message' => 'Feedback submitted. We appreciate your input!']);
}
