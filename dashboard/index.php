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
	$total = 0;

	foreach ($balance['total'] as $currency => $amount) {
		if ($amount > 0) {
			echo "Currency: $currency, Amount: $amount\n";
			$total += $exchange->price_to_precision($currency, $amount);
		}
	}

	return $total;
}

foreach ($apiKeys as $exchangeId => $credentials) {
	try {
		$exchange = login($exchangeId, $credentials['apiKey'], $credentials['secret']);
		echo "Logged into $exchangeId\n";
		$total_balance = get_total_account_balance($exchange);
		echo "Total Account Balance for $exchangeId: $total_balance\n\n";
	} catch (Exception $e) {
		echo "Error logging into $exchangeId: " . $e->getMessage() . "\n\n";
	}
}
