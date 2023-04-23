<?php
require_once 'vendor/autoload.php';

use ccxt\Exchange;

$apiKeys = [
	'binance' => [
		'apiKey' => 'YOUR_BINANCE_API_KEY',
		'secret' => 'YOUR_BINANCE_SECRET_KEY',
	],
	'coinbasepro' => [
		'apiKey' => 'YOUR_COINBASEPRO_API_KEY',
		'secret' => 'YOUR_COINBASEPRO_SECRET_KEY',
		'password' => 'YOUR_COINBASEPRO_API_PASSWORD',
	],
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
		echo "Logging in to $exchangeId\n";
		$exchange = create_exchange($exchangeId, $credentials['apiKey'], $credentials['secret'], $credentials['password'] ?? null);
		$total_balance = get_total_balance($exchange);
		echo "Total balance on $exchangeId: $total_balance\n";
		echo "---------------------------------\n";
	}
}

main($apiKeys);
