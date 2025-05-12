import { apiLikedUrl } from "../Authentication/AUTH.js";

export default async function getLikedUsers() {
    try {
        const res = await fetch(apiLikedUrl);
        if (!res.ok) throw new Error("Failed to fetch liked users");
        const data = await res.json();
        console.log("[GET_liked] Liked users fetched:", data);
        return data;
    } catch (err) {
        console.error("[GET_liked] Error:", err);
        return [];
    }
}
