import { apiUserUrl } from "../Authentication/AUTH.js";

export default async function updateUserInformation(userId, updatedUser) {
  const url = `${apiUserUrl}/${userId}`;
  try {
    const response = await axios.put(url, updatedUser);
    console.log("PUT status:", response.status);
    return updatedUser;
  } catch (error) {
    console.error("PUT error:", error?.response?.status || error.message);
    throw error;
  }
}
