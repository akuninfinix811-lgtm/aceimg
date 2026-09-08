/* =========================================================
   REDFLIX SCRIPT
   ========================================================= */

"use strict";

/* ================= CONFIG ================= */

const SHOPEE_AD_URL =
  "https://s.shopee.co.id/4qFQYYdc3C";


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
   HLS DESTROY
   ========================================================= */

function destroyHls(instance) {

  if (instance) {

    try {
      instance.destroy();
    } catch (error) {
      console.warn(
        "HLS destroy error:",
        error
      );
    }

  }

  return null;
}


/* =========================================================
   VIDEO LOADER
   ========================================================= */

function loadVideo(
  videoElement,
  url,
  autoplay = false
) {

  if (!videoElement || !url) {

    console.warn(
      "Video element atau URL kosong."
    );

    return null;
  }


  /* ================= DESTROY OLD HLS ================= */

  if (videoElement._redflixHls) {

    try {

      videoElement._redflixHls.destroy();

    } catch (error) {

      console.warn(
        "Gagal destroy HLS:",
        error
      );

    }

    videoElement._redflixHls = null;
  }


  /* ================= RESET VIDEO ================= */

  try {

    videoElement.pause();

    videoElement.removeAttribute(
      "src"
    );

    videoElement.load();

  } catch (error) {

    console.warn(
      "Reset video error:",
      error
    );

  }


  const cleanUrl =
    String(url).trim();


  /* ================= FORMAT DETECTION ================= */

  const isHls =
    /\.m3u8(?:$|[?#])/i.test(
      cleanUrl
    );

  const isMp4 =
    /\.mp4(?:$|[?#])/i.test(
      cleanUrl
    );

  const isWebm =
    /\.webm(?:$|[?#])/i.test(
      cleanUrl
    );


  console.log(
    "Loading video:",
    cleanUrl
  );

  console.log(
    "HLS:",
    isHls
  );


  /* =====================================================
     HLS.JS
     ===================================================== */

  if (
    isHls &&
    window.Hls &&
    Hls.isSupported()
  ) {

    console.log(
      "Menggunakan HLS.js"
    );


    const hls =
      new Hls({

        enableWorker: false,

        lowLatencyMode: false,

        backBufferLength: 30,

        maxBufferLength: 30

      });


    videoElement._redflixHls =
      hls;


    /* ================= MEDIA ATTACHED ================= */

    hls.on(
      Hls.Events.MEDIA_ATTACHED,
      function () {

        console.log(
          "Media berhasil di-attach."
        );

        hls.loadSource(
          cleanUrl
        );

      }
    );


    /* ================= MANIFEST LOADING ================= */

    hls.on(
      Hls.Events.MANIFEST_LOADING,
      function () {

        console.log(
          "Manifest HLS sedang dimuat..."
        );

      }
    );


    /* ================= MANIFEST PARSED ================= */

    hls.on(
      Hls.Events.MANIFEST_PARSED,
      function (_event, data) {

        console.log(
          "Manifest berhasil.",
          "Quality:",
          data.levels
            ? data.levels.length
            : 0
        );


        if (autoplay) {

          videoElement
            .play()
            .then(function () {

              console.log(
                "Video mulai diputar."
              );

            })
            .catch(function (error) {

              console.warn(
                "Autoplay diblokir:",
                error
              );

            });

        }

      }
    );


    /* ================= HLS ERROR ================= */

    hls.on(
      Hls.Events.ERROR,
      function (_event, data) {

        console.error(
          "HLS ERROR:",
          data
        );


        if (
          !data ||
          !data.fatal
        ) {

          return;

        }


        switch (data.type) {

          case Hls.ErrorTypes.NETWORK_ERROR:

            console.warn(
              "HLS network error. Mencoba recover..."
            );

            try {

              hls.startLoad();

            } catch (error) {

              console.error(
                "Network recovery gagal:",
                error
              );

            }

            break;


          case Hls.ErrorTypes.MEDIA_ERROR:

            console.warn(
              "HLS media error. Mencoba recover..."
            );

            try {

              hls.recoverMediaError();

            } catch (error) {

              console.error(
                "Media recovery gagal:",
                error
              );

            }

            break;


          default:

            console.error(
              "HLS fatal error:",
              data
            );


            try {

              hls.destroy();

            } catch (error) {}


            videoElement._redflixHls =
              null;


            if (playerError) {

              playerError.classList.remove(
                "hidden"
              );

            }

            break;

        }

      }
    );


    /* ================= LOAD HLS ================= */

    hls.attachMedia(
      videoElement
    );


    return hls;
  }


  /* =====================================================
     NATIVE HLS
     ===================================================== */

  if (
    isHls &&
    videoElement.canPlayType(
      "application/vnd.apple.mpegurl"
    )
  ) {

    console.log(
      "Menggunakan native HLS."
    );


    videoElement.src =
      cleanUrl;


    videoElement.addEventListener(
      "loadedmetadata",
      function handleMetadata() {

        videoElement.removeEventListener(
          "loadedmetadata",
          handleMetadata
        );


        if (autoplay) {

          videoElement
            .play()
            .catch(function (error) {

              console.warn(
                "Native autoplay diblokir:",
                error
              );

            });

        }

      }
    );


    return null;
  }


  /* =====================================================
     MP4 / WEBM
     ===================================================== */

  if (
    isMp4 ||
    isWebm ||
    !isHls
  ) {

    console.log(
      "Menggunakan video HTML5."
    );


    videoElement.src =
      cleanUrl;


    if (autoplay) {

      videoElement
        .play()
        .catch(function (error) {

          console.warn(
            "Autoplay MP4/WebM diblokir:",
            error
          );

        });

    }


    return null;
  }


  /* =====================================================
     FORMAT TIDAK DIDUKUNG
     ===================================================== */

  console.error(
    "Format video tidak didukung:",
    cleanUrl
  );


  if (playerError) {

    playerError.classList.remove(
      "hidden"
    );

  }


  return null;
}


/* =========================================================
   CREATE CARD
   ========================================================= */

function createCard(movie) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "video-card";


  card.dataset.id =
    movie.id;


  const safeTitle =
    escapeHTML(
      movie.title
    );


  const safeGenre =
    escapeHTML(
      movie.genre
    );


  const safeRating =
    escapeHTML(
      movie.rating
    );


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
          ★ ${safeRating}
        </span>

      </div>

    </div>

  `;


  const video =
    card.querySelector(
      "video"
    );


  /* ================= CARD CLICK ================= */

  card.addEventListener(
    "click",
    function () {

      openDetail(movie);

    }
  );


  /* ================= HOVER PLAY ================= */

  card.addEventListener(
    "mouseenter",
    function () {

      if (
        !video.src &&
        !video._redflixHls
      ) {

        loadVideo(
          video,
          movie.video,
          false
        );

      }


      video
        .play()
        .catch(function () {});

    }
  );


  /* ================= HOVER STOP ================= */

  card.addEventListener(
    "mouseleave",
    function () {

      video.pause();


      try {

        video.currentTime =
          0;

      } catch (error) {}

    }
  );


  return card;
}


/* =========================================================
   RENDER MOVIES
   ========================================================= */

function renderMovies(list) {

  if (!movieGrid || !seriesGrid) {
    return;
  }


  movieGrid.innerHTML =
    "";

  seriesGrid.innerHTML =
    "";


  let movieCount =
    0;

  let seriesCount =
    0;


  list.forEach(
    function (movie) {

      const card =
        createCard(movie);


      if (
        movie.type === "series"
      ) {

        seriesGrid.appendChild(
          card
        );

        seriesCount++;

      } else {

        movieGrid.appendChild(
          card
        );

        movieCount++;

      }

    }
  );


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


  if (emptyState) {

    emptyState.classList.toggle(
      "hidden",
      list.length !== 0
    );

  }

}


/* =========================================================
   HERO
   ========================================================= */

function setupHero() {

  if (
    !heroVideo ||
    !heroTitle ||
    !heroDescription
  ) {

    return;

  }


  const featured =
    movies.find(
      function (movie) {

        return movie.featured;

      }
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


  if (heroPlayBtn) {

    heroPlayBtn.onclick =
      function () {

        openPlayer(
          featured
        );

      };

  }


  if (heroInfoBtn) {

    heroInfoBtn.onclick =
      function () {

        openDetail(
          featured
        );

      };

  }

}


/* =========================================================
   OPEN DETAIL
   ========================================================= */

function openDetail(movie) {

  if (
    !movie ||
    !detailModal
  ) {

    return;

  }


  currentMovie =
    movie;


  if (detailTitle) {

    detailTitle.textContent =
      movie.title;

  }


  if (detailYear) {

    detailYear.textContent =
      movie.year;

  }


  if (detailRating) {

    detailRating.textContent =
      `★ ${movie.rating}`;

  }


  if (detailGenre) {

    detailGenre.textContent =
      movie.genre;

  }


  if (detailType) {

    detailType.textContent =
      movie.type === "series"
        ? "SERIES"
        : "MOVIE";

  }


  if (detailDescription) {

    detailDescription.textContent =
      movie.description;

  }


  if (detailCast) {

    detailCast.textContent =
      movie.cast;

  }


  if (detailVideo) {

    detailHls =
      loadVideo(
        detailVideo,
        movie.video,
        false
      );

  }


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
   OPEN PLAYER
   ========================================================= */

function openPlayer(movie) {

  if (
    !movie ||
    !playerModal ||
    !mainPlayer
  ) {

    return;

  }


  currentMovie =
    movie;


  /* ================= IKLAN ================= */

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


  /* ================= RESET ERROR ================= */

  if (playerError) {

    playerError.classList.add(
      "hidden"
    );

  }


  /* ================= OPEN PLAYER ================= */

  playerModal.classList.remove(
    "hidden"
  );


  playerModal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";


  /* ================= LOAD VIDEO ================= */

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
    destroyHls(
      detailHls
    );


  currentMovie =
    null;


  if (
    playerModal &&
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
    destroyHls(
      mainHls
    );


  document.body.style.overflow =
    "";


  currentMovie =
    null;

}


/* =========================================================
   DETAIL PLAY
   ========================================================= */

if (detailPlayBtn) {

  detailPlayBtn.addEventListener(
    "click",
    function () {

      if (!currentMovie) {
        return;
      }


      const movie =
        currentMovie;


      /*
       * Jangan gunakan setTimeout.
       * openPlayer langsung berasal dari
       * event click sehingga window.open
       * lebih mungkin diizinkan browser.
       */

      closeDetail();

      openPlayer(movie);

    }
  );

}


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

if (playerClose) {

  playerClose.addEventListener(
    "click",
    function () {

      closePlayer();

    }
  );

}


/* =========================================================
   PLAYER ERROR
   ========================================================= */

if (mainPlayer) {

  mainPlayer.addEventListener(
    "error",
    function () {

      console.error(
        "HTML5 video error:",
        mainPlayer.error
      );


      if (playerError) {

        playerError.classList.remove(
          "hidden"
        );

      }

    }
  );

}


/* =========================================================
   BACKDROP DETAIL
   ========================================================= */

if (detailModal) {

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

}


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
  "keydown",
  function (event) {

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


      renderMovies(
        filtered
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
            searchInput
              ? searchInput.value
                  .trim()
                  .toLowerCase()
              : "";


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


          renderMovies(
            filtered
          );

        }
      );

    }
  );


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

  return String(
    value ?? ""
  )

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
   PAGE VISIBILITY
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

renderMovies(
  movies
);

setupHero();
