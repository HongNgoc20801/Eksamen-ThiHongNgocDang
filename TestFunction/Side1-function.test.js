
const { validateLogin } = require("../Function/Side1-function.js")

describe("Login validation",() =>{
    const users =
        [
        {name : "liuliu", password:"1111"},
        {name : "haha", password :"1111"},
    ];

    test ("Login is correct return to user", () =>{
        const result = validateLogin(users,"liuliu","1111");
        expect(result).toEqual(users[0]);
    });
    test("Login failed return null",() =>{
        const result =validateLogin(users,"liuliu","wrong");
        expect(result).toBe(null);
    });
    
});