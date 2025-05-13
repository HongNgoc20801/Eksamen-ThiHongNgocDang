
const { validateLogin, validateRegister } = require("../Function/Side1-function.js")

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

describe("Register validation tests",()=>{
    test(" Valid Input ", ()=>{
        expect(validateRegister("liuliu","liu@gmail.com","1111",24)).toBe(true);
    });
    test ("Email is not valid", ()=>{
        expect(validateRegister("liuliu", "liuliugamil.com","1111",24)).toBe(false)
    });
    test("Under 18",()=>{
        expect(validateRegister("liuliu","liu@gmail.com","1111",17)).toBe(false)
    });
});