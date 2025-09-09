# Binance Screener Bot

Bot sederhana berbasis **Node.js** yang mengambil data pasar dari Binance, memfilter token dengan kenaikan harga dan volume tertentu, lalu mengirimkan hasilnya ke Telegram.

## Fitur
- Mengambil data semua pasangan perdagangan di Binance.
- Memfilter token berdasarkan:
  - **Volume minimum** (default: 10 juta USD).
  - **Persentase kenaikan harga** (default: 10%).
- Mengirim notifikasi otomatis ke Telegram.

## Persiapan
1. Pastikan sudah terpasang [Node.js](https://nodejs.org/) versi 16 atau lebih baru.
2. Clone repository ini:
   ```bash
   git clone https://github.com/dammajid/binance-screener-bot-by-murph.git
   cd binance-screener-bot-by-murph
