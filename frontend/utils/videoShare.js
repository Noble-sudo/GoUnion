const extensionFromType = (type = '') => type.includes('webm') ? 'webm' : type.includes('quicktime') ? 'mov' : 'mp4';

const renderWatermarkedVideo = async (url, watermark) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Video download failed (${response.status})`);
    const sourceUrl = URL.createObjectURL(await response.blob());
    const video = document.createElement('video');
    video.src = sourceUrl;
    video.muted = true;
    video.playsInline = true;
    await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = () => reject(new Error('Video could not be decoded.'));
    });

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    const canvasStream = canvas.captureStream(30);
    const sourceStream = video.captureStream?.();
    sourceStream?.getAudioTracks().forEach((track) => canvasStream.addTrack(track));
    const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
        .find((type) => MediaRecorder.isTypeSupported(type));
    if (!mimeType) throw new Error('This browser cannot render watermarked videos.');

    const chunks = [];
    const recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: 5_000_000 });
    recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data);
    const finished = new Promise((resolve) => { recorder.onstop = resolve; });
    recorder.start(250);
    await video.play();
    await new Promise((resolve) => {
        const drawFrame = () => {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const scale = Math.max(1, canvas.width / 900);
            const fontSize = Math.round(18 * scale);
            const padding = Math.round(14 * scale);
            context.font = `900 ${fontSize}px sans-serif`;
            const label = watermark.toUpperCase();
            const labelWidth = context.measureText(label).width;
            context.fillStyle = 'rgba(0, 0, 0, 0.48)';
            context.fillRect(padding, padding, labelWidth + padding * 2, fontSize + padding * 1.5);
            context.fillStyle = 'rgba(255, 255, 255, 0.9)';
            context.fillText(label, padding * 1.5, padding + fontSize);
            if (video.ended) resolve(); else requestAnimationFrame(drawFrame);
        };
        drawFrame();
    });
    recorder.stop();
    await finished;
    sourceStream?.getTracks().forEach((track) => track.stop());
    canvasStream.getTracks().forEach((track) => track.stop());
    URL.revokeObjectURL(sourceUrl);
    return new Blob(chunks, { type: mimeType });
};

export const saveVideoFile = async (url, filename = 'gounion-video') => {
    const blob = await renderWatermarkedVideo(url, 'GoUnion');
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `${filename}.${extensionFromType(blob.type)}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
};

export const shareVideoFile = async (url, filename, title, text) => {
    const blob = await renderWatermarkedVideo(url, 'GoUnion');
    const file = new File([blob], `${filename}.${extensionFromType(blob.type)}`, { type: blob.type });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title, text, files: [file] });
        return 'shared';
    }
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
    window.alert('Your browser cannot share video files directly. The watermarked video was saved to your downloads.');
    return 'saved';
};