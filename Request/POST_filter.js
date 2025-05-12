// POST_filter.js
import { apiFilterUrl } from "../Authentication/AUTH.js";

export default async function postFilter(filterObject) {
    try {
        const res = await fetch(apiFilterUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(filterObject)
        });

        if (!res.ok) {
            throw new Error("Failed to POST filter");
        }

        const data = await res.json();
        console.log("[POST_filter]  Filter saved to API:", data);
        return data;
    } catch (err) {
        console.error("[POST_filter]  Error saving filter:", err);
        throw err;
    }
}