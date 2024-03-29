const BASE_URL = "https://dull-pink-sockeye-tie.cyclic.app";
const API_URLS = {
  fetch: BASE_URL + "/students/available",
  convert: BASE_URL + "/students/convert",
};

const totalBalance = document.querySelectorAll(".total-balance");

const getCurrencies = async () => {
  if (localStorage.hasOwnProperty("currencies")) {
    return;
  }
  const result = await fetch(API_URLS.fetch);
  const data = await result.json();
  // Save currencies to local storage
  // to avoid repeatedly calling the API
  localStorage.currencies = JSON.stringify(data);
  return;
};

const convertCurrency = async (from = "USD", to = "USD", amount = 0.0) => {
  if (from === to) {
    return parseFloat(amount);
  }
  const result = await fetch(API_URLS.convert, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: from,
      to: to,
      amount: parseFloat(amount),
    }),
  });
  const data = await result.json();
  return parseFloat(data.toFixed(2));
};

// https://www.freecodecamp.org/news/how-to-format-number-as-currency-in-javascript-one-line-of-code/
const CurrencyFormat = (currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  });
};

const calculateBalance = (valueOnly = false) => {
  const transactions = JSON.parse(localStorage.transactions ?? "[]");
  let balance = 0;
  transactions.map((trans) => {
    const amount = trans.usdAmount;
    const type = trans.type;
    switch (type) {
      case "income":
        balance += amount;
        break;
      case "expense":
        balance -= amount;
        break;
    }
  });
  if (valueOnly) {
    return parseFloat(balance.toFixed(2));
  }
  const formatted = CurrencyFormat("USD").format(balance);
  totalBalance.forEach((el) => (el.textContent = `${formatted}`));
  return formatted;
};

// Calculate balance on load
calculateBalance();

const getCurrencyDetails = (code) => {
  const currencies = JSON.parse(localStorage.currencies);
  return currencies.filter((currency) => currency.code === code)?.[0];
};
