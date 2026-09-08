"use strict";

/*
========================================
  DATA
========================================
*/

const movies = Array.isArray(window.movies)
  ? window.movies
  : [];


/*
========================================
  IKLAN
========================================
*/

const SHOPEE_AD_URL =
  "https://s.shopee.co.id/4qFQYYdc3C";


/*
========================================
  ELEMENT
========================================
*/

const movieGrid =
  document.getElementById("movieGrid");

const emptyState =
  document.getElementById("emptyState");

const resultCount =
  document.getElementById("resultCount");

const searchInput =
  document.getElementById("searchInput");

const filterButtons =
  document.querySelectorAll(".filter-btn");


/* HERO */

const heroVideo =
  document.getElementById("heroVideo");

const heroTitle =
  document.getElementById("heroTitle");

const heroDescription =
  document.getElementById("heroDescription");

const heroYear =
  document.getElementById("heroYear");

const heroGenre =
  document.getElementById("heroGenre");

const heroRating =
  document.getElementById("heroRating");

const heroPlayBtn =
  document.getElementById("heroPlayBtn");


/* DETAIL */

const detailModal =
  document.getElementById("detailModal");

const closeDetailBtn =
  document.getElementById("closeDetailBtn");

const detailType =
  document.getElementById("detailType");

const detailTitle =
  document.getElementById("detailTitle");

const detailYear =
  document.getElementById("detailYear");

const detailGenre =
  document.getElementById("detailGenre");

const detailRating =
  document.getElementById("detailRating");

const detailDescription =
  document.getElementById("detailDescription");

const detailCast =
  document.getElementById("detailCast");

const detailPlayBtn =
  document.getElementById("detailPlayBtn");


/* PLAYER */

const playerModal =
  document.getElementById("playerModal");

const closePlayerBtn =
  document.getElementById("closePlayerBtn");

const mainPlayer =
  document.getElementById("mainPlayer");

const playerTitle =
  document.getElementById("playerTitle");

const videoLoading =
  document.getElementById("videoLoading");

const videoError =
  document.getElementById("videoError");


/*
========================================
  STATE
========================================
*/

let currentMovie = null;
let currentFilter = "all";

let heroHls = null;
let mainHls = null;

let adOpened = false;


/*
========================================
  UTILITY
========================================
*/

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function isHLS(url) {
  return /\.m3u8(\?.*)?$/i.test(url);
}


/*
========================================
  IKLAN
========================================
*/

function openShopeeAd() {
  if (adOpened) {
    return;
  }

  adOpened = true;

  const popup = window.open(
    SHOPEE_AD_URL,
    "_blank",
    "noopener,noreferrer"
  );

  /*
    Kalau browser memblokir popup,
    video tetap akan dilanjutkan.
  */

  if (!popup) {
    console.log(
      "Popup iklan diblokir oleh browser."
    );
  }
}


/*
========================================
  VIDEO LOADER
========================================
*/

function destroyHeroVideo() {

  if (heroHls) {
    heroHls.destroy();
    heroHls = null;
  }

  heroVideo.pause();

  heroVideo.removeAttribute("src");

  heroVideo.load();
}


function destroyMainVideo() {

  if (mainHls) {
    mainHls.destroy();
    mainHls = null;
  }

  mainPlayer.pause();

  mainPlayer.removeAttribute("src");

  mainPlayer.load();
}


function loadVideo(videoElement, url, type) {

  if (!videoElement || !url) {
    return null;
  }

  if (isHLS(url)) {

    if (
      window.Hls &&
      Hls.isSupported()
    ) {

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(url);

      hls.attachMedia(videoElement);

      hls.on(
        Hls.Events.MANIFEST_PARSED,
        function () {

          if (type === "hero") {
            videoElement
              .play()
              .catch(() => {});
          }

          if (type === "main") {
            videoElement
              .play()
              .catch(() => {});
          }

        }
      );

      hls.on(
        Hls.Events.ERROR,
        function (_event, data) {

          console.error(
            "HLS Error:",
            data
          );

          if (
            data &&
            data.fatal
          ) {

            if (type === "main") {

              videoLoading.classList.add(
                "hidden"
              );

              videoError.classList.remove(
                "hidden"
              );
            }
          }
        }
      );

      return hls;
    }

    /*
      Safari / browser yang punya
      native HLS
    */

    if (
      videoElement.canPlayType(
        "application/vnd.apple.mpegurl"
      )
    ) {

      videoElement.src = url;

      videoElement.addEventListener(
        "loadedmetadata",
        function () {

          videoElement
            .play()
            .catch(() => {});

        },
        {
          once: true
        }
      );

      return null;
    }

    console.error(
      "Browser tidak mendukung HLS."
    );

    return null;
  }


  /*
    MP4 / video biasa
  */

  videoElement.src = url;

  videoElement.addEventListener(
    "loadedmetadata",
    function () {

      videoElement
        .play()
        .catch(() => {});

    },
    {
      once: true
    }
  );

  return null;
}


/*
========================================
  CARD
========================================
*/

function createCard(movie) {

  const card =
    document.createElement("article");

  card.className = "movie-card";

  card.dataset.id = movie.id;

  card.innerHTML = `
    <video
      class="card-video"
      muted
      playsinline
      preload="metadata"
    ></video>

    <div class="card-info">

      <div class="card-title">
        ${escapeHTML(movie.title)}
      </div>

      <div class="card-meta">

        <span>
          ${escapeHTML(movie.year)}
        </span>

        <span>•</span>

        <span>
          ${escapeHTML(movie.genre)}
        </span>

        <span>•</span>

        <span class="card-rating">
          ⭐ ${escapeHTML(movie.rating)}
        </span>

      </div>

    </div>
  `;


  const video =
    card.querySelector(".card-video");


  /*
    Jangan langsung autoplay semua
    video katalog agar tidak berat.
  */

  card.addEventListener(
    "mouseenter",
    function () {

      if (!video.src) {

        const hls =
          loadVideo(
            video,
            movie.video,
            "card"
          );

        video.dataset.loaded = "true";

        /*
          Simpan HLS instance di element
        */

        if (hls) {
          video._hls = hls;
        }
      }

      video
        .play()
        .catch(() => {});
    }
  );


  card.addEventListener(
    "mouseleave",
    function () {

      video.pause();

      video.currentTime = 0;

      if (video._hls) {

        video._hls.destroy();

        video._hls = null;
      }

      video.removeAttribute("src");

      video.load();
    }
  );


  card.addEventListener(
    "click",
    function () {

      openDetail(movie);
    }
  );


  return card;
}


/*
========================================
  RENDER
========================================
*/

function getFilteredMovies() {

  const search =
    searchInput.value
      .trim()
      .toLowerCase();


  return movies.filter(
    function (movie) {

      const matchesFilter =
        currentFilter === "all" ||
        movie.type === currentFilter;


      const text =
        [
          movie.title,
          movie.genre,
          movie.year,
          movie.description
        ]
          .join(" ")
          .toLowerCase();


      const matchesSearch =
        !search ||
        text.includes(search);


      return (
        matchesFilter &&
        matchesSearch
      );
    }
  );
}


function renderMovies() {

  const filtered =
    getFilteredMovies();


  movieGrid.innerHTML = "";


  if (!filtered.length) {

    emptyState.classList.remove(
      "hidden"
    );

    resultCount.textContent =
      "0 video";

    return;
  }


  emptyState.classList.add(
    "hidden"
  );


  resultCount.textContent =
    `${filtered.length} video`;


  const fragment =
    document.createDocumentFragment();


  filtered.forEach(
    function (movie) {

      fragment.appendChild(
        createCard(movie)
      );
    }
  );


  movieGrid.appendChild(
    fragment
  );
}


/*
========================================
  HERO
========================================
*/

function setupHero() {

  if (!movies.length) {
    return;
  }


  const featured =
    movies.find(
      movie => movie.featured
    ) || movies[0];


  heroTitle.textContent =
    featured.title;

  heroDescription.textContent =
    featured.description || "";

  heroYear.textContent =
    featured.year;

  heroGenre.textContent =
    featured.genre;

  heroRating.textContent =
    `⭐ ${featured.rating}`;


  destroyHeroVideo();


  heroHls =
    loadVideo(
      heroVideo,
      featured.video,
      "hero"
    );


  heroPlayBtn.onclick =
    function () {

      openPlayer(featured);
    };
}


/*
========================================
  DETAIL
========================================
*/

function openDetail(movie) {

  currentMovie = movie;


  detailType.textContent =
    movie.type === "series"
      ? "SERIES"
      : "FILM";


  detailTitle.textContent =
    movie.title;

  detailYear.textContent =
    movie.year;

  detailGenre.textContent =
    movie.genre;

  detailRating.textContent =
    `⭐ ${movie.rating}`;

  detailDescription.textContent =
    movie.description || "";

  detailCast.textContent =
    movie.cast || "-";


  detailModal.classList.add(
    "show"
  );

  detailModal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";
}


function closeDetail() {

  detailModal.classList.remove(
    "show"
  );

  detailModal.setAttribute(
    "aria-hidden",
    "true"
  );

  if (!playerModal.classList.contains("show")) {
    document.body.style.overflow = "";
  }
}


/*
========================================
  PLAYER
========================================
*/

function openPlayer(movie) {

  if (!movie || !movie.video) {
    return;
  }


  /*
    PENTING:
    window.open dijalankan langsung
    dari aksi user sebelum proses video.
  */

  openShopeeAd();


  currentMovie = movie;


  closeDetail();


  destroyMainVideo();


  videoLoading.classList.remove(
    "hidden"
  );

  videoError.classList.add(
    "hidden"
  );


  playerTitle.textContent =
    movie.title;


  playerModal.classList.add(
    "show"
  );

  playerModal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";


  mainHls =
    loadVideo(
      mainPlayer,
      movie.video,
      "main"
    );


  mainPlayer.onloadedmetadata =
    function () {

      videoLoading.classList.add(
        "hidden"
      );
    };


  mainPlayer.oncanplay =
    function () {

      videoLoading.classList.add(
        "hidden"
      );
    };


  mainPlayer.onerror =
    function () {

      videoLoading.classList.add(
        "hidden"
      );

      videoError.classList.remove(
        "hidden"
      );
    };
}


function closePlayer() {

  playerModal.classList.remove(
    "show"
  );

  playerModal.setAttribute(
    "aria-hidden",
    "true"
  );


  destroyMainVideo();


  videoLoading.classList.remove(
    "hidden"
  );

  videoError.classList.add(
    "hidden"
  );


  document.body.style.overflow =
    "";


  currentMovie = null;
}


/*
========================================
  DETAIL PLAY
========================================
*/

detailPlayBtn.addEventListener(
  "click",
  function () {

    if (!currentMovie) {
      return;
    }

    /*
      JANGAN pakai setTimeout di sini.
      Supaya window.open tetap dianggap
      sebagai aksi langsung user.
    */

    openPlayer(currentMovie);
  }
);


/*
========================================
  CLOSE BUTTON
========================================
*/

closeDetailBtn.addEventListener(
  "click",
  closeDetail
);


closePlayerBtn.addEventListener(
  "click",
  closePlayer
);


/*
========================================
  BACKDROP
========================================
*/

detailModal
  .querySelector(".modal-backdrop")
  .addEventListener(
    "click",
    closeDetail
  );


playerModal
  .querySelector(".player-backdrop")
  .addEventListener(
    "click",
    closePlayer
  );


/*
========================================
  SEARCH
========================================
*/

searchInput.addEventListener(
  "input",
  function () {

    renderMovies();
  }
);


/*
========================================
  FILTER
========================================
*/

filterButtons.forEach(
  function (button) {

    button.addEventListener(
      "click",
      function () {

        filterButtons.forEach(
          function (btn) {

            btn.classList.remove(
              "active"
            );
          }
        );


        button.classList.add(
          "active"
        );


        currentFilter =
          button.dataset.filter;


        renderMovies();
      }
    );
  }
);


/*
========================================
  ESCAPE
========================================
*/

document.addEventListener(
  "keydown",
  function (event) {

    if (event.key !== "Escape") {
      return;
    }


    if (
      playerModal.classList.contains(
        "show"
      )
    ) {

      closePlayer();

      return;
    }


    if (
      detailModal.classList.contains(
        "show"
      )
    ) {

      closeDetail();
    }
  }
);


/*
========================================
  INIT
========================================
*/

function init() {

  console.log(
    "Jumlah video:",
    movies.length
  );


  if (!movies.length) {

    console.error(
      "Data movie tidak ditemukan. Pastikan movie.js dimuat sebelum script.js."
    );

    emptyState.classList.remove(
      "hidden"
    );

    return;
  }


  renderMovies();

  setupHero();
}


init();
