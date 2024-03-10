const title = document.getElementById("transaction-title");
// Form
const transForm = document.getElementById("trans_form");
const [currencySelector, transAmount, transDesc, submitBtn] = [
  document.getElementById("currency_selector"),
  document.getElementById("trans_amount"),
  document.getElementById("trans_desc"),
  document.getElementById("submit_btn"),
];
let prevCurrency = "USD";
let editMode = false;
let editTransaction = {};

// Check if edit mode
const editParam = new URLSearchParams(window.location.search).get("edit");
if (editParam) {
  // Check if transaction ID is valid
  const transactions = JSON.parse(localStorage.transactions ?? "[]");
  const transaction = transactions.filter((trans) => trans.id == editParam);
  if (transaction.length > 0) {
    title.textContent = "Edit Transaction";
    editMode = true;
    editTransaction = transaction[0];
    prevCurrency = transaction[0].currency.code;

    // Fill form
    transAmount.value = editTransaction.amount;
    transDesc.value = editTransaction.desc;
    document.querySelector(
      `#trans_type_${editTransaction.type}`
    ).checked = true;

    submitBtn.textContent = "Save";
  }
}

// Fetch currencies and populate
// currency dropdown
getCurrencies().then(() => {
  const currencies = JSON.parse(localStorage.currencies);
  currencies.map((currency) => {
    const { name, symbol, code } = currency;
    currencySelector.innerHTML += `<option value="${code}" ${
      prevCurrency === code ? "selected" : ""
    }>${name} (${symbol})</option>`;
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
  toggleDisabled(submitBtn, true);
  createTransaction(
    currencySelector.value,
    transAmount.value,
    document.querySelector('input[name="trans_type"]:checked').value,
    transDesc.value.trim()
  ).then(() => {
    toggleDisabled(submitBtn, false);
    transForm.reset();
  });
});

const createTransaction = async (
  currency = "USD",
  amount = 0.0,
  type = "income",
  desc = ""
) => {
  const transactions = JSON.parse(localStorage.transactions ?? "[]");
  const transObject = {
    id: editMode
      ? editTransaction.id
      : (transactions[transactions.length - 1]?.id ?? 0) + 1,
    currency: getCurrencyDetails(currency),
    amount: amount,
    usdAmount: await convertCurrency(currency, "USD", amount).then(
      (data) => data
    ),
    type: type,
    desc: desc,
    date: editMode ? editTransaction.date : Date.now(),
  };
  if (editMode) {
    const newTransactions = transactions.map((tr) =>
      tr.id === transObject.id
        ? {
            ...tr,
            ...transObject,
          }
        : tr
    );
    localStorage.transactions = JSON.stringify([...newTransactions]);
    calculateBalance();
    return;
  }
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
