function filterJsonObjects(jsonObject, feed) {
  const substrings = ["5L", "5S", "3L", "3S"];

  var filteredObjects = jsonObject;
  
	if (feed === 1) {
	  filteredObjects = filteredObjects.filter(obj => substrings.some(substring => obj.currency.includes(substring)));
	} else if (feed === 2) {
	  filteredObjects = filteredObjects.filter(obj => substrings.some(substring => obj.symbol.includes(substring)));
	} else if (feed === 3) {
	  filteredObjects = filteredObjects.filter(obj => substrings.some(substring => obj.symbol.includes(substring)));
	}

  return filteredObjects;
}

(function()
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
})();
