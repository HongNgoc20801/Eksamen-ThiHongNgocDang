import { apiLikedUrl } from "../Authentication/AUTH.js";

export default async function deleteLikedUser(id) {
    try {
        const url = `${apiLikedUrl}/${id}`;
        await fetch(url, { method: "DELETE" });
        console.log("[DELETE_liked] Deleted:", id);
    } catch (err) {
        console.error("[DELETE_liked] Error deleting user:", err);
        throw err;
    }
}
