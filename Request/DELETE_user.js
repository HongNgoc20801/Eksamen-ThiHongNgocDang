import { apiUserUrl } from "../Authentication/AUTH.js";
export default async function deleteCrudUser(id){
    try{
        const url =`${apiUserUrl}/${id}`;
        await axios.delete(url);
        console.log("Deleted successfully");
    }catch(err){
        console.error("Unsuccess to delete", err);
        throw err;
    }
}