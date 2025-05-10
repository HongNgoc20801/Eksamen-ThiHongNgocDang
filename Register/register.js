import{apiUserUrl} from "../Authentication/AUTH.js";
import createUser from "../Request/POST_user.js";

document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("reg-name").value.trim();
    const password = document.getElementById("reg-password").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const age = document.getElementById("reg-age").value.trim();

    if (!name || !password || !email || !age || isNaN(age)) {
        alert("Please fill in all required fields, including age");
        return;
    }

    const newUser = {
        name,
        password,
        email,
        age,
    };

    try {
        const created = await createUser(newUser);
        localStorage.setItem("user", JSON.stringify(created));
        alert("Account created successfully!");
        window.location.href = "/Datingapp/datingapp.html";
    } catch (err) {
        alert("Failed to register. Please try again.");
        console.error(err);
    }
});

