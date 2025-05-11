import { apiUserUrl } from "../Authentication/AUTH.js";
export default async function getCrudUsers(){
    try{
        const res = await axios.get(apiUserUrl);
        const data = res.data;

        console.log("[GET_user.js] Users fetched:", data);
        return data;
    }catch(err){
        console.error("Can not fetch users from crud crud",err);
        return [];
    }
}