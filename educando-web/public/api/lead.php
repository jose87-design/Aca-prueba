<?php
declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

function fail(int $status, string $code): never {
    http_response_code($status);
    echo json_encode(['status' => 'error', 'code' => $code], JSON_UNESCAPED_SLASHES);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail(405, 'METHOD');

$host = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
$origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
if ($origin !== '') {
    $originHost = strtolower((string)(parse_url($origin, PHP_URL_HOST) ?? ''));
    if ($originHost === '' || $originHost !== preg_replace('/:\d+$/', '', $host)) fail(403, 'ORIGIN');
}

$length = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($length < 2 || $length > 12000) fail(413, 'SIZE');

$configPath = getenv('CHISPA_CONFIG_PATH') ?: dirname((string)($_SERVER['DOCUMENT_ROOT'] ?? __DIR__)) . '/.chispa-leads.php';
if (!is_file($configPath) || !is_readable($configPath)) fail(503, 'NOT_CONFIGURED');
$config = require $configPath;
if (!is_array($config)) fail(503, 'NOT_CONFIGURED');

$upstream = (string)($config['upstream'] ?? '');
$token = (string)($config['ingress_token'] ?? '');
$perIp = (int)($config['max_per_ip_hour'] ?? 12);
if (!preg_match('#^https://script\.google\.com/macros/s/[A-Za-z0-9_-]+/exec$#', $upstream) || strlen($token) < 24) fail(503, 'NOT_CONFIGURED');
if ($perIp < 1 || $perIp > 100) $perIp = 12;

$raw = file_get_contents('php://input');
if (!is_string($raw) || strlen($raw) > 12000) fail(400, 'INPUT');
$data = json_decode($raw, true);
if (!is_array($data)) fail(400, 'INPUT');

$ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$bucket = gmdate('YmdH');
$key = hash_hmac('sha256', $ip . '|' . $bucket, $token);
$rateDir = sys_get_temp_dir() . '/chispa-leads';
if (!is_dir($rateDir)) @mkdir($rateDir, 0700, true);
$rateFile = $rateDir . '/' . $key;
$count = 0;
if (is_file($rateFile)) $count = (int)@file_get_contents($rateFile);
if ($count >= $perIp) fail(429, 'RATE_LIMIT');
@file_put_contents($rateFile, (string)($count + 1), LOCK_EX);
foreach (glob($rateDir . '/*') ?: [] as $f) {
    if (@filemtime($f) !== false && filemtime($f) < time() - 7200) @unlink($f);
}

$data['ingress_token'] = $token;
$outbound = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if ($outbound === false) fail(400, 'INPUT');

$ch = curl_init($upstream);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $outbound,
    CURLOPT_HTTPHEADER => ['Content-Type: text/plain; charset=utf-8'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 3,
    CURLOPT_CONNECTTIMEOUT => 4,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_USERAGENT => 'EducandoConChispa-Leads/1.0',
]);
$response = curl_exec($ch);
$errno = curl_errno($ch);
$http = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);

if ($errno !== 0 || !is_string($response) || $http < 200 || $http >= 400) fail(502, 'UPSTREAM');
$decoded = json_decode($response, true);
if (!is_array($decoded) || !isset($decoded['status'])) fail(502, 'UPSTREAM_RESPONSE');

http_response_code($decoded['status'] === 'success' || $decoded['status'] === 'ok' ? 200 : 422);
echo json_encode($decoded, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
