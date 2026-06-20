<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

if (!isset($_SESSION['auth'])) {
    app_json(['ok' => false, 'message' => 'Unauthorized.'], 401);
}

$auth = $_SESSION['auth'];
$role = $auth['role'] ?? 'customer';
$data = app_input();
$action = (string) ($data['action'] ?? '');
$db = app_db();

if ($action === 'approve_turf' || $action === 'reject_turf') {
    if ($role !== 'admin') {
        app_json(['ok' => false, 'message' => 'Admin access required.'], 403);
    }

    $turfId = (int) ($data['turf_id'] ?? 0);
    $status = $action === 'approve_turf' ? 'approved' : 'rejected';
    $stmt = $db->prepare("UPDATE turfs SET approval_status = ? WHERE id = ?");
    $stmt->bind_param('si', $status, $turfId);
    $stmt->execute();
    $stmt->close();

    app_json(['ok' => true, 'message' => 'Turf status updated.']);
}

if ($action === 'toggle_user') {
    if ($role !== 'admin') {
        app_json(['ok' => false, 'message' => 'Admin access required.'], 403);
    }

    $userId = (int) ($data['user_id'] ?? 0);
    $active = (int) ($data['is_active'] ?? 1) ? 1 : 0;
    $stmt = $db->prepare("UPDATE users SET is_active = ? WHERE id <> 1 AND id = ?");
    $stmt->bind_param('ii', $active, $userId);
    $stmt->execute();
    $stmt->close();

    app_json(['ok' => true, 'message' => 'User status updated.']);
}

if ($action === 'toggle_availability') {
    if (!in_array($role, ['admin', 'owner'], true)) {
        app_json(['ok' => false, 'message' => 'Owner access required.'], 403);
    }

    $turfId = (int) ($data['turf_id'] ?? 0);
    $availability = (int) ($data['is_available'] ?? 1) ? 1 : 0;

    if ($role === 'owner') {
        $stmt = $db->prepare("UPDATE turfs SET is_available = ? WHERE id = ? AND owner_user_id = ?");
        $stmt->bind_param('iii', $availability, $turfId, $auth['id']);
    } else {
        $stmt = $db->prepare("UPDATE turfs SET is_available = ? WHERE id = ?");
        $stmt->bind_param('ii', $availability, $turfId);
    }
    $stmt->execute();
    $stmt->close();

    app_json(['ok' => true, 'message' => 'Availability updated.']);
}

if ($action === 'toggle_favorite') {
    if ($role !== 'customer') {
        app_json(['ok' => false, 'message' => 'Customer account required.'], 403);
    }

    $turfId = (int) ($data['turf_id'] ?? 0);
    $userId = (int) $auth['id'];
    $stmt = $db->prepare("SELECT id FROM favorites WHERE user_id = ? AND turf_id = ? LIMIT 1");
    $stmt->bind_param('ii', $userId, $turfId);
    $stmt->execute();
    $existing = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ($existing) {
        $stmt = $db->prepare("DELETE FROM favorites WHERE user_id = ? AND turf_id = ?");
        $stmt->bind_param('ii', $userId, $turfId);
        $stmt->execute();
        $stmt->close();
        app_json(['ok' => true, 'message' => 'Removed from favorites.', 'favorited' => false]);
    }

    $stmt = $db->prepare("INSERT INTO favorites (user_id, turf_id) VALUES (?, ?)");
    $stmt->bind_param('ii', $userId, $turfId);
    $stmt->execute();
    $stmt->close();

    app_json(['ok' => true, 'message' => 'Added to favorites.', 'favorited' => true]);
}

if ($action === 'add_review') {
    if ($role !== 'customer') {
        app_json(['ok' => false, 'message' => 'Customer account required.'], 403);
    }

    $turfId = (int) ($data['turf_id'] ?? 0);
    $rating = max(1, min(5, (int) ($data['rating'] ?? 5)));
    $comment = trim((string) ($data['comment'] ?? ''));
    if ($comment === '') {
        app_json(['ok' => false, 'message' => 'Comment is required.'], 422);
    }

    $stmt = $db->prepare(
        "INSERT INTO reviews (user_id, turf_id, rating, comment)
         VALUES (?, ?, ?, ?)"
    );
    $stmt->bind_param('iiis', $auth['id'], $turfId, $rating, $comment);
    $stmt->execute();
    $stmt->close();

    app_json(['ok' => true, 'message' => 'Review added.']);
}

if ($action === 'update_booking_status') {
    $bookingId = (int) ($data['booking_id'] ?? 0);
    $status = (string) ($data['status'] ?? '');
    $allowedStatuses = ['pending', 'confirmed', 'completed', 'canceled'];
    if (!in_array($status, $allowedStatuses, true)) {
        app_json(['ok' => false, 'message' => 'Invalid booking status.'], 422);
    }

    $stmt = $db->prepare(
        "SELECT b.id, b.user_id, t.owner_user_id
         FROM bookings b
         INNER JOIN turfs t ON t.id = b.turf_id
         WHERE b.id = ?
         LIMIT 1"
    );
    $stmt->bind_param('i', $bookingId);
    $stmt->execute();
    $booking = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$booking) {
        app_json(['ok' => false, 'message' => 'Booking not found.'], 404);
    }

    $canUpdate = false;
    if ($role === 'admin') {
        $canUpdate = true;
    } elseif ($role === 'owner' && (int) $booking['owner_user_id'] === (int) $auth['id']) {
        $canUpdate = in_array($status, ['confirmed', 'completed', 'canceled'], true);
    } elseif ($role === 'customer' && (int) $booking['user_id'] === (int) $auth['id']) {
        $canUpdate = $status === 'canceled';
    }

    if (!$canUpdate) {
        app_json(['ok' => false, 'message' => 'You cannot update this booking.'], 403);
    }

    $stmt = $db->prepare("UPDATE bookings SET status = ? WHERE id = ?");
    $stmt->bind_param('si', $status, $bookingId);
    $stmt->execute();
    $stmt->close();

    app_json(['ok' => true, 'message' => 'Booking status updated.']);
}

app_json(['ok' => false, 'message' => 'Invalid action.'], 422);
