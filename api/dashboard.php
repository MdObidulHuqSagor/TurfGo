<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

if (!isset($_SESSION['auth'])) {
    app_json(['ok' => false, 'message' => 'Unauthorized.'], 401);
}

$auth = $_SESSION['auth'];
$role = $auth['role'] ?? 'customer';
$db = app_db();

function dash_assoc(mysqli_result $result): array
{
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    return $rows;
}

function dash_month_series(mysqli $db, string $where = '1=1'): array
{
    $sql = "
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym,
               COUNT(*) AS bookings,
               COALESCE(SUM(total_amount), 0) AS revenue
        FROM bookings
        WHERE {$where}
        GROUP BY ym
        ORDER BY ym DESC
        LIMIT 6
    ";
    $result = $db->query($sql);
    $rows = dash_assoc($result);
    $indexed = [];
    foreach ($rows as $row) {
        $indexed[$row['ym']] = $row;
    }

    $labels = [];
    $bookings = [];
    $revenue = [];
    for ($i = 5; $i >= 0; $i--) {
        $month = new DateTimeImmutable("first day of -{$i} month");
        $key = $month->format('Y-m');
        $labels[] = $month->format('M Y');
        $bookings[] = (int) ($indexed[$key]['bookings'] ?? 0);
        $revenue[] = (float) ($indexed[$key]['revenue'] ?? 0);
    }

    return [
        'labels' => $labels,
        'bookings' => $bookings,
        'revenue' => $revenue,
    ];
}

function dash_owner_month_series(mysqli $db, int $ownerId): array
{
    $sql = "
        SELECT DATE_FORMAT(b.created_at, '%Y-%m') AS ym,
               COUNT(*) AS bookings,
               COALESCE(SUM(b.total_amount), 0) AS revenue
        FROM bookings b
        INNER JOIN turfs t ON t.id = b.turf_id
        WHERE t.owner_user_id = {$ownerId}
        GROUP BY ym
        ORDER BY ym DESC
        LIMIT 6
    ";
    $result = $db->query($sql);
    $rows = dash_assoc($result);
    $indexed = [];
    foreach ($rows as $row) {
        $indexed[$row['ym']] = $row;
    }

    $labels = [];
    $bookings = [];
    $revenue = [];
    for ($i = 5; $i >= 0; $i--) {
        $month = new DateTimeImmutable("first day of -{$i} month");
        $key = $month->format('Y-m');
        $labels[] = $month->format('M Y');
        $bookings[] = (int) ($indexed[$key]['bookings'] ?? 0);
        $revenue[] = (float) ($indexed[$key]['revenue'] ?? 0);
    }

    return [
        'labels' => $labels,
        'bookings' => $bookings,
        'revenue' => $revenue,
    ];
}

function dash_user_row(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'role' => $row['role'],
        'username' => $row['username'],
        'full_name' => $row['full_name'] ?? null,
        'phone_number' => $row['phone_number'] ?? null,
        'is_active' => (int) ($row['is_active'] ?? 1),
        'created_at' => $row['created_at'],
    ];
}

function dash_booking_row(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'user_id' => (int) $row['user_id'],
        'booked_by_role' => $row['booked_by_role'] ?? null,
        'turf_id' => (int) $row['turf_id'],
        'booking_date' => $row['booking_date'],
        'start_time' => $row['start_time'],
        'hours' => (float) $row['hours'],
        'status' => $row['status'],
        'payment_method' => $row['payment_method'],
        'total_amount' => (float) $row['total_amount'],
        'customer_name' => $row['customer_name'],
        'customer_phone' => $row['customer_phone'],
        'notes' => $row['notes'],
        'created_at' => $row['created_at'],
        'turf_name' => $row['turf_name'],
        'owner_name' => $row['owner_name'],
    ];
}

function dash_booking_calendar_row(array $row): array
{
    return dash_booking_row($row);
}

function dash_review_row(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'turf_name' => $row['turf_name'],
        'rating' => (int) $row['rating'],
        'comment' => $row['comment'],
        'created_at' => $row['created_at'],
        'customer_name' => $row['customer_name'],
    ];
}

function dash_turf_row(array $row): array
{
    return app_turf_payload($row);
}

if ($role === 'admin') {
    $summary = [
        'total_users' => (int) ($db->query("SELECT COUNT(*) AS c FROM users WHERE role <> 'admin'")->fetch_assoc()['c'] ?? 0),
        'total_turf_owners' => (int) ($db->query("SELECT COUNT(*) AS c FROM users WHERE role = 'owner'")->fetch_assoc()['c'] ?? 0),
        'total_bookings' => (int) ($db->query("SELECT COUNT(*) AS c FROM bookings")->fetch_assoc()['c'] ?? 0),
        'revenue' => (float) ($db->query("SELECT COALESCE(SUM(total_amount), 0) AS c FROM bookings WHERE status <> 'canceled'")->fetch_assoc()['c'] ?? 0),
        'pending_turf_approvals' => (int) ($db->query("SELECT COUNT(*) AS c FROM turfs WHERE approval_status = 'pending'")->fetch_assoc()['c'] ?? 0),
    ];

    $users = dash_assoc(
        $db->query(
            "SELECT id, role, username, full_name, phone_number, is_active, created_at
             FROM users
             WHERE role <> 'admin'
             ORDER BY created_at DESC
             LIMIT 12"
        )
    );

    $bookings = dash_assoc(
        $db->query(
            "SELECT b.id, b.user_id, b.turf_id, b.booking_date, b.start_time, b.hours, b.status, b.payment_method,
                    b.total_amount, b.customer_name, b.customer_phone, b.notes, b.created_at,
                    t.turf_name, t.owner_name, u.role AS booked_by_role
             FROM bookings b
             INNER JOIN turfs t ON t.id = b.turf_id
             INNER JOIN users u ON u.id = b.user_id
             ORDER BY b.created_at DESC
             LIMIT 12"
        )
    );

    $calendarBookings = dash_assoc(
        $db->query(
            "SELECT b.id, b.user_id, b.turf_id, b.booking_date, b.start_time, b.hours, b.status, b.payment_method,
                    b.total_amount, b.customer_name, b.customer_phone, b.notes, b.created_at,
                    t.turf_name, t.owner_name, u.role AS booked_by_role
             FROM bookings b
             INNER JOIN turfs t ON t.id = b.turf_id
             INNER JOIN users u ON u.id = b.user_id
             ORDER BY b.booking_date ASC, b.start_time ASC
             LIMIT 60"
        )
    );

    $pendingTurfs = dash_assoc(
        $db->query(
            "SELECT t.id, t.turf_name, t.owner_name, t.owner_phone, t.city, t.division, t.district, t.upazila,
                    t.area, t.address_line, t.price_per_hour, t.turf_image, t.approval_status, t.is_available,
                    t.created_at, u.username AS owner_username
             FROM turfs t
             INNER JOIN users u ON u.id = t.owner_user_id
             WHERE t.approval_status = 'pending'
             ORDER BY t.created_at DESC"
        )
    );

    $reports = [
        'monthly' => dash_month_series($db),
        'top_turfs' => dash_assoc(
            $db->query(
                "SELECT t.turf_name, COUNT(b.id) AS bookings, COALESCE(SUM(b.total_amount), 0) AS revenue
                 FROM turfs t
                 LEFT JOIN bookings b ON b.turf_id = t.id AND b.status <> 'canceled'
                 GROUP BY t.id
                 ORDER BY revenue DESC
                 LIMIT 5"
            )
        ),
    ];

    app_json([
        'ok' => true,
        'role' => $role,
        'user' => $auth,
        'summary' => $summary,
        'users' => array_map('dash_user_row', $users),
        'bookings' => array_map('dash_booking_row', $bookings),
        'calendar_bookings' => array_map('dash_booking_calendar_row', $calendarBookings),
        'pending_turfs' => array_map('dash_turf_row', $pendingTurfs),
        'reports' => $reports,
    ]);
}

if ($role === 'owner') {
    $ownerId = (int) $auth['id'];
    $summary = [
        'total_earnings' => (float) ($db->query(
            "SELECT COALESCE(SUM(b.total_amount), 0) AS c
             FROM bookings b
             INNER JOIN turfs t ON t.id = b.turf_id
             WHERE t.owner_user_id = {$ownerId} AND b.status IN ('confirmed','completed')"
        )->fetch_assoc()['c'] ?? 0),
        'booking_requests' => (int) ($db->query(
            "SELECT COUNT(*) AS c
             FROM bookings b
             INNER JOIN turfs t ON t.id = b.turf_id
             WHERE t.owner_user_id = {$ownerId} AND b.status = 'pending'"
        )->fetch_assoc()['c'] ?? 0),
        'total_turfs' => (int) ($db->query(
            "SELECT COUNT(*) AS c FROM turfs WHERE owner_user_id = {$ownerId}"
        )->fetch_assoc()['c'] ?? 0),
        'customer_reviews' => (int) ($db->query(
            "SELECT COUNT(*) AS c
             FROM reviews r
             INNER JOIN turfs t ON t.id = r.turf_id
             WHERE t.owner_user_id = {$ownerId}"
        )->fetch_assoc()['c'] ?? 0),
    ];

    $turfs = dash_assoc(
        $db->query(
            "SELECT t.id, t.turf_name, t.owner_name, t.owner_phone, t.city, t.division, t.district, t.upazila,
                    t.area, t.address_line, t.price_per_hour, t.turf_image, t.approval_status, t.is_available,
                    t.created_at, u.username AS owner_username
             FROM turfs t
             INNER JOIN users u ON u.id = t.owner_user_id
             WHERE t.owner_user_id = {$ownerId}
             ORDER BY t.created_at DESC"
        )
    );

    $requests = dash_assoc(
        $db->query(
            "SELECT b.id, b.user_id, b.turf_id, b.booking_date, b.start_time, b.hours, b.status, b.payment_method,
                    b.total_amount, b.customer_name, b.customer_phone, b.notes, b.created_at,
                    t.turf_name, t.owner_name, u.role AS booked_by_role
             FROM bookings b
             INNER JOIN turfs t ON t.id = b.turf_id
             INNER JOIN users u ON u.id = b.user_id
             WHERE t.owner_user_id = {$ownerId} AND b.status = 'pending'
             ORDER BY b.created_at DESC"
        )
    );

    $calendarBookings = dash_assoc(
        $db->query(
            "SELECT b.id, b.user_id, b.turf_id, b.booking_date, b.start_time, b.hours, b.status, b.payment_method,
                    b.total_amount, b.customer_name, b.customer_phone, b.notes, b.created_at,
                    t.turf_name, t.owner_name, u.role AS booked_by_role
             FROM bookings b
             INNER JOIN turfs t ON t.id = b.turf_id
             INNER JOIN users u ON u.id = b.user_id
             WHERE t.owner_user_id = {$ownerId}
             ORDER BY b.booking_date ASC, b.start_time ASC
             LIMIT 60"
        )
    );

    $reviews = dash_assoc(
        $db->query(
            "SELECT r.id, r.rating, r.comment, r.created_at, t.turf_name,
                    COALESCE(u.full_name, u.username) AS customer_name
             FROM reviews r
             INNER JOIN turfs t ON t.id = r.turf_id
             INNER JOIN users u ON u.id = r.user_id
             WHERE t.owner_user_id = {$ownerId}
             ORDER BY r.created_at DESC
             LIMIT 12"
        )
    );

    app_json([
        'ok' => true,
        'role' => $role,
        'user' => $auth,
        'summary' => $summary,
        'turfs' => array_map('dash_turf_row', $turfs),
        'requests' => array_map('dash_booking_row', $requests),
        'calendar_bookings' => array_map('dash_booking_calendar_row', $calendarBookings),
        'reviews' => array_map('dash_review_row', $reviews),
        'reports' => [
            'monthly' => dash_owner_month_series($db, $ownerId),
        ],
    ]);
}

$customerId = (int) $auth['id'];
$summary = [
    'upcoming_bookings' => (int) ($db->query(
        "SELECT COUNT(*) AS c
         FROM bookings
         WHERE user_id = {$customerId}
           AND booking_date >= CURDATE()
           AND status IN ('pending','confirmed')"
    )->fetch_assoc()['c'] ?? 0),
    'favorites' => (int) ($db->query("SELECT COUNT(*) AS c FROM favorites WHERE user_id = {$customerId}")->fetch_assoc()['c'] ?? 0),
    'payment_history' => (float) ($db->query(
        "SELECT COALESCE(SUM(total_amount), 0) AS c
         FROM bookings
         WHERE user_id = {$customerId} AND status <> 'canceled'"
    )->fetch_assoc()['c'] ?? 0),
    'reviews' => (int) ($db->query("SELECT COUNT(*) AS c FROM reviews WHERE user_id = {$customerId}")->fetch_assoc()['c'] ?? 0),
];

$upcoming = dash_assoc(
    $db->query(
        "SELECT b.id, b.user_id, b.turf_id, b.booking_date, b.start_time, b.hours, b.status, b.payment_method,
                b.total_amount, b.customer_name, b.customer_phone, b.notes, b.created_at,
                t.turf_name, t.owner_name, u.role AS booked_by_role
         FROM bookings b
         INNER JOIN turfs t ON t.id = b.turf_id
         INNER JOIN users u ON u.id = b.user_id
         WHERE b.user_id = {$customerId}
           AND b.booking_date >= CURDATE()
           AND b.status IN ('pending','confirmed')
         ORDER BY b.booking_date ASC, b.start_time ASC"
    )
);

$history = dash_assoc(
    $db->query(
        "SELECT b.id, b.user_id, b.turf_id, b.booking_date, b.start_time, b.hours, b.status, b.payment_method,
                b.total_amount, b.customer_name, b.customer_phone, b.notes, b.created_at,
                t.turf_name, t.owner_name, u.role AS booked_by_role
         FROM bookings b
         INNER JOIN turfs t ON t.id = b.turf_id
         INNER JOIN users u ON u.id = b.user_id
         WHERE b.user_id = {$customerId}
         ORDER BY b.created_at DESC"
    )
);

$favorites = dash_assoc(
    $db->query(
        "SELECT t.id, t.turf_name, t.owner_name, t.owner_phone, t.city, t.division, t.district, t.upazila,
                t.area, t.address_line, t.price_per_hour, t.turf_image, t.approval_status, t.is_available,
                t.created_at, u.username AS owner_username
         FROM favorites f
         INNER JOIN turfs t ON t.id = f.turf_id
         INNER JOIN users u ON u.id = t.owner_user_id
         WHERE f.user_id = {$customerId}
         ORDER BY f.created_at DESC"
    )
);

$reviews = dash_assoc(
    $db->query(
        "SELECT r.id, r.rating, r.comment, r.created_at, t.turf_name,
                COALESCE(u.full_name, u.username) AS customer_name
         FROM reviews r
         INNER JOIN turfs t ON t.id = r.turf_id
         INNER JOIN users u ON u.id = r.user_id
         WHERE r.user_id = {$customerId}
         ORDER BY r.created_at DESC"
    )
);

app_json([
    'ok' => true,
    'role' => $role,
    'user' => $auth,
    'summary' => $summary,
    'upcoming' => array_map('dash_booking_row', $upcoming),
    'history' => array_map('dash_booking_row', $history),
    'favorites' => array_map('dash_turf_row', $favorites),
    'reviews' => array_map('dash_review_row', $reviews),
    'reports' => [
        'monthly' => dash_month_series($db, "user_id = {$customerId}"),
    ],
]);
