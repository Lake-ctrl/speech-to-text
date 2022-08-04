API_KEY = "59be53d11953491782d5d8a1dd365a95";

const form = document.getElementById("form");
const textOutput = document.getElementById("text-output");
const loading = document.getElementById("loading");

// Loading progress bar
const queue = document.createElement("div");
const processing = document.createElement("div");
const complete = document.createElement("div");

queue.textContent = "Your audio is being queued";
queue.id = "queue";
processing.textContent = "Your audio is being processed";
processing.id = "processing";
complete.textContent = "Your transcription is complete!";
complete.id = "complete";

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

async function createTranscription(audio_URL) {
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
		return response;
	} catch (err) {
		console.error(err);
	}
}

async function handleClick(e) {
	e.preventDefault();
	try {
		const audio_URL = await uploadAudio();
		const transcription_id = await createTranscription(audio_URL);
		const checkCompletion = setInterval(async () => {
			const response = await getTranscriptionStatus(transcription_id);
			switch (response.data.status) {
				case "queued":
					console.log("Your audio is being queued");
					if (loading.contains(queue) === false) {
						loading.appendChild(queue);
					}
					break;
				case "processing":
					console.log("Your audio is being processed");
					if (loading.contains(queue) === true) {
						queue.replaceWith(processing);
					} else loading.appendChild(processing);

					break;
				case "completed":
					console.log("Transcription complete!");
					if (loading.contains(processing) === true) {
						processing.replaceWith(complete);
					} else loading.appendChild(complete);

					textOutput.append(response.data.text);
					if (response.data.text != null) {
						clearInterval(checkCompletion);
					}
					break;
			}
		}, 1000);
	} catch (err) {
		console.error(err);
	}
}

form.addEventListener("submit", (e) => handleClick(e));
