<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

$data = app_input();
$username = trim((string) ($data['username'] ?? ''));
$password = (string) ($data['password'] ?? '');

if ($username === '' || $password === '') {
    app_json(['ok' => false, 'message' => 'Username and password are required.'], 422);
}

$db = app_db();
$stmt = $db->prepare(
    "SELECT id, role, username, password_hash, full_name, phone_number, profile_image, is_active
     FROM users
     WHERE username = ?
     LIMIT 1"
);
$stmt->bind_param('s', $username);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user || !password_verify($password, $user['password_hash'])) {
    app_json(['ok' => false, 'message' => 'Invalid credentials.'], 401);
}

if ((int) ($user['is_active'] ?? 1) !== 1) {
    app_json(['ok' => false, 'message' => 'This account is inactive.'], 403);
}

session_regenerate_id(true);
$_SESSION['auth'] = app_user_payload($user);

app_json([
    'ok' => true,
    'user' => app_user_payload($user),
]);
