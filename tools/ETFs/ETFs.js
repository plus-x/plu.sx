function filterJsonObjects(jsonObject, feed) {
  const substrings = ["5L", "5S", "3L", "3S"];

  const filteredObjects = jsonObject.filter(obj => {
	const currency;
	if( feed == 1 ) currency = obj.currency;
	if( feed == 2 ) currency = obj.symbol;
	if( feed == 3 ) currency = obj.symbol;
	return substrings.some(substring => currency.includes(substring));
  });

  return filteredObjects;
}

// Fetching the JSON data from the API endpoint
fetch("ETFs.php?feed=1")
  .then(response => {
	if (!response.ok) {
	  return response.text().then(text => {
		throw new Error(`HTTP error! Status: ${response.status}. Response data: ${text}`);
	  });
	}
	return response.json();
  })
  .then(jsonObject => {
	const filteredJsonObject = filterJsonObjects(jsonObject, 1);
	const flattenedCurrencyArray = filteredJsonObject.map(obj => obj.currency).flat();
	const currencyList = flattenedCurrencyArray.join("<br>");
	const boxGateIO = document.querySelector("#GateIO");
	boxGateIO.innerHTML = currencyList;
  })
  .catch(error => console.error(error));

fetch("ETFs.php?feed=2")
  .then(response => {
	if (!response.ok) {
	  return response.text().then(text => {
		throw new Error(`HTTP error! Status: ${response.status}. Response data: ${text}`);
	  });
	}
	return response.json();
  })
  .then(jsonObject => {
	const filteredJsonObject = filterJsonObjects(jsonObject, 2);
	const flattenedCurrencyArray = filteredJsonObject.map(obj => obj.currency).flat();
	const currencyList = flattenedCurrencyArray.join("<br>");
	const boxKuCoin = document.querySelector("#KuCoin");
	boxKuCoin.innerHTML = currencyList;
  })
  .catch(error => console.error(error));
  
  fetch("ETFs.php?feed=3")
	.then(response => {
	  if (!response.ok) {
		return response.text().then(text => {
		  throw new Error(`HTTP error! Status: ${response.status}. Response data: ${text}`);
		});
	  }
	  return response.json();
	})
	.then(jsonObject => {
	  const filteredJsonObject = filterJsonObjects(jsonObject, 3);
	  const flattenedCurrencyArray = filteredJsonObject.map(obj => obj.currency).flat();
	  const currencyList = flattenedCurrencyArray.join("<br>");
	  const boxMEXC = document.querySelector("#MEXC");
	  boxMEXC.innerHTML = currencyList;
	})
	.catch(error => console.error(error));
