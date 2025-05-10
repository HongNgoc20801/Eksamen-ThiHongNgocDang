import { apiUserUrl } from "../Authentication/AUTH.js";

export default async function createCrudUser(newUser){
    try{
        const res = await axios.post(apiUserUrl,newUser);
        return res.data;
    }catch(err){
        console.error("Can not create crud user:", err);
        throw err;
    }
}