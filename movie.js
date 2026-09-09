const movies = [
  {
    id: 1,
    title: "Kolpri kak anjani pemain basket viral",
    year: 2026,
    genre: "semi",
    rating: "8.5",
    type: "movie",
    featured: true,
    description:
      "Contoh data film untuk RedFlix. Ganti dengan konten yang kamu punya hak untuk ditayangkan.",
    cast:
      "Actor 1, Actor 2, Actor 3",
    video:
      "https://stream.kingbokep.video/kolpri-kak-anjani-pemain-basket/playlist.m3u8"
  },

  {
    id: 2,
    title: "Contoh Film Drama",
    year: 2026,
    genre: "Drama",
    rating: "8.1",
    type: "movie",
    featured: false,
    description:
      "Contoh film drama untuk katalog RedFlix.",
    cast:
      "Actor 4, Actor 5",
    video:
      "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4"
  },

  {
    id: 3,
    title: "Contoh Series",
    year: 2026,
    genre: "Series",
    rating: "8.7",
    type: "series",
    featured: false,
    description:
      "Contoh series untuk katalog RedFlix.",
    cast:
      "Actor 6, Actor 7",
    video:
      "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4"
  },

  {
    id: 4,
    title: "Contoh Series Action",
    year: 2026,
    genre: "Action",
    rating: "8.3",
    type: "series",
    featured: false,
    description:
      "Contoh series action untuk katalog RedFlix.",
    cast:
      "Actor 8, Actor 9",
    video:
      "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4"
  }
];

/* =========================================================
   REDFLIX - ADS SCRIPT
========================================================= */

// URL Iklan Shopee
const SHOPEE_AD_URL = "https://s.shopee.co.id/4qFQYYdc3C";

// Flag penanda iklan sudah terbuka dalam sesi saat ini
let isAdOpened = false;

// Event listener untuk klik di mana saja pada layar
document.addEventListener(
  "click",
  (event) => {
    // 1. Jika iklan sudah pernah terbuka di sesi/refresh ini, hentikan
    if (isAdOpened) {
      return;
    }

    // 2. Abaikan jika user menekan tombol penutup player/modal
    if (
      event.target.closest("#playerClose") ||
      event.target.closest("[data-close-detail]")
    ) {
      return;
    }

    // 3. Tandai bahwa iklan sudah terpicu
    isAdOpened = true;

    // 4. Buka iklan Shopee di tab baru (tanpa mengunci/memblokir scroll)
    window.open(SHOPEE_AD_URL, "_blank", "noopener,noreferrer");
  },
  { capture: true }
);
