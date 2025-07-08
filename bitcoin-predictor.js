class BitcoinPredictor {
    constructor() {
        this.period = 25;
        this.klineData = [];
        this.predictions = [];
        this.isRunning = false;
        this.updateInterval = null;
        
        
        this.init();
    }

    async init() {
        try {
            this.updateStatus('جاري الاتصال بمنصة بينانس...', 'info');
            await this.fetchInitialData();
            this.startRealTimeUpdates();
            this.updateStatus('تم الاتصال بنجاح - جاري التحليل...', 'success');
        } catch (error) {
            console.error('خطأ في التهيئة:', error);
            this.updateStatus(`خطأ في الاتصال: ${error.message}`, 'error');
        }
    }

    async fetchInitialData() {
        try {
            // استخدام الرابط الذي يعمل 100% - تغيير فقط الرابط
            const response = await fetch('https://api1.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=200');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            this.klineData = data.map(candle => ({
                timestamp: candle[0],
                open: parseFloat(candle[1]),
                high: parseFloat(candle[2]),
                low: parseFloat(candle[3]),
                close: parseFloat(candle[4]),
                volume: parseFloat(candle[5])
            }));
            
            console.log(`تم جلب ${this.klineData.length} شمعة بنجاح`);
            this.calculatePredictions();
        } catch (error) {
            console.error('خطأ في جلب البيانات:', error);
            throw error;
        }
    }

    calculatePredictions() {
        if (this.klineData.length < this.period * 3) {
            this.updateStatus('بيانات غير كافية للتحليل', 'error');
            return;
        }

        const data = this.klineData;
        const period = this.period;
        
        // حساب دلتا الحجم (نفس منطق المؤشر الأصلي)
        const deltaVolume = data.map(candle => 
            candle.close > candle.open ? candle.volume : -candle.volume
        );

        // حساب الدلتا للفترات الثلاث (الاستراتيجية الأصلية)
        const delta1 = this.sumArray(deltaVolume.slice(-period));
        const delta2 = this.sumArray(deltaVolume.slice(-period * 2, -period));
        const delta3 = this.sumArray(deltaVolume.slice(-period * 3, -period * 2));

        // حساب إجمالي الحجم (الاستراتيجية الأصلية)
        const total1 = this.sumArray(data.slice(-period).map(d => d.volume));
        const total2 = this.sumArray(data.slice(-period * 2, -period).map(d => d.volume));
        const total3 = this.sumArray(data.slice(-period * 3, -period * 2).map(d => d.volume));

        // حساب متوسط الأسعار للفترات (الاستراتيجية الأصلية)
        const avgPrices = [];
        for (let i = 0; i < period; i++) {
            const price1 = data[data.length - 1 - i]?.close || 0;
            const price2 = data[data.length - 1 - i - period]?.close || 0;
            const price3 = data[data.length - 1 - i - period * 2]?.close || 0;
            avgPrices.push((price1 + price2 + price3) / 3);
        }

        // حساب الفرق والتنبؤ (الاستراتيجية الأصلية)
        const currentPrice = data[data.length - 1].close;
        const avgDelta = (delta1 + delta2 + delta3) / 3;
        const baseDiff = currentPrice - avgPrices[0];
        
        // إنشاء التنبؤات للساعات القادمة (5 نقاط كما في الاستراتيجية الأصلية)
        this.predictions = [];
        for (let i = 0; i < 5; i++) {
            const futurePrice = baseDiff + avgPrices[Math.min(i * 5, avgPrices.length - 1)];
            // تطبيق تأثير الحجم (الاستراتيجية الأصلية)
            const volumeInfluence = avgDelta > 0 ? 1.002 : 0.998;
            const adjustedPrice = futurePrice * Math.pow(volumeInfluence, i + 1);
            this.predictions.push(Math.round(adjustedPrice));
        }

        // تحديث العرض
        this.updateDisplay(delta1, delta2, delta3, total1, total2, total3);
    }

    sumArray(arr) {
        return arr.reduce((sum, val) => sum + val, 0);
    }

    updateDisplay(delta1, delta2, delta3, total1, total2, total3) {
        // تحديث التنبؤات (الاستراتيجية الأصلية)
        const predictionText = `توقع مسار البيتكوين اليوم: [${this.predictions.join('-')}]`;
        document.getElementById('prediction-display').textContent = predictionText;

        // تحديث الشريط المتحرك مع الأيقونات التعبيرية
const iframe = document.getElementById('ticker-iframe');
if (iframe && iframe.contentDocument) {
    // إضافة أيقونات Font Awesome بين التوقعات
    const predictionsWithIcons = this.predictions.map((prediction, index) => {
        // اختيار الأيقونة حسب نوع التوقع
        let icon = '';
        if (prediction.includes('صعود') || prediction.includes('ارتفاع')) {
            icon = '<i class="fas fa-arrow-up text-success"></i>';
        } else if (prediction.includes('هبوط') || prediction.includes('انخفاض')) {
            icon = '<i class="fas fa-arrow-down text-danger"></i>';
        } else if (prediction.includes('استقرار') || prediction.includes('ثبات')) {
            icon = '<i class="fas fa-minus text-warning"></i>';
        } else {
            icon = '<i class="fas fa-chart-line text-info"></i>';
        }
        
        return `${icon} ${prediction}`;
    }).join(' <i class="fas fa-circle text-muted" style="font-size: 0.5em;"></i> ');
    
    // تحديث محتوى الشريط المتحرك
    const tickerContent = `
        <i class="fab fa-bitcoin text-warning"></i> 
        توقع مسار البيتكوين اليوم: 
        <span class="predictions-container">${predictionsWithIcons}</span> 
        <i class="fas fa-clock text-primary"></i> 
        آخر تحديث: ${new Date().toLocaleTimeString('ar-SA')}
    `;
    
    const tickerElement = iframe.contentDocument.getElementById('ticker-content');
    if (tickerElement) {
        tickerElement.innerHTML = tickerContent; // استخدام innerHTML بدلاً من textContent
        
        // إضافة CSS للأيقونات داخل الـ iframe إذا لم تكن موجودة
        const head = iframe.contentDocument.head;
        if (!head.querySelector('#fontawesome-css')) {
            const fontAwesomeLink = iframe.contentDocument.createElement('link');
            fontAwesomeLink.id = 'fontawesome-css';
            fontAwesomeLink.rel = 'stylesheet';
            fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
            head.appendChild(fontAwesomeLink);
        }
        
        // إضافة CSS مخصص للتنسيق
        if (!head.querySelector('#ticker-custom-css')) {
            const customStyle = iframe.contentDocument.createElement('style');
            customStyle.id = 'ticker-custom-css';
            customStyle.textContent = `
                .predictions-container {
                    margin: 0 10px;
                    font-weight: bold;
                }
                .text-success { color: #28a745 !important; }
                .text-danger { color: #dc3545 !important; }
                .text-warning { color: #ffc107 !important; }
                .text-info { color: #17a2b8 !important; }
                .text-primary { color: #007bff !important; }
                .text-muted { color: #6c757d !important; }
                .fas, .fab {
                    margin: 0 5px;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
            `;
            head.appendChild(customStyle);
        }
    }
}

        // تحديث بيانات الحجم (الاستراتيجية الأصلية)
        this.updateVolumeData('period1', delta1, total1, '0-25');
        this.updateVolumeData('period2', delta2, total2, '25-50');
        this.updateVolumeData('period3', delta3, total3, '50-75');

        this.updateStatus('تم التحديث بنجاح', 'success');
    }

    updateVolumeData(periodId, delta, total, periodLabel) {
        const element = document.getElementById(periodId);
        if (!element) return;

        const deltaElement = element.querySelector(`#${periodId.replace('period', 'delta')}`);
        const totalElement = element.querySelector(`#${periodId.replace('period', 'total')}`);
        const labelElement = element.querySelector('.period-label');
        
        if (deltaElement) {
            deltaElement.textContent = `دلتا: ${this.formatVolume(delta)}`;
        }
        if (totalElement) {
            totalElement.textContent = `إجمالي: ${this.formatVolume(total)}`;
        }
        if (labelElement) {
            labelElement.textContent = `الفترة ${periodLabel}`;
        }
        
        // تلوين العنصر حسب الدلتا (الاستراتيجية الأصلية)
        element.className = `volume-card ${delta > 0 ? 'positive' : 'negative'}`;
    }

    formatVolume(volume) {
        if (Math.abs(volume) > 1000000) {
            return (volume / 1000000).toFixed(2) + 'M';
        } else if (Math.abs(volume) > 1000) {
            return (volume / 1000).toFixed(2) + 'K';
        }
        return volume.toFixed(2);
    }

    updateStatus(message, type) {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.innerHTML = `<span class="${type}">${message}</span>`;
        }
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    startRealTimeUpdates() {
        // تحديث كل 60 ثانية (الاستراتيجية الأصلية)
        this.updateInterval = setInterval(async () => {
            try {
                await this.fetchLatestData();
                this.calculatePredictions();
            } catch (error) {
                this.updateStatus(`خطأ في التحديث: ${error.message}`, 'error');
            }
        }, 60000);
    }

    async fetchLatestData() {
        // استخدام الرابط الذي يعمل 100% - تغيير فقط الرابط
        const response = await fetch('https://api1.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=1');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const latestCandle = {
            timestamp: data[0][0],
            open: parseFloat(data[0][1]),
            high: parseFloat(data[0][2]),
            low: parseFloat(data[0][3]),
            close: parseFloat(data[0][4]),
            volume: parseFloat(data[0][5])
        };

        // إضافة الشمعة الجديدة وإزالة الأقدم (الاستراتيجية الأصلية)
        this.klineData.push(latestCandle);
        if (this.klineData.length > 200) {
            this.klineData.shift();
        }
    }

    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.isRunning = false;
    }
}

// بدء التطبيق (الاستراتيجية الأصلية)
document.addEventListener('DOMContentLoaded', () => {
    const predictor = new BitcoinPredictor();
    
    // إيقاف التحديثات عند إغلاق الصفحة
    window.addEventListener('beforeunload', () => {
        predictor.stop();
    });
});
