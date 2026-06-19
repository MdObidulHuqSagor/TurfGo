<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

if (!isset($_SESSION['auth']) || ($_SESSION['auth']['role'] ?? null) !== 'owner') {
    app_json(['ok' => false, 'message' => 'Owner access required.'], 403);
}

$ownerId = (int) $_SESSION['auth']['id'];
$db = app_db();

$stmt = $db->prepare(
    "SELECT
        t.id,
        t.turf_name,
        t.owner_name,
        t.owner_phone,
        t.division,
        t.district,
        t.upazila,
        t.area,
        t.address_line,
        t.price_per_hour,
        t.turf_image,
        t.created_at,
        u.username AS owner_username
     FROM turfs t
     INNER JOIN users u ON u.id = t.owner_user_id
     WHERE t.owner_user_id = ?
     ORDER BY t.id DESC"
);
$stmt->bind_param('i', $ownerId);
$stmt->execute();
$result = $stmt->get_result();

$turfs = [];
while ($row = $result->fetch_assoc()) {
    $turfs[] = app_turf_payload($row);
}

$stmt->close();

app_json([
    'ok' => true,
    'turfs' => $turfs,
]);
