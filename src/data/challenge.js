/** Skor minimal (0–100) untuk lulus satu level Jungle Challenge. */
export const CHALLENGE_PASS = 70;
/** Jumlah soal per level (dapat dikonfigurasi). */
export const CHALLENGE_COUNT = 6;
/** Pilihan timer (menit) untuk Jungle Challenge; 0 = tanpa timer. */
export const CHALLENGE_TIMER_OPTIONS = [0, 5, 10];

export const CHALLENGE_LEVELS = [
  {
    level: 1,
    name: "PENJELAJAH PEMULA",
    scene: "Jalan Setapak Berlumut",
    naru: "Pemanasan dulu! Tunjukkan kamu masih ingat dasar-dasar bilangan berpangkat!",
    topics: "Pengenalan bilangan berpangkat dan perkalian berulang",
  },
  {
    level: 2,
    name: "PETUALANG HUTAN",
    scene: "Hutan Bambu Berkabut",
    naru: "Makin dalam, makin seru! Sifat perkalian, pembagian, kurung, dan pangkat nol menunggumu!",
    topics: "Perkalian, pembagian, pangkat dari pangkat, pangkat nol",
  },
  {
    level: 3,
    name: "PENAKLUK EKSPONEN",
    scene: "Puncak Altar Sang Eksponen",
    naru: "Ini tantangan terakhir! Gabungkan semua kekuatan pangkat yang sudah kamu kuasai!",
    topics: "Soal gabungan termasuk pangkat negatif",
  },
];
