import { apiFilterUrl } from "../Authentication/AUTH.js";

export default async function putFilter(filterId, updatedFilter) {
    try {
        const res = await fetch(`${apiFilterUrl}/${filterId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedFilter)
        });

        if (!res.ok) {
            
            throw new Error("Failed to update filter");
        }

        console.log("[PUT_filter] Filter updated:", updatedFilter);
    } catch (err) {
        console.error("[PUT_filter] Error updating filter:", err.message);
        throw err;
    }
}