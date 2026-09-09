/* =========================================================
   REDFLIX
========================================================= */


/* ================= IKLAN ================= */

const SHOPEE_AD_URL =
  "https://s.shopee.co.id/4qFQYYdc3C";


/* ================= STATE IKLAN ================= */

let isAdOpened = false;


/* ================= ELEMENT ================= */

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


/* ================= STATE ================= */

let currentMovie = null;
let currentHls = null;


/* ================= VIDEO ================= */

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


  /* ================= MP4 / WEBM ================= */

  if (!url.includes(".m3u8")) {

    videoElement.src = url;

    if (autoplay) {

      videoElement
