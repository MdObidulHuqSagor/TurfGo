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
        'created_at' => $row['created_at'],
    ];
}
