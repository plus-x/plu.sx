<?php

$feedNumber = isset($_GET['feed']) ? $_GET['feed'] : 1;
$url = "";

if ($feedNumber == 1) {
  $url = "https://api.gateio.ws/api/v4/spot/currencies";
} else if ($feedNumber == 2) {
  $url = "https://api.kucoin.com/api/v2/symbols";
} else if ($feedNumber == 3) {
  $url = "https://api.mexc.com/api/v3/etf/info";
} 
else {
  echo "Invalid feed number.";
  exit();
}

// Set up cURL
$curl = curl_init();
curl_setopt_array($curl, array(
  CURLOPT_URL => $url,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTPHEADER => array(
	"Content-Type: application/json"
  )
));

// Execute the cURL request
$response = curl_exec($curl);

// Check for errors
if (curl_errno($curl)) {
  echo "Error: " . curl_error($curl);
  exit();
}

// Close the cURL session
curl_close($curl);

// Set the Content-Type header to allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Output the response data
echo $response;

?>
