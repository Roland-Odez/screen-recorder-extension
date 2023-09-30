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

function sendBase64ToServer(base64Data) {
    const url = 'https://scree-recorderapi.onrender.com/videos/'; // Replace with your server URL
    const requestData = { video_chunk: base64Data };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
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
        // Combine all recorded chunks into a single Blob
        const completeBlob = new Blob(recordedChunks, { type: 'video/webm' });
        // Convert the Blob to Base64
        blobToBase64(completeBlob, (base64Data) => {
            // Send the Base64-encoded data to your server
            sendBase64ToServer(base64Data);
        });

    }

    recorder.ondataavailable = function (event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
        // console.log('event', event)
        // let recordedBlob = event.data;
        // let url = URL.createObjectURL(recordedBlob);

        // let a = document.createElement("a");

        // a.style.display = "none";

        // a.href = url;

        // a.download = "screen-recording.webm"

        // document.body.appendChild(a);

        // a.click();

        // document.body.removeChild(a);

        // URL.revokeObjectURL(url);
    }
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === "request_recording") {
        console.log("requesting recording")

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

// // Create a FormData object to send the stream as a file
// const formData = new FormData();
// formData.append("file", new Blob([stream], { type: "application/octet-stream" }), "stream.txt");

// // Make a POST request with the stream data
// fetch("https://example.com/upload", {
//     method: "POST",
//     body: formData,
// })
//     .then((response) => {
//         if (!response.ok) {
//             throw new Error("Network response was not ok");
//         }
//         return response.text(); // or response.json() if you expect JSON response
//     })
//     .then((data) => {
//         console.log("Response:", data);
//     })
//     .catch((error) => {
//         console.error("Error:", error);
//     });


// chrome.desktopCapture.chooseDesktopMedia(['screen', 'window'], (streamId) => {
//     if (!streamId) {
//         // User canceled screen capture
//         console.error('Screen capture was canceled by the user.');
//         return;
//     }

//     // Create a media stream using the selected screen source
//     const constraints = {
//         audio: false, // Set to true if you want to capture audio as well
//         video: {
//             mandatory: {
//                 chromeMediaSource: 'desktop',
//                 chromeMediaSourceId: streamId,
//             },
//         },
//     };

//     navigator.mediaDevices.getUserMedia(constraints)
//         .then((stream) => {
//             // Now you have the screen capture stream, you can record it using MediaRecorder or other methods.
//             // For example, create a MediaRecorder to record the stream.
//             const mediaRecorder = new MediaRecorder(stream);

//             mediaRecorder.ondataavailable = (event) => {
//                 // Handle each chunk of recorded data as needed
//                 if (event.data.size > 0) {
//                     // Send the data to your server or process it locally
//                     // For example, you can store the chunks and combine them later.
//                 }
//             };

//             // Start recording
//             mediaRecorder.start();
//         })
//         .catch((error) => {
//             console.error('Error accessing screen capture stream:', error);
//         });
// });
