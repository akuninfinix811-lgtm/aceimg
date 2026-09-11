<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RedFlix - Player & Catalog</title>
  
  <!-- HLS.js untuk memutar format .m3u8 -->
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>

  <style>
    * { 
      box-sizing: border-box; 
      margin: 0; 
      padding: 0; 
    }
    
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
      background: #141414; 
      color: #fff; 
      padding: 20px; 
    }
    
    .player-container {
      position: relative;
      width: 100%;
      height: 480px;
      background: #000;
      margin-bottom: 25px;
      border-radius: 8px;
      overflow: hidden;
    }

    .player-container video, 
    .player-container iframe {
      width: 100%;
      height: 100%;
      border: 0;
      display: none;
    }

    .player-container .active { 
      display: block; 
    }

    .catalog { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); 
      gap: 15px; 
    }

    .card { 
      background: #222; 
      padding: 15px; 
      border-radius: 8px; 
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 10px;
    }

    .card h3 { 
      font-size: 15px; 
      line-height: 1.4;
    }

    .card button { 
      padding: 8px 12px; 
      background: #e50914; 
      color: #fff; 
      border: 0; 
      border-radius: 4px; 
      font-weight: bold;
      cursor: pointer; 
    }

    .card button:hover {
      background: #b80710;
    }
  </style>
</head>
<body>

  <!-- CONTAINER PEMUTAR UTAMA -->
  <div class="player-container">
    <video id="video-player" controls autoplay playsinline></video>
    <iframe 
      id="iframe-player" 
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen" 
      allowfullscreen>
    </iframe>
  </div>

  <!-- KATALOG FILM -->
  <div class="catalog" id="catalog-list"></div>

  <script>
    const movies = [
      {
        id: 1,
        title: "Kolpri kak anjani pemain basket viral",
        video: "https://stream.kingbokep.video/kolpri-kak-anjani-pemain-basket/playlist.m3u8"
      },
      {
        id: 2,
        title: "tetangga mamaku",
        video: "https://gudangbf.vercel.app/?id=player2"
      },
      {
        id: 3,
        title: "Contoh Series",
        video: "https://cdn.aceimg.com/826XWyBMo.mp4"
      }
    ];

    const videoEl = document.getElementById("video-player");
    const iframeEl = document.getElementById("iframe-player");
    let hlsInstance = null;

    function playContent(url) {
      // Hentikan pemutaran sebelumnya
      if (hlsInstance) { 
        hlsInstance.destroy(); 
        hlsInstance = null;
      }
      videoEl.pause();
      videoEl.src = "";
      iframeEl.src = "about:blank";
      
      videoEl.classList.remove("active");
      iframeEl.classList.remove("active");

      // JIKA LINK ADALAH EMBED / HALAMAN WEBPAGE (Vercel)
      if (url.includes("vercel.app") || (!url.endsWith(".mp4") && !url.includes(".m3u8"))) {
        iframeEl.src = url;
        iframeEl.classList.add("active");
      } 
      // JIKA LINK FILE VIDEO DIRECT (.m3u8 / .mp4)
      else {
        videoEl.classList.add("active");
        if (url.includes(".m3u8")) {
          if (Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(videoEl);
          } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
            videoEl.src = url;
          }
        } else {
          videoEl.src = url;
        }
        videoEl.play().catch(() => {});
      }
    }

    // Render List Katalog Film
    const catalogEl = document.getElementById("catalog-list");
    movies.forEach(item => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${item.title}</h3>
        <button onclick="playContent('${item.video}')">Putar Video</button>
      `;
      catalogEl.appendChild(card);
    });

    // Otomatis memutar film pertama saat halaman dimuat
    if (movies.length > 0) {
      playContent(movies[0].video);
    }
  </script>

</body>
</html>
