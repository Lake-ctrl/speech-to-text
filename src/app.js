const API_KEY = process.env.API_KEY;

const form = document.getElementById("form");
const textOutput = document.getElementById("text-output");
const loading = document.getElementById("loading");
const loader = document.getElementById("loader");
const progress = document.getElementById("progress-bar");
const progressLabel = document.getElementById("progress-bar-label");

const config = {
	onUploadProgress: function (progressEvent) {
		const percentCompleted = Math.round(
			(progressEvent.loaded / progressEvent.total) * 100
		);
		progress.setAttribute("value", percentCompleted);
		progress.previousElementSibling.textContent = `${percentCompleted}%`;
	},
};

// Setting up the AssemblyAI headers
const assembly = axios.create({
	baseURL: "https://api.assemblyai.com/v2",
	headers: {
		authorization: API_KEY,
	},
});

async function uploadAudio() {
	const formPayload = new FormData();
	const file = document.getElementById("fileupload");
	const audioFile = file.files[0];
	formPayload.append("audio", audioFile);

	try {
		const response = await assembly.post("/upload", formPayload, config);
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
	progress.style.display = "block";
	progressLabel.style.display = "block";
	loading.textContent = "";
	try {
		const audio_URL = await uploadAudio();
		const transcription_id = await createTranscription(audio_URL);
		const checkCompletion = setInterval(async () => {
			const response = await getTranscriptionStatus(transcription_id);
			switch (response.data.status) {
				case "queued":
					console.log("Your audio is being queued");

					loading.textContent = "Your audio is being queued";

					break;
				case "processing":
					console.log("Your audio is being processed");

					loading.textContent = "Your audio is being processed";
					loader.style.display = "block";
					progress.style.display = "none";
					progressLabel.style.display = "none";
					break;
				case "completed":
					console.log("Transcription complete!");

					loading.textContent = "Transcription complete!";
					loader.style.display = "none";

					textOutput.append(response.data.text);
					if (response.data.text != null) {
						clearInterval(checkCompletion);
					}
					break;
				case "error":
					console.log("Error");
					loading.textContent =
						"There has been an error, please try again";
					loader.style.display = "none";
					clearInterval(checkCompletion);
			}
		}, 1000);
	} catch (err) {
		console.error(err);
	}
}

form.addEventListener("submit", (e) => handleClick(e));
