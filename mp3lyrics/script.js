document.addEventListener('DOMContentLoaded', function() {
    // Elementy stron
    const songListPage = document.getElementById('song-list-page');
    const addSongPage = document.getElementById('add-song-page');
    const viewSongPage = document.getElementById('view-song-page');
    const songsContainer = document.getElementById('songs-container');
    const addSongBtn = document.getElementById('add-song-btn');
    
    // Elementy formularza dodawania/edycji
    const backBtn = document.getElementById('back-btn');
    const saveSongBtn = document.getElementById('save-song');
    const songTitleInput = document.getElementById('song-title');
    const songArtistInput = document.getElementById('song-artist');
    const sectionTypeSelect = document.getElementById('section-type');
    const addSectionButton = document.getElementById('add-section');
    const songSectionsContainer = document.getElementById('song-sections');
    const formTitle = document.getElementById('form-title');
    
    // Elementy podglądu piosenki
    const viewSongTitle = document.getElementById('view-song-title');
    const viewSongArtist = document.getElementById('view-song-artist');
    const songContent = document.getElementById('song-content');
    const editSongBtn = document.getElementById('edit-song-btn');
    const backToListBtn = document.getElementById('back-to-list-btn');
    const deleteSongBtn = document.getElementById('delete-song-btn');
    
    let sectionCounter = 1;
    let songs = JSON.parse(localStorage.getItem('songs')) || [];
    let currentSongId = null;
    
    // Funkcje pomocnicze
    function showPage(page) {
        songListPage.classList.remove('active');
        addSongPage.classList.remove('active');
        viewSongPage.classList.remove('active');
        
        document.getElementById(`${page}-page`).classList.add('active');
    }
    
    function resetForm() {
        songTitleInput.value = '';
        songArtistInput.value = '';
        songSectionsContainer.innerHTML = '';
        sectionCounter = 1;
        currentSongId = null;
        formTitle.textContent = 'Dodaj nową piosenkę';
    }
    
    function renderSongList() {
        if (songs.length === 0) {
            songsContainer.innerHTML = '<div class="no-songs">Nie masz jeszcze żadnych zapisanych tekstów piosenek.</div>';
            return;
        }
        
        songsContainer.innerHTML = '';
        
        songs.forEach(song => {
            const songCard = document.createElement('div');
            songCard.className = 'song-card';
            
            let preview = '';
            for (const section of song.sections) {
                if (section.content.trim() !== '') {
                    preview = section.content.split('\n')[0];
                    break;
                }
            }
            
            songCard.innerHTML = `
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
                <div class="song-preview">${preview || '[Brak tekstu]'}</div>
            `;
            
            songCard.addEventListener('click', () => viewSong(song.id));
            songsContainer.appendChild(songCard);
        });
    }
    
    function addSongSection(type, content = '') {
        const sectionId = `section-${sectionCounter++}`;
        const sectionTitle = type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
        
        const sectionElement = document.createElement('div');
        sectionElement.className = 'song-section';
        sectionElement.id = sectionId;
        
        sectionElement.innerHTML = `
            <div class="section-header">
                <span class="section-title">${sectionTitle}</span>
                <button class="remove-section" data-section="${sectionId}">
                    <i class="fas fa-times"></i> Usuń
                </button>
            </div>
            <textarea placeholder="Wpisz tekst tej sekcji..." data-section="${sectionId}">${content}</textarea>
        `;
        
        songSectionsContainer.appendChild(sectionElement);
    }
    
    // Funkcje zarządzania piosenkami
    function saveSong() {
        const title = songTitleInput.value.trim();
        const artist = songArtistInput.value.trim();
        
        if (!title) {
            alert('Proszę podać tytuł piosenki!');
            return;
        }
        
        const sections = [];
        const sectionElements = document.querySelectorAll('.song-section');
        
        sectionElements.forEach(section => {
            const type = section.querySelector('.section-title').textContent.toLowerCase().replace(' ', '-');
            const content = section.querySelector('textarea').value.trim();
            
            sections.push({
                type: type,
                content: content
            });
        });
        
        if (currentSongId) {
            // Edycja istniejącej piosenki
            const songIndex = songs.findIndex(s => s.id === currentSongId);
            if (songIndex !== -1) {
                songs[songIndex] = {
                    id: currentSongId,
                    title: title,
                    artist: artist,
                    sections: sections,
                    createdAt: songs[songIndex].createdAt,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Nowa piosenka
            const newSong = {
                id: Date.now(),
                title: title,
                artist: artist,
                sections: sections,
                createdAt: new Date().toISOString()
            };
            songs.push(newSong);
        }
        
        localStorage.setItem('songs', JSON.stringify(songs));
        showPage('song-list');
        renderSongList();
    }
    
    function viewSong(songId) {
        const song = songs.find(s => s.id === songId);
        if (!song) return;
        
        viewSongTitle.textContent = song.title;
        viewSongArtist.textContent = song.artist;
        songContent.innerHTML = '';
        
        song.sections.forEach(section => {
            if (section.content.trim() === '') return;
            
            const sectionElement = document.createElement('div');
            sectionElement.className = 'song-section-view';
            
            const titleElement = document.createElement('div');
            titleElement.className = 'section-title-view';
            titleElement.textContent = `[${section.type.charAt(0).toUpperCase() + section.type.slice(1).replace('-', ' ')}]`;
            
            const contentElement = document.createElement('div');
            contentElement.className = 'section-content-view';
            contentElement.textContent = section.content;
            
            sectionElement.appendChild(titleElement);
            sectionElement.appendChild(contentElement);
            songContent.appendChild(sectionElement);
        });
        
        // Ustaw ID aktualnie oglądanej piosenki
        editSongBtn.dataset.songId = songId;
        deleteSongBtn.dataset.songId = songId;
        showPage('view-song');
    }
    
    function editSong(songId) {
        const song = songs.find(s => s.id === songId);
        if (!song) return;
        
        currentSongId = songId;
        formTitle.textContent = 'Edytuj piosenkę';
        songTitleInput.value = song.title;
        songArtistInput.value = song.artist;
        songSectionsContainer.innerHTML = '';
        
        song.sections.forEach(section => {
            addSongSection(section.type, section.content);
        });
        
        showPage('add-song');
    }
    
    function deleteSong(songId) {
        if (confirm('Czy na pewno chcesz usunąć tę piosenkę? Tej operacji nie można cofnąć.')) {
            songs = songs.filter(s => s.id !== songId);
            localStorage.setItem('songs', JSON.stringify(songs));
            showPage('song-list');
            renderSongList();
        }
    }
    
    // Nasłuchiwacze zdarzeń
    addSongBtn.addEventListener('click', function(e) {
        e.preventDefault();
        resetForm();
        showPage('add-song');
    });
    
    backBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showPage('song-list');
    });
    
    saveSongBtn.addEventListener('click', function(e) {
        e.preventDefault();
        saveSong();
    });
    
    addSectionButton.addEventListener('click', function() {
        const selectedType = sectionTypeSelect.value;
        addSongSection(selectedType);
    });
    
    songSectionsContainer.addEventListener('click', function(e) {
        if (e.target.closest('.remove-section')) {
            const sectionId = e.target.closest('.remove-section').getAttribute('data-section');
            document.getElementById(sectionId).remove();
        }
    });
    
    editSongBtn.addEventListener('click', function() {
        const songId = parseInt(this.dataset.songId);
        editSong(songId);
    });
    
    backToListBtn.addEventListener('click', function() {
        showPage('song-list');
    });
    
    deleteSongBtn.addEventListener('click', function() {
        const songId = parseInt(this.dataset.songId);
        deleteSong(songId);
    });
    
    // Inicjalizacja
    showPage('song-list');
    renderSongList();
});