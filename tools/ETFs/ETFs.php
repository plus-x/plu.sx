<?php

$url = "https://api.gateio.ws/api/v4/spot/currencies";

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
