# kraeplin-vue

Latihan Vue 3. Aku bikin tes Kraeplin: jumlahkan dua angka berurutan, lalu isi **digit satuan**. Skor (benar / total jawab) jalan terus, kolom baru muncul sendiri kalau satu kolom habis.

Yang aktif sekarang cuma `src/views/TestView.vue` di route `/`. `OwnerView.vue` aku simpan buat ngerjain ulang fitur yang sama nanti, biar lebih nempel.

```bash
npm install
npm run dev
```

Catatan singkat dari yang kucoba di TestView:

- **`<script setup>`** — logika komponen. yang dideclare di sini langsung kepakai di template.
- **`ref`** — state. di script harus `.value`, di template tidak.
- **`computed`** — nilai turunan (skor, akurasi, teks soal).
- **`watch`** — jalan saat `answer` berubah, langsung cek digit.
- **`watchEffect`** — ikut apa yang dibaca di dalamnya; di sini buat fokusin input lagi.
- **`nextTick`** — nunggu DOM selesai di-update.
- **`{{ }}`** — tampilin nilai.
- **`:` (`v-bind`)** — bind attribute / class / style.
- **`@` (`v-on`)** — event (`@click`, `@keydown`).
- **`v-model`** — input terikat ke `answer`.
- **`v-if` / `v-else-if` / `v-else`** — node ada atau tidak.
- **`v-show`** — hide/show hint tanpa hapus node.
- **`v-for` + `:key`** — loop kolom angka.
