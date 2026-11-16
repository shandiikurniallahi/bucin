/* ---- GANTI tanggal jadian (tahun, bulan 0-11, tanggal). Bulan 8 = September ---- */
const jadian = new Date(2022, 8, 15, 0, 0, 0);

/* Titik kenangan di jalan: [x, y, tanggal, keterangan, teks di atas/bawah jalan] */
const kenangan = [
  [30,  250, '15 Sep 2022', 'Awal cerita kita', 'atas'],
  [194, 185, '15 Sep 2023', '1 tahun bersama', 'bawah'],
  [380, 150, '15 Sep 2024', '2 tahun bersama', 'atas'],
  [532, 193, '15 Sep 2025', '3 tahun bersama', 'bawah'],
  [672, 197, '15 Sep 2026', '4 tahun bersama', 'bawah'],
  [870, 100, 'Dan seterusnya', 'Selamanya ∞', 'atas']
];
const NS = 'http://www.w3.org/2000/svg';
const grupTitik = document.getElementById('titik');
kenangan.forEach(([x, y, tgl, ket, pos]) => {
  const atas = pos === 'atas';
  const g = document.createElementNS(NS, 'g');
  g.innerHTML =
    `<circle cx="${x}" cy="${y}" r="11" fill="#ff6b8b" stroke="#fff" stroke-width="3"/>` +
    `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" fill="#3a0b1c">♥</text>` +
    `<text class="tgl" x="${x}" y="${atas ? y - 44 : y + 52}" text-anchor="middle">${tgl}</text>` +
    `<text class="ket" x="${x}" y="${atas ? y - 27 : y + 69}" text-anchor="middle">${ket}</text>`;
  grupTitik.appendChild(g);
});

/* Hormati pengguna yang mematikan animasi */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.getElementById('jalan').pauseAnimations();
}

/* Musik */
const lagu = document.getElementById('lagu');
const gerbang = document.getElementById('gerbang');
const tombolMusik = document.getElementById('musik');

let fadeTimer;
function putar() {
  lagu.volume = 0;
  return lagu.play().then(() => {
    tombolMusik.textContent = '♪';
    clearInterval(fadeTimer);
    fadeTimer = setInterval(() => {            // suara naik pelan-pelan
      lagu.volume = Math.min(1, lagu.volume + 0.05);
      if (lagu.volume >= 1) clearInterval(fadeTimer);
    }, 120);
    return true;
  }).catch(() => { tombolMusik.textContent = '▶'; return false; });
}

// Coba putar otomatis saat halaman dibuka. Jika diblokir browser,
// lagu langsung mulai saat hati "Buka hati kita" diklik.
putar().then(ok => { if (ok) gerbang.classList.add('tutup'); });

// Jika file lagu tidak ditemukan, beri tahu lewat tombol musik
lagu.addEventListener('error', () => {
  tombolMusik.textContent = '!';
  tombolMusik.title = 'File lagu.mp3 tidak ditemukan';
});
document.getElementById('buka').addEventListener('click', () => {
  putar();
  gerbang.classList.add('tutup');
});
tombolMusik.addEventListener('click', () => {
  if (lagu.paused) { putar(); } else { lagu.pause(); tombolMusik.textContent = '▶'; }
});

/* Hujan hati */
const wadah = document.getElementById('hearts');
const simbol = ['❤', '💖', '💕', '♥', '💗'];
function buatHati() {
  const h = document.createElement('span');
  h.className = 'heart';
  h.textContent = simbol[Math.floor(Math.random() * simbol.length)];
  const durasi = 6 + Math.random() * 6;
  h.style.left = Math.random() * 100 + 'vw';
  h.style.fontSize = (14 + Math.random() * 26) + 'px';
  h.style.animationDuration = durasi + 's, ' + (2 + Math.random() * 3) + 's';
  wadah.appendChild(h);
  setTimeout(() => h.remove(), durasi * 1000);
}
setInterval(buatHati, 350);

/* Zoom foto: membesar dari posisi aslinya, mengecil kembali saat ditutup */
const lb = document.getElementById('lightbox');
document.body.appendChild(lb); // agar tampil di atas semua elemen
const lbImg = document.getElementById('lb-img');
const lbCap = document.getElementById('lb-cap');
const figs = Array.from(document.querySelectorAll('.galeri figure'));
let aktif = -1, sibuk = false;
const EASE = 'transform .55s cubic-bezier(.2,.8,.2,1)';

function transformDari(thumb) {
  const a = thumb.getBoundingClientRect();
  const b = lbImg.getBoundingClientRect();
  const dx = (a.left + a.width / 2) - (b.left + b.width / 2);
  const dy = (a.top + a.height / 2) - (b.top + b.height / 2);
  return `translate(${dx}px, ${dy}px) scale(${a.width / b.width})`;
}

function isi(i) {
  const img = figs[i].querySelector('img');
  lbImg.src = img.currentSrc || img.src;
  lbImg.alt = img.alt;
  lbCap.textContent = figs[i].querySelector('figcaption').textContent;
  aktif = i;
}

function buka(i) {
  isi(i);
  lb.classList.add('aktif');
  lbImg.style.transition = 'none';
  lbImg.style.transform = transformDari(figs[i].querySelector('img'));
  lbImg.style.opacity = '.6';
  lbImg.getBoundingClientRect(); // paksa render
  requestAnimationFrame(() => {
    lbImg.style.transition = EASE + ', opacity .4s ease';
    lbImg.style.transform = 'none';
    lbImg.style.opacity = '1';
    lb.classList.add('terang');
  });
  document.body.style.overflow = 'hidden';
}

function tutup() {
  if (sibuk || aktif < 0) return;
  sibuk = true;
  lb.classList.remove('terang');
  lbImg.style.transition = EASE + ', opacity .4s ease .1s';
  lbImg.style.transform = transformDari(figs[aktif].querySelector('img'));
  lbImg.style.opacity = '0';
  setTimeout(() => {
    lb.classList.remove('aktif');
    document.body.style.overflow = '';
    aktif = -1; sibuk = false;
  }, 560);
}

function geser(arah) {
  if (aktif < 0 || sibuk) return;
  const baru = (aktif + arah + figs.length) % figs.length;
  lbImg.style.transition = 'transform .25s ease, opacity .25s ease';
  lbImg.style.transform = `translateX(${arah * -40}px) scale(.96)`;
  lbImg.style.opacity = '0';
  setTimeout(() => {
    isi(baru);
    lbImg.style.transition = 'none';
    lbImg.style.transform = `translateX(${arah * 40}px) scale(.96)`;
    lbImg.getBoundingClientRect();
    lbImg.style.transition = 'transform .35s cubic-bezier(.2,.8,.2,1), opacity .35s ease';
    lbImg.style.transform = 'none';
    lbImg.style.opacity = '1';
  }, 250);
}

figs.forEach((f, i) => {
  f.addEventListener('click', () => buka(i));
  f.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); buka(i); } });
});
lb.addEventListener('click', e => { if (e.target === lb) tutup(); });
document.getElementById('lb-tutup').addEventListener('click', tutup);
document.getElementById('lb-prev').addEventListener('click', () => geser(-1));
document.getElementById('lb-next').addEventListener('click', () => geser(1));
document.addEventListener('keydown', e => {
  if (aktif < 0) return;
  if (e.key === 'Escape') tutup();
  if (e.key === 'ArrowLeft') geser(-1);
  if (e.key === 'ArrowRight') geser(1);
});

/* Hitung waktu bersama */
function hitung() {
  const s = Math.floor((Date.now() - jadian) / 1000);
  document.getElementById('h-hari').textContent = Math.floor(s / 86400);
  document.getElementById('h-jam').textContent = Math.floor(s % 86400 / 3600);
  document.getElementById('h-menit').textContent = Math.floor(s % 3600 / 60);
  document.getElementById('h-detik').textContent = s % 60;
}
hitung(); setInterval(hitung, 1000);

/* Anniversary: tahun ke berapa dan hitung mundur ke perayaan berikutnya */
(function () {
  const now = new Date();
  const hariIni = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let ke = now.getFullYear() - jadian.getFullYear();
  let berikut = new Date(jadian.getFullYear() + ke, jadian.getMonth(), jadian.getDate());
  if (berikut < hariIni) { ke++; berikut = new Date(jadian.getFullYear() + ke, jadian.getMonth(), jadian.getDate()); }
  const lalu = ke - (berikut.getTime() === hariIni.getTime() ? 0 : 1);
  const tahunIni = Math.max(lalu, 1);
  document.getElementById('ke').textContent = tahunIni;
  document.getElementById('tahun').textContent = tahunIni + ' tahun';
  document.getElementById('m-ke').textContent = berikut.getFullYear() - jadian.getFullYear();
  document.getElementById('m-tgl').textContent = berikut.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('m-hari').textContent = Math.ceil((berikut - now) / 86400000);
})();