<?php
declare(strict_types=1);

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function app_env(string $key, string $default = ''): string
{
    $value = getenv($key);
    if ($value === false || $value === '') {
        return $default;
    }
    return $value;
}

function app_json(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function app_input(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
    if (stripos($contentType, 'application/json') !== false) {
        $raw = file_get_contents('php://input') ?: '';
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }

    return $_POST;
}

function app_normalize_phone(string $value): string
{
    $value = preg_replace('/\D+/', '', $value) ?? '';
    return trim($value);
}

function app_slug(string $value): string
{
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
    return trim($value, '-');
}

function app_upload(array $file, string $directory): string
{
    if (!isset($file['error']) || is_array($file['error'])) {
        app_json(['ok' => false, 'message' => 'Invalid upload payload.'], 422);
    }

    if ($file['error'] === UPLOAD_ERR_NO_FILE) {
        app_json(['ok' => false, 'message' => 'Image is required.'], 422);
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        app_json(['ok' => false, 'message' => 'Upload failed.'], 422);
    }

    $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $mime = mime_content_type($file['tmp_name']) ?: '';
    if (!in_array($mime, $allowed, true)) {
        app_json(['ok' => false, 'message' => 'Only JPG, PNG, WEBP, and GIF images are allowed.'], 422);
    }

    $publicRoot = dirname(__DIR__) . '/public/uploads/' . trim($directory, '/');
    if (!is_dir($publicRoot) && !mkdir($publicRoot, 0775, true) && !is_dir($publicRoot)) {
        app_json(['ok' => false, 'message' => 'Failed to prepare upload folder.'], 500);
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $ext = $ext ? '.' . strtolower($ext) : '';
    $name = bin2hex(random_bytes(10)) . $ext;
    $target = $publicRoot . '/' . $name;

    if (!move_uploaded_file($file['tmp_name'], $target)) {
        app_json(['ok' => false, 'message' => 'Unable to save upload.'], 500);
    }

    return '/uploads/' . trim($directory, '/') . '/' . $name;
}

function app_db(): mysqli
{
    static $db = null;
    if ($db instanceof mysqli) {
        return $db;
    }

    $host = app_env('TURFGO_DB_HOST', '127.0.0.1');
    $user = app_env('TURFGO_DB_USER', 'root');
    $pass = app_env('TURFGO_DB_PASSWORD', '');
    $name = app_env('TURFGO_DB_NAME', 'turfgo');

    $server = new mysqli($host, $user, $pass);
    $server->set_charset('utf8mb4');
    $server->query(sprintf(
        "CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
        $server->real_escape_string($name)
    ));
    $server->select_db($name);

    $server->query(
        "CREATE TABLE IF NOT EXISTS users (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            role ENUM('admin', 'owner', 'customer') NOT NULL,
            username VARCHAR(120) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(160) DEFAULT NULL,
            phone_number VARCHAR(40) DEFAULT NULL,
            profile_image VARCHAR(255) DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_role (role),
            INDEX idx_phone (phone_number)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $server->query(
        "CREATE TABLE IF NOT EXISTS turfs (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            owner_user_id INT UNSIGNED NOT NULL,
            turf_name VARCHAR(180) NOT NULL,
            owner_name VARCHAR(160) NOT NULL,
            owner_phone VARCHAR(40) NOT NULL,
            division VARCHAR(100) NOT NULL,
            district VARCHAR(100) NOT NULL,
            upazila VARCHAR(100) DEFAULT NULL,
            area VARCHAR(120) DEFAULT NULL,
            address_line VARCHAR(255) DEFAULT NULL,
            price_per_hour DECIMAL(10,2) NOT NULL DEFAULT 0,
            turf_image VARCHAR(255) DEFAULT NULL,
            search_blob TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_turf_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $server->query(
        "CREATE TABLE IF NOT EXISTS bookings (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            turf_id INT UNSIGNED NOT NULL,
            booking_date DATE NOT NULL,
            start_time VARCHAR(20) NOT NULL,
            hours DECIMAL(4,1) NOT NULL DEFAULT 1,
            status ENUM('pending', 'confirmed', 'completed', 'canceled') NOT NULL DEFAULT 'pending',
            payment_method VARCHAR(40) DEFAULT NULL,
            total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
            customer_name VARCHAR(160) DEFAULT NULL,
            customer_phone VARCHAR(40) DEFAULT NULL,
            notes VARCHAR(255) DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT fk_booking_turf FOREIGN KEY (turf_id) REFERENCES turfs(id) ON DELETE CASCADE,
            INDEX idx_booking_status (status),
            INDEX idx_booking_date (booking_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $server->query(
        "CREATE TABLE IF NOT EXISTS favorites (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            turf_id INT UNSIGNED NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_favorite (user_id, turf_id),
            CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT fk_favorite_turf FOREIGN KEY (turf_id) REFERENCES turfs(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $server->query(
        "CREATE TABLE IF NOT EXISTS reviews (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            turf_id INT UNSIGNED NOT NULL,
            rating TINYINT UNSIGNED NOT NULL,
            comment TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT fk_review_turf FOREIGN KEY (turf_id) REFERENCES turfs(id) ON DELETE CASCADE,
            INDEX idx_review_rating (rating)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    app_add_column_if_missing($server, 'users', 'is_active', "TINYINT(1) NOT NULL DEFAULT 1 AFTER profile_image");
    app_add_column_if_missing($server, 'turfs', 'approval_status', "ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending' AFTER turf_image");
    app_add_column_if_missing($server, 'turfs', 'is_available', "TINYINT(1) NOT NULL DEFAULT 1 AFTER approval_status");
    app_add_column_if_missing($server, 'turfs', 'city', "VARCHAR(100) DEFAULT NULL AFTER owner_phone");

    $adminUsername = app_env('TURFGO_ADMIN_USERNAME', 'admin');
    $adminPassword = app_env('TURFGO_ADMIN_PASSWORD', 'admin123');
    $stmt = $server->prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    $stmt->execute();
    $hasAdmin = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$hasAdmin) {
        $hash = password_hash($adminPassword, PASSWORD_DEFAULT);
        $stmt = $server->prepare(
            "INSERT INTO users (role, username, password_hash, full_name, phone_number)
             VALUES ('admin', ?, ?, 'Administrator', NULL)"
        );
        $stmt->bind_param('ss', $adminUsername, $hash);
        $stmt->execute();
        $stmt->close();
    }

    app_ensure_seed_data($server);

    $db = $server;
    return $db;
}

function app_require_admin(): array
{
    if (!isset($_SESSION['auth'])) {
        app_json(['ok' => false, 'message' => 'Unauthorized.'], 401);
    }

    $auth = $_SESSION['auth'];
    if (($auth['role'] ?? null) !== 'admin') {
        app_json(['ok' => false, 'message' => 'Admin access required.'], 403);
    }

    return $auth;
}

function app_user_payload(array $user): array
{
    return [
        'id' => (int) $user['id'],
        'role' => $user['role'],
        'username' => $user['username'],
        'full_name' => $user['full_name'] ?? null,
        'phone_number' => $user['phone_number'] ?? null,
        'profile_image' => $user['profile_image'] ?? null,
        'is_active' => isset($user['is_active']) ? (int) $user['is_active'] : 1,
    ];
}

function app_turf_payload(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'turf_name' => $row['turf_name'],
        'owner_name' => $row['owner_name'],
        'owner_phone' => $row['owner_phone'],
        'division' => $row['division'],
        'district' => $row['district'],
        'upazila' => $row['upazila'],
        'area' => $row['area'],
        'address_line' => $row['address_line'],
        'price_per_hour' => (float) $row['price_per_hour'],
        'turf_image' => $row['turf_image'],
        'owner_username' => $row['owner_username'] ?? null,
        'approval_status' => $row['approval_status'] ?? 'approved',
        'is_available' => isset($row['is_available']) ? (int) $row['is_available'] : 1,
        'city' => $row['city'] ?? null,
        'created_at' => $row['created_at'],
    ];
}

function app_column_exists(mysqli $db, string $table, string $column): bool
{
    $database = $db->query('SELECT DATABASE() AS db')->fetch_assoc()['db'] ?? null;
    if (!$database) {
        return false;
    }

    $stmt = $db->prepare(
        "SELECT 1
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ?
           AND TABLE_NAME = ?
           AND COLUMN_NAME = ?
         LIMIT 1"
    );
    $stmt->bind_param('sss', $database, $table, $column);
    $stmt->execute();
    $exists = (bool) $stmt->get_result()->fetch_row();
    $stmt->close();

    return $exists;
}

function app_add_column_if_missing(mysqli $db, string $table, string $column, string $definition): void
{
    if (!app_column_exists($db, $table, $column)) {
        $db->query(sprintf('ALTER TABLE `%s` ADD COLUMN `%s` %s', $table, $column, $definition));
    }
}

function app_ensure_seed_data(mysqli $db): void
{
    $ownerUsername = 'owner1';
    $ownerPassword = password_hash('secret123', PASSWORD_DEFAULT);
    $stmt = $db->prepare("SELECT id FROM users WHERE username = ? LIMIT 1");
    $stmt->bind_param('s', $ownerUsername);
    $stmt->execute();
    $owner = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$owner) {
        $stmt = $db->prepare(
            "INSERT INTO users (role, username, password_hash, full_name, phone_number)
             VALUES ('owner', ?, ?, 'Test Owner', '01700000000')"
        );
        $stmt->bind_param('ss', $ownerUsername, $ownerPassword);
        $stmt->execute();
        $ownerId = $stmt->insert_id;
        $stmt->close();
    } else {
        $ownerId = (int) $owner['id'];
    }

    $customerUsername = '01800000000';
    $customerPassword = password_hash('pass1234', PASSWORD_DEFAULT);
    $stmt = $db->prepare("SELECT id FROM users WHERE username = ? LIMIT 1");
    $stmt->bind_param('s', $customerUsername);
    $stmt->execute();
    $customer = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$customer) {
        $stmt = $db->prepare(
            "INSERT INTO users (role, username, password_hash, full_name, phone_number)
             VALUES ('customer', ?, ?, 'Test Customer', '01800000000')"
        );
        $stmt->bind_param('ss', $customerUsername, $customerPassword);
        $stmt->execute();
        $customerId = $stmt->insert_id;
        $stmt->close();
    } else {
        $customerId = (int) $customer['id'];
    }

    $turfsCount = (int) ($db->query("SELECT COUNT(*) AS c FROM turfs")->fetch_assoc()['c'] ?? 0);
    if ($turfsCount === 0) {
        $stmt = $db->prepare(
            "INSERT INTO turfs (owner_user_id, turf_name, owner_name, owner_phone, city, division, district, upazila, area, address_line, price_per_hour, turf_image, search_blob, approval_status, is_available)
             VALUES (?, 'Bashundhara Turf Arena', 'Test Owner', '01700000000', 'Dhaka', 'Dhaka', 'Dhaka', 'Bashundhara', 'Bashundhara R/A', 'Road 1', 2500, '/brand-logo.png', 'Dhaka Bashundhara Turf Arena', 'approved', 1)"
        );
        $stmt->bind_param('i', $ownerId);
        $stmt->execute();
        $turfId = $stmt->insert_id;
        $stmt->close();
    } else {
        $row = $db->query("SELECT id FROM turfs ORDER BY id ASC LIMIT 1")->fetch_assoc();
        $turfId = (int) ($row['id'] ?? 0);
    }

    $bookingsCount = (int) ($db->query("SELECT COUNT(*) AS c FROM bookings")->fetch_assoc()['c'] ?? 0);
    if ($bookingsCount === 0 && $turfId > 0) {
        $stmt = $db->prepare(
            "INSERT INTO bookings (user_id, turf_id, booking_date, start_time, hours, status, payment_method, total_amount, customer_name, customer_phone, notes)
             VALUES (?, ?, CURDATE(), '06:00 PM', 2, 'confirmed', 'bkash', 5000, 'Test Customer', '01800000000', 'Seed booking')"
        );
        $stmt->bind_param('ii', $customerId, $turfId);
        $stmt->execute();
        $stmt->close();
    }

    $favoritesCount = (int) ($db->query("SELECT COUNT(*) AS c FROM favorites")->fetch_assoc()['c'] ?? 0);
    if ($favoritesCount === 0 && $turfId > 0) {
        $stmt = $db->prepare("INSERT IGNORE INTO favorites (user_id, turf_id) VALUES (?, ?)");
        $stmt->bind_param('ii', $customerId, $turfId);
        $stmt->execute();
        $stmt->close();
    }

    $reviewsCount = (int) ($db->query("SELECT COUNT(*) AS c FROM reviews")->fetch_assoc()['c'] ?? 0);
    if ($reviewsCount === 0 && $turfId > 0) {
        $stmt = $db->prepare(
            "INSERT INTO reviews (user_id, turf_id, rating, comment)
             VALUES (?, ?, 5, 'Good turf and clean facility')"
        );
        $stmt->bind_param('ii', $customerId, $turfId);
        $stmt->execute();
        $stmt->close();
    }
}
