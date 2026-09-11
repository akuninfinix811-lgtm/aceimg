<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RedFlix - Stream</title>

  <!-- HLS.js Library -->
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #000;
      color: #fff;
      padding: 15px;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 15px;
    }

    .logo {
      color: #e50914;
      font-weight: 900;
      font-size: 20px;
      letter-spacing: 1px;
    }

    .search-box input {
      background: #111;
      border: 1px solid #333;
      color: #fff;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
    }

    /* WADAH PEMUTAR VIDEO & EMBED */
    .player-wrapper {
      position: relative;
      width: 100%;
      height: 220px;
      background: #111;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 15px;
    }

    .player-wrapper video,
    .player-wrapper iframe {
      width: 100%;
      height: 100%;
      border: 0;
      display: none;
    }

    .player-wrapper .active {
      display: block;
    }

    /* FEATURED SECTION */
    .featured {
      margin-bottom: 20px;
    }

    .featured-label {
      color: #e50914;
      font-size: 10px;
      font-weight: bold;
      letter-spacing: 1px;
    }

    .featured-title {
      font-size: 24px;
      font-weight: 800;
      margin: 4px 0;
    }

    .featured-desc {
      font-size: 12px;
      color: #aaa;
      margin-bottom: 12px;
    }

    .btn-group {
      display: flex;
      gap: 10px;
    }

    .btn-play {
      background: #e50914;
      color: #fff;
      border: 0;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
    }

    .btn-detail {
      background: #222;
      color: #fff;
      border: 0;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
    }

    /* FILTER CATEGORIES */
    .categories {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .cat-btn {
      background: #222;
      color: #fff;
      border: 0;
      padding: 6px 16px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
    }

    .cat-btn.active {
      background: #e50914;
    }

    /* SECTION TITLES & CATALOG */
    .section-title {
      font-size: 16px;
      border-left: 3px solid #e50914;
      padding-left: 8px;
      margin: 15px 0 10px 0;
    }

    .catalog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
    }

    .movie-card {
      background: #141414;
      border: 1px solid #222;
      border-radius: 6px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .movie-card h4 {
      font-size: 12px;
      margin-bottom: 8px;
      line-height: 1.3;
    }

    .movie-card button {
      background: #e50914;
      color: #fff;
      border: 0;
      padding: 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      cursor: pointer;
    }

    footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #222;
      font-size: 11px;
      color: #666;
    }

    footer span { color: #e50914; }
  </style>
</head>
<body>

  <header>
    <div class="logo">REDFLIX</div>
    <div class="search-box">
      <input type="text" placeholder="Cari film atau series...">
    </div>
  </header>

  <!-- WADAH PLAYER (UTAMA) -->
  <div class="player-wrapper">
    <video id="video-player" controls autoplay playsinline></video>
    <iframe id="iframe-player" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
  </div>

  <!-- FEATURED INFO -->
  <div class="featured">
    <div class="featured-label">FEATURED</div>
    <div class="featured-title" id="featured-title">RedFlix</div>
    <div class="featured-desc" id="featured-desc">Saksikan film dan series favoritmu.</div>
    <div class="btn-group">
      <button class="btn-play" id="btn-main-play">► Mulai Nonton</button>
      <button class="btn-detail">i Detail</button>
    </div>
  </div>

  <!-- NAVIGASI KATEGORI -->
  <div class="categories">
    <button class="cat-btn active">Semua</button>
    <button class="cat-btn">Film</button>
    <button class="cat-btn">Series</button>
  </div>

  <!-- LIST FILM -->
  <div class="section-title">Film & Series</div>
  <div class="catalog-grid" id="catalog-list"></div>

  <footer>
    <div><span>REDFLIX</span></div>
    <div>© 2026 RedFlix</div>
  </footer>

  <script>
    /* DATA ARRAY MOVIES */
    const movies = [
      {
        id: 1,
        title: "Kolpri kak anjani pemain basket viral",
        year: 2026,
        genre: "semi",
        type: "movie",
        featured: true,
        description: "Video viral kolpri kak anjani pemain basket.",
        video: "https://stream.kingbokep.video/kolpri-kak-anjani-pemain-basket/playlist.m3u8"
      },
      {
        id: 2,
        title: "tetangga mamaku",
        year: 2026,
        genre: "colmek",
        type: "movie",
        featured: false,
        description: "Tetangga mamaku lagi sange.",
        video: "https://gudangbf.vercel.app/?id=player2"
      },
      {
        id: 3,
        title: "Contoh Series",
        year: 2026,
        genre: "Series",
        type: "series",
        featured: false,
        description: "Contoh series untuk katalog RedFlix.",
        video: "https://cdn.aceimg.com/826XWyBMo.mp4"
      },
      {
        id: 4,
        title: "Contoh Series Action",
        year: 2026,
        genre: "Action",
        type: "series",
        featured: false,
        description: "Contoh series action untuk katalog RedFlix.",
        video: "https://cdn.aceimg.com/bnmNv3Ts3.mp4"
      }
    ];

    const videoEl = document.getElementById("video-player");
    const iframeEl = document.getElementById("iframe-player");
    let hlsInstance = null;

    /* FUNGSI PEMUTARAN VIDEO / EMBED */
    function playMovie(url, title = "", desc = "") {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
      videoEl.pause();
      videoEl.src = "";
      iframeEl.src = "about:blank";

      videoEl.classList.remove("active");
      iframeEl.classList.remove("active");

      if (title) document.getElementById("featured-title").textContent = title;
      if (desc) document.getElementById("featured-desc").textContent = desc;

      // JIKA EMBED / VERCEL URL
      if (url.includes("vercel.app") || (!url.endsWith(".mp4") && !url.includes(".m3u8"))) {
        iframeEl.src = url;
        iframeEl.classList.add("active");
      } 
      // JIKA FILE MEDIA DIRECT (.m3u8 / .mp4)
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

      // Scroll otomatis ke bagian pemutar video
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /* RENDER MOVIES KE LAYAR */
    const catalogEl = document.getElementById("catalog-list");
    movies.forEach(item => {
      const card = document.createElement("div");
      card.className = "movie-card";
      card.innerHTML = `
        <h4>${item.title}</h4>
        <button onclick="playMovie('${item.video}', '${item.title}', '${item.description}')">Putar</button>
      `;
      catalogEl.appendChild(card);
    });

    /* EVENT UTAMA UNTUK TOMBOL "MULAI NONTON" */
    document.getElementById("btn-main-play").addEventListener("click", function() {
      if (movies.length > 0) {
        playMovie(movies[0].video, movies[0].title, movies[0].description);
      }
    });
  </script>

</body>
</html>
