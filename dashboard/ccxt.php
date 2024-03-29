<?php

error_reporting(E_ALL);
ini_set('display_errors', 0); // Disable displaying errors
ini_set('log_errors', 1); // Enable logging errors


require_once 'vendor/autoload.php';

use ccxt\Exchange;

$apiKeys = [
	'binance' => [
		'apiKey' => 'fmiX4M1slroIMd7cxlUabfz5zFsl0UiHpyfgDg8iS9VqaFBfgdWffQmVxD9FpmDv',
		'secret' => 'DTjf6G5FCLwVH59Ke4M85zX9o6eXgyvtqhbdIyAXFdrV3BhxGD6EDgf04WpENtib',
	],
	'mexc' => [
		'apiKey' => 'mx0vglOx0aDB39KAOt',
		'secret' => 'eebec69041d9489e83650a424beee4db',
	],
	'kucoin' => [
		'apiKey' => '644709064fb6dc0001c7220f',
		'secret' => 'fc1603ff-4694-4525-a074-b9699cd355af',
		'password' => 'ZAv27eNuT39LZCrfQ4DMQfca!mPjQCHa', // KuCoin requires an API password as well
	],
	'bybit' => [
		'apiKey' => 'yNAXnUZ9NuykSzE64n',
		'secret' => '5QI9csq15ThYBJsEZ9OWkweO8NI3VWOokn6F',
	],
	'ascendex' => [
		'apiKey' => 'wJuIjYwu8xIBVs1XafLOh1cXkKgYsnrv',
		'secret' => 'gUjj8xK8C4N74vzWHPUiJCVRXy23ba8vqEgkmh5C9QBDxSfdXXChvRnDvh7BHJo2',
	]
];

function login($exchangeId, $apiKey, $secret, $password = null) {
	$exchangeClass = "\\ccxt\\$exchangeId";
	$exchange = new $exchangeClass(array(
		'apiKey' => $apiKey,
		'secret' => $secret,
		'password' => $password, // Add this line for exchanges that require an API password
	));

	return $exchange;
}

function get_total_account_balance($exchange) {
	try {
		$balance = $exchange->fetch_balance();
		$balances = [];

		foreach ($balance['total'] as $currency => $amount) {
			if ($amount > 0) {
				$balances[$currency] = $amount;
			}
		}

		return $balances;
		
	} catch (Exception $e) {
		return ["error" => $e->getMessage()];
	}
}

function get_total_account_balance_bybit_spot($exchange) {
	$balance = $exchange->fetch_balance(array('type' => 'spot')); // Add 'type' => 'spot' parameter
	$balances = [];

	foreach ($balance['total'] as $currency => $amount) {
		if ($amount > 0) {
			$balances[$currency] = $amount;
		}
	}

	return $balances;
}

$output = [];

foreach ($apiKeys as $exchangeId => $credentials) {
	try {
		$exchange = login($exchangeId, $credentials['apiKey'], $credentials['secret'], $credentials['password'] ?? null);

		if ($exchangeId === 'bybit') {
			$total_balances = get_total_account_balance_bybit_spot($exchange);
		} else {
			$total_balances = get_total_account_balance($exchange);
		}

		$output[$exchangeId] = $total_balances;
	} catch (Exception $e) {
		$output[$exchangeId] = ["error" => $e->getMessage()];
	}
}

function custom_error_handler($errno, $errstr, $errfile, $errline) {
	global $output;

	$output['php_error'] = [
		'error_no' => $errno,
		'message' => $errstr,
		'file' => $errfile,
		'line' => $errline
	];
}

set_error_handler("custom_error_handler");

$json_output = json_encode($output, JSON_PRETTY_PRINT);
echo $json_output;

?>