// binance.js
const axios = require('axios');

const BASE_URL = 'https://api.binance.com/api/v3';

// Buat instance axios menggunakan timeout 
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 5000 // 5 detik
});

// Ambil semua data ticker 24/7
async function get24hrTicker() {
    try {
        const response = await axiosInstance.get('/ticker/24hr');
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`Binance API error (${error.response.status}): ${error.response.statusText}`);
        } else if (error.request) {
            throw new Error('Tidak ada respons dari Binance API');
        } else {
            throw new Error('Kesalahan internal: ' + error.message);
        }
    }
}

/**
 * take token high price
 */
async function getTopGainers(minVolume = 1000000, minPriceChange = 5) {
    const tickers = await get24hrTicker();

    const filteredTokens = tickers
        .filter(ticker => ticker.symbol.endsWith('USDT'))
        .filter(ticker => parseFloat(ticker.quoteVolume) > minVolume)
        .filter(ticker => parseFloat(ticker.priceChangePercent) > minPriceChange)
        .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
        .slice(0, 10);

    return mapTokenData(filteredTokens);
}

/**
 * take token low price
 */
async function getTopLosers(minVolume = 1000000, minDropPercent = -5) {
    const tickers = await get24hrTicker();

    const filteredTokens = tickers
        .filter(ticker => ticker.symbol.endsWith('USDT'))
        .filter(ticker => parseFloat(ticker.quoteVolume) > minVolume)
        .filter(ticker => parseFloat(ticker.priceChangePercent) < minDropPercent)
        .sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent)) // paling negatif dulu
        .slice(0, 10);

    return mapTokenData(filteredTokens);
}

/**
 * take token high volume movers
 */
async function getHighVolumeMovers(minVolume = 50000000, minPriceChange = 2) {
    const tickers = await get24hrTicker();

    const filteredTokens = tickers
        .filter(ticker => ticker.symbol.endsWith('USDT'))
        .filter(ticker => parseFloat(ticker.quoteVolume) > minVolume)
        .filter(ticker => Math.abs(parseFloat(ticker.priceChangePercent)) > minPriceChange)
        .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, 10);

    return mapTokenData(filteredTokens);
}

/**
 * Helper: format data token
 */
function mapTokenData(tokens) {
    return tokens.map(ticker => ({
        symbol: ticker.symbol,
        priceChangePercent: parseFloat(ticker.priceChangePercent),
        volume: parseFloat(ticker.quoteVolume),
        lastPrice: parseFloat(ticker.lastPrice),
        formatted: {
            priceChangePercent: parseFloat(ticker.priceChangePercent).toFixed(2) + '%',
            volume: parseFloat(ticker.quoteVolume).toLocaleString('en-US', { maximumFractionDigits: 0 }),
            lastPrice: parseFloat(ticker.lastPrice).toFixed(4)
        }
    }));
}

module.exports = { 
    getTopGainers, 
    getTopLosers, 
    getHighVolumeMovers 
};
