import { apiUserUrl } from "../Authentication/AUTH.js";
export default async function getCrudUsers(){
    try{
        const res = await axios.get(apiUserUrl);
        return res.data;
    }catch(err){
        console.error("Can not fetch users from crud crud",err);
        return [];
    }
}