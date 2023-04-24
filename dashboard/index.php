<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'vendor/autoload.php';

use ccxt\Exchange;

$apiKeys = [
	'binance' => [
		'apiKey' => 'fmiX4M1slroIMd7cxlUabfz5zFsl0UiHpyfgDg8iS9VqaFBfgdWffQmVxD9FpmDv',
		'secret' => 'DTjf6G5FCLwVH59Ke4M85zX9o6eXgyvtqhbdIyAXFdrV3BhxGD6EDgf04WpENtib',
	]
	
	// Add more exchanges and their respective API keys here.
];

function login($exchangeId, $apiKey, $secret) {
	$exchangeClass = "\\ccxt\\$exchangeId";
	$exchange = new $exchangeClass(array(
		'apiKey' => $apiKey,
		'secret' => $secret,
	));

	return $exchange;
}

function get_total_account_balance($exchange) {
	$balance = $exchange->fetch_balance();
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
		$exchange = login($exchangeId, $credentials['apiKey'], $credentials['secret']);
		$total_balances = get_total_account_balance($exchange);
		$output[$exchangeId] = $total_balances;
	} catch (Exception $e) {
		$output[$exchangeId] = ["error" => $e->getMessage()];
	}
}

$json_output = json_encode($output, JSON_PRETTY_PRINT);
echo $json_output;

?>