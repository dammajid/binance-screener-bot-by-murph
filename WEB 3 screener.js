// index.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { getTopGainers } = require('./binance');
const { sendTelegram } = require('./telegram');

// Konfigurasi screener
const MIN_VOLUME_USDT = 10_000_000;   // minimal volume (USDT)
const MIN_PRICE_CHANGE_PERCENT = 10;  // minimal persentase perubahan harga
const LOG_FILE = path.join(__dirname, 'screener.log');

// Fungsi untuk mencatat log ke file
function writeLog(message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, logLine, 'utf8');
}

async function main() {
    const startTime = new Date().toLocaleTimeString();
    console.log(`[${startTime}] Screener dijalankan.`);
    writeLog(`Screener dijalankan pada ${startTime}`);

    try {
        console.log('Mengambil data pasar dari Binance...');
        writeLog('Mengambil data pasar dari Binance...');

        const topGainers = await getTopGainers(MIN_VOLUME_USDT, MIN_PRICE_CHANGE_PERCENT);

        if (topGainers.length === 0) {
            const noResultMessage = 'Tidak ada token yang memenuhi kriteria saat ini.';
            console.log(noResultMessage);
            writeLog(noResultMessage);
            await sendTelegram(noResultMessage);
            return;
        }

        console.log(`${topGainers.length} token ditemukan, mengirim notifikasi ke Telegram.`);
        writeLog(`${topGainers.length} token ditemukan.`);

        // Format pesan untuk Telegram
        let message = `Top Gainers Hari Ini\n\n`;
        topGainers.forEach((token, i) => {
            let note = '';
            if (token.priceChangePercent > 20) note = 'Potensi pergerakan besar';
            if (token.volume > 100_000_000) note = 'Volume tinggi';

            message += `${i + 1}. ${token.symbol}\n`;
            message += `   Perubahan Harga : ${token.priceChangePercent}%\n`;
            message += `   Volume          : $${Number(token.volume).toLocaleString()}\n`;
            message += `   Harga Terakhir  : $${token.lastPrice}\n`;
            if (note) message += `   Catatan         : ${note}\n`;
            message += `\n`;
        });

        message += `Selesai. Silakan periksa chart untuk analisis lebih lanjut.`;

        await sendTelegram(message);
        console.log('Notifikasi berhasil dikirim.');
        writeLog('Notifikasi berhasil dikirim.');

    } catch (error) {
        console.error('Terjadi kesalahan:', error.message);
        writeLog(`Error: ${error.message}`);
        await sendTelegram(`Terjadi kesalahan di bot screener:\n${error.message}`);
    }
}

// Jalankan bot
main().catch(err => {
    console.error('Fatal error:', err);
    writeLog(`Fatal error: ${err.message}`);
    sendTelegram(`Fatal error di screener:\n${err.message}`);
});
