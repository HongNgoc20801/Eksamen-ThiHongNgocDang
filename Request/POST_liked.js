import { apiLikedUrl } from "../Authentication/AUTH.js";

export default async function postLikedUser(likedUserObject) {
    try {
        const res = await fetch(apiLikedUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(likedUserObject)
        });

        if (!res.ok) {
            throw new Error("Failed to POST liked user");
        }

        const data = await res.json();
        console.log("[POST_liked] Liked user saved:", data);
        return data;
    } catch (err) {
        console.error("[POST_liked] Error saving liked user:", err);
        throw err;
    }
}
