import { apiUserUrl } from "../Authentication/AUTH.js";
const loginForm=document.getElementById("login-form");
loginForm.addEventListener("submit",async (event)=>{
    event.preventDefault();
    const username =document.getElementById("username").value;
    const password =document.getElementById("password").value;

    console.log(username,password);
    try{
        const response =await axios.get(apiUserUrl)
        const allUsers =response.data;
        console.log("All users:", allUsers);

        const user = allUsers.filter(
            (user)=>user.name ===username && user.password === password
        );
        console.log("Matched user:", user);
        if (user.length > 0 ){
            localStorage.setItem("user", JSON.stringify(user[0]));
            window.location.href="todo.html";
        }else{
            alert("wrong username or password!");
        }

        
    }catch(error){
        console.log("Can not get User");
    }
    
});