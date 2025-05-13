function validateLogin(users,username,password){
    return users.find(user => user.name === username && user.password === password) || null;
}
module.exports = {validateLogin };