const userLoggedIn=JSON.parse(localStorage.getItem("user"));
if(!userLoggedIn){
    alert("Please log in to continue using the app.");
    window.location.href="/Login/login.html";
}else{
    document.getElementById("information-user").innerHTML = `
    <p>Welcome to Dating App, where you can connnect with the other even how far it is, <strong>${userLoggedIn.name}</strong>!</p>
    `;
    showSection("home")
} 
//Nav  
document.getElementById("home").addEventListener("click",()=>showSection("home"));
document.getElementById("information").addEventListener("click",()=>{
    showSection("information");
    showUserInformation(userLoggedIn);
});
document.getElementById("swipe").addEventListener("click",()=> showSection("swipe"));
document.getElementById("liked").addEventListener("click",()=> showSection("liked"));

function showSection(sectionId){
    const section =["home", "profile", "swipe", "liked"];
    section.forEach((id)=> {
        const element =document.getElementById(`section-${id}`);
        if (element) element.style.display = id ===sectionId ? "block" :"none";
    });
}
//showUserinformation
function showUserInformation(user){
    const informationDiv = document.getElementById("information");
    informationDiv.innerHTML=`
        <h3> Your Information </h3>
        <p><strong>Username:</strong> ${user.name}</p>
        <p><strong>Password:</strong> ${"*".repeat(user.password.length)}</p>
        <button id="edit-information-btn">Edit Information</button>
    
    `;
    document.getElementById("edit-information-btn").addEventListener("click",()=>{

    });
}