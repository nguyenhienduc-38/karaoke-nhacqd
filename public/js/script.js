document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     ANIMATION LOGO
  =============================== */
  document.querySelectorAll(".logo123").forEach(logo => {
    const text = logo.textContent.trim();
    logo.textContent = "";

    [...text].forEach(ch => {
      const span = document.createElement("span");
      span.textContent = ch === " " ? "\u00A0" : ch;
      logo.appendChild(span);
    });

    const letters = logo.querySelectorAll("span");
    let i = 0;
    setInterval(() => {
      letters.forEach(s => {
        s.style.transform = "scale(1)";
        s.style.color = "red";
      });
      letters[i].style.transform = "scale(1.6)";
      letters[i].style.color = "orange";
      i = (i + 1) % letters.length;
    }, 300);
  });

  /* ===============================
     HOME PAGE – HIỂN THỊ PLAYLIST
  =============================== */
  const videosContainer = document.querySelector(".videos");

  if (videosContainer) {
    Promise.all([
      fetch("../public/data/playlists.json").then(r => r.json()),
      fetch("../public/data/songs.json").then(r => r.json())
    ])
      .then(([plData, songData]) => {
        videosContainer.innerHTML = "";

        plData.playlists.forEach(pl => {
          const playlistSongs =
            songData.playlists.find(p => p.id === pl.id)?.songs || [];

          const card = document.createElement("div");
          card.className = "video-card";
          card.innerHTML = `
            <img class="thumbnail" src="../public/${pl.thumbnail}">
            <div class="video-info">
              <div class="title">${pl.title}</div>
              <div class="channel">${playlistSongs.length} bài hát</div>
            </div>
          `;

          card.onclick = () => {
            window.location.href = `index.html?playlist=${pl.id}`;
          };

          videosContainer.appendChild(card);
        });
      })
      .catch(err => console.error("Lỗi load playlist:", err));
  }

  /* ===============================
     PLAYLIST PAGE
  =============================== */
  const playlistEl = document.getElementById("playlist");
  const videoWrapper = document.getElementById("videoWrapper");
  const videoPlayer = document.getElementById("videoPlayer");
  const videoSrc = document.getElementById("videoSrc");

  if (!playlistEl) return;

  const params = new URLSearchParams(window.location.search);
  const playlistId = params.get("playlist");

  fetch("../public/data/songs.json")
    .then(r => r.json())
    .then(data => {
      const playlist = data.playlists.find(p => p.id === playlistId);
      if (!playlist) return;

      renderPlaylist(playlist.songs);
      restoreLastSong();
    })
    .catch(err => console.error("Lỗi load bài hát:", err));

  function renderPlaylist(songs) {
    playlistEl.innerHTML = "";

    songs.forEach(song => {
      const id = `song-${playlistId}-${song.id}`;

      playlistEl.insertAdjacentHTML("beforeend", `
        <input type="radio" name="track" id="${id}"
               data-video="../public/${song.videoUrl}">
        <label for="${id}" class="track">
          <img class="thumb" src="../public/${song.thumbnail}">
          <div class="meta">
            <div class="title">${song.title}</div>
            <div class="artist">${song.author || ""}</div>
          </div>
        </label>
      `);
    });

    bindPlayerEvents();
  }

  function bindPlayerEvents() {
    document.querySelectorAll('input[name="track"]').forEach(input => {
      input.addEventListener("change", () => {
        videoSrc.src = input.dataset.video;
        videoPlayer.load();
        videoWrapper.style.display = "block";
        videoPlayer.play().catch(() => {});
        localStorage.setItem("currentSong", input.id);
      });
    });
  }

  function restoreLastSong() {
    const saved = localStorage.getItem("currentSong");
    if (!saved) return;

    const input = document.getElementById(saved);
    if (input) {
      input.checked = true;
      input.dispatchEvent(new Event("change"));
    }
  }

  /* ===============================
     HOME BUTTON
  =============================== */
  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      window.location.href = "home.html";
    });
  }

});
