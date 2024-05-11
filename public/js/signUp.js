async function submitForm(event) {
  event.preventDefault(); // Prevent the default form submission behavior

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await axios.post("/user/signUp", {
      name,
      email,
      password,
    });

    if (response.status == 200) {
      let success = document.getElementById("success");
      success.innerHTML = response.data.message;
      document.getElementById("name").value = "";
      document.getElementById("email").value = "";
      document.getElementById("password").value = "";
    }
  } catch (error) {
    console.log(error.response.status);
    if (error.response.status == 409) {
      let unsuccessfull = document.getElementById("unsuccessfull");
      unsuccessfull.innerHTML = "Email is already taken";
      document.getElementById("email").value = "";
    }
    if (error.response.status == 400) {
      let unsuccessfull = document.getElementById("unsuccessfull");
      unsuccessfull.innerHTML = "Some data is missing";
      document.getElementById("email").value = "";
    }
  }
}
