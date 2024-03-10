const transTable = document.querySelector(".transactions-table tbody");
const noTrans = document.querySelector(".no-transactions");
const showTypeSelector = document.getElementById("show_type");
const sortingHeaders = document.querySelectorAll("th[data-sort]");
const currencySelector = document.getElementById("currency_select");
const [amountFromInput, amountToInput] = [
  document.getElementById("amount_from"),
  document.getElementById("amount_to"),
];

// Sorting & filtering variables
let sortDescending = false;
let showType = "all";
let sort = "date";
let currency = "all";
let amountFrom;
let amountTo;

// Event listeners
sortingHeaders.forEach((header) =>
  header.addEventListener("click", () => {
    const sortType = header.dataset.sort;
    sort = sortType;
    sortDescending = !sortDescending;
    populateTable();
  })
);
showTypeSelector.addEventListener("change", (e) => {
  const type = e.target.value;
  showType = type;
  populateTable(type);
});
currencySelector.addEventListener("change", (e) => {
  const selCurrency = e.target.value;
  currency = selCurrency;
  populateTable(showType, selCurrency);
});
amountFromInput.addEventListener("input", (e) => {
  amountFrom = parseFloat(e.target.value);
  populateTable();
});
amountToInput.addEventListener("input", (e) => {
  amountTo = parseFloat(e.target.value);
  populateTable();
});

getCurrencies().then(() => {
  const currencies = JSON.parse(localStorage.currencies);
  currencies.map((currency) => {
    const { name, symbol, code } = currency;
    currencySelector.innerHTML += `<option value="${code}">${code} (${symbol})</option>`;
  });
});

const populateTable = () => {
  transTable.innerHTML = "";

  const transactions = filterTransactions();

  // Toggle no transactions message if none are found
  noTrans.classList.toggle("hidden", transactions.length > 0);

  // Iterate over transactions and add them to table
  transactions.map((trans) => {
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

const filterTransactions = () => {
  let transactions = JSON.parse(localStorage.transactions ?? "[]");

  // Transaction type
  switch (showType) {
    case "income":
      transactions = transactions.filter((tr) => tr.type === "income");
      break;
    case "expense":
      transactions = transactions.filter((tr) => tr.type === "expense");
      break;
  }

  // Transaction currency
  if (currency != "all") {
    transactions = transactions.filter((tr) => tr.currency.code === currency);
  }

  // Sorting
  switch (sort) {
    case "date":
      transactions = transactions.sort((a, b) =>
        sortDescending ? b.date - a.date : a.date - b.date
      );
      break;
    case "amount":
      transactions = transactions.sort((a, b) =>
        sortDescending
          ? (b.type === "income" ? b.usdAmount : -b.usdAmount) -
            (a.type === "income" ? a.usdAmount : -a.usdAmount)
          : (a.type === "income" ? a.usdAmount : -a.usdAmount) -
            (b.type === "income" ? b.usdAmount : -b.usdAmount)
      );
      break;
  }

  // Amount from and to
  if (!isNaN(amountFrom) && !isNaN(amountTo)) {
    transactions = transactions.filter((tr) => {
      const amount = tr.type === "income" ? tr.amount : -tr.amount;
      return amount >= amountFrom && amount <= amountTo;
    });
  }

  return transactions;
};

// Populate table on page load
populateTable();

const deleteTransaction = (id) => {
  document.getElementById(`transaction_${id}`).remove();
  const transactions = JSON.parse(localStorage.transactions ?? "[]");
  const newTransactions = transactions.filter((t) => t.id !== id);
  localStorage.transactions = JSON.stringify(newTransactions);
  // Calculate new balance
  calculateBalance();
  noTrans.classList.toggle("hidden", newTransactions.length !== 0);
};
