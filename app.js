require("dotenv").config();

const axios = require("axios").default;
const API_KEY = process.env.API_KEY;

const form = document.getElementById("form");
const button = document.getElementById("button");

// Setting up the AssemblyAI headers
const assembly = axios.create({
	baseURL: "https://api.assemblyai.com/v2",
	headers: {
		authorization: API_KEY,
		"content-type": "application/json",
	},
});

async function uploadAudio() {
	const formPayload = new FormData();
	const file = document.getElementById("file");
	const audioFile = file.files[0];
	formPayload.append("audio", audioFile);

	try {
		const uploadData = await assembly.post("/upload", formPayload, {
			headers: {
				"Transfer-Encoding": "chunked",
			},
		});
		return uploadData;
	} catch (err) {
		console.error(err);
	}
}

async function getTranscription(audio_URL) {
	try {
		const transcription = await assembly.post("/transcript", {
			audio_url: audio_URL,
		});
	} catch (err) {
		console.error(err);
	}
}

async function handleClick(e) {
	e.preventDefault();
	try {
		const audio_URL = await uploadAudio();
		const transcription = await getTranscription(audio_url);
		return transcription;
	} catch (err) {
		console.error(err);
	}
}

function helloButton() {
	console.log("Hello");
}

form.addEventListener("submit", handleClick(e));
button.addEventListener("click", helloButton);
