class BitcoinAnalyzer {
    constructor() {
        this.period = 25;
        this.colorUp = '#00ff00';
        this.colorDown = '#d42583';
        this.data = [];
        this.volumeData = [];
    }

    // جلب البيانات من Binance API
    async fetchBinanceData() {
        try {
            const response = await fetch('https://api1.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=200');
            const klines = await response.json();
            
            this.data = klines.map(kline => ({
                timestamp: kline[0],
                open: parseFloat(kline[1]),
                high: parseFloat(kline[2]),
                low: parseFloat(kline[3]),
                close: parseFloat(kline[4]),
                volume: parseFloat(kline[5])
            }));

            return this.data;
        } catch (error) {
            console.error('خطأ في جلب البيانات:', error);
            return null;
        }
    }

    // حساب أعلى قيمة في فترة معينة
    highest(data, period) {
        return Math.max(...data.slice(-period).map(d => d.high));
    }

    // حساب أقل قيمة في فترة معينة
    lowest(data, period) {
        return Math.min(...data.slice(-period).map(d => d.low));
    }

    // حساب مجموع القيم
    sum(array, period) {
        return array.slice(-period).reduce((sum, val) => sum + val, 0);
    }

    // حساب متوسط القيم
    average(array) {
        return array.reduce((sum, val) => sum + val, 0) / array.length;
    }

    // حساب Delta Volume
    calculateDeltaVolume() {
        return this.data.map(candle => {
            return candle.close > candle.open ? candle.volume : -candle.volume;
        });
    }

    // تحليل الاتجاه المستقبلي
    analyzeFutureTrend() {
        if (this.data.length < this.period * 3) {
            return null;
        }

        const deltaVolume = this.calculateDeltaVolume();
        const closes = this.data.map(d => d.close);
        const volumes = this.data.map(d => d.volume);

        // حساب Delta لكل فترة
        const delta1 = this.sum(deltaVolume, this.period);
        const delta2 = this.sum(deltaVolume, this.period * 2) - delta1;
        const delta3 = this.sum(deltaVolume, this.period * 3) - delta1 - delta2;

        // حساب Total Volume لكل فترة
        const total1 = this.sum(volumes, this.period);
        const total2 = this.sum(volumes, this.period * 2) - total1;
        const total3 = this.sum(volumes, this.period * 3) - total1 - total2;

        // تحديد الألوان بناءً على Delta
        const color1 = delta1 > 0 ? this.colorUp : this.colorDown;
        const color2 = delta2 > 0 ? this.colorUp : this.colorDown;
        const color3 = delta3 > 0 ? this.colorUp : this.colorDown;

        // حساب القيم المستقبلية
        const futureValues = [];
        const deltaValues = [];
        
        for (let i = 0; i < this.period; i++) {
            const avgPrice = this.average([
                closes[closes.length - 1 - i] || closes[closes.length - 1],
                closes[closes.length - 1 - i - this.period] || closes[closes.length - 1],
                closes[closes.length - 1 - i - this.period * 2] || closes[closes.length - 1]
            ]);
            
            const avgDelta = this.average([
                deltaVolume[deltaVolume.length - 1 - i] || deltaVolume[deltaVolume.length - 1],
                deltaVolume[deltaVolume.length - 1 - i - this.period] || deltaVolume[deltaVolume.length - 1],
                deltaVolume[deltaVolume.length - 1 - i - this.period * 2] || deltaVolume[deltaVolume.length - 1]
            ]);

            futureValues.push(avgPrice);
            deltaValues.push(avgDelta);
        }

        const currentPrice = closes[closes.length - 1];
        const priceDiff = currentPrice - futureValues[0];
        const avgVolDelta = this.average(deltaValues);

        // إنشاء التوقعات المستقبلية
        const predictions = futureValues.map((value, index) => ({
            step: index + 1,
            targetPrice: priceDiff + value,
            confidence: avgVolDelta > 0 ? 'صاعد' : 'هابط',
            color: avgVolDelta > 0 ? this.colorUp : this.colorDown
        }));

        return {
            currentPrice,
            trend: avgVolDelta > 0 ? 'صاعد' : 'هابط',
            trendColor: avgVolDelta > 0 ? this.colorUp : this.colorDown,
            volumeAnalysis: {
                period1: { delta: delta1, total: total1, color: color1 },
                period2: { delta: delta2, total: total2, color: color2 },
                period3: { delta: delta3, total: total3, color: color3 }
            },
            predictions: predictions.slice(0, 10), // أول 10 توقعات
            avgVolumeDelta: avgVolDelta
        };
    }

    // تنسيق الأرقام
    formatNumber(num) {
        if (Math.abs(num) >= 1e9) {
            return (num / 1e9).toFixed(2) + 'B';
        } else if (Math.abs(num) >= 1e6) {
            return (num / 1e6).toFixed(2) + 'M';
        } else if (Math.abs(num) >= 1e3) {
            return (num / 1e3).toFixed(2) + 'K';
        }
        return num.toFixed(2);
    }

    // تنسيق السعر
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    }

    // إنشاء HTML للنتائج
    generateHTML(analysis) {
        if (!analysis) return '<div class="error">لا توجد بيانات كافية للتحليل</div>';

        const volumeRows = Object.entries(analysis.volumeAnalysis).map(([key, data], index) => {
            const periodRange = this.period * (index > 0 ? index + 1 : 1) + ' - ' + (this.period * index);
            return `
                <tr>
                    <td>${periodRange}</td>
                    <td style="color: ${data.color}">${this.formatNumber(data.delta)}</td>
                    <td>${this.formatNumber(data.total)}</td>
                </tr>
            `;
        }).join('');

        const predictionRows = analysis.predictions.map(pred => `
            <tr>
                <td>الهدف ${pred.step}</td>
                <td style="color: ${pred.color}">${this.formatPrice(pred.targetPrice)}</td>
                <td style="color: ${pred.color}">${pred.confidence}</td>
            </tr>
        `).join('');

        return `
            <div class="bitcoin-analysis">
                <div class="current-status">
                    <h3>الوضع الحالي</h3>
                    <div class="status-grid">
                        <div class="status-item">
                            <span class="label">السعر الحالي:</span>
                            <span class="value">${this.formatPrice(analysis.currentPrice)}</span>
                        </div>
                        <div class="status-item">
                            <span class="label">الاتجاه:</span>
                            <span class="value" style="color: ${analysis.trendColor}">${analysis.trend}</span>
                        </div>
                        <div class="status-item">
                            <span class="label">متوسط دلتا الحجم:</span>
                            <span class="value" style="color: ${analysis.trendColor}">${this.formatNumber(analysis.avgVolumeDelta)}</span>
                        </div>
                    </div>
                </div>

                <div class="volume-analysis">
                    <h3>تحليل الحجم</h3>
                    <table class="analysis-table">
                        <thead>
                            <tr>
                                <th>الفترة</th>
                                <th>دلتا الحجم</th>
                                <th>إجمالي الحجم</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${volumeRows}
                        </tbody>
                    </table>
                </div>

                <div class="future-predictions">
                    <h3>التوقعات المستقبلية</h3>
                    <table class="predictions-table">
                        <thead>
                            <tr>
                                <th>الهدف</th>
                                <th>السعر المتوقع</th>
                                <th>الثقة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${predictionRows}
                        </tbody>
                    </table>
                </div>

                <div class="last-update">
                    <small>آخر تحديث: ${new Date().toLocaleString('ar-SA')}</small>
                </div>
            </div>
        `;
    }

    // تشغيل التحليل
    async runAnalysis() {
        console.log('جاري جلب البيانات من Binance...');
        
        const data = await this.fetchBinanceData();
        if (!data) {
            return '<div class="error">فشل في جلب البيانات من Binance</div>';
        }

        console.log('جاري تحليل البيانات...');
        const analysis = this.analyzeFutureTrend();
        
        return this.generateHTML(analysis);
    }
}

// تصدير الكلاس للاستخدام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BitcoinAnalyzer;
}

// استخدام التطبيق
async function initBitcoinAnalyzer() {
    const analyzer = new BitcoinAnalyzer();
    const resultHTML = await analyzer.runAnalysis();
    
    // إدراج النتائج في الصفحة
    const resultContainer = document.getElementById('analysis-results');
    if (resultContainer) {
        resultContainer.innerHTML = resultHTML;
    }
    
    return resultHTML;
}

// تحديث تلقائي كل 5 دقائق
setInterval(initBitcoinAnalyzer, 5 * 60 * 1000);
