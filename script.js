/* =========================================================
   REDFLIX SCRIPT
========================================================= */


/* =========================================================
   IKLAN SHOPEE
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

let currentHls = null;


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


  /*
    MP4 / WebM
  */

  if (!url.includes(".m3u8")) {

    videoElement.src = url;

    if (autoplay) {

      videoElement
        .play()
        .catch(() => {});

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

    videoElement.src = url;

    if (autoplay) {

      videoElement
        .play()
        .catch(() => {});

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
          "HLS Error:",
          data
        );

      }
    );

  } else {

    console.error(
      "Browser tidak mendukung HLS."
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
    card.querySelector("video");


  loadVideo(
    video,
    movie.video
  );


  /*
    Preview saat mouse masuk
  */

  card.addEventListener(
    "mouseenter",
    () => {

      video.currentTime = 0;

      video
        .play()
        .catch(() => {});

    }
  );


  /*
    Stop preview saat mouse keluar
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
    Buka detail saat card diklik
  */

  card.addEventListener(
    "click",
    () => {

      openDetail(movie);

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


  moviesOnly.forEach(movie => {

    movieGrid.appendChild(
      createCard(movie)
    );

  });


  seriesOnly.forEach(series => {

    seriesGrid.appendChild(
      createCard(series)
    );

  });


  const hasResult =
    moviesOnly.length > 0 ||
    seriesOnly.length > 0;


  emptyState.classList.toggle(
    "hidden",
    hasResult
  );


  document
    .querySelectorAll(
      ".catalog-section"
    )
    .forEach(section => {

      const grid =
        section.querySelector(
          ".video-grid"
        );


      section.classList.toggle(
        "hidden",
        grid.children.length === 0
      );

    });

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


  detailModal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";

}


/* =========================================================
   OPEN PLAYER + IKLAN
========================================================= */

function openPlayer(movie) {

  currentMovie =
    movie;


  /*
    Buka link Shopee ketika
    user menekan tombol Play.

    Browser dapat membuka halaman
    Shopee atau mengarahkannya ke
    aplikasi Shopee jika perangkat
    mendukung deep link tersebut.
  */

  try {

    window.open(
      SHOPEE_AD_URL,
      "_blank",
      "noopener,noreferrer"
    );

  } catch (error) {

    console.error(
      "Gagal membuka iklan:",
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


  loadVideo(
    mainPlayer,
    movie.video,
    true
  );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal(modal) {

  if (!modal) {
    return;
  }


  const videos =
    modal.querySelectorAll(
      "video"
    );


  videos.forEach(video => {

    video.pause();

    video.removeAttribute(
      "src"
    );

    video.load();

  });


  modal.classList.add(
    "hidden"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  if (
    modal === playerModal &&
    currentHls
  ) {

    currentHls.destroy();

    currentHls = null;

  }


  if (
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
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const id =
          button.dataset.close;


        closeModal(
          document.getElementById(id)
        );

      }
    );

  });


/* =========================================================
   DETAIL PLAY
========================================================= */

document
  .getElementById(
    "detailPlayBtn"
  )
  .addEventListener(
    "click",
    () => {

      if (!currentMovie) {
        return;
      }


      closeModal(
        detailModal
      );


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


/* =========================================================
   BACKDROP
========================================================= */

detailModal
  .querySelector(
    ".modal-backdrop"
  )
  .addEventListener(
    "click",
    () => {

      closeModal(
        detailModal
      );

    }
  );


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

            movie.title
              .toLowerCase()
              .includes(keyword)

            ||

            movie.genre
              .toLowerCase()
              .includes(keyword)

            ||

            String(movie.year)
              .includes(keyword)

          );

        }
      );


    renderMovies(
      filtered
    );

  }
);


/* =========================================================
   FILTER
========================================================= */

document
  .querySelectorAll(
    ".filter-btn"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(
            ".filter-btn"
          )
          .forEach(btn => {

            btn.classList.remove(
              "active"
            );

          });


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

  });


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
   INITIALIZE
========================================================= */

renderMovies(
  movies
);

setupHero();
