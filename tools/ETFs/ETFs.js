function filterJsonObjects(jsonObject) {
  const substrings = ["5L", "5S", "3L", "3S"];

  const filteredObjects = jsonObject.filter(obj => {
	const currency = obj.currency;
	return substrings.some(substring => currency.includes(substring));
  });

  return filteredObjects;
}

// Fetching the JSON data from the API endpoint
fetch("proxy.php")
  .then(response => {
	if (!response.ok) {
	  return response.text().then(text => {
		throw new Error(`HTTP error! Status: ${response.status}. Response data: ${text}`);
	  });
	}
	return response.json();
  })
  .then(jsonObject => {
	const filteredJsonObject = filterJsonObjects(jsonObject);
	const flattenedCurrencyArray = filteredJsonObject.map(obj => obj.currency).flat();
	const currencyList = flattenedCurrencyArray.join("<br>");
	const boxDiv = document.querySelector("#box");
	boxDiv.innerHTML = currencyList;
  })
  .catch(error => console.error(error));
