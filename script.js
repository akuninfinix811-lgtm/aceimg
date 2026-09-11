/* =========================
   REDFLIX PLAYER SYSTEM
   ========================= */

let hlsInstance = null;
let currentMovie = null;
let currentFilter = "all";
let adOpened = false;


/* =========================
   DOM
   ========================= */

const heroVideo = document.getElementById("heroVideo");
const heroTitle = document.getElementById("heroTitle");
const heroDescription = document.getElementById("heroDescription");
const heroPlayBtn = document.getElementById("heroPlayBtn");
const heroInfoBtn = document.getElementById("heroInfoBtn");

const movieGrid = document.getElementById("movieGrid");
const seriesGrid = document.getElementById("seriesGrid");

const movieSection = document.getElementById("movieSection");
const seriesSection = document.getElementById("seriesSection");

const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");

const detailModal = document.getElementById("detailModal");
const detailVideo = document.getElementById("detailVideo");
const detailTitle = document.getElementById("detailTitle");
const detailYear = document.getElementById("detailYear");
const detailGenre = document.getElementById("detailGenre");
const detailRating = document.getElementById("detailRating");
const detailType = document.getElementById("detailType");
const detailDescription = document.getElementById("detailDescription");
const detailCast = document.getElementById("detailCast");
const detailPlayBtn = document.getElementById("detailPlayBtn");

const playerModal = document.getElementById("playerModal");
const playerClose = document.getElementById("playerClose");
const mainPlayer = document.getElementById("mainPlayer");
const iframePlayer = document.getElementById("iframePlayer");
const playerError = document.getElementById("playerError");


/* =========================
   DETEKSI JENIS VIDEO
   ========================= */

function isIframeUrl(url) {

  if (!url) return false;

  const value = url.toLowerCase();

  // File video langsung
  if (value.includes(".mp4")) return false;
  if (value.includes(".m3u8")) return false;
  if (value.includes(".webm")) return false;
  if (value.includes(".ogg")) return false;

  // Selain file media dianggap sebagai halaman/embed
  return true;
}


/* =========================
   STOP PLAYER
   ========================= */

function stopCurrentPlayer() {

  if (hlsInstance) {
    try {
      hlsInstance.destroy();
    } catch (error) {
      console.warn("HLS destroy error:", error);
    }

    hlsInstance = null;
  }

  if (mainPlayer) {
    mainPlayer.pause();
    mainPlayer.removeAttribute("src");

    try {
      mainPlayer.load();
    } catch (error) {
      console.warn("Video reset error:", error);
    }
  }

  if (iframePlayer) {
    iframePlayer.src = "about:blank";
  }

  if (mainPlayer) {
    mainPlayer.classList.remove("active");
    mainPlayer.style.display = "none";
  }

  if (iframePlayer) {
    iframePlayer.classList.remove("active");
    iframePlayer.style.display = "none";
  }

  if (playerError) {
    playerError.classList.add("hidden");
  }
}


/* =========================
   PLAY MOVIE
   ========================= */

function playMovie(movieUrl, title = "", desc = "") {

  if (!movieUrl) {
    console.error("URL video kosong.");
    return;
  }

  if (!mainPlayer || !iframePlayer) {
    console.error(
      "mainPlayer atau iframePlayer tidak ditemukan di index.html."
    );
    return;
  }

  stopCurrentPlayer();

  if (heroTitle && title) {
    heroTitle.textContent = title;
  }

  if (heroDescription && desc) {
    heroDescription.textContent = desc;
  }


  /* =========================
     EMBED / WEBPAGE
     ========================= */

  if (isIframeUrl(movieUrl)) {

    iframePlayer.src = movieUrl;

    iframePlayer.style.display = "block";
    iframePlayer.classList.add("active");

  }


  /* =========================
     HLS / VIDEO DIRECT
     ========================= */

  else {

    mainPlayer.style.display = "block";
    mainPlayer.classList.add("active");


    /* HLS */
    if (movieUrl.toLowerCase().includes(".m3u8")) {

      if (
        typeof Hls !== "undefined" &&
        Hls.isSupported()
      ) {

        hlsInstance = new Hls();

        hlsInstance.loadSource(movieUrl);
        hlsInstance.attachMedia(mainPlayer);

        hlsInstance.on(
          Hls.Events.ERROR,
          function (event, data) {

            console.error("HLS error:", data);

            if (data.fatal && playerError) {
              playerError.classList.remove("hidden");
            }

          }
        );

      }

      else if (
        mainPlayer.canPlayType(
          "application/vnd.apple.mpegurl"
        )
      ) {

        mainPlayer.src = movieUrl;

      }

      else {

        if (playerError) {
          playerError.classList.remove("hidden");
        }

        return;
      }

    }


    /* MP4 / WEBM */
    else {

      mainPlayer.src = movieUrl;

    }


    /* Autoplay */
    mainPlayer.play().catch(function () {
      // Browser dapat memblokir autoplay.
    });

  }


  /* Scroll ke player */
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================
   OPEN PLAYER
   ========================= */

function openPlayer(movie) {

  if (!movie) return;

  currentMovie = movie;

  if (playerModal) {
    playerModal.classList.remove("hidden");
  }

  document.body.style.overflow = "hidden";

  playMovie(
    movie.video,
    movie.title,
    movie.description
  );
}


/* =========================
   CLOSE PLAYER
   ========================= */

function closePlayer() {

  stopCurrentPlayer();

  if (playerModal) {
    playerModal.classList.add("hidden");
  }

  document.body.style.overflow = "";
}


/* =========================
   DETAIL
   ========================= */

function openDetail(movie) {

  if (!movie || !detailModal) return;

  currentMovie = movie;

  detailTitle.textContent = movie.title || "-";
  detailYear.textContent = movie.year || "-";
  detailGenre.textContent = movie.genre || "-";
  detailRating.textContent = "★ " + (movie.rating || "-");

  detailType.textContent =
    movie.type === "series"
      ? "SERIES"
      : "FILM";

  detailDescription.textContent =
    movie.description || "";

  detailCast.textContent =
    movie.cast || "-";


  /* Detail preview hanya untuk video langsung */
  if (detailVideo) {

    detailVideo.pause();
    detailVideo.removeAttribute("src");

    if (
      movie.video &&
      !isIframeUrl(movie.video)
    ) {

      detailVideo.src = movie.video;

    }
  }


  detailModal.classList.remove("hidden");
}


/* =========================
   CLOSE DETAIL
   ========================= */

function closeDetail() {

  if (detailVideo) {

    detailVideo.pause();
    detailVideo.removeAttribute("src");

    try {
      detailVideo.load();
    } catch (error) {
      console.warn("Detail video reset error:", error);
    }

  }

  if (detailModal) {
    detailModal.classList.add("hidden");
  }
}


/* =========================
   CREATE CARD
   ========================= */

function createCard(movie) {

  const card = document.createElement("article");

  card.className = "movie-card";

  card.innerHTML = `
    <div class="movie-card-content">

      <div class="movie-card-info">

        <h3>${escapeHTML(movie.title || "Tanpa Judul")}</h3>

        <div class="movie-card-meta">
          <span>${escapeHTML(String(movie.year || ""))}</span>
          <span>•</span>
          <span>${escapeHTML(movie.genre || "")}</span>
          <span>•</span>
          <span>★ ${escapeHTML(movie.rating || "")}</span>
        </div>

      </div>

      <button
        class="btn btn-red card-play-btn"
        type="button"
      >
        ▶ Putar
      </button>

    </div>
  `;


  /* Klik kartu */
  card.addEventListener("click", function (event) {

    if (
      event.target.closest(".card-play-btn")
    ) {
      return;
    }

    openDetail(movie);

  });


  /* Tombol play */
  const playButton =
    card.querySelector(".card-play-btn");

  if (playButton) {

    playButton.addEventListener(
      "click",
      function (event) {

        event.stopPropagation();

        openPlayer(movie);

      }
    );

  }


  return card;
}


/* =========================
   RENDER CATALOG
   ========================= */

function renderMovies(list) {

  if (!movieGrid || !seriesGrid) return;

  movieGrid.innerHTML = "";
  seriesGrid.innerHTML = "";

  let movieCount = 0;
  let seriesCount = 0;


  list.forEach(function (movie) {

    const card = createCard(movie);

    if (movie.type === "series") {

      seriesGrid.appendChild(card);
      seriesCount++;

    } else {

      movieGrid.appendChild(card);
      movieCount++;

    }

  });


  if (movieSection) {
    movieSection.style.display =
      movieCount > 0 ? "" : "none";
  }

  if (seriesSection) {
    seriesSection.style.display =
      seriesCount > 0 ? "" : "none";
  }


  if (emptyState) {

    emptyState.classList.toggle(
      "hidden",
      list.length > 0
    );

  }
}


/* =========================
   FILTER
   ========================= */

function applyFilter() {

  const keyword =
    searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";


  let filtered = movies.filter(function (movie) {

    const matchSearch =
      !keyword ||
      movie.title.toLowerCase().includes(keyword) ||
      movie.genre.toLowerCase().includes(keyword);


    const matchFilter =
      currentFilter === "all" ||
      movie.type === currentFilter;


    return matchSearch && matchFilter;

  });


  renderMovies(filtered);
}


/* =========================
   HERO
   ========================= */

function setupHero() {

  if (!movies || movies.length === 0) {
    return;
  }

  const featured =
    movies.find(function (movie) {
      return movie.featured;
    }) || movies[0];


  if (heroTitle) {
    heroTitle.textContent =
      featured.title || "RedFlix";
  }

  if (heroDescription) {
    heroDescription.textContent =
      featured.description || "";
  }


  /*
   * Hero preview hanya untuk
   * video direct. iframe tidak
   * dimasukkan ke hero.
   */
  if (
    heroVideo &&
    featured.video &&
    !isIframeUrl(featured.video)
  ) {

    heroVideo.src = featured.video;

    heroVideo.play().catch(function () {});

  }


  if (heroPlayBtn) {

    heroPlayBtn.onclick = function () {
      openPlayer(featured);
    };

  }


  if (heroInfoBtn) {

    heroInfoBtn.onclick = function () {
      openDetail(featured);
    };

  }

}


/* =========================
   SEARCH
   ========================= */

if (searchInput) {

  searchInput.addEventListener(
    "input",
    applyFilter
  );

}


/* =========================
   FILTER BUTTON
   ========================= */

document.querySelectorAll(
  ".filter-btn"
).forEach(function (button) {

  button.addEventListener(
    "click",
    function () {

      document.querySelectorAll(
        ".filter-btn"
      ).forEach(function (btn) {

        btn.classList.remove("active");

      });


      button.classList.add("active");

      currentFilter =
        button.dataset.filter || "all";

      applyFilter();

    }
  );

});


/* =========================
   CLOSE DETAIL
   ========================= */

document.querySelectorAll(
  "[data-close-detail]"
).forEach(function (element) {

  element.addEventListener(
    "click",
    closeDetail
  );

});


/* =========================
   DETAIL PLAY
   ========================= */

if (detailPlayBtn) {

  detailPlayBtn.addEventListener(
    "click",
    function () {

      if (!currentMovie) return;

      closeDetail();

      setTimeout(function () {
        openPlayer(currentMovie);
      }, 100);

    }
  );

}


/* =========================
   CLOSE PLAYER
   ========================= */

if (playerClose) {

  playerClose.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();

      closePlayer();

    }
  );

}


/* =========================
   ESCAPE
   ========================= */

document.addEventListener(
  "keydown",
  function (event) {

    if (event.key !== "Escape") {
      return;
    }

    closeDetail();
    closePlayer();

  }
);


/* =========================
   SHARE / URL VIDEO
   ========================= */

/*
   Contoh:

   https://domainkamu.com/?video=1

   https://domainkamu.com/?video=2
*/

function openVideoFromURL() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const videoId =
    params.get("video");

  if (!videoId) {
    return;
  }


  const movie =
    movies.find(function (item) {

      return String(item.id) ===
        String(videoId);

    });


  if (!movie) {
    console.warn(
      "Video dengan ID tersebut tidak ditemukan."
    );
    return;
  }


  /*
   * Tunggu DOM selesai,
   * lalu buka player.
   */
  setTimeout(function () {

    openPlayer(movie);

  }, 300);

}


/* =========================
   ESCAPE HTML
   ========================= */

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================
   POPUP IKLAN
   ========================= */

/*
   Iklan hanya aktif pada
   klik area player.

   Bukan seluruh halaman.
*/

const SHOPEE_AD_URL =
  "https://s.shopee.co.id/4qFQYYdc3C";


function setupPlayerAd() {

  if (!playerModal) return;

  const playerBox =
    playerModal.querySelector(".player-box");

  if (!playerBox) return;


  /*
   * Jangan membuat overlay dua kali.
   */
  if (
    document.getElementById(
      "player-ad-overlay"
    )
  ) {
    return;
  }


  const overlay =
    document.createElement("div");

  overlay.id =
    "player-ad-overlay";


  /*
   * CSS langsung supaya tidak
   * bergantung style.css.
   */
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.right = "0";
  overlay.style.bottom = "50px";
  overlay.style.zIndex = "20";
  overlay.style.background = "transparent";
  overlay.style.cursor = "pointer";


  /*
   * Pastikan parent bisa
   * menjadi referensi absolute.
   */
  const currentPosition =
    window.getComputedStyle(
      playerBox
    ).position;

  if (currentPosition === "static") {
    playerBox.style.position =
      "relative";
  }


  playerBox.appendChild(overlay);


  overlay.addEventListener(
    "click",
    function (event) {

      event.preventDefault();
      event.stopPropagation();


      if (adOpened) {
        return;
      }

      adOpened = true;


      /*
       * window.open dilakukan
       * langsung dari user click.
       */
      window.open(
        SHOPEE_AD_URL,
        "_blank",
        "noopener,noreferrer"
      );


      overlay.remove();

    },
    true
  );

}


/* =========================
   RESET IKLAN
   ========================= */

function resetPlayerAd() {

  adOpened = false;

  const oldOverlay =
    document.getElementById(
      "player-ad-overlay"
    );

  if (oldOverlay) {
    oldOverlay.remove();
  }

}


/* =========================
   PLAYER OPEN OVERRIDE
   ========================= */

const originalOpenPlayer =
  openPlayer;


/*
 * Saat player dibuka,
 * siapkan overlay iklan.
 */
function openPlayerWithAd(movie) {

  resetPlayerAd();

  originalOpenPlayer(movie);

  setTimeout(function () {
    setupPlayerAd();
  }, 100);

}


/*
 * Gunakan versi ini
 * untuk tombol player.
 */
document.addEventListener(
  "click",
  function (event) {

    const playButton =
      event.target.closest(
        ".card-play-btn"
      );

    if (!playButton) {
      return;
    }

  }
);


/* =========================
   INIT
   ========================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    renderMovies(movies);

    setupHero();

    openVideoFromURL();

  }
);
