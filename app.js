require("dotenv").config();

const axios = require("axios");
const audioURL = "https://bit.ly/3yxKEIY";
const refreshInterval = 5000;
const API_KEY = process.env.API_KEY;

// Setting up the AssemblyAI headers
const assembly = axios.create({
	baseURL: "https://api.assemblyai.com/v2",
	headers: {
		authorization: API_KEY,
		"content-type": "application/json",
	},
});

const getTranscript = async () => {
	// Sends the audio file to AssemblyAI for transcription
	const response = await assembly.post("/transcript", {
		audio_url: audioURL,
	});

	// Interval for checking transcript completion
	const checkCompletionInterval = setInterval(async () => {
		const transcript = await assembly.get(
			`/transcript/${response.data.id}`
		);
		const transcriptStatus = transcript.data.status;

		if (transcriptStatus !== "completed") {
			console.log(`Transcript Status: ${transcriptStatus}`);
		} else if (transcriptStatus === "completed") {
			console.log("\nTranscription completed!\n");
			let transcriptText = transcript.data.text;
			console.log(`Your transcribed text:\n\n${transcriptText}`);
			clearInterval(checkCompletionInterval);
		}
	}, refreshInterval);
};

getTranscript();
