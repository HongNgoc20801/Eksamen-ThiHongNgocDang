import{apiUserUrl} from "../Authentication/AUTH.js";
const registerForm =document.getElementById("register-form")

registerForm.addEventListener("submit",async (event)=>{
    event.preventDefault();
    const username =document.getElementById("username").value;
    const password =document.getElementById("password").value;

    const user={name:username, password:password};

    console.log(user);
    try{
        const response =await axios.post(apiUserUrl,user)
        alert("Account is created, you can login now ");
        window.location.href="/Login/login.html";
    }catch(error){
        console.log("Can not register User",error)
    }


});
