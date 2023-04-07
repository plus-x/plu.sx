function filterJsonObjects(jsonObject) {
  const substrings = ["5L", "5S", "3L", "3S"];

  const filteredObjects = jsonObject.filter(obj => {
	const currency = obj.currency;
	return substrings.some(substring => currency.includes(substring));
  });

  return filteredObjects;
}

// Fetching the JSON data from the API endpoint
fetch("ETFs.php")
  .then(response => response.json())
  .then(jsonObject => {
	const filteredJsonObject = filterJsonObjects(jsonObject);
	const flattenedCurrencyArray = filteredJsonObject.map(obj => obj.currency).flat();
	const currencyList = flattenedCurrencyArray.join("<br>");
	document.body.innerHTML = `<p>${currencyList}</p>`;
  })
  .catch(error => console.error(error));