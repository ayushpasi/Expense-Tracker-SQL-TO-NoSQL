async function fetchLeaderboardData() {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get("/premium/showLeaderBoard", {
      headers: { Authorization: token },
    });
    return response.data.userLeaderboardDetails;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
}

// Display leaderboard function
async function displayLeaderboard() {
  const leaderboardBody = document.getElementById("leaderboardBody");
  leaderboardBody.innerHTML = ""; // Clear previous content

  try {
    const userLeaderboardDetails = await fetchLeaderboardData();

    userLeaderboardDetails.forEach((user, index) => {
      const row = document.createElement("tr");

      const rankCell = document.createElement("td");
      rankCell.textContent = index + 1;

      const nameCell = document.createElement("td");
      nameCell.textContent = user.name;

      const costCell = document.createElement("td");
      costCell.textContent = user.totalExpense;

      row.appendChild(rankCell);
      row.appendChild(nameCell);
      row.appendChild(costCell);

      leaderboardBody.appendChild(row);
    });
    leaderboardButton.style.display = "none";
  } catch (error) {
    console.error("Error displaying leaderboard:", error);
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

document.addEventListener("DOMContentLoaded", displayLeaderboard);
