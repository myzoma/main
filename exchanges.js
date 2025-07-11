// بيانات المنصات مع APIs الحقيقية
const exchanges = {
    binance: {
        name: 'Binance',
        logo: 'https://bin.bnbstatic.com/static/images/common/favicon.ico',
        fetchPrice: async () => {
            const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
            const data = await response.json();
            return {
                price: parseFloat(data.lastPrice),
                change: parseFloat(data.priceChangePercent)
            };
        }
    },
    okx: {
        name: 'OKX',
        logo: 'https://static.okx.com/cdn/assets/imgs/MjAyMTA0/6EABC5C8E2E5C5A6E5A6E5A6E5A6E5A6.png',
        fetchPrice: async () => {
            const response = await fetch('https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT');
            const data = await response.json();
            return {
                price: parseFloat(data.data[0].last),
                change: parseFloat(data.data[0].changePercent) * 100
            };
        }
    },
    kucoin: {
        name: 'KuCoin',
        logo: 'https://assets.staticimg.com/cms/media/6EhbDBAOLTiWJIaBP6sLrJ/b4c7378b5b4c4e78b8e4c8c5c5c5c5c5/kucoin-logo.png',
        fetchPrice: async () => {
            const response = await fetch('https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=BTC-USDT');
            const data = await response.json();
            const statsResponse = await fetch('https://api.kucoin.com/api/v1/market/stats?symbol=BTC-USDT');
            const statsData = await statsResponse.json();
            return {
                price: parseFloat(data.data.price),
                change: parseFloat(statsData.data.changeRate) * 100
            };
        }
    },
    bitget: {
        name: 'Bitget',
        logo: 'https://img.bitgetimg.com/multiplatform/web/favicon.ico',
        fetchPrice: async () => {
            const response = await fetch('https://api.bitget.com/api/spot/v1/market/ticker?symbol=BTCUSDT');
            const data = await response.json();
            return {
                price: parseFloat(data.data.close),
                change: parseFloat(data.data.change)
            };
        }
    },
    bybit: {
        name: 'Bybit',
        logo: 'https://static.bybit.com/web/favicon.ico',
        fetchPrice: async () => {
            const response = await fetch('https://api.bybit.com/v5/market/tickers?category=spot&symbol=BTCUSDT');
            const data = await response.json();
            return {
                price: parseFloat(data.result.list[0].lastPrice),
                change: parseFloat(data.result.list[0].price24hPcnt) * 100
            };
        }
    },
    bingx: {
        name: 'BingX',
        logo: 'https://img.bingx.com/web/favicon.ico',
        fetchPrice: async () => {
            const response = await fetch('https://open-api.bingx.com/openApi/spot/v1/ticker/24hr?symbol=BTC-USDT');
            const data = await response.json();
            return {
                price: parseFloat(data.data.lastPrice),
                change: parseFloat(data.data.priceChangePercent)
            };
        }
    },
    coinbase: {
        name: 'Coinbase',
        logo: 'https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d594e79dc7d1977a3a40c66963e6aca4a5a344d9a/asset_icons/80782fe2e8c53b0323c09b3b8c0b23e8b2b5b444b41989e8b4b7b7b7b7b7b7b7.png',
        fetchPrice: async () => {
            const response = await fetch('https://api.pro.coinbase.com/products/BTC-USD/ticker');
            const data = await response.json();
            const statsResponse = await fetch('https://api.pro.coinbase.com/products/BTC-USD/stats');
            const statsData = await statsResponse.json();
            
            const currentPrice = parseFloat(data.price);
            const openPrice = parseFloat(statsData.open);
            const change = ((currentPrice - openPrice) / openPrice) * 100;
            
            return {
                price: currentPrice,
                change: change
            };
        }
    }
};

let isTableVisible = false;

// دالة إظهار/إخفاء الجدول
function togglePriceTable() {
    const table = document.getElementById('priceTable');
    isTableVisible = !isTableVisible;
    
    if (isTableVisible) {
        table.classList.add('show');
        fetchAllPrices();
    } else {
        table.classList.remove('show');
    }
}

// دالة جلب جميع الأسعار
async function fetchAllPrices() {
    const tableBody = document.getElementById('priceTableBody');
    const loading = document.getElementById('loading');
    
    loading.style.display = 'block';
    tableBody.innerHTML = '';
    
    // جلب الأسعار بشكل متوازي
    const promises = Object.entries(exchanges).map(async ([key, exchange]) => {
        try {
            const priceData = await exchange.fetchPrice();
            return { exchange, priceData, error: false };
        } catch (error) {
            console.error(`خطأ في جلب سعر ${exchange.name}:`, error);
            return { exchange, priceData: null, error: true };
        }
    });
    
    const results = await Promise.allSettled(promises);
    
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            const { exchange, priceData, error } = result.value;
            addPriceRow(exchange, priceData, error);
        }
    });
    
    loading.style.display = 'none';
}

// دالة إضافة صف السعر للجدول
function addPriceRow(exchange, priceData, hasError) {
    const tableBody = document.getElementById('priceTableBody');
    const row = document.createElement('tr');
    
    if (hasError || !priceData) {
        row.innerHTML = `
            <td>
                <div class="exchange-info">
                    <img src="${exchange.logo}" alt="${exchange.name}" class="exchange-logo" 
                         onerror="this.style.display='none'">
                    <span>${exchange.name}</span>
                </div>
            </td>
            <td><span class="error">غير متاح</span></td>
            <td><span class="error">-</span></td>
            <td><span class="error">خطأ في التحميل</span></td>
        `;
    } else {
        const changeClass = priceData.change >= 0 ? 'change-positive' : 'change-negative';
        const changeSymbol = priceData.change >= 0 ? '+' : '';
        
        row.innerHTML = `
            <td>
                <div class="exchange-info">
                    <img src="${exchange.logo}" alt="${exchange.name}" class="exchange-logo" 
                         onerror="this.style.display='none'">
                    <span>${exchange.name}</span>
                </div>
            </td>
            <td>
                <span class="price">$${priceData.price.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}</span>
            </td>
            <td>
                <span class="${changeClass}">${changeSymbol}${priceData.change.toFixed(2)}%</span>
            </td>
            <td>
                <span class="last-update">${new Date().toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })}</span>
            </td>
        `;
    }
    
    tableBody.appendChild(row);
}

// تحديث الأسعار كل 30 ثانية إذا كان الجدول مرئياً
setInterval(() => {
    if (isTableVisible) {
        fetchAllPrices();
    }
}, 30000);

// إضافة تأثيرات إضافية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تأثير تحريك الشعارات
    document.addEventListener('mouseover', function(e) {
        if (e.target.classList.contains('exchange-logo')) {
            e.target.style.transform = 'scale(1.2) rotate(5deg)';
        }
    });
    
    document.addEventListener('mouseout', function(e) {
        if (e.target.classList.contains('exchange-logo')) {
            e.target.style.transform = 'scale(1) rotate(0deg)';
        }
    });
});

// دالة للتعامل مع أخطاء CORS (حل بديل)
async function fetchWithProxy(url) {
    try {
        // محاولة الوصول المباشر أولاً
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        // في حالة فشل CORS، يمكن استخدام proxy
        console.warn('CORS error, trying alternative method:', error);
        
        // يمكنك استخدام خدمات proxy مثل:
        // const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
        // const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        
        throw error;
    }
}

// دالة بديلة لجلب الأسعار باستخدام CoinGecko API (لا يحتاج CORS)
async function fetchPricesFromCoinGecko() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        
        return {
            price: data.bitcoin.usd,
            change: data.bitcoin.usd_24h_change
        };
    } catch (error) {
        console.error('خطأ في جلب البيانات من CoinGecko:', error);
        throw error;
    }
}

// دالة بديلة لجلب الأسعار من CoinCap API
async function fetchPricesFromCoinCap() {
    try {
        const response = await fetch('https://api.coincap.io/v2/assets/bitcoin');
        const data = await response.json();
        
        return {
            price: parseFloat(data.data.priceUsd),
            change: parseFloat(data.data.changePercent24Hr)
        };
    } catch (error) {
        console.error('خطأ في جلب البيانات من CoinCap:', error);
        throw error;
    }
}

// إضافة APIs بديلة للمنصات التي قد تواجه مشاكل CORS
const fallbackAPIs = {
    coingecko: {
        name: 'CoinGecko',
        logo: 'https://static.coingecko.com/s/thumbnail-007177f3eca19695592f0b8b0eabbdae282b54154e1be912285c9034ea6cbaf2.png',
        fetchPrice: fetchPricesFromCoinGecko
    },
    coincap: {
        name: 'CoinCap',
        logo: 'https://coincap.io/static/logos/black.svg',
        fetchPrice: fetchPricesFromCoinCap
    }
};

// دالة محسنة لجلب الأسعار مع fallback
async function fetchAllPricesWithFallback() {
    const tableBody = document.getElementById('priceTableBody');
    const loading = document.getElementById('loading');
    
    loading.style.display = 'block';
    tableBody.innerHTML = '';
    
    // محاولة جلب الأسعار من المنصات الأصلية
    const promises = Object.entries(exchanges).map(async ([key, exchange]) => {
        try {
            const priceData = await exchange.fetchPrice();
            return { exchange, priceData, error: false };
        } catch (error) {
            console.error(`خطأ في جلب سعر ${exchange.name}:`, error);
            return { exchange, priceData: null, error: true };
        }
    });
    
    const results = await Promise.allSettled(promises);
    let successCount = 0;
    
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            const { exchange, priceData, error } = result.value;
            if (!error) successCount++;
            addPriceRow(exchange, priceData, error);
        }
    });
    
    // إذا فشلت معظم المنصات، استخدم APIs البديلة
    if (successCount < 2) {
        console.log('استخدام APIs بديلة...');
        
        for (const [key, fallbackAPI] of Object.entries(fallbackAPIs)) {
            try {
                const priceData = await fallbackAPI.fetchPrice();
                addPriceRow(fallbackAPI, priceData, false);
            } catch (error) {
                console.error(`خطأ في API البديل ${fallbackAPI.name}:`, error);
                addPriceRow(fallbackAPI, null, true);
            }
        }
    }
    
    loading.style.display = 'none';
}

// استبدال الدالة الأصلية بالدالة المحسنة
// fetchAllPrices = fetchAllPricesWithFallback;
