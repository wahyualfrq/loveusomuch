/**
 * CinemaStudio - Clean Portrait Player Logic (Matching Reference UI)
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const videoInput = document.getElementById('video-input');
    const videoElement = document.getElementById('video-element');
    const videoFrame = document.getElementById('video-frame');
    const downloadBtn = document.getElementById('download-btn');
    const downloadBtnText = document.getElementById('download-btn-text');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const progressTrack = document.getElementById('progress-track');
    const progressFill = document.getElementById('progress-fill');
    const timeDisplay = document.getElementById('time-display');

    let iconPause = btnPlayPause ? btnPlayPause.querySelector('.icon-pause') : null;
    let iconPlay = btnPlayPause ? btnPlayPause.querySelector('.icon-play') : null;

    let activeObjectUrl = null;

    // Autoplay on load
    function initAutoplay() {
        if (videoElement) {
            videoElement.muted = true;
            videoElement.play().then(() => {
                updatePlayPauseUI(true);
            }).catch(error => {
                console.log("Autoplay fallback:", error);
                updatePlayPauseUI(false);
            });
        }
    }

    function togglePlay() {
        if (!videoElement) return;
        if (videoElement.paused) {
            videoElement.play();
            updatePlayPauseUI(true);
        } else {
            videoElement.pause();
            updatePlayPauseUI(false);
        }
    }

    function updatePlayPauseUI(isPlaying) {
        if (!iconPlay || !iconPause) return;
        if (isPlaying) {
            iconPlay.classList.add('hidden');
            iconPause.classList.remove('hidden');
        } else {
            iconPlay.classList.remove('hidden');
            iconPause.classList.add('hidden');
        }
    }

    if (btnPlayPause) {
        btnPlayPause.addEventListener('click', togglePlay);
    }

    if (videoElement) {
        videoElement.addEventListener('click', togglePlay);
        
        videoElement.addEventListener('timeupdate', () => {
            if (isNaN(videoElement.duration)) return;
            const pct = (videoElement.currentTime / videoElement.duration) * 100;
            if (progressFill) progressFill.style.width = `${pct}%`;
            if (timeDisplay) timeDisplay.textContent = formatTime(videoElement.currentTime);
        });
    }

    if (progressTrack) {
        progressTrack.addEventListener('click', (e) => {
            if (!videoElement || !videoElement.duration) return;
            const rect = progressTrack.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            videoElement.currentTime = pos * videoElement.duration;
        });
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Handle File Selection (if user drops or selects a file)
    function handleFileSelection(file) {
        if (!file || !file.type.startsWith('video/')) {
            alert('Silakan pilih file video yang valid (MP4, WebM, MOV, MKV).');
            return;
        }

        if (activeObjectUrl) {
            URL.revokeObjectURL(activeObjectUrl);
        }

        activeObjectUrl = URL.createObjectURL(file);
        videoElement.src = activeObjectUrl;
        videoElement.load();

        videoElement.muted = true;
        videoElement.play().then(() => {
            updatePlayPauseUI(true);
        }).catch(err => console.log('Autoplay error:', err));

        downloadBtn.href = activeObjectUrl;
        downloadBtn.download = file.name;
        downloadBtn.removeAttribute('target');
        if (downloadBtnText) downloadBtnText.textContent = `Download`;
    }

    if (videoFrame) {
        videoFrame.addEventListener('dblclick', () => {
            if (videoInput) videoInput.click();
        });

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            videoFrame.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        videoFrame.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files[0]) {
                handleFileSelection(files[0]);
            }
        });
    }

    if (videoInput) {
        videoInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleFileSelection(e.target.files[0]);
            }
        });
    }

    initAutoplay();
});


