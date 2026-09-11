/* =========================================================
   REDFLIX ENGINE (SUPPORT MP4, M3U8 & VERCEL EMBED)
========================================================= */

/* IKLAN */
const SHOPEE_AD_URL = "https://s.shopee.co.id/4qFQYYdc3C";
let isAdOpened = false;

/* DOM ELEMENTS */
const movieGrid = document.getElementById("movieGrid");
const seriesGrid = document.getElementById("seriesGrid");
const movieSection = document.getElementById("movieSection");
const seriesSection = document.getElementById("seriesSection");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");

const heroVideo = document.getElementById("heroVideo");
const heroTitle = document.getElementById("heroTitle");
const heroDescription = document.getElementById("heroDescription");
const heroPlayBtn = document.getElementById("heroPlayBtn");
const heroInfoBtn = document.getElementById("heroInfoBtn");

const detailModal = document.getElementById("detailModal");
const detailVideo = document.getElementById("detailVideo");

const playerModal = document.getElementById("playerModal");
const mainPlayer = document.getElementById("mainPlayer");
const mainIframe = document.getElementById("mainIframe");
const playerError = document.getElementById("playerError");
const playerClose = document.getElementById("playerClose");
const detailPlayBtn = document.getElementById("detailPlayBtn");

let currentMovie = null;
let currentHls = null;

/* DETEKSI UNTUK LINK EMBED VERCEL / WEBPAGE */
function isEmbedUrl(url) {
  if (!url) return false;
  return url.includes("vercel.app") || (!url.endsWith(".mp4") && !url.includes(".m3u8"));
}

/* PEMUTAR VIDEO NATIVE / HLS */
function loadVideo(videoElement, url, autoplay = false) {
  if (!videoElement || !url || isEmbedUrl(url)) return;

  videoElement.pause();
  videoElement.removeAttribute("src");
  videoElement.load();

  if (!url.includes(".m3u8")) {
    videoElement.src = url;
    if (autoplay) videoElement.play().catch(() => {});
    return;
  }

  if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
    videoElement.src = url;
    if (autoplay) videoElement.play().catch(() => {});
    return;
  }

  if (typeof Hls !== "undefined" && Hls.isSupported()) {
    if (currentHls) {
      currentHls.destroy();
      currentHls = null;
    }
    currentHls = new Hls();
    currentHls.loadSource(url);
    currentHls.attachMedia(videoElement);

    currentHls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (autoplay) videoElement.play().catch(() => {});
    });
  }
}

/* CREATE KARTU FILM */
function createCard(movie) {
  const card = document.createElement("article");
  card.className = "video-card";

  card.innerHTML = `
    <div class="card-video">
      <video muted loop playsinline preload="metadata"></video>
      <div class="card-play">▶</div>
    </div>
    <div class="card-info">
      <h3 class="card-title">${escapeHTML(movie.title)}</h3>
      <div class="card-meta">
        <span>${movie.year}</span> • <span>${escapeHTML(movie.genre)}</span> • <span class="card-rating">★ ${escapeHTML(movie.rating)}</span>
      </div>
      <button class="share-btn" type="button">↗ Share</button>
    </div>
  `;

  const video = card.querySelector("video");
  const shareBtn = card.querySelector(".share-btn");

  if (!isEmbedUrl(movie.video)) {
    loadVideo(video, movie.video);
    card.addEventListener("mouseenter", () => { video.currentTime = 0; video.play().catch(() => {}); });
    card.addEventListener("mouseleave", () => { video.pause(); });
  }

  shareBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?video=${encodeURIComponent(movie.id)}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: movie.title, text: `Tonton ${movie.title} di RedFlix`, url: shareUrl });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link video berhasil disalin!");
        return;
      }
      prompt("Salin link video ini:", shareUrl);
    } catch (e) {}
  });

  card.addEventListener("click", () => openDetail(movie));
  return card;
}

/* RENDER KATALOG */
function renderMovies(list) {
  movieGrid.innerHTML = "";
  seriesGrid.innerHTML = "";

  const filmList = list.filter(movie => movie.type === "movie");
  const seriesList = list.filter(movie => movie.type === "series");

  filmList.forEach(movie => movieGrid.appendChild(createCard(movie)));
  seriesList.forEach(movie => seriesGrid.appendChild(createCard(movie)));

  movieSection.classList.toggle("hidden", filmList.length === 0);
  seriesSection.classList.toggle("hidden", seriesList.length === 0);
  emptyState.classList.toggle("hidden", list.length > 0);
}

/* HERO BANNER */
function setupHero() {
  const featured = movies.find(movie => movie.featured) || movies[0];
  if (!featured) return;

  currentMovie = featured;
  heroTitle.textContent = featured.title;
  heroDescription.textContent = featured.description;
  loadVideo(heroVideo, featured.video, true);

  heroPlayBtn.onclick = () => openPlayer(featured);
  heroInfoBtn.onclick = () => openDetail(featured);
}

/* MODAL DETAIL */
function openDetail(movie) {
  currentMovie = movie;
  document.getElementById("detailTitle").textContent = movie.title;
  document.getElementById("detailYear").textContent = movie.year;
  document.getElementById("detailGenre").textContent = movie.genre;
  document.getElementById("detailRating").textContent = `★ ${movie.rating}`;
  document.getElementById("detailType").textContent = movie.type === "series" ? "SERIES" : "FILM";
  document.getElementById("detailDescription").textContent = movie.description;
  document.getElementById("detailCast").textContent = movie.cast || "-";

  loadVideo(detailVideo, movie.video);
  detailModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

/* MODAL PLAYER (SWITCH VIDEO / EMBED) */
function openPlayer(movie) {
  currentMovie = movie;
  playerError.classList.add("hidden");
  playerModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  if (isEmbedUrl(movie.video)) {
    mainPlayer.classList.add("hidden");
    mainIframe.classList.remove("hidden");
    mainIframe.src = movie.video;
  } else {
    mainIframe.classList.add("hidden");
    mainIframe.src = "about:blank";
    mainPlayer.classList.remove("hidden");
    loadVideo(mainPlayer, movie.video, true);
  }
}

function closeDetail() {
  detailVideo.pause();
  detailVideo.removeAttribute("src");
  detailModal.classList.add("hidden");
  document.body.style.overflow = "";
}

function closePlayer() {
  mainPlayer.pause();
  mainPlayer.removeAttribute("src");
  mainIframe.src = "about:blank";
  if (currentHls) { currentHls.destroy(); currentHls = null; }
  playerModal.classList.add("hidden");
  document.body.style.overflow = "";
}

/* EVENT LISTENERS */
document.querySelectorAll("[data-close-detail]").forEach(el => el.addEventListener("click", closeDetail));
detailPlayBtn.addEventListener("click", () => {
  if (!currentMovie) return;
  const m = currentMovie;
  closeDetail();
  setTimeout(() => openPlayer(m), 100);
});
playerClose.addEventListener("click", closePlayer);

document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closePlayer(); closeDetail(); }
});

/* SEARCH */
searchInput.addEventListener("input", e => {
  const kw = e.target.value.trim().toLowerCase();
  renderMovies(movies.filter(m => m.title.toLowerCase().includes(kw) || m.genre.toLowerCase().includes(kw)));
});

/* FILTER */
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;
    renderMovies(f === "all" ? movies : movies.filter(m => m.type === f));
  });
});

/* ESCAPE HTML */
function escapeHTML(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* POPUP IKLAN 1X */
document.addEventListener("click", e => {
  if (isAdOpened || e.target.closest(".share-btn") || e.target.closest("#playerClose") || e.target.closest("[data-close-detail]")) return;
  isAdOpened = true;
  window.open(SHOPEE_AD_URL, "_blank", "noopener,noreferrer");
}, { capture: true });

/* INIT */
renderMovies(movies);
setupHero();
