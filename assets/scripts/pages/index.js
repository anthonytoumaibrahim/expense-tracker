const transTable = document.querySelector(".transactions-table tbody");
const transactions = JSON.parse(localStorage.transactions ?? "[]");
const noTrans = document.querySelector(".no-transactions");

if (transactions.length > 0) noTrans.classList.toggle("hidden", true);

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
  }"><img src="./assets/images/currencies/${
    currency.code
  }.png" />${CurrencyFormat(currency.code).format(amount)}</td>`;

  // Actions column
  const actionsCol = document.createElement("td");
  
  // Edit button
  actionsCol.innerHTML += `<a class="action-button unstyled-link" href="./transaction.html?edit=${id}"><img src="./assets/images/icons/edit.svg" /></a>`;
  actionsCol.append(deleteBtn);

  row.append(actionsCol);

  transTable.append(row);
});

const deleteTransaction = (id) => {
  document.getElementById(`transaction_${id}`).remove();
  const transactions = JSON.parse(localStorage.transactions ?? "[]");
  const newTransactions = transactions.filter((t) => t.id !== id);
  localStorage.transactions = JSON.stringify(newTransactions);
  // Calculate new balance
  calculateBalance();
  if (newTransactions.length === 0) noTrans.classList.toggle("hidden", false);
};
