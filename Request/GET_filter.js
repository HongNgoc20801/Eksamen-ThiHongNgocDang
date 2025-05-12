import { apiFilterUrl } from "../Authentication/AUTH.js";
export default async function getFilter() {
    try {
        const res = await fetch(apiFilterUrl);
        if (!res.ok) throw new Error("Failed to fetch filter data");
        const data = await res.json();
        console.log("[GET_filter] All filters fetched:", data);
        return data;
    } catch (err) {
        console.error("[GET_filter] Error fetching filters:", err);
        return []; 
    }
}