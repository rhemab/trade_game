import { useState } from "react";

export default function useAlpacaApi(path, loadOnStart = true) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(loadOnStart);
    const [error, setError] = useState("");

    async function getData() {
        setLoading(true);
        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
                "APCA-API-KEY-ID": process.env.NEXT_PUBLIC_ALPACA_KEY,
                "APCA-API-SECRET-KEY": process.env.NEXT_PUBLIC_ALPACA_SECRET,
            },
        };

        fetch(`${process.env.NEXT_PUBLIC_ALPACA_API_URL}${path}`, options)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                setData(data);
            })
            .catch((err) => {
                console.error(err);
                setError(err);
            })
            .finally(() => setLoading(false));
    }

    return [loading, error, data, getData];
}
