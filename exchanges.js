// استخدام APIs تدعم CORS أو طرق بديلة
const exchanges = {
    binance: {
        name: 'Binance',
        logo: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png',
        fetchPrice: async () => {
            // استخدام WebSocket أو API يدعم CORS
            const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            return {
                price: parseFloat(data.lastPrice),
                change: parseFloat(data.priceChangePercent)
            };
        }
    },
    coingecko: {
        name: 'CoinGecko',
        logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
        fetchPrice: async () => {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            return {
                price: data.bitcoin.usd,
                change: data.bitcoin.usd_24h_change || 0
            };
        }
    },
    coincap: {
        name: 'CoinCap',
        logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
        fetchPrice: async () => {
            const response = await fetch('https://api.coincap.io/v2/assets/bitcoin');
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            return {
                price: parseFloat(data.data.priceUsd),
                change: parseFloat(data.data.changePercent24Hr) || 0
            };
        }
    },
    coinlore: {
        name: 'CoinLore',
        logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
        fetchPrice: async () => {
            const response = await fetch('https://api.coinlore.net/api/ticker/?id=90');
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            return {
                price: parseFloat(data[0].price_usd),
                change: parseFloat(data[0].percent_change_24h) || 0
            };
        }
    },
    cryptocompare: {
        name: 'CryptoCompare',
        logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
        fetchPrice: async () => {
            const response = await fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC&tsyms=USD');
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            return {
                price: parseFloat(data.RAW.BTC.USD.PRICE),
                change: parseFloat(data.RAW.BTC.USD.CHANGEPCT24HOUR) || 0
            };
        }
    },
    messari: {
        name: 'Messari',
        logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
        fetchPrice: async () => {
            const response = await fetch('https://data.messari.io/api/v1/assets/bitcoin/metrics');
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            return {
                price: parseFloat(data.data.market_data.price_usd),
                change: parseFloat(data.data.market_data.percent_change_usd_last_24_hours) || 0
            };
        }
    },
    nomics: {
        name: 'Nomics',
        logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
        fetchPrice: async () => {
            // Nomics API يحتاج مفتاح، لذا سنستخدم بديل
            const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=BTC');
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            return {
                price: parseFloat(data.data.rates.USD),
                change: 0 // لا يوفر تغيير 24 ساعة
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

// دالة جلب جميع الأسعار مع timeout
async function fetchAllPrices() {
    const tableBody = document.getElementById('priceTableBody');
    const loading = document.getElementById('loading');
    
    loading.style.display = 'block';
    tableBody.innerHTML = '';
    
    // إضافة timeout لكل طلب
    const fetchWithTimeout = async (fetchFunction, timeout = 5000) => {
        return Promise.race([
            fetchFunction(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), timeout)
            )
        ]);
    };
    
    // جلب الأسعار بشكل متوازي مع timeout
    const promises = Object.entries(exchanges).map(async ([key, exchange]) => {
        try {
            const priceData = await fetchWithTimeout(exchange.fetchPrice, 5000);
            return { exchange, priceData, error: false };
        } catch (error) {
            console.error(`خطأ في جلب سعر ${exchange.name}:`, error.message);
            return { exchange, priceData: null, error: true, errorMessage: error.message };
        }
    });
    
    try {
        const results = await Promise.allSettled(promises);
        
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                const { exchange, priceData, error, errorMessage } = result.value;
                addPriceRow(exchange, priceData, error, errorMessage);
            } else {
                console.error('Promise rejected:', result.reason);
            }
        });
    } catch (error) {
        console.error('خطأ عام في جلب الأسعار:', error);
    }
    
    loading.style.display = 'none';
}

// دالة إضافة صف السعر للجدول
function addPriceRow(exchange, priceData, hasError, errorMessage = '') {
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
            <td><span class="error">${errorMessage || 'خطأ في التحميل'}</span></td>
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
let updateInterval;

function startAutoUpdate() {
    if (updateInterval) clearInterval(updateInterval);
    
    updateInterval = setInterval(() => {
        if (isTableVisible) {
            console.log('تحديث تلقائي للأسعار...');
            fetchAllPrices();
        }
    }, 30000);
}

// إيقاف التحديث التلقائي
function stopAutoUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

// تعديل دالة إظهار/إخفاء الجدول لتشمل التحديث التلقائي
function togglePriceTable() {
    const table = document.getElementById('priceTable');
    isTableVisible = !isTableVisible;
    
    if (isTableVisible) {
        table.classList.add('show');
        fetchAllPrices();
        startAutoUpdate();
    } else {
        table.classList.remove('show');
        stopAutoUpdate();
    }
}

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
    
    // تنظيف عند إغلاق الصفحة
    window.addEventListener('beforeunload', function() {
        stopAutoUpdate();
    });
});

// دالة اختبار الاتصال
async function testConnection() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/ping');
        const data = await response.json();
        console.log('اختبار الاتصال نجح:', data);
        return true;
    } catch (error) {
        console.error('فشل اختبار الاتصال:', error);
        return false;
    }
}

// تشغيل اختبار الاتصال عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    testConnection();
});
