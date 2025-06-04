document.addEventListener('DOMContentLoaded', function () {
    const mp3FileInput = document.getElementById('mp3File');
    const editorFields = document.getElementById('editor-fields');
    const fileInfo = document.getElementById('file-info');
    const saveButton = document.getElementById('save');
    const coverInput = document.getElementById('cover');
    const coverPreview = document.createElement('img');

    coverPreview.style.maxWidth = "100%";
    coverPreview.style.marginTop = "10px";
    coverPreview.style.borderRadius = "8px";
    document.querySelector('.cover-label').appendChild(coverPreview);

    // Ładowanie bibliotek z zewnętrznych CDN
    const script1 = document.createElement('script');
    script1.src = "https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js";
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = "https://cdn.jsdelivr.net/npm/browser-id3-writer@4.0.0";
    document.body.appendChild(script2);

    script2.onload = function () { // Upewniamy się, że biblioteka została załadowana
        mp3FileInput.addEventListener('change', function () {
            if (!this.files.length) return;

            const file = this.files[0];

            fileInfo.innerHTML = `
                <p><strong>Nazwa pliku:</strong> ${file.name}</p>
                <p><strong>Rozmiar:</strong> ${(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            `;
            fileInfo.classList.remove('hidden');
            editorFields.classList.remove('hidden');
            editorFields.classList.add('visible');

            // Odczyt metadanych
            window.jsmediatags.read(file, {
                onSuccess: function (tag) {
                    document.getElementById('title').value = tag.tags.title || '';
                    document.getElementById('artist').value = tag.tags.artist || '';
                    document.getElementById('album').value = tag.tags.album || '';

                    if (tag.tags.picture) {
                        const { data, format } = tag.tags.picture;
                        const base64String = `data:image/${format};base64,${btoa(String.fromCharCode(...new Uint8Array(data)))}`;
                        coverPreview.src = base64String;
                    } else {
                        coverPreview.src = '';
                    }
                },
                onError: function (error) {
                    console.log('Błąd odczytu tagów:', error);
                    fileInfo.innerHTML += `<p><em>Nie udało się odczytać metadanych</em></p>`;
                }
            });
        });

        // Podgląd okładki
        coverInput.addEventListener('change', function () {
            if (this.files.length) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    coverPreview.src = e.target.result;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });

        saveButton.addEventListener('click', async () => {
            if (!mp3FileInput.files.length) {
                alert("Proszę wybrać plik MP3");
                return;
            }
        
            const file = mp3FileInput.files[0];
            const title = document.getElementById('title').value;
            const artist = document.getElementById('artist').value;
            const album = document.getElementById('album').value;
        
            const buffer = await file.arrayBuffer();
            const writer = new window.ID3Writer(buffer);
        
            writer.setFrame('TIT2', title);
            writer.setFrame('TPE1', [artist]);
            writer.setFrame('TALB', album);
        
            if (coverInput.files.length) {
                const coverFile = coverInput.files[0];
                const coverBuffer = await coverFile.arrayBuffer();
                writer.setFrame('APIC', {
                    type: 3,
                    data: new Uint8Array(coverBuffer),
                    description: "Cover"
                });
            }
        
            writer.addTag();
        
            const updatedFile = new Blob([writer.arrayBuffer], { type: "audio/mp3" });
            const url = URL.createObjectURL(updatedFile);
            const a = document.createElement("a");
            a.href = url;
            a.download = title ? `${title}.mp3` : "updated.mp3";
            a.click();
        
            setTimeout(() => {
                URL.revokeObjectURL(url);
                
                // Resetowanie pól formularza
                document.getElementById('title').value = '';
                document.getElementById('artist').value = '';
                document.getElementById('album').value = '';
                coverInput.value = '';
                coverPreview.src = '';
                
                // Ukrywanie pól edycji i informacji o pliku
                editorFields.classList.remove('visible');
                editorFields.classList.add('hidden');
                fileInfo.classList.add('hidden');
                
                // Resetowanie inputa pliku
                mp3FileInput.value = '';
            }, 100);
        });
    };
});
