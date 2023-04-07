function filterJsonObjects(jsonObject, feed) {
  const substrings = ["5L", "5S", "3L", "3S"];

  const filteredObjects = jsonObject.filter(obj => {
	var currency;
	if( feed == 1 ) currency = obj.currency;
	if( feed == 2 ) currency = obj.symbol;
	if( feed == 3 ) currency = obj.symbol;
	return substrings.some(substring => currency.includes(substring));
  });

  return filteredObjects;
}

function()
{
	var filteredJsonObject,
		flattenedCurrencyArray,
		currencyList,
		box;
		
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
		filteredJsonObject = filterJsonObjects(jsonObject, 1);
		flattenedCurrencyArray = filteredJsonObject.map(obj => obj.currency).flat();
		currencyList = flattenedCurrencyArray.join("<br>");
		box = document.querySelector("#GateIO");
		box.innerHTML = currencyList;
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
		filteredJsonObject = filterJsonObjects(jsonObject, 2);
		flattenedCurrencyArray = filteredJsonObject.map(obj => obj.currency).flat();
		currencyList = flattenedCurrencyArray.join("<br>");
		box = document.querySelector("#KuCoin");
		box.innerHTML = currencyList;
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
		  filteredJsonObject = filterJsonObjects(jsonObject, 3);
		  flattenedCurrencyArray = filteredJsonObject.map(obj => obj.currency).flat();
		  currencyList = flattenedCurrencyArray.join("<br>");
		  box = document.querySelector("#MEXC");
		  box.innerHTML = currencyList;
		})
		.catch(error => console.error(error));
}();
