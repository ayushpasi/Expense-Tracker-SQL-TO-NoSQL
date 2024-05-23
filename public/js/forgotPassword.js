const resetPasswordLinkBtn = document.getElementById("resetPasswordLinkBtn");

async function sendMail() {
  try {
    const email = document.getElementById("email").value;
    const res = await axios.post("/password/send-mail", {
      email: email,
    });
    alert(res.data.message);
    window.location.href = "/";
  } catch (error) {
    console.log(error);
    alert(error.response.data.message);
    window.location.reload();
  }
}

resetPasswordLinkBtn.addEventListener("click", sendMail);
