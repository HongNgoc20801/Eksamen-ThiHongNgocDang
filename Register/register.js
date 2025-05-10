import{apiUserUrl} from "../Authentication/AUTH.js";
import createUser from "../Request/POST_user.js";

document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("reg-name").value.trim();
    const password = document.getElementById("reg-password").value.trim();
    const email = document.getElementById("reg-email").value.trim();

    if (!name || !password || !email) {
        alert("Please fill in all required fields.");
        return;
    }

    const newUser = {
        name,
        password,
        email
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

