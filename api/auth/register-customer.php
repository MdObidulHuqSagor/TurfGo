<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

$db = app_db();
$data = app_input();

$fullName = trim((string) ($data['full_name'] ?? ''));
$phoneNumber = app_normalize_phone((string) ($data['phone_number'] ?? ''));
$password = (string) ($data['password'] ?? '');

if ($fullName === '' || $phoneNumber === '' || $password === '') {
    app_json(['ok' => false, 'message' => 'Full name, phone number, and password are required.'], 422);
}

if (!isset($_FILES['profile_image'])) {
    app_json(['ok' => false, 'message' => 'Profile image is required.'], 422);
}

$profileImage = app_upload($_FILES['profile_image'], 'profiles');

$username = $phoneNumber;
$stmt = $db->prepare("SELECT id FROM users WHERE username = ? LIMIT 1");
$stmt->bind_param('s', $username);
$stmt->execute();
$existing = $stmt->get_result()->fetch_assoc();
$stmt->close();

if ($existing) {
    app_json(['ok' => false, 'message' => 'An account already exists for this phone number.'], 409);
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $db->prepare(
    "INSERT INTO users (role, username, password_hash, full_name, phone_number, profile_image)
     VALUES ('customer', ?, ?, ?, ?, ?)"
);
$stmt->bind_param('sssss', $username, $hash, $fullName, $phoneNumber, $profileImage);
$stmt->execute();
$userId = $stmt->insert_id;
$stmt->close();

app_json([
    'ok' => true,
    'message' => 'Customer account created.',
    'user' => [
        'id' => $userId,
        'role' => 'customer',
        'username' => $username,
        'full_name' => $fullName,
        'phone_number' => $phoneNumber,
        'profile_image' => $profileImage,
    ],
]);
