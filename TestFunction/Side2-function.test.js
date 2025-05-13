const {filteredCandidates}=require("../Function/Side2-function.js")

const tryUsers=[
    {name: "Liuliu", email:"liuliu@gmail.com", gender:"female", dob:{age:22}},
    {name: "Liuliu1", email:"liuliu1@gmail.com", gender:"female", dob:{age:29}},
    {name: "Liuliu2", email:"liuliu2@gmail.com", gender:"female", dob:{age:35}},

];
describe("filteredCandidates",()=>{
    test("filter gender and age", ()=>{
        const filters = {gender:"female",minAge:20,maxAge:24 };
        const result = filteredCandidates(tryUsers, filters,[],[]);
        expect (result.map(u => u.name)).toEqual(["Liuliu"]);
    });

    test ("Take out user has been disliked",()=>{
        const filters = {};
        const disliked = ["Liuliu | 22 | liuliu@gmail.com"];
        const result = filteredCandidates(tryUsers,filters,disliked,[]);
        expect(result.find(u => u.name === "Liuliu")).toBeUndefined();
    });
})