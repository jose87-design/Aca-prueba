<?php
declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

function fail_route(int $status, string $code): never {
    http_response_code($status);
    echo json_encode(['status' => 'error', 'code' => $code], JSON_UNESCAPED_SLASHES);
    exit;
}

$method = (string)($_SERVER['REQUEST_METHOD'] ?? '');
if (!in_array($method, ['GET','POST'], true)) fail_route(405, 'METHOD');
$host = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
$origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
if ($origin !== '') {
    $originHost = strtolower((string)(parse_url($origin, PHP_URL_HOST) ?? ''));
    if ($originHost === '' || $originHost !== preg_replace('/:\d+$/', '', $host)) fail_route(403, 'ORIGIN');
}

if ($method === 'POST') {
    $length = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($length < 2 || $length > 10000) fail_route(413, 'SIZE');
}

$configPath = getenv('CHISPA_CONFIG_PATH') ?: dirname((string)($_SERVER['DOCUMENT_ROOT'] ?? __DIR__)) . '/.chispa-leads.php';
if (!is_file($configPath) || !is_readable($configPath)) fail_route(503, 'NOT_CONFIGURED');
$config = require $configPath;
if (!is_array($config)) fail_route(503, 'NOT_CONFIGURED');

$upstream = (string)($config['analytics_upstream'] ?? '');
$token = (string)($config['ingress_token'] ?? '');
$perIp = (int)($config['analytics_max_per_ip_hour'] ?? 180);
if (!preg_match('#^https://script\.google\.com/macros/s/[A-Za-z0-9_-]+/exec$#', $upstream) || strlen($token) < 24) fail_route(503, 'NOT_CONFIGURED');
if ($method === 'GET') {
    echo json_encode(['status' => 'ready'], JSON_UNESCAPED_SLASHES);
    exit;
}
if ($perIp < 10 || $perIp > 1000) $perIp = 180;

$ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$bucket = gmdate('YmdH');
$key = hash_hmac('sha256', 'analytics|' . $ip . '|' . $bucket, $token);
$rateDir = sys_get_temp_dir() . '/chispa-route-events';
if (!is_dir($rateDir)) @mkdir($rateDir, 0700, true);
$rateFile = $rateDir . '/' . $key;
$count = is_file($rateFile) ? (int)@file_get_contents($rateFile) : 0;
if ($count >= $perIp) fail_route(429, 'RATE_LIMIT');
@file_put_contents($rateFile, (string)($count + 1), LOCK_EX);
foreach (glob($rateDir . '/*') ?: [] as $f) {
    if (@filemtime($f) !== false && filemtime($f) < time() - 7200) @unlink($f);
}

$raw = file_get_contents('php://input');
$data = is_string($raw) ? json_decode($raw, true) : null;
if (!is_array($data)) fail_route(400, 'INPUT');

$allowed = [
    'timestamp_iso'=>80,'event_id'=>100,'route_id'=>100,'route_version'=>100,'app_version'=>100,
    'session_id'=>120,'visit_id'=>120,'consent_version'=>80,'event_type'=>100,'language'=>10,
    'group_type'=>60,'group_size'=>30,'device_type'=>40,'viewport_width'=>20,'viewport_height'=>20,
    'user_agent_short'=>40,'referrer'=>40,'page_url'=>300,'source'=>100,'stop_id'=>30,'stop_name'=>140,
    'stop_order'=>30,'attempt_number'=>20,'hints_used'=>20,'answer_length'=>20,'is_correct'=>10,
    'completed_stop'=>10,'completed_route'=>10,'unlocked_count'=>20,'completed_count'=>20,
    'progress_percent'=>20,'elapsed_seconds'=>30,'active_seconds'=>30,'local_hour'=>10,'local_weekday'=>30
];
$clean = [];
foreach ($allowed as $field => $max) {
    if (!array_key_exists($field, $data)) continue;
    $value = $data[$field];
    if (is_bool($value) || is_int($value) || is_float($value)) $value = (string)$value;
    if (!is_string($value)) continue;
    $clean[$field] = mb_substr($value, 0, $max);
}
if (($clean['route_id'] ?? '') !== 'ruta_pergamino_tarazona' || !isset($clean['event_type'])) fail_route(400, 'INPUT');

$outbound = json_encode($clean, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if ($outbound === false) fail_route(400, 'INPUT');

$ch = curl_init($upstream);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $outbound,
    CURLOPT_HTTPHEADER => ['Content-Type: text/plain; charset=utf-8'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 3,
    CURLOPT_CONNECTTIMEOUT => 3,
    CURLOPT_TIMEOUT => 6,
    CURLOPT_USERAGENT => 'EducandoConChispa-RouteAnalytics/1.0',
]);
curl_exec($ch);
$errno = curl_errno($ch);
$http = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);

if ($errno !== 0 || $http < 200 || $http >= 400) fail_route(502, 'UPSTREAM');
echo json_encode(['status' => 'accepted'], JSON_UNESCAPED_SLASHES);
