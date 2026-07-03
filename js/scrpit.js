        // (B) GET AUDIO TAG + DEFINE PLAYLIST
        let audio = document.getElementById("bgm"),
            playlist = ["1.mp3", "2.mp3"],
            current = 0;
        // (C) AUTO LOAD NEXT SONG
        audio.onended = () => {
            current++;
            if (current >= playlist.length) { current = 0; }
            audio.src = playlist[current];
            audio.pause();
            audio.load();
            audio.play();
        };