const transTable = document.querySelector(".transactions-table tbody");
const transactions = JSON.parse(localStorage.transactions ?? "[]");

transactions.map((trans) => {
  const { id, currency, amount, usdAmount, type, desc, date } = trans;
  transTable.innerHTML += `<tr>
    <td>${id}</td>
    <td>${new Date(date).toLocaleString()}</td>
    <td>${desc}</td>
    <td class="font-bold currency-row ${
      type == "income" ? "text-primary" : "text-error"
    }"><img src="./assets/images/currencies/${
    currency.code
  }.png" />${CurrencyFormat(currency.code).format(amount)}</td>
    <td></td>
  </tr>`;
});
