import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

const App = () => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isCapturingImage, setIsCapturingImage] = useState(false);

  const showImageCapture = () => {
    setShowCamera(true);
    setIsCapturingImage(true);
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setShowCamera(false);
    setIsCapturingImage(false);
  };

  const startRecording = () => {
    setShowCamera(true);
    setIsCapturingImage(false);
    const videoConstraints = {
      width: 1280,
      height: 720,
      facingMode: 'user', // or 'environment' for rear camera
    };

    navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm',
        });

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);

        const chunks = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          setRecordedVideo(blob);
          setIsRecording(false);
          setShowCamera(false);
          URL.revokeObjectURL(blob);
        };
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const clearCapturedMedia = () => {
    setCapturedImage(null);
    setRecordedVideo(null);
    setShowCamera(false);
    setIsCapturingImage(false);
  };

  return (
    <div>
      <h1>React Webcam App</h1>
      <div>
        <button onClick={clearCapturedMedia}>Clear</button>
        <button onClick={showImageCapture}>Capture Image</button>
        {!isRecording ? (
          <button onClick={startRecording}>Start Recording</button>
        ) : (
          <button onClick={stopRecording}>Stop Recording</button>
        )}
      </div>
      <div>
        {showCamera && (
          <div>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={640}
              height={480}
            />
            {isCapturingImage && (
              <button onClick={captureImage}>Take Picture</button>
            )}
          </div>
        )}
      </div>
      <div>
        {capturedImage && (
          <div>
            <h2>Captured Image</h2>
            <img src={capturedImage} alt="Captured" />
          </div>
        )}
        {recordedVideo && (
          <div>
            <h2>Recorded Video</h2>
            <video src={URL.createObjectURL(recordedVideo)} controls />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
