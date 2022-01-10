import { useEffect, useState } from "react";

const API_KEY = import.meta.env.VITE_GIPHY_API;

const useFetch = ({ keyword }) => {
	const [gifUrl, setGifUrl] = useState("");

	const fetchGifs = async () => {
		try {
			//Getting response from gif api
			const response = await fetch(
				`https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${keyword
					.split(" ")
					.join("")}&limit=1`
			);

			const { data } = await response.json();

			setGifUrl(data[0]?.images?.downsized_medium?.url);
		} catch (e) {
			setGifUrl("https://c.tenor.com/swTDQJ85dDEAAAAM/aaaa.gif");
		}
	};

	useEffect(() => {
		if (keyword) fetchGifs();
	}, [keyword]);

	return gifUrl;
};

export default useFetch;
