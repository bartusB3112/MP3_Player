document.addEventListener('DOMContentLoaded', function () {
    const mp3FileInput = document.getElementById('mp3File');
    const fileInfo = document.getElementById('file-info');
    const coverImage = document.getElementById('cover-image');
    const audioElement = new Audio();
    
    // Elementy odtwarzacza
    const playBtn = document.getElementById('play-btn');
    const playIcon = document.getElementById('play-icon');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration-display');
    const volumeSlider = document.getElementById('volume-slider');
    
    let isPlaying = false;

    mp3FileInput.addEventListener('change', function () {
        if (!this.files.length) return;

        const file = this.files[0];
        const fileUrl = URL.createObjectURL(file);
        
        // Ustawienie źródła audio
        audioElement.src = fileUrl;
        
        // Odczyt metadanych ID3
        window.jsmediatags.read(file, {
            onSuccess: function (tag) {
                document.getElementById('title').textContent = tag.tags.title || '-';
                document.getElementById('artist').textContent = tag.tags.artist || '-';
                document.getElementById('album').textContent = tag.tags.album || '-';

                if (tag.tags.picture) {
                    const { data, format } = tag.tags.picture;
                    const base64String = `data:image/${format};base64,${arrayBufferToBase64(data)}`;
                    coverImage.src = base64String;
                    coverImage.style.display = 'block';
                } else {
                    coverImage.style.display = 'none';
                }
                
                fileInfo.classList.add('visible');
            },
            onError: function (error) {
                console.log('Błąd odczytu tagów:', error);
                fileInfo.classList.add('visible');
            }
        });
    });

    // Funkcje odtwarzacza
    function togglePlay() {
        if (isPlaying) {
            audioElement.pause();
            playIcon.classList.replace('fa-pause', 'fa-play');
        } else {
            audioElement.play();
            playIcon.classList.replace('fa-play', 'fa-pause');
        }
        isPlaying = !isPlaying;
    }

    function updateProgress(e) {
        const { duration, currentTime } = e.srcElement;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        
        // Aktualizacja czasu
        currentTimeEl.textContent = formatTime(currentTime);
        
        // Ustawienie całkowitego czasu przy pierwszym załadowaniu
        if (durationEl.textContent === '0:00' && !isNaN(duration)) {
            durationEl.textContent = formatTime(duration);
        }
    }

    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audioElement.duration;
        audioElement.currentTime = (clickX / width) * duration;
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
    }

    function setVolume() {
        audioElement.volume = this.value;
    }

    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    // Event listeners dla odtwarzacza
    playBtn.addEventListener('click', togglePlay);
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', () => {
        playIcon.classList.replace('fa-pause', 'fa-play');
        isPlaying = false;
    });
    progressContainer.addEventListener('click', setProgress);
    volumeSlider.addEventListener('input', setVolume);
});