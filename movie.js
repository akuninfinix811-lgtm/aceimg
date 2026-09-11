/* =========================
   DATA MOVIES
   ========================= */
const movies = [
  {
    id: 1,
    title: "Kolpri kak anjani pemain basket viral",
    year: 2026,
    genre: "semi",
    rating: "8.5",
    type: "movie",
    featured: true,
    description: "Contoh data film untuk RedFlix.",
    cast: "Actor 1, Actor 2",
    video: "https://stream.kingbokep.video/kolpri-kak-anjani-pemain-basket/playlist.m3u8"
  },
  {
    id: 2,
    title: "tetangga mamaku",
    year: 2026,
    genre: "colmek",
    rating: "8.1",
    type: "movie",
    featured: false,
    description: "Tetangga mamaku lagi sange.",
    cast: "Actor 4, Actor 5",
    video: "https://gudangbf.vercel.app/?id=player2"
  },
  {
    id: 3,
    title: "Contoh Series",
    year: 2026,
    genre: "Series",
    rating: "8.7",
    type: "series",
    featured: false,
    description: "Contoh series untuk katalog RedFlix.",
    cast: "Actor 6, Actor 7",
    video: "https://cdn.aceimg.com/826XWyBMo.mp4"
  },
  {
    id: 4,
    title: "Contoh Series Action",
    year: 2026,
    genre: "Action",
    rating: "8.3",
    type: "series",
    featured: false,
    description: "Contoh series action untuk katalog RedFlix.",
    cast: "Actor 8, Actor 9",
    video: "https://cdn.aceimg.com/bnmNv3Ts3.mp4"
  }
];

/* =========================
   FUNGSI PEMUTAR (PLAYER ENGINE)
   ========================= */
let hlsInstance = null;

function playMovie(movieUrl, title = "", desc = "") {
  const videoEl = document.getElementById("video-player");
  const iframeEl = document.getElementById("iframe-player");
  const featuredTitle = document.getElementById("featured-title");
  const featuredDesc = document.getElementById("featured-desc");

  if (!videoEl || !iframeEl) return;

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

  // Update Judul & Deskripsi jika ada
  if (featuredTitle && title) featuredTitle.textContent = title;
  if (featuredDesc && desc) featuredDesc.textContent = desc;

  // JIKA LINK ADALAH EMBED / WEBPAGE (Vercel)
  if (movieUrl.includes("vercel.app") || (!movieUrl.endsWith(".mp4") && !movieUrl.includes(".m3u8"))) {
    iframeEl.src = movieUrl;
    iframeEl.classList.add("active");
  } 
  // JIKA LINK FILE MEDIA DIRECT (.m3u8 / .mp4)
  else {
    videoEl.classList.add("active");
    if (movieUrl.includes(".m3u8")) {
      if (typeof Hls !== "undefined" && Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(movieUrl);
        hlsInstance.attachMedia(videoEl);
      } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
        videoEl.src = movieUrl;
      }
    } else {
      videoEl.src = movieUrl;
    }
    videoEl.play().catch(() => {});
  }

  // Auto scroll ke pemutar video atas
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =========================
   RENDER KATALOG & EVENT
   ========================= */
document.addEventListener("DOMContentLoaded", function () {
  const catalogList = document.getElementById("catalog-list");
  const btnMainPlay = document.getElementById("btn-main-play");

  // Render semua film ke layar
  if (catalogList) {
    catalogList.innerHTML = "";
    movies.forEach(item => {
      const card = document.createElement("div");
      card.className = "movie-card";
      card.innerHTML = `
        <h4>${item.title}</h4>
        <button onclick="playMovie('${item.video}', '${item.title}', '${item.description}')">Putar</button>
      `;
      catalogList.appendChild(card);
    });
  }

  // Tombol "Mulai Nonton" di banner utama
  if (btnMainPlay && movies.length > 0) {
    btnMainPlay.addEventListener("click", function () {
      const featured = movies.find(m => m.featured) || movies[0];
      playMovie(featured.video, featured.title, featured.description);
    });
  }
});
