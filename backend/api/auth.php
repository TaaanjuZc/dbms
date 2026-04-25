<?php
// ============================================================
//  api/auth.php  —  Register / Login / Logout / Me
// ============================================================
require_once __DIR__ . '/config.php';
sess();

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
  case 'register': handle_register(); break;
  case 'login':    handle_login();    break;
  case 'logout':   handle_logout();   break;
  case 'me':       handle_me();       break;
  default:         err('Unknown action.');
}

// ────────────────────────────────────────────────────────────
function handle_register(): void {
  $body = json_decode(file_get_contents('php://input'), true) ?? $_POST;

  $username = trim($body['username'] ?? '');
  $email    = strtolower(trim($body['email'] ?? ''));
  $password = $body['password'] ?? '';

  if (strlen($username) < 3) err('Username must be at least 3 characters.');
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) err('Invalid email address.');
  if (strlen($password) < 6) err('Password must be at least 6 characters.');

  $pdo = db();

  // Check uniqueness
  $st = $pdo->prepare('SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1');
  $st->execute([$email, $username]);
  if ($st->fetch()) err('Email or username already taken.');

  $colors = ['#C9A84C','#7B9EA6','#A67B9E','#9EA67B','#7B9EA6','#E07B54'];
  $color  = $colors[array_rand($colors)];
  $hash   = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

  $ins = $pdo->prepare(
    'INSERT INTO users (username, email, password_hash, avatar_color) VALUES (?,?,?,?)'
  );
  $ins->execute([$username, $email, $hash, $color]);

  $user = ['id' => (int)$pdo->lastInsertId(), 'username' => $username,
           'email' => $email, 'avatar_color' => $color, 'role' => 'student'];
  $_SESSION['user'] = $user;

  ok(['user' => $user, 'message' => 'Account created successfully.']);
}

// ────────────────────────────────────────────────────────────
function handle_login(): void {
  $body = json_decode(file_get_contents('php://input'), true) ?? $_POST;

  $email    = strtolower(trim($body['email'] ?? ''));
  $password = $body['password'] ?? '';

  if (!$email || !$password) err('Email and password are required.');

  $st = db()->prepare(
    'SELECT id, username, email, password_hash, avatar_color, role, is_active
     FROM users WHERE email = ? LIMIT 1'
  );
  $st->execute([$email]);
  $row = $st->fetch();

  if (!$row || !password_verify($password, $row['password_hash'])) {
    err('Invalid email or password.', 401);
  }
  if (!$row['is_active']) err('Account has been deactivated.', 403);

  unset($row['password_hash']);
  $row['id'] = (int)$row['id'];
  $_SESSION['user'] = $row;

  ok(['user' => $row, 'message' => 'Logged in successfully.']);
}

// ────────────────────────────────────────────────────────────
function handle_logout(): void {
  $_SESSION = [];
  session_destroy();
  ok(['message' => 'Logged out.']);
}

// ────────────────────────────────────────────────────────────
function handle_me(): void {
  if (empty($_SESSION['user'])) {
    ok(['user' => null]);
  }
  $uid = $_SESSION['user']['id'];
  $st = db()->prepare(
    'SELECT id, username, email, avatar_color, role, created_at FROM users WHERE id = ?'
  );
  $st->execute([$uid]);
  $user = $st->fetch();
  if (!$user) { $_SESSION = []; ok(['user' => null]); }
  $user['id'] = (int)$user['id'];
  ok(['user' => $user]);
}
