export async function startCamera(
  video,
  constraints = { video: { facingMode: 'user' }, audio: false }
) {
  if (!video) {
    throw new Error('Camera preview element was not found.');
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(
      'Camera access is not supported here. Use HTTPS or localhost.'
    );
  }

  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  video.srcObject = stream;
  await video.play();

  return stream;
}

export function stopCamera(videoOrStream) {
  const stream = videoOrStream?.srcObject || videoOrStream;

  stream?.getTracks?.().forEach(track => track.stop());

  if (videoOrStream?.srcObject) {
    videoOrStream.srcObject = null;
  }
}

export function captureFrame(video, type = 'image/jpeg', quality = 0.88) {
  if (!video?.videoWidth) {
    throw new Error('Start the camera before taking a picture.');
  }

  const canvas = document.createElement('canvas');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  canvas.getContext('2d').drawImage(video, 0, 0);

  return canvas.toDataURL(type, quality);
}
