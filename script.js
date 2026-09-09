/* =========================================================
   REDFLIX
========================================================= */


/* =========================================================
   IKLAN
========================================================= */

const SHOPEE_AD_URL =
  "https://s.shopee.co.id/4qFQYYdc3C";


/* =========================================================
   ELEMENT
========================================================= */

const movieGrid =
  document.getElementById("movieGrid");

const seriesGrid =
  document.getElementById("seriesGrid");

const movieSection =
  document.getElementById("movieSection");

const seriesSection =
  document.getElementById("seriesSection");

const searchInput =
  document.getElementById("searchInput");

const emptyState =
  document.getElementById("emptyState");

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

const detailModal =
  document.getElementById("detailModal");

const detailVideo =
  document.getElementById("detailVideo");

const playerModal =
  document.getElementById("playerModal");

const mainPlayer =
  document.getElementById("mainPlayer");

const playerError =
  document.getElementById("playerError");

const playerClose =
  document.getElementById("playerClose");

const detailPlayBtn =
  document.getElementById("detailPlayBtn");

const adOverlay =
  document.getElementById("ad-overlay");


/* =========================================================
   STATE
========================================================= */

let currentMovie = null;
let currentHls = null;
let adOpened = false;


/* =========================================================
   LOAD VIDEO
========================================================= */

function loadVideo(
  videoElement,
  url,
  autoplay = false
) {

  if (!videoElement || !url) {
    return;
  }


  videoElement.pause();

  videoElement.removeAttribute("src");

  videoElement.load();


  /* =======================================================
     MP4 / WEBM
  ======================================================== */

  if (!url.includes(".m3u8")) {

    videoElement.src = url;

    if (autoplay) {

      videoElement
        .play()
        .catch(() => {});

    }

    return;
  }


  /* =======================================================
     NATIVE HLS
  ======================================================== */

  if (
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

    return;
  }


  /* =======================================================
     HLS.JS
  ======================================================== */

  if (
    typeof Hls !== "undefined" &&
    Hls.isSupported()
  ) {

    if (currentHls) {

      currentHls.destroy();

      currentHls = null;
    }


    currentHls = new Hls();


    currentHls.loadSource(url);


    currentHls.attachMedia(
      videoElement
    );


    currentHls.on(
      Hls.Events.MANIFEST_PARSED,
      () => {

        if (autoplay) {

          videoElement
            .play()
            .catch(() => {});

        }

      }
    );


    currentHls.on(
      Hls.Events.ERROR,
      (event, data) => {

        console.error(
          "HLS error:",
          data
        );

      }
    );

  }

}


/* =========================================================
   CREATE CARD
========================================================= */

function createCard(movie) {

  const card =
    document.createElement("article");


  card.className =
    "video-card";


  card.innerHTML = `

    <div class="card-video">

      <video
        muted
        loop
        playsinline
        preload="metadata"
      ></video>

      <div class="card-play">
        ▶
      </div>

    </div>


    <div class="card-info">

      <h3 class="card-title">
        ${escapeHTML(movie.title)}
      </h3>


      <div class="card-meta">

        <span>
          ${movie.year}
        </span>

        <span>•</span>

        <span>
          ${escapeHTML(movie.genre)}
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


  loadVideo(
    video,
    movie.video
  );


  /* =======================================================
     DESKTOP HOVER
  ======================================================== */

  card.addEventListener(
    "mouseenter",
    () => {

      video.currentTime = 0;

      video
        .play()
        .catch(() => {});

    }
  );


  card.addEventListener(
    "mouseleave",
    () => {

      video.pause();

      try {

        video.currentTime = 0;

      } catch (error) {}

    }
  );


  /* =======================================================
     DETAIL
  ======================================================== */

  card.addEventListener(
    "click",
    () => {

      openDetail(movie);

    }
  );


  return card;
}


/* =========================================================
   RENDER MOVIES
========================================================= */

function renderMovies(list) {

  movieGrid.innerHTML = "";

  seriesGrid.innerHTML = "";


  const filmList =
    list.filter(
      movie =>
        movie.type === "movie"
    );


  const seriesList =
    list.filter(
      movie =>
        movie.type === "series"
    );


  filmList.forEach(
    movie => {

      movieGrid.appendChild(
        createCard(movie)
      );

    }
  );


  seriesList.forEach(
    movie => {

      seriesGrid.appendChild(
        createCard(movie)
      );

    }
  );


  movieSection.classList.toggle(
    "hidden",
    filmList.length === 0
  );


  seriesSection.classList.toggle(
    "hidden",
    seriesList.length === 0
  );


  emptyState.classList.toggle(
    "hidden",
    list.length > 0
  );

}


/* =========================================================
   HERO
========================================================= */

function setupHero() {

  const featured =
    movies.find(
      movie =>
        movie.featured === true
    ) || movies[0];


  if (!featured) {
    return;
  }


  currentMovie =
    featured;


  heroTitle.textContent =
    featured.title;


  heroDescription.textContent =
    featured.description;


  loadVideo(
    heroVideo,
    featured.video,
    true
  );


  heroPlayBtn.onclick =
    () => {

      openPlayer(
        featured
      );

    };


  heroInfoBtn.onclick =
    () => {

      openDetail(
        featured
      );

    };

}


/* =========================================================
   DETAIL
========================================================= */

function openDetail(movie) {

  currentMovie =
    movie;


  document.getElementById(
    "detailTitle"
  ).textContent =
    movie.title;


  document.getElementById(
    "detailYear"
  ).textContent =
    movie.year;


  document.getElementById(
    "detailGenre"
  ).textContent =
    movie.genre;


  document.getElementById(
    "detailRating"
  ).textContent =
    `★ ${movie.rating}`;


  document.getElementById(
    "detailType"
  ).textContent =
    movie.type === "series"
      ? "SERIES"
      : "FILM";


  document.getElementById(
    "detailDescription"
  ).textContent =
    movie.description;


  document.getElementById(
    "detailCast"
  ).textContent =
    movie.cast || "-";


  loadVideo(
    detailVideo,
    movie.video
  );


  detailModal.classList.remove(
    "hidden"
  );


  document.body.style.overflow =
    "hidden";

}


/* =========================================================
   OPEN PLAYER
========================================================= */

function openPlayer(movie) {

  currentMovie =
    movie;


  /* Reset error */
  playerError.classList.add(
    "hidden"
  );


  /* =======================================================
     RESET IKLAN
  ======================================================== */

  adOpened = false;


  if (adOverlay) {

    adOverlay.classList.remove(
      "hidden"
    );

  }


  /* =======================================================
     BUKA PLAYER
  ======================================================== */

  playerModal.classList.remove(
    "hidden"
  );


  document.body.style.overflow =
    "hidden";


  /* =======================================================
     LOAD VIDEO
  ======================================================== */

  loadVideo(
    mainPlayer,
    movie.video,
    true
  );

}


/* =========================================================
   IKLAN OVERLAY
========================================================= */

if (adOverlay) {

  adOverlay.addEventListener(
    "click",
    function () {

      if (adOpened) {
        return;
      }


      adOpened = true;


      /*
       * Buka iklan langsung dari
       * aksi klik user.
       */

      window.open(
        SHOPEE_AD_URL,
        "_blank",
        "noopener,noreferrer"
      );


      /*
       * Hilangkan overlay setelah
       * klik pertama.
       */

      adOverlay.classList.add(
        "hidden"
      );

    },
    {
      once: true
    }
  );

}


/* =========================================================
   CLOSE DETAIL
========================================================= */

function closeDetail() {

  if (detailVideo) {

    detailVideo.pause();

    detailVideo.removeAttribute(
      "src"
    );

    detailVideo.load();

  }


  detailModal.classList.add(
    "hidden"
  );


  document.body.style.overflow =
    "";

}


/* =========================================================
   CLOSE PLAYER
========================================================= */

function closePlayer() {

  if (mainPlayer) {

    mainPlayer.pause();

    mainPlayer.removeAttribute(
      "src"
    );

    mainPlayer.load();

  }


  if (currentHls) {

    currentHls.destroy();

    currentHls = null;

  }


  playerModal.classList.add(
    "hidden"
  );


  document.body.style.overflow =
    "";

}


/* =========================================================
   CLOSE DETAIL BUTTON
========================================================= */

document
  .querySelectorAll(
    "[data-close-detail]"
  )
  .forEach(
    element => {

      element.addEventListener(
        "click",
        closeDetail
      );

    }
  );


/* =========================================================
   DETAIL PLAY
========================================================= */

if (detailPlayBtn) {

  detailPlayBtn.addEventListener(
    "click",
    () => {

      if (!currentMovie) {
        return;
      }


      closeDetail();


      setTimeout(
        () => {

          openPlayer(
            currentMovie
          );

        },
        100
      );

    }
  );

}


/* =========================================================
   PLAYER CLOSE
========================================================= */

if (playerClose) {

  playerClose.addEventListener(
    "click",
    closePlayer
  );

}


/* =========================================================
   ESCAPE
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key !== "Escape"
    ) {
      return;
    }


    if (
      playerModal &&
      !playerModal.classList.contains(
        "hidden"
      )
    ) {

      closePlayer();

      return;
    }


    if (
      detailModal &&
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

if (searchInput) {

  searchInput.addEventListener(
    "input",
    event => {

      const keyword =
        event.target.value
          .trim()
          .toLowerCase();


      const result =
        movies.filter(
          movie => {

            return (

              movie.title
                .toLowerCase()
                .includes(
                  keyword
                )

              ||

              movie.genre
                .toLowerCase()
                .includes(
                  keyword
                )

              ||

              String(
                movie.year
              ).includes(
                keyword
              )

            );

          }
        );


      renderMovies(
        result
      );

    }
  );

}


/* =========================================================
   FILTER
========================================================= */

document
  .querySelectorAll(
    ".filter-btn"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".filter-btn"
            )
            .forEach(
              btn => {

                btn.classList.remove(
                  "active"
                );

              }
            );


          button.classList.add(
            "active"
          );


          const filter =
            button.dataset.filter;


          if (
            filter === "all"
          ) {

            renderMovies(
              movies
            );

            return;
          }


          renderMovies(
            movies.filter(
              movie =>
                movie.type ===
                filter
            )
          );

        }
      );

    }
  );


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

  return String(value)

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
   START
========================================================= */

renderMovies(
  movies
);

setupHero();
