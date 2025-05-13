function validateLogin(users,username,password){
    return users.find(user => user.name === username && user.password === password) || null;
}
function validateRegister(name, email, password,age){
    return (
        typeof name === "string" && name.trim() !== " " &&
        typeof email === "string" && email.includes("@") &&
        typeof password === "string" && password.trim().length >=4 && !isNaN(age) && Number(age) >= 18

    );
}
module.exports = {validateLogin, validateRegister };