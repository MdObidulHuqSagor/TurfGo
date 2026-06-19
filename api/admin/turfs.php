<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

app_require_admin();

$db = app_db();
$result = $db->query(
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
     ORDER BY t.id DESC"
);

$turfs = [];
while ($row = $result->fetch_assoc()) {
    $turfs[] = app_turf_payload($row);
}

app_json([
    'ok' => true,
    'turfs' => $turfs,
]);
