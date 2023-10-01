console.log("Hi, I have been injected whoopie!!!")
let h = document.createElement("h1");
h.innerHTML = 'hey i am here'
document.body.append(h)

function blobToBase64(blob, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
        const base64Data = reader.result.split(',')[1]; // Get the Base64 data portion
        callback(base64Data);
    };
}

function sendBase64ToServer(base64Data, status) {
    const url = 'https://scree-recorderapi.onrender.com/videos/'; // Replace with your server URL
    const formData = new FormData()
    formData.append("video_chunk", base64Data)
    formData.append("final_chunk", status)

    fetch(url, {
        method: 'POST',
        body: formData,
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Request failed with status: ' + response.status);
            }
            return response.text(); // or response.json() if you expect JSON response
        })
        .then((data) => {
            console.log('Server response:', data);
        })
        .catch((error) => {
            console.error('Error sending Base64 data to server:', error);
        });
}

var recorder = null
var final = false
function onAccessApproved(stream) {
    recorder = new MediaRecorder(stream);

    recorder.start();
    let recordedChunks = []

    recorder.onstop = function () {
        // stream.getTracks().forEach(function (track) {
        //     if (track.readyState === "live") {
        //         track.stop()
        //     }
        // })

        final = true
        clearInterval(id)

    }

    recorder.ondataavailable = function (event) {
        console.log("is avaliable oo")
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
        setTimeout(() => {
    // if(recordedChunks.length > 0){
            // Combine all recorded chunks into a single Blob
            const completeBlob = new Blob(recordedChunks, { type: 'video/webm' });
            // Convert the Blob to Base64
            blobToBase64(completeBlob, (base64Data) => {
            // Send the Base64-encoded data to your server
                sendBase64ToServer(base64Data, final);
            });
            // }
        }, 500)
    }

    const id = setInterval(() => {
        recorder.requestData()
        console.log('call ondataavaliabe')
    }, 3000)
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === "request_recording") {
        console.log("requesting recording", chrome)

        sendResponse(`processed: ${message.action}`);

        navigator.mediaDevices.getDisplayMedia({
            audio: true,
            video: {
                width: 9999999999,
                height: 9999999999
            }
        }).then((stream) => {
            onAccessApproved(stream)
            console.log("chunks of data", stream)
        })

    }

    if (message.action === "stopvideo") {
        console.log("stopping video");
        sendResponse(`processed: ${message.action}`);
        if (!recorder) return console.log("no recorder")

        recorder.stop();


    }

})

