function filterJsonObjects(jsonObject, feed) {
  const substrings = ["5L", "5S", "3L", "3S"];

  var filteredObjects = jsonObject;
  
	if (feed === 1) {
	  filteredObjects = filteredObjects.filter(obj => substrings.some(substring => obj.currency.includes(substring)));
	} else if (feed === 2) {
	  filteredObjects = filteredObjects.data.filter(obj => substrings.some(substring => obj.symbol.includes(substring)));
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
		
	(function() {
	  // Fetching the JSON data from the API endpoint
	  fetch("ETFs.php?feed=1")
		.then(response => {
		  if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}. Response data: ${response.text()}`);
		  }
		  return response.json();
		})
		.then(jsonObject => {
		  const filteredJsonObject = filterJsonObjects(jsonObject, 1);
		  const flattenedCurrencyArray = filteredJsonObject.map(obj => obj.currency).flat();
		  const currencyList = flattenedCurrencyArray.join("<br>");
		  const box = document.querySelector("#GateIO");
		  box.innerHTML = currencyList;
		})
		.catch(error => console.error(error));
	
	  (function() {
		fetch("ETFs.php?feed=2")
		  .then(response => {
			if (!response.ok) {
			  throw new Error(`HTTP error! Status: ${response.status}. Response data: ${response.text()}`);
			}
			console.log(response);
			return response.json();
		  })
		  .then(jsonObject => {
			const filteredJsonObject = filterJsonObjects(jsonObject, 2);
			const flattenedCurrencyArray = filteredJsonObject.map(obj => obj.symbol).flat();
			const currencyList = flattenedCurrencyArray.join("<br>");
			const box = document.querySelector("#KuCoin");
			box.innerHTML = currencyList;
		  })
		  .catch(error => console.error(error));
	  })();
	
	  (function() {
		fetch("ETFs.php?feed=3")
		  .then(response => {
			if (!response.ok) {
			  throw new Error(`HTTP error! Status: ${response.status}. Response data: ${response.text()}`);
			}
			return response.json();
		  })
		  .then(jsonObject => {
			const filteredJsonObject = filterJsonObjects(jsonObject, 3);
			const flattenedCurrencyArray = filteredJsonObject.map(obj => obj.name).flat();
			const currencyList = flattenedCurrencyArray.join("<br>");
			const box = document.querySelector("#MEXC");
			box.innerHTML = currencyList;
		  })
		  .catch(error => console.error(error));
	  })();
	})();
})();
