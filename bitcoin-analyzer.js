class BitcoinAnalyzer {
    constructor() {
        this.period = 25;
    }

    async fetchBinanceData() {
        try {
            const response = await fetch('https://api1.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=200');
            const klines = await response.json();
            
            return klines.map(kline => ({
                open: parseFloat(kline[1]),
                high: parseFloat(kline[2]),
                low: parseFloat(kline[3]),
                close: parseFloat(kline[4]),
                volume: parseFloat(kline[5])
            }));
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    sum(array, length) {
        if (!array || array.length < length) return 0;
        return array.slice(-length).reduce((sum, val) => sum + val, 0);
    }

    analyzeFutureTrend(data) {
        if (!data || data.length < this.period * 3) {
            return null;
        }

        // حساب delta volume حسب المؤشر الأصلي
        const deltaVolume = data.map(candle => 
            candle.close > candle.open ? candle.volume : -candle.volume
        );

        const closes = data.map(d => d.close);
        const volumes = data.map(d => d.volume);

        // حساب delta لكل فترة (حرفياً من المؤشر)
        const delta1 = this.sum(deltaVolume, this.period);
        const delta2 = this.sum(deltaVolume, this.period * 2) - delta1;
        const delta3 = this.sum(deltaVolume, this.period * 3) - delta1 - delta2;

        // حساب total volume لكل فترة
        const total1 = this.sum(volumes, this.period);
        const total2 = this.sum(volumes, this.period * 2) - total1;
        const total3 = this.sum(volumes, this.period * 3) - total1 - total2;

        // حساب القيم المستقبلية
        const values = [];
        const deltaValues = [];

        for (let i = 0; i < this.period; i++) {
            const idx1 = closes.length - 1 - i;
            const idx2 = closes.length - 1 - i - this.period;
            const idx3 = closes.length - 1 - i - this.period * 2;

            const avgPrice = (
                (closes[idx1] || closes[closes.length - 1]) +
                (closes[idx2] || closes[closes.length - 1]) +
                (closes[idx3] || closes[closes.length - 1])
            ) / 3;

            const avgDelta = (
                (deltaVolume[idx1] || 0) +
                (deltaVolume[idx2] || 0) +
                (deltaVolume[idx3] || 0)
            ) / 3;

            values.push(avgPrice);
            deltaValues.push(avgDelta);
        }

        const currentPrice = closes[closes.length - 1];
        const diff = currentPrice - values[0];
        const avgVolDelta = deltaValues.reduce((sum, val) => sum + val, 0) / deltaValues.length;

        // إنشاء الأهداف المستقبلية
        const targets = [];
        for (let i = 0; i < 10; i++) {
            if (values[i]) {
                targets.push({
                    target: i + 1,
                    price: diff + values[i],
                    trend: avgVolDelta > 0 ? 'صاعد' : 'هابط'
                });
            }
        }

        return {
            currentPrice,
            trend: avgVolDelta > 0 ? 'صاعد' : 'هابط',
            trendColor: avgVolDelta > 0 ? '#00ff00' : '#d42583',
            targets,
            volumeData: {
                delta1: delta1,
                delta2: delta2,
                delta3: delta3,
                total1: total1,
                total2: total2,
                total3: total3
            },
            avgVolumeDelta: avgVolDelta
        };
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    }

    generateHTML(analysis) {
        if (!analysis) {
            return '<div style="color: red; padding: 20px;">فشل في التحليل - بيانات غير كافية</div>';
        }

        const targetsHTML = analysis.targets.map(target => 
            `<div style="padding: 8px; border-bottom: 1px solid #eee; color: ${analysis.trendColor};">
                الهدف ${target.target}: $${this.formatNumber(target.price)}
            </div>`
        ).join('');

        return `
            <div style="max-width: 800px; margin: 20px auto; padding: 20px; border: 2px solid ${analysis.trendColor}; border-radius: 10px; background: #f9f9f9; font-family: Arial;">
                
                <h3 style="text-align: center; color: #333; margin-bottom: 20px;">
                    تحليل البيتكوين - Three Step Future Trend
                </h3>
                
                <div style="background: white; padding: 15px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span><strong>السعر الحالي:</strong></span>
                        <span>$${this.formatNumber(analysis.currentPrice)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span><strong>الاتجاه:</strong></span>
                        <span style="color: ${analysis.trendColor}; font-weight: bold;">${analysis.trend}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span><strong>متوسط دلتا الحجم:</strong></span>
                        <span style="color: ${analysis.trendColor};">${this.formatNumber(analysis.avgVolumeDelta)}</span>
                    </div>
                </div>

                <h4 style="color: #333; margin-bottom: 15px;">الأهداف المستقبلية:</h4>
                <div style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    ${targetsHTML}
                </div>

                <div style="background: white; padding: 15px; margin-top: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h4 style="color: #333; margin-bottom: 10px;">بيانات الحجم:</h4>
                    <div style="font-size: 14px;">
                        <div>الفترة 1: Delta = ${this.formatNumber(analysis.volumeData.delta1)} | Total = ${this.formatNumber(analysis.volumeData.total1)}</div>
                        <div>الفترة 2: Delta = ${this.formatNumber(analysis.volumeData.delta2)} | Total = ${this.formatNumber(analysis.volumeData.total2)}</div>
                        <div>الفترة 3: Delta = ${this.formatNumber(analysis.volumeData.delta3)} | Total = ${this.formatNumber(analysis.volumeData.total3)}</div>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 15px; color: #666; font-size: 12px;">
                    آخر تحديث: ${new Date().toLocaleString('ar-SA')}
                </div>
            </div>
        `;
    }

    async run() {
        console.log('بدء التحليل...');
        
        const data = await this.fetchBinanceData();
        if (!data) {
            return '<div style="color: red; padding: 20px;">فشل في جلب البيانات من Binance</div>';
        }

        console.log(`تم جلب ${data.length} شمعة`);
        
        const analysis = this.analyzeFutureTrend(data);
        console.log('نتيجة التحليل:', analysis);
        
        return this.generateHTML(analysis);
    }
}

// تشغيل التحليل
async function showAnalysis() {
    const container = document.getElementById('analysis-results');
    if (!container) {
        console.error('العنصر analysis-results غير موجود');
        return;
    }

    container.innerHTML = '<div style="text-align: center; padding: 40px;">جاري التحليل...</div>';

    try {
        const analyzer = new BitcoinAnalyzer();
        const result = await analyzer.run();
        container.innerHTML = result;
    } catch (error) {
        console.error('خطأ:', error);
        container.innerHTML = '<div style="color: red; padding: 20px;">حدث خطأ في التحليل</div>';
    }
}

// تشغيل فوري
showAnalysis();

// تحديث كل 5 دقائق
setInterval(showAnalysis, 5 * 60 * 1000);
