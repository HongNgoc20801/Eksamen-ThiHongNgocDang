import { apiUserUrl } from "../Authentication/AUTH.js";

export default async function updateUser(userId, updatedUserData) {
  try{
    const url = `${apiUserUrl}/${userId}`;
    const res =await axios.put(url, updatedUserData)
    console.log("Success to update:",res.data);
    return res.data;

  }catch(err){
    console.error("Can not update:",err);
    throw err;
  }
  
}
