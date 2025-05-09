const userLoggedIn=JSON.parse(localStorage.getItem("user"));
if(!userLoggedIn){
    alert("Please log in to continue using the app.");
    window.location.href="/Login/login.html";
}else{
    const userProfil = document.getElementById("information-user");
    userProfil.innerHTML = `
        <p>Welcome to Dating App, where you can connnect with the other even how far it is, <strong>${userLoggedIn.name}</strong>!</p>
    `;
}   