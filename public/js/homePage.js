// Function to add rows to the table
const buyPremiumBtn = document.getElementById("buyPremiumBtn");
const reportsLink = document.getElementById("reportsLink");
const leaderboardLink = document.getElementById("leaderboardLink");
const logoutBtn = document.getElementById("logoutBtn");

const form = document.getElementById("my-form");
form.addEventListener("submit", addNewExpense);

const token = localStorage.getItem("token");
function addRowsToTable(expense) {
  var tbody = document.getElementById("expenseTableBody");
  var tableContent = "";
  const stringifiedExpense = JSON.stringify(expense);

  tableContent += `<tr class="trStyle">
    <td >${expense.date}</td>
    <td>${expense.expenseAmount}</td>
    <td>${expense.expenseDescription}</td>
    <td>${expense.expenseCategory}</td>
    <td>
    <button class="btn btn-danger" onclick="deleteRow(this, '${expense._id}')">
    <i class="bi bi-trash"></i>
  </button>
  <button class="btn btn-primary" onclick="updateRow(this)" data-expense='${stringifiedExpense}'>
  <i class="bi bi-pencil-square"></i> Update
</button>
</td>
  </tr>`;

  tbody.innerHTML += tableContent;
}

function updateRow(btn) {
  const stringifiedExpense = btn.getAttribute("data-expense");
  const expense = JSON.parse(stringifiedExpense);
  const { _id, expenseAmount, expenseCategory, expenseDescription } = expense;

  document.getElementById("expenseAmount").value = expenseAmount;
  document.getElementById("expenseCategory").value = expenseCategory;
  document.getElementById("expenseDescription").value = expenseDescription;

  const form = document.getElementById("my-form");

  form.removeEventListener("submit", addNewExpense);

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const updatedExpenseAmount = document.getElementById("expenseAmount").value;
    const updatedExpenseDescription =
      document.getElementById("expenseDescription").value;
    const updatedExpenseCategory =
      document.getElementById("expenseCategory").value;

    const updatedFormData = {
      expenseAmount: updatedExpenseAmount,
      expenseDescription: updatedExpenseDescription,
      expenseCategory: updatedExpenseCategory,
    };

    try {
      const response = await axios.put(
        `/expense/edit-expense/${_id}`,
        updatedFormData,
        { headers: { Authorization: token } }
      );

      console.log("Expense updated successfully:", response.data);

      form.reset();
      window.location.reload();

      form.removeEventListener("submit", arguments.callee);
      form.addEventListener("submit", addNewExpense);
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  });
}

// // Functions for delete and update
// Functions for delete and update
async function deleteRow(btn, expenseId) {
  console.log(expenseId);
  var row = btn.parentNode.parentNode;
  row.parentNode.removeChild(row);
  try {
    const response = await axios.delete(
      `/expense/delete-expense/${expenseId}`,
      { headers: { Authorization: token } }
    );
    console.log("Expense deleted:", response.data);
    // Handle success if needed
  } catch (error) {
    console.error("Error deleting expense:", error);
    // Handle error if needed
  }
}

async function addNewExpense(e) {
  e.preventDefault();
  let expenseAmount = e.target.expenseAmount.value;
  let expenseDescription = e.target.expenseDescription.value;
  let expenseCategory = e.target.expenseCategory.value;
  if (expenseCategory == "Select Category") {
    alert("Select the Category!");
    window.location.href("/home-page");
  }
  if (!expenseDescription) {
    alert("Add the Description!");
    window.location.href("/home-page");
  }
  if (!parseInt(expenseAmount)) {
    alert("Please enter the valid amount!");
    window.location.href("/home-page");
  }

  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  // add leading zeros to day and month if needed
  const formattedDay = day < 10 ? `0${day}` : day;
  const formattedMonth = month < 10 ? `0${month}` : month;

  // create the date string in date-month-year format
  const dateStr = `${formattedDay}-${formattedMonth}-${year}`;

  // console.log(dateStr); // outputs something like "23-02-2023"

  let expense = {
    date: dateStr,
    expenseAmount: expenseAmount,
    expenseDescription: expenseDescription,
    expenseCategory: expenseCategory,
  };

  try {
    const response = await axios.post("/expense/add-expense", expense, {
      headers: { Authorization: token },
    });
    console.log(response.data.expense);
    // Assuming the server sends back the newly created expense
    addRowsToTable(response.data.expense);
  } catch (error) {
    console.error(error);
  }
}
const parseJwt = (token) => {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
};

window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const decodedToken = parseJwt(token);
  if (decodedToken.isPremiumUser) {
    buyPremiumBtn.innerHTML = "Premium Member &#128142";
    reportsLink.removeAttribute("onclick");
    reportsLink.innerHTML = "Reports &#128142";
    leaderboardLink.removeAttribute("onclick");
    leaderboardLink.innerHTML = "Leaderboard &#128142";

    leaderboardLink.setAttribute("href", "/premium/get-leaderboard-page");
    reportsLink.setAttribute("href", "/premium/get-report-page");
    buyPremiumBtn.removeEventListener("click", buyPremium);
  }
  const limit = parseInt(document.getElementById("rowsPerPage").value);
  getAllExpenses(1, limit);
});
buyPremiumBtn.addEventListener("click", buyPremium);
async function buyPremium(e) {
  const token = localStorage.getItem("token");
  const res = await axios.get(
    "http://localhost:3000/purchase/premium-membership",
    { headers: { Authorization: token } }
  );

  var options = {
    key: res.data.key_id, // Enter the Key ID generated from the Dashboard
    order_id: res.data.order.id, // For one time payment
    // This handler function will handle the success payment
    handler: async function (response) {
      const res = await axios.post(
        "http://localhost:3000/purchase/update-transaction-status",
        {
          order_id: options.order_id,
          payment_id: response.razorpay_payment_id,
        },
        { headers: { Authorization: token } }
      );
      alert(
        "Welcome to our Premium Membership, You have now access to Reports and LeaderBoard"
      );
      window.location.reload();

      localStorage.setItem("token", res.data.token);
    },
  };
  const rzp1 = new Razorpay(options);
  rzp1.open();
  e.preventDefault();

  rzp1.on("payment.failed", (response) => {
    console.log(response.error.code);
    console.log(response.error.description);
    alert(`Something went wrong`);
  });
}

// // Function to fetch leaderboard data using Axios
// async function fetchLeaderboardData() {
//   try {
//     const response = await axios.get(
//       "http://localhost:3000/premium/show-leader-board",
//       { headers: { Authorization: token } }
//     );
//     return response.data.userLeaderboardDetails;
//   } catch (error) {
//     console.error("Error fetching leaderboard:", error);
//     return [];
//   }
// }

// // Display leaderboard function
// async function displayLeaderboard() {
//   const leaderboardButton = document.getElementById("showLeaderBoard");
//   leaderboardButton.style.display = "block";

//   leaderboardButton.addEventListener("click", async () => {
//     document.getElementById("leaderboardContainer").style.display = "block";
//     const leaderboardBody = document.getElementById("leaderboardBody");
//     leaderboardBody.innerHTML = ""; // Clear previous content

//     try {
//       const userLeaderboardDetails = await fetchLeaderboardData();

//       userLeaderboardDetails.forEach((user, index) => {
//         const row = document.createElement("tr");

//         const rankCell = document.createElement("td");
//         rankCell.textContent = index + 1;

//         const nameCell = document.createElement("td");
//         nameCell.textContent = user.name;

//         const costCell = document.createElement("td");
//         costCell.textContent = user.totalExpense;

//         row.appendChild(rankCell);
//         row.appendChild(nameCell);
//         row.appendChild(costCell);

//         leaderboardBody.appendChild(row);
//       });
//       leaderboardButton.style.display = "none";
//     } catch (error) {
//       console.error("Error displaying leaderboard:", error);
//     }
//   });

//   // Add the button to the DOM
//   document.body.appendChild(leaderboardButton);
// }

document.getElementById("rowsPerPage").addEventListener("change", function () {
  const limit = parseInt(this.value);
  getAllExpenses(1, limit);
});

async function getAllExpenses(pageNo, limit) {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `http://localhost:3000/expense/get-all-expenses/${pageNo}?limit=${limit}`,
      { headers: { Authorization: token } }
    );

    const table = document.getElementById("expenseTableBody");
    table.innerHTML = ""; // Clear the table before populating with new data

    res.data.expenses.forEach((expense) => {
      addRowsToTable(expense);
    });

    const ul = document.getElementById("paginationUL");
    ul.innerHTML = ""; // Clear the pagination before re-creating

    for (let i = 1; i <= res.data.totalPages; i++) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      li.setAttribute("class", "page-item");
      a.setAttribute("class", "page-link");
      a.setAttribute("href", "#");
      a.appendChild(document.createTextNode(i));
      li.appendChild(a);
      ul.appendChild(li);
      a.addEventListener("click", function (e) {
        e.preventDefault();
        getAllExpenses(i, limit);
      });
    }
  } catch (error) {
    console.error("Error fetching expenses:", error);
  }
}
async function logout() {
  try {
    localStorage.clear();
    window.location.href = "/";
  } catch (error) {
    console.log(error);
  }
}
logoutBtn.addEventListener("click", logout);
