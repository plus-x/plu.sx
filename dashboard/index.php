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

function create_exchange($exchangeId, $apiKey, $apiSecret, $apiPassword = null) {
	$exchangeClass = "\\ccxt\\$exchangeId";
	$exchange = new $exchangeClass(array(
		'apiKey' => $apiKey,
		'secret' => $apiSecret,
		'password' => $apiPassword, // For exchanges that require a password, like Coinbase Pro
		'enableRateLimit' => true,
	));

	return $exchange;
}

function get_total_balance(Exchange $exchange) {
	$balance = $exchange->fetch_balance();
	$total_balance = 0;

	foreach ($balance['total'] as $currency => $amount) {
		if ($amount > 0) {
			echo "Currency: $currency, Amount: $amount\n";
			$total_balance += $amount;
		}
	}

	return $total_balance;
}

function main($apiKeys) {
	foreach ($apiKeys as $exchangeId => $credentials) {
		$exchangeClass = "\\ccxt\\" . $exchangeId;
		
		try {
			$exchange = new $exchangeClass(array_merge($credentials, $settings));
			echo "Logging into $exchangeId...\n";
			$balance = $exchange->fetch_balance();
			echo "Fetched balance from $exchangeId...\n";
			print_r($balance);
		} catch (Exception $e) {
			echo "Error while fetching balance from $exchangeId: " . $e->getMessage() . "\n";
		}
	}
}

main($apiKeys);
