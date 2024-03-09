const transTable = document.querySelector(".transactions-table tbody");
const transactions = JSON.parse(localStorage.transactions ?? "[]");
const noTrans = document.querySelector(".no-transactions");
const showType = document.getElementById("show_type");
const sortHeaders = document.querySelectorAll("th[data-sort]");
const currencySelector = document.getElementById("currency_select");

let sortDesc = false;
let show = "all";
let sort = "date";
let currency = "all";

sortHeaders.forEach((header) =>
  header.addEventListener("click", () => {
    const sortType = header.dataset.sort;
    sortDesc = !sortDesc;
    populateTable(show, currency, sortType, sortDesc);
  })
);

getCurrencies().then(() => {
  const currencies = JSON.parse(localStorage.currencies);
  currencies.map((currency) => {
    const { name, symbol, code } = currency;
    currencySelector.innerHTML += `<option value="${code}">${code} (${symbol})</option>`;
  });
});
showType.addEventListener("change", (e) => {
  const type = e.target.value;
  show = type;
  populateTable(type);
});
currencySelector.addEventListener("change", (e) => {
  const selCurrency = e.target.value;
  currency = selCurrency;
  populateTable(show, selCurrency);
});

const populateTable = (type, currency = "all", sort = "date", desc = false) => {
  transTable.innerHTML = "";
  const transactions = JSON.parse(localStorage.transactions ?? "[]");
  let shownTransactions;
  switch (type) {
    case "income":
      shownTransactions = transactions.filter((tr) => tr.type === "income");
      break;
    case "expense":
      shownTransactions = transactions.filter((tr) => tr.type === "expense");
      break;
    default:
      shownTransactions = transactions;
  }
  if (currency !== "all") {
    shownTransactions = shownTransactions.filter(
      (tr) => tr.currency.code === currency
    );
  }
  switch (sort) {
    case "date":
      shownTransactions = shownTransactions.sort((a, b) =>
        desc ? b.date - a.date : a.date - b.date
      );
      break;
    case "amount":
      shownTransactions = shownTransactions.sort((a, b) =>
        desc ? b.usdAmount - a.usdAmount : a.usdAmount - b.usdAmount
      );
  }
  shownTransactions.map((trans) => {
    const { id, currency, amount, usdAmount, type, desc, date } = trans;
    // Delete Button
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("action-button");
    deleteBtn.innerHTML = `<img src="./assets/images/icons/delete.svg" />`;
    deleteBtn.addEventListener("click", () => deleteTransaction(id));

    const row = document.createElement("tr");
    row.id = `transaction_${id}`;
    row.innerHTML = `<td>${id}</td>
    <td>${new Date(date).toLocaleString()}</td>
    <td class="${desc == "" ? "text-muted italic" : ""}">${
      desc == "" ? "No description provided." : desc
    }</td>
    <td class="font-bold currency-row ${
      type == "income" ? "text-primary" : "text-error"
    }"><img src="./assets/images/currencies/${currency.code}.png" />${
      type == "income" ? "+" : "-"
    }${CurrencyFormat(currency.code).format(amount)}</td>`;

    // Actions column
    const actionsCol = document.createElement("td");

    // Edit button
    actionsCol.innerHTML += `<a class="action-button unstyled-link" href="./transaction.html?edit=${id}"><img src="./assets/images/icons/edit.svg" /></a>`;
    actionsCol.append(deleteBtn);

    row.append(actionsCol);

    transTable.append(row);
  });
};

populateTable();
if (transactions.length > 0) noTrans.classList.toggle("hidden", true);

const deleteTransaction = (id) => {
  document.getElementById(`transaction_${id}`).remove();
  const transactions = JSON.parse(localStorage.transactions ?? "[]");
  const newTransactions = transactions.filter((t) => t.id !== id);
  localStorage.transactions = JSON.stringify(newTransactions);
  // Calculate new balance
  calculateBalance();
  if (newTransactions.length === 0) noTrans.classList.toggle("hidden", false);
};
