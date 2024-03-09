const title = document.getElementById("transaction-title");
// Form
const transForm = document.getElementById("trans_form");
const [currencySelector, transAmount] = [
  document.getElementById("currency_selector"),
  document.getElementById("trans_amount"),
];
let prevCurrency = "USD";

// Check if edit mode
const param = new URLSearchParams(window.location.search).get("edit");
if (param) {
  title.textContent = "Edit Transaction";
}

// Fetch currencies and populate
// currency dropdown
getCurrencies().then(() => {
  const currencies = JSON.parse(localStorage.currencies);
  currencies.map((currency) => {
    const { name, symbol, code } = currency;
    currencySelector.innerHTML += `<option value="${code}">${name} (${symbol})</option>`;
  });
});

currencySelector.addEventListener("change", async (e) => {
  // Disable amount field
  toggleDisabled(transAmount, true);

  const newCurrency = e.target.value;
  // Convert currencies
  const convert = await convertCurrency(
    prevCurrency,
    newCurrency,
    parseFloat(transAmount.value)
  );
  const data = await convert;
  transAmount.value = data;
  toggleDisabled(transAmount, false);
  prevCurrency = newCurrency;
});

transForm.addEventListener("submit", (e) => {
  e.preventDefault();
  createTransaction(
    currencySelector.value,
    transAmount.value,
    document.querySelector('input[name="trans_type"]:checked').value
  );
});

const createTransaction = async (
  currency = "USD",
  amount = 0.0,
  type = "income"
) => {
  const transactions = JSON.parse(localStorage.transactions ?? "[]");
  const transObject = {
    id: (transactions[transactions.length - 1]?.id ?? 0) + 1,
    currency: currency,
    amount: amount,
    usdAmount: await convertCurrency(currency, "USD", amount).then(
      (data) => data
    ),
    type: type,
  };
  localStorage.transactions = JSON.stringify([...transactions, transObject]);
  calculateBalance();
};

const toggleDisabled = (element, condition = true) => {
  if (condition) {
    element.setAttribute("disabled", true);
    return;
  }
  element.removeAttribute("disabled");
};
