

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
	const file = document.getElementById("fileupload");
	const audioFile = file.files[0];
	formPayload.append("audio", audioFile);

	try {
		const response = await assembly.post("/upload", formPayload, {});
		console.log(response);
		return response.data.upload_url;
	} catch (err) {
		console.error(err);
	}
}

async function getTranscription(audio_URL) {
	try {
		const response = await assembly.post("/transcript", {
			audio_url: audio_URL,
		});
		console.log(response);
		return response.data.id;
	} catch (err) {
		console.error(err);
	}
}

async function getTranscriptionStatus(id) {
	try {
		const response = await assembly.get(`/transcript/${id}`);
		console.log(response);
		return response.data.text;
	} catch (err) {
		console.error(err);
	}
}

async function handleClick(e) {
	e.preventDefault();
	try {
		const audio_URL = await uploadAudio();
		const transcription_id = await getTranscription(audio_URL);
		const transcription = setTimeout(async () => {
			const response = await getTranscriptionStatus(transcription_id);
			console.log(response);
		}, 20000);

		return transcription_id;
	} catch (err) {
		console.error(err);
	}
}

function helloButton() {
	console.log("Hello");
}

form.addEventListener("submit", (e) => handleClick(e));
button.addEventListener("click", helloButton);
