/* =========================================================
   REDFLIX SCRIPT
========================================================= */


/* =========================================================
   IKLAN SHOPEE
========================================================= */

const SHOPEE_AD_URL =
  "https://s.shopee.co.id/2gAtB1h0zd";


/* =========================================================
   DATA MOVIE
========================================================= */

const movies =
  Array.isArray(window.movies)
    ? window.movies
    : [];


if (!movies.length) {
  console.error(
    "Data film tidak ditemukan. Pastikan movie.js dimuat sebelum script.js."
  );
}


/* =========================================================
   ELEMENT
========================================================= */

const movieGrid =
  document.getElementById("movieGrid");

const seriesGrid =
  document.getElementById("seriesGrid");

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

const playerModal =
  document.getElementById("playerModal");

const detailVideo =
  document.getElementById("detailVideo");

const mainPlayer =
  document.getElementById("mainPlayer");

const playerError =
  document.getElementById("playerError");


/* =========================================================
   STATE
========================================================= */

let currentMovie = null;

const hlsInstances =
  new Map();

let adOpenedForCurrentPlay =
  false;


/* =========================================================
   OPEN IKLAN SHOPEE
========================================================= */

function openShopeeAd() {

  try {

    const popup =
      window.open(
        SHOPEE_AD_URL,
        "_blank"
      );

    if (!popup) {

      console.warn(
        "Popup Shopee diblokir oleh browser."
      );

      return false;

    }

    try {
      popup.opener = null;
    } catch (error) {}

    return true;

  } catch (error) {

    console.error(
      "Gagal membuka iklan Shopee:",
      error
    );

    return false;

  }

}


/* =========================================================
   LOAD VIDEO
========================================================= */

function loadVideo(
  videoElement,
  url,
  autoplay = false
) {

  if (!videoElement || !url) {

    console.warn(
      "Video element atau URL video kosong."
    );

    return;

  }


  /*
    Hancurkan HLS sebelumnya
  */

  if (
    hlsInstances.has(videoElement)
  ) {

    const oldHls =
      hlsInstances.get(
        videoElement
      );

    try {
      oldHls.destroy();
    } catch (error) {}

    hlsInstances.delete(
      videoElement
    );

  }


  videoElement.pause();

  videoElement.removeAttribute(
    "src"
  );

  videoElement.load();


  /*
    MP4 / WebM
  */

  if (
    !url.includes(".m3u8")
  ) {

    videoElement.src =
      url;


    if (autoplay) {

      videoElement
        .play()
        .catch(error => {

          console.warn(
            "Autoplay gagal:",
            error
          );

        });

    }

    return;

  }


  /*
    Native HLS
  */

  if (
    videoElement.canPlayType(
      "application/vnd.apple.mpegurl"
    )
  ) {

    videoElement.src =
      url;


    if (autoplay) {

      videoElement
        .play()
        .catch(error => {

          console.warn(
            "Autoplay HLS gagal:",
            error
          );

        });

    }

    return;

  }


  /*
    HLS.js
  */

  if (
    typeof Hls !== "undefined" &&
    Hls.isSupported()
  ) {

    const hls =
      new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });


    hlsInstances.set(
      videoElement,
      hls
    );


    hls.loadSource(
      url
    );


    hls.attachMedia(
      videoElement
    );


    hls.on(
      Hls.Events.MANIFEST_PARSED,
      () => {

        if (autoplay) {

          videoElement
            .play()
            .catch(error => {

              console.warn(
                "Autoplay HLS.js gagal:",
                error
              );

            });

        }

      }
    );


    hls.on(
      Hls.Events.ERROR,
      (event, data) => {

        console.error(
          "HLS Error:",
          data
        );


        if (data.fatal) {

          try {
            hls.destroy();
          } catch (error) {}

          hlsInstances.delete(
            videoElement
          );

        }

      }
    );


  } else {

    console.error(
      "Browser tidak mendukung HLS."
    );

  }

}


/* =========================================================
   DESTROY VIDEO
========================================================= */

function destroyVideo(
  videoElement
) {

  if (!videoElement) {
    return;
  }


  if (
    hlsInstances.has(
      videoElement
    )
  ) {

    const hls =
      hlsInstances.get(
        videoElement
      );

    try {
      hls.destroy();
    } catch (error) {}

    hlsInstances.delete(
      videoElement
    );

  }


  videoElement.pause();

  videoElement.removeAttribute(
    "src"
  );

  videoElement.load();

}


/* =========================================================
   CREATE CARD
========================================================= */

function createCard(
  movie
) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "video-card";


  card.dataset.id =
    movie.id;


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
    card.querySelector(
      "video"
    );


  loadVideo(
    video,
    movie.video
  );


  /*
    Preview desktop
  */

  card.addEventListener(
    "mouseenter",
    () => {

      try {
        video.currentTime = 0;
      } catch (error) {}

      video
        .play()
        .catch(() => {});

    }
  );


  /*
    Stop preview
  */

  card.addEventListener(
    "mouseleave",
    () => {

      video.pause();

      try {
        video.currentTime = 0;
      } catch (error) {}

    }
  );


  /*
    Card diklik = Detail
  */

  card.addEventListener(
    "click",
    () => {

      openDetail(
        movie
      );

    }
  );


  return card;

}


/* =========================================================
   RENDER MOVIES
========================================================= */

function renderMovies(
  list
) {

  if (!movieGrid || !seriesGrid) {
    return;
  }


  movieGrid.innerHTML =
    "";

  seriesGrid.innerHTML =
    "";


  const moviesOnly =
    list.filter(
      item =>
        item.type === "movie"
    );


  const seriesOnly =
    list.filter(
      item =>
        item.type === "series"
    );


  /*
    FILM
  */

  moviesOnly.forEach(
    movie => {

      movieGrid.appendChild(
        createCard(movie)
      );

    }
  );


  /*
    SERIES
  */

  seriesOnly.forEach(
    series => {

      seriesGrid.appendChild(
        createCard(series)
      );

    }
  );


  const hasResult =
    moviesOnly.length > 0 ||
    seriesOnly.length > 0;


  if (emptyState) {

    emptyState.classList.toggle(
      "hidden",
      hasResult
    );

  }


  /*
    Sembunyikan section kosong
  */

  document
    .querySelectorAll(
      ".catalog-section"
    )
    .forEach(
      section => {

        const grid =
          section.querySelector(
            ".video-grid"
          );


        if (!grid) {
          return;
        }


        section.classList.toggle(
          "hidden",
          grid.children.length === 0
        );

      }
    );

}


/* =========================================================
   HERO
========================================================= */

function setupHero() {

  if (!movies.length) {
    return;
  }


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


  if (heroTitle) {

    heroTitle.textContent =
      featured.title;

  }


  if (heroDescription) {

    heroDescription.textContent =
      featured.description || "";

  }


  if (heroVideo) {

    loadVideo(
      heroVideo,
      featured.video,
      true
    );

  }


  /*
    Tombol Hero Play
  */

  if (heroPlayBtn) {

    heroPlayBtn.onclick =
      () => {

        openPlayer(
          featured
        );

      };

  }


  /*
    Tombol Hero Info
  */

  if (heroInfoBtn) {

    heroInfoBtn.onclick =
      () => {

        openDetail(
          featured
        );

      };

  }

}


/* =========================================================
   DETAIL
========================================================= */

function openDetail(
  movie
) {

  if (!movie) {
    return;
  }


  currentMovie =
    movie;


  const detailTitle =
    document.getElementById(
      "detailTitle"
    );

  const detailYear =
    document.getElementById(
      "detailYear"
    );

  const detailGenre =
    document.getElementById(
      "detailGenre"
    );

  const detailRating =
    document.getElementById(
      "detailRating"
    );

  const detailType =
    document.getElementById(
      "detailType"
    );

  const detailDescription =
    document.getElementById(
      "detailDescription"
    );

  const detailCast =
    document.getElementById(
      "detailCast"
    );


  if (detailTitle) {

    detailTitle.textContent =
      movie.title;

  }


  if (detailYear) {

    detailYear.textContent =
      movie.year;

  }


  if (detailGenre) {

    detailGenre.textContent =
      movie.genre;

  }


  if (detailRating) {

    detailRating.textContent =
      `★ ${movie.rating}`;

  }


  if (detailType) {

    detailType.textContent =
      movie.type === "series"
        ? "SERIES"
        : "FILM";

  }


  if (detailDescription) {

    detailDescription.textContent =
      movie.description || "";

  }


  if (detailCast) {

    detailCast.textContent =
      movie.cast || "-";

  }


  if (detailVideo) {

    loadVideo(
      detailVideo,
      movie.video,
      false
    );

  }


  if (detailModal) {

    detailModal.classList.remove(
      "hidden"
    );


    detailModal.setAttribute(
      "aria-hidden",
      "false"
    );

  }


  document.body.style.overflow =
    "hidden";

}


/* =========================================================
   OPEN PLAYER + IKLAN
========================================================= */

function openPlayer(
  movie
) {

  if (!movie) {
    return;
  }


  currentMovie =
    movie;


  /*
    Reset status iklan
  */

  adOpenedForCurrentPlay =
    false;


  /*
    Buka Shopee LANGSUNG
    dari klik user.
  */

  const adOpened =
    openShopeeAd();


  console.log(
    "Shopee popup:",
    adOpened
      ? "berhasil dibuka"
      : "diblokir browser"
  );


  /*
    Tutup detail
  */

  if (
    detailModal &&
    !detailModal.classList.contains(
      "hidden"
    )
  ) {

    closeModal(
      detailModal
    );

  }


  /*
    Reset error
  */

  if (playerError) {

    playerError.classList.add(
      "hidden"
    );

  }


  /*
    Buka player
  */

  if (playerModal) {

    playerModal.classList.remove(
      "hidden"
    );


    playerModal.setAttribute(
      "aria-hidden",
      "false"
    );

  }


  document.body.style.overflow =
    "hidden";


  /*
    Load video
  */

  if (mainPlayer) {

    loadVideo(
      mainPlayer,
      movie.video,
      true
    );

  }

}


/* =========================================================
   KLIK VIDEO PLAYER
========================================================= */

if (mainPlayer) {

  mainPlayer.addEventListener(
    "click",
    () => {

      /*
        Hanya buka iklan sekali
        untuk sesi player ini.
      */

      if (
        adOpenedForCurrentPlay
      ) {

        return;

      }


      adOpenedForCurrentPlay =
        true;


      openShopeeAd();

    }
  );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal(
  modal
) {

  if (!modal) {
    return;
  }


  const videos =
    modal.querySelectorAll(
      "video"
    );


  videos.forEach(
    video => {

      destroyVideo(
        video
      );

    }
  );


  modal.classList.add(
    "hidden"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  if (
    modal === playerModal
  ) {

    adOpenedForCurrentPlay =
      false;

  }


  if (
    detailModal &&
    playerModal &&
    detailModal.classList.contains(
      "hidden"
    ) &&
    playerModal.classList.contains(
      "hidden"
    )
  ) {

    document.body.style.overflow =
      "";

  }

}


/* =========================================================
   CLOSE BUTTON
========================================================= */

document
  .querySelectorAll(
    "[data-close]"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            button.dataset.close;


          const modal =
            document.getElementById(
              id
            );


          closeModal(
            modal
          );

        }
      );

    }
  );


/* =========================================================
   DETAIL PLAY
========================================================= */

const detailPlayBtn =
  document.getElementById(
    "detailPlayBtn"
  );


if (detailPlayBtn) {

  detailPlayBtn.addEventListener(
    "click",
    () => {

      if (!currentMovie) {
        return;
      }


      /*
        Tidak menggunakan setTimeout.
        Popup dipanggil langsung dari klik.
      */

      openPlayer(
        currentMovie
      );

    }
  );

}


/* =========================================================
   BACKDROP
========================================================= */

if (detailModal) {

  const backdrop =
    detailModal.querySelector(
      ".modal-backdrop"
    );


  if (backdrop) {

    backdrop.addEventListener(
      "click",
      () => {

        closeModal(
          detailModal
        );

      }
    );

  }

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

      closeModal(
        playerModal
      );

      return;

    }


    if (
      detailModal &&
      !detailModal.classList.contains(
        "hidden"
      )
    ) {

      closeModal(
        detailModal
      );

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


      const filtered =
        movies.filter(
          movie => {

            return (

              String(
                movie.title || ""
              )
              .toLowerCase()
              .includes(
                keyword
              )

              ||

              String(
                movie.genre || ""
              )
              .toLowerCase()
              .includes(
                keyword
              )

              ||

              String(
                movie.year || ""
              )
              .includes(
                keyword
              )

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
                movie.type === filter
            )
          );

        }
      );

    }
  );


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
  value
) {

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
   INITIALIZE
========================================================= */

renderMovies(
  movies
);

setupHero();


console.log(
  "RedFlix berhasil dimuat."
);

console.log(
  "Jumlah film:",
  movies.length
);
