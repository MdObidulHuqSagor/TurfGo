<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

if (!isset($_SESSION['auth'])) {
    app_json(['ok' => true, 'user' => null]);
}

app_json([
    'ok' => true,
    'user' => $_SESSION['auth'],
]);
