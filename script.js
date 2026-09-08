/* =========================================================
   REDFLIX SCRIPT
   ========================================================= */

"use strict";


/* ================= CONFIG ================= */

const SHOPEE_AD_URL = "https://s.shopee.co.id/4qFQYYdc3C";


/* ================= ELEMENTS ================= */

const heroVideo =
  document.getElementById("heroVideo");

const heroTitle =
  document.getElementById("heroTitle");

const heroDescription =
  document.getElementById("heroDescription");

const heroPlayBtn =
  document.getElementById("heroPlayBtn");

const heroInfoBtn =
  document.getElementById("heroInfoBtn");

const movieGrid =
  document.getElementById("movieGrid");

const seriesGrid =
  document.getElementById("seriesGrid");

const searchInput =
  document.getElementById("searchInput");

const emptyState =
  document.getElementById("emptyState");

const detailModal =
  document.getElementById("detailModal");

const detailVideo =
  document.getElementById("detailVideo");

const detailTitle =
  document.getElementById("detailTitle");

const detailYear =
  document.getElementById("detailYear");

const detailRating =
  document.getElementById("detailRating");

const detailGenre =
  document.getElementById("detailGenre");

const detailType =
  document.getElementById("detailType");

const detailDescription =
  document.getElementById("detailDescription");

const detailCast =
  document.getElementById("detailCast");

const detailPlayBtn =
  document.getElementById("detailPlayBtn");

const playerModal =
  document.getElementById("playerModal");

const mainPlayer =
  document.getElementById("mainPlayer");

const playerClose =
  document.getElementById("playerClose");

const playerError =
  document.getElementById("playerError");


/* ================= STATE ================= */

let currentMovie = null;
let currentFilter = "all";

let heroHls = null;
let detailHls = null;
let mainHls = null;


/* =========================================================
   VIDEO LOADER
   ========================================================= */

function destroyHls(instance) {
  if (instance) {
    try {
      instance.destroy();
    } catch (error) {
      console.warn("HLS destroy error:", error);
    }
  }

  return null;
}


function loadVideo(videoElement, url, autoplay = false) {

  if (!videoElement || !url) {
    return null;
  }

  const oldHls =
    videoElement._redflixHls || null;

  if (oldHls) {
    try {
      oldHls.destroy();
    } catch (error) {
      console.warn(error);
    }

    videoElement._redflixHls = null;
  }

  videoElement.pause();

  videoElement.removeAttribute("src");
  videoElement.load();

  const isHls =
    /\.m3u8($|\?)/i.test(url);

  const isMp4 =
    /\.mp4($|\?)/i.test(url);

  const isWebm =
    /\.webm($|\?)/i.test(url);


  /* ================= HLS.JS ================= */

  if (
    isHls &&
    window.Hls &&
    Hls.isSupported()
  ) {

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false
    });

    videoElement._redflixHls = hls;

    hls.loadSource(url);
    hls.attachMedia(videoElement);

    hls.on(
      Hls.Events.MANIFEST_PARSED,
      function () {

        if (autoplay) {

          videoElement
            .play()
            .catch(() => {});

        }
      }
    );

    hls.on(
      Hls.Events.ERROR,
      function (_event, data) {

        if (
          data &&
          data.fatal
        ) {

          console.warn(
            "HLS fatal error:",
            data
          );
        }
      }
    );

    return hls;
  }


  /* ================= NATIVE HLS ================= */

  if (
    isHls &&
    videoElement.canPlayType(
      "application/vnd.apple.mpegurl"
    )
  ) {

    videoElement.src = url;

    if (autoplay) {

      videoElement
        .play()
        .catch(() => {});

    }

    return null;
  }


  /* ================= MP4 / WEBM ================= */

  if (
    isMp4 ||
    isWebm ||
    !isHls
  ) {

    videoElement.src = url;

    if (autoplay) {

      videoElement
        .play()
        .catch(() => {});

    }

    return null;
  }


  return null;
}


/* =========================================================
   CARD
   ========================================================= */

function createCard(movie) {

  const card =
    document.createElement("article");

  card.className = "video-card";

  card.dataset.id = movie.id;


  const safeTitle =
    escapeHTML(movie.title);

  const safeGenre =
    escapeHTML(movie.genre);

  const safeType =
    movie.type === "series"
      ? "Series"
      : "Film";


  card.innerHTML = `
    <div class="card-video">

      <video
        muted
        playsinline
        preload="metadata"
      ></video>

      <div class="card-play">
        ▶
      </div>

    </div>

    <div class="card-info">

      <div class="card-title">
        ${safeTitle}
      </div>

      <div class="card-meta">

        <span>
          ${movie.year}
        </span>

        <span>•</span>

        <span>
          ${safeGenre}
        </span>

        <span>•</span>

        <span class="card-rating">
          ★ ${escapeHTML(movie.rating)}
        </span>

      </div>

    </div>
  `;


  const video =
    card.querySelector("video");


  card.addEventListener(
    "click",
    function () {

      openDetail(movie);

    }
  );


  card.addEventListener(
    "mouseenter",
    function () {

      if (!video.src) {
        loadVideo(
          video,
          movie.video,
          false
        );
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

      try {
        video.currentTime = 0;
      } catch (error) {}

    }
  );


  return card;
}


/* =========================================================
   RENDER
   ========================================================= */

function renderMovies(list) {

  movieGrid.innerHTML = "";
  seriesGrid.innerHTML = "";


  let movieCount = 0;
  let seriesCount = 0;


  list.forEach(function (movie) {

    const card =
      createCard(movie);


    if (movie.type === "series") {

      seriesGrid.appendChild(card);

      seriesCount++;

    } else {

      movieGrid.appendChild(card);

      movieCount++;

    }

  });


  const movieSection =
    movieGrid.closest(
      ".catalog-section"
    );

  const seriesSection =
    seriesGrid.closest(
      ".catalog-section"
    );


  if (movieSection) {

    movieSection.style.display =
      movieCount > 0
        ? ""
        : "none";

  }


  if (seriesSection) {

    seriesSection.style.display =
      seriesCount > 0
        ? ""
        : "none";

  }


  emptyState.classList.toggle(
    "hidden",
    list.length !== 0
  );
}


/* =========================================================
   HERO
   ========================================================= */

function setupHero() {

  const featured =
    movies.find(
      movie => movie.featured
    ) || movies[0];


  if (!featured) {
    return;
  }


  heroTitle.textContent =
    featured.title;

  heroDescription.textContent =
    featured.description;


  heroHls =
    loadVideo(
      heroVideo,
      featured.video,
      false
    );


  heroPlayBtn.onclick =
    function () {

      openPlayer(featured);

    };


  heroInfoBtn.onclick =
    function () {

      openDetail(featured);

    };

}


/* =========================================================
   DETAIL
   ========================================================= */

function openDetail(movie) {

  if (!movie) {
    return;
  }


  currentMovie = movie;


  detailTitle.textContent =
    movie.title;

  detailYear.textContent =
    movie.year;

  detailRating.textContent =
    `★ ${movie.rating}`;

  detailGenre.textContent =
    movie.genre;

  detailType.textContent =
    movie.type === "series"
      ? "SERIES"
      : "MOVIE";

  detailDescription.textContent =
    movie.description;

  detailCast.textContent =
    movie.cast;


  detailHls =
    loadVideo(
      detailVideo,
      movie.video,
      false
    );


  detailModal.classList.remove(
    "hidden"
  );

  detailModal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";
}


/* =========================================================
   PLAYER
   ========================================================= */

function openPlayer(movie) {

  if (!movie) {
    return;
  }


  currentMovie = movie;


  /*
   * Popup dibuka langsung dari event klik.
   * Jangan dibungkus setTimeout agar browser
   * tidak menganggapnya sebagai popup otomatis.
   */

  try {

    window.open(
      SHOPEE_AD_URL,
      "_blank",
      "noopener,noreferrer"
    );

  } catch (error) {

    console.warn(
      "Popup error:",
      error
    );

  }


  playerError.classList.add(
    "hidden"
  );


  playerModal.classList.remove(
    "hidden"
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
      true
    );
}


/* =========================================================
   CLOSE DETAIL
   ========================================================= */

function closeDetail() {

  if (!detailModal) {
    return;
  }


  detailModal.classList.add(
    "hidden"
  );

  detailModal.setAttribute(
    "aria-hidden",
    "true"
  );


  if (detailVideo) {

    detailVideo.pause();

    detailVideo.removeAttribute(
      "src"
    );

    detailVideo.load();

  }


  detailHls =
    destroyHls(detailHls);


  currentMovie = null;


  if (
    playerModal.classList.contains(
      "hidden"
    )
  ) {

    document.body.style.overflow =
      "";

  }
}


/* =========================================================
   CLOSE PLAYER
   ========================================================= */

function closePlayer() {

  if (!playerModal) {
    return;
  }


  playerModal.classList.add(
    "hidden"
  );

  playerModal.setAttribute(
    "aria-hidden",
    "true"
  );


  if (mainPlayer) {

    mainPlayer.pause();

    mainPlayer.removeAttribute(
      "src"
    );

    mainPlayer.load();

  }


  mainHls =
    destroyHls(mainHls);


  document.body.style.overflow =
    "";


  currentMovie = null;
}


/* =========================================================
   DETAIL PLAY
   ========================================================= */

detailPlayBtn.addEventListener(
  "click",
  function () {

    if (!currentMovie) {
      return;
    }


    /*
     * Penting:
     * openPlayer dipanggil langsung dari click
     * supaya window.open tidak mudah diblokir.
     */

    const movie =
      currentMovie;


    closeDetail();

    openPlayer(movie);

  }
);


/* =========================================================
   DETAIL CLOSE BUTTON
   ========================================================= */

document
  .querySelectorAll(
    "[data-close-detail]"
  )
  .forEach(
    function (element) {

      element.addEventListener(
        "click",
        function () {

          closeDetail();

        }
      );

    }
  );


/* =========================================================
   PLAYER CLOSE
   ========================================================= */

playerClose.addEventListener(
  "click",
  function () {

    closePlayer();

  }
);


/* =========================================================
   PLAYER ERROR
   ========================================================= */

mainPlayer.addEventListener(
  "error",
  function () {

    playerError.classList.remove(
      "hidden"
    );

  }
);


/* =========================================================
   BACKDROP
   ========================================================= */

detailModal.addEventListener(
  "click",
  function (event) {

    if (
      event.target.classList.contains(
        "modal-backdrop"
      )
    ) {

      closeDetail();

    }

  }
);


/* =========================================================
   ESCAPE
   ========================================================= */

document.addEventListener(
  "keydown",
  function (event) {

    if (event.key !== "Escape") {
      return;
    }


    if (
      !playerModal.classList.contains(
        "hidden"
      )
    ) {

      closePlayer();

      return;

    }


    if (
      !detailModal.classList.contains(
        "hidden"
      )
    ) {

      closeDetail();

    }

  }
);


/* =========================================================
   SEARCH
   ========================================================= */

searchInput.addEventListener(
  "input",
  function () {

    const keyword =
      searchInput.value
        .trim()
        .toLowerCase();


    const filtered =
      movies.filter(
        function (movie) {

          const searchable =
            [
              movie.title,
              movie.genre,
              movie.description,
              movie.cast,
              movie.year
            ]
              .join(" ")
              .toLowerCase();


          const matchesSearch =
            searchable.includes(
              keyword
            );


          const matchesFilter =
            currentFilter === "all" ||
            movie.type === currentFilter;


          return (
            matchesSearch &&
            matchesFilter
          );

        }
      );


    renderMovies(filtered);

  }
);


/* =========================================================
   FILTER
   ========================================================= */

document
  .querySelectorAll(
    ".filter-btn"
  )
  .forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          document
            .querySelectorAll(
              ".filter-btn"
            )
            .forEach(
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


          const keyword =
            searchInput.value
              .trim()
              .toLowerCase();


          const filtered =
            movies.filter(
              function (movie) {

                const searchable =
                  [
                    movie.title,
                    movie.genre,
                    movie.description,
                    movie.cast,
                    movie.year
                  ]
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                  searchable.includes(
                    keyword
                  );


                const matchesFilter =
                  currentFilter === "all" ||
                  movie.type === currentFilter;


                return (
                  matchesSearch &&
                  matchesFilter
                );

              }
            );


          renderMovies(filtered);

        }
      );

    }
  );


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   CLEANUP VIDEO WHEN PAGE HIDDEN
   ========================================================= */

document.addEventListener(
  "visibilitychange",
  function () {

    if (
      document.hidden &&
      heroVideo
    ) {

      heroVideo.pause();

    }

  }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

renderMovies(movies);

setupHero();
