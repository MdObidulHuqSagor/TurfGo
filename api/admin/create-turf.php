<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

app_require_admin();

$db = app_db();

$turfName = trim((string) ($_POST['turf_name'] ?? ''));
$ownerName = trim((string) ($_POST['owner_name'] ?? ''));
$ownerPhone = app_normalize_phone((string) ($_POST['owner_phone'] ?? ''));
$division = trim((string) ($_POST['division'] ?? ''));
$district = trim((string) ($_POST['district'] ?? ''));
$upazila = trim((string) ($_POST['upazila'] ?? ''));
$area = trim((string) ($_POST['area'] ?? ''));
$addressLine = trim((string) ($_POST['address_line'] ?? ''));
$username = trim((string) ($_POST['username'] ?? ''));
$password = (string) ($_POST['password'] ?? '');
$pricePerHour = (float) ($_POST['price_per_hour'] ?? 0);

if ($turfName === '' || $ownerName === '' || $ownerPhone === '' || $division === '' || $district === '' || $username === '' || $password === '') {
    app_json([
        'ok' => false,
        'message' => 'Turf name, owner name, owner phone, division, district, username, and password are required.',
    ], 422);
}

if (!isset($_FILES['turf_image'])) {
    app_json(['ok' => false, 'message' => 'Turf image is required.'], 422);
}

$turfImage = app_upload($_FILES['turf_image'], 'turfs');

$db->begin_transaction();

try {
    $ownerUserId = null;
    $stmt = $db->prepare("SELECT id, password_hash FROM users WHERE username = ? AND role = 'owner' LIMIT 1");
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $existingOwner = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    $hash = password_hash($password, PASSWORD_DEFAULT);

    if ($existingOwner) {
        if (!password_verify($password, $existingOwner['password_hash'])) {
            throw new RuntimeException('This owner username already exists with a different password.');
        }
        $ownerUserId = (int) $existingOwner['id'];
    } else {
        $stmt = $db->prepare(
            "INSERT INTO users (role, username, password_hash, full_name, phone_number)
             VALUES ('owner', ?, ?, ?, ?)"
        );
        $stmt->bind_param('ssss', $username, $hash, $ownerName, $ownerPhone);
        $stmt->execute();
        $ownerUserId = $stmt->insert_id;
        $stmt->close();
    }

    $searchBlob = implode(' ', array_filter([
        $turfName,
        $ownerName,
        $ownerPhone,
        $division,
        $district,
        $upazila,
        $area,
        $addressLine,
        $username,
    ]));

    $stmt = $db->prepare(
        "INSERT INTO turfs
            (owner_user_id, turf_name, owner_name, owner_phone, division, district, upazila, area, address_line, price_per_hour, turf_image, search_blob)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param(
        'issssssssdss',
        $ownerUserId,
        $turfName,
        $ownerName,
        $ownerPhone,
        $division,
        $district,
        $upazila,
        $area,
        $addressLine,
        $pricePerHour,
        $turfImage,
        $searchBlob
    );
    $stmt->execute();
    $turfId = $stmt->insert_id;
    $stmt->close();

    $db->commit();

    app_json([
        'ok' => true,
        'message' => 'Turf and owner access created.',
        'owner' => [
            'id' => $ownerUserId,
            'username' => $username,
            'password' => $password,
            'full_name' => $ownerName,
            'phone_number' => $ownerPhone,
        ],
        'turf' => [
            'id' => $turfId,
            'turf_name' => $turfName,
            'owner_name' => $ownerName,
            'owner_phone' => $ownerPhone,
            'division' => $division,
            'district' => $district,
            'upazila' => $upazila,
            'area' => $area,
            'address_line' => $addressLine,
            'price_per_hour' => $pricePerHour,
            'turf_image' => $turfImage,
        ],
    ]);
} catch (Throwable $e) {
    $db->rollback();
    app_json(['ok' => false, 'message' => $e->getMessage()], 400);
}
