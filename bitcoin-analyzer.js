class BitcoinAnalyzer {
    constructor() {
        this.period = 25;
        this.colorUp = '#00ff00';
        this.colorDown = '#d42583';
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
            console.error('Error:', error);
            return null;
        }
    }

    // ta.highest(50) - أعلى قيمة في 50 فترة
    highest(data, period) {
        return Math.max(...data.slice(-period).map(d => d.high));
    }

    // ta.lowest(50) - أقل قيمة في 50 فترة  
    lowest(data, period) {
        return Math.min(...data.slice(-period).map(d => d.low));
    }

    // math.sum - مجموع القيم
    mathSum(array, period) {
        if (array.length < period) return 0;
        return array.slice(-period).reduce((sum, val) => sum + val, 0);
    }

    // math.avg - متوسط القيم
    mathAvg(...values) {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    // تطبيق المؤشر حرفياً
    futureTrend(data) {
        if (data.length < this.period * 3) return null;

        const closes = data.map(d => d.close);
        const volumes = data.map(d => d.volume);
        const opens = data.map(d => d.open);

        // حساب delta_vol حرفياً من الكود
        const deltaVol = [];
        for (let i = 0; i < data.length; i++) {
            deltaVol[i] = closes[i] > opens[i] ? volumes[i] : -volumes[i];
        }

        // حساب delta1, delta2, delta3 حرفياً
        const delta1 = this.mathSum(deltaVol, this.period);
        const delta2 = this.mathSum(deltaVol, this.period * 2) - delta1;
        const delta3 = this.mathSum(deltaVol, this.period * 3) - delta1 - delta2;

        // حساب total1, total2, total3 حرفياً
        const total1 = this.mathSum(volumes, this.period);
        const total2 = this.mathSum(volumes, this.period * 2) - total1;
        const total3 = this.mathSum(volumes, this.period * 3) - total1 - total2;

        // تحديد الألوان حرفياً
        const color1 = delta1 > 0 ? this.colorUp : this.colorDown;
        const color2 = delta2 > 0 ? this.colorUp : this.colorDown;
        const color3 = delta3 > 0 ? this.colorUp : this.colorDown;

        // حساب values array حرفياً
        const values = [];
        const delta = [];
        
        for (let i = 0; i < this.period + 1; i++) {
            // math.avg(src[i], src[i + period], src[i + period * 2])
            const idx1 = closes.length - 1 - i;
            const idx2 = closes.length - 1 - i - this.period;
            const idx3 = closes.length - 1 - i - this.period * 2;
            
            const val1 = closes[idx1] || closes[closes.length - 1];
            const val2 = closes[idx2] || closes[closes.length - 1];
            const val3 = closes[idx3] || closes[closes.length - 1];
            
            values[i] = this.mathAvg(val1, val2, val3);
            
            // math.avg(delta_vol[i], delta_vol[i + period], delta_vol[i + period * 2])
            const dval1 = deltaVol[idx1] || 0;
            const dval2 = deltaVol[idx2] || 0;
            const dval3 = deltaVol[idx3] || 0;
            
            delta[i] = this.mathAvg(dval1, dval2, dval3);
        }

        // عكس المصفوفة حرفياً - values.reverse()
        values.reverse();

        // حساب diff حرفياً - series float diff = src - values.first()
        const currentClose = closes[closes.length - 1];
        const diff = currentClose - values[0];

        // حساب vol_delta حرفياً - series float vol_delta = delta.avg()
        const volDelta = delta.reduce((sum, val) => sum + val, 0) / delta.length;

        // إنشاء future_trend حرفياً
        const futureTrend = [];
        for (let i = 0; i < this.period; i++) {
            // chart.point.from_index(bar_index + i, diff + values.get(i))
            const futurePrice = diff + values[i];
            futureTrend.push({
                index: i,
                price: futurePrice
            });
        }

        // تحديد اللون النهائي حرفياً - color := vol_delta > 0 ? color_up : color_dn
        const finalColor = volDelta > 0 ? this.colorUp : this.colorDown;

        return {
            currentPrice: currentClose,
            trend: volDelta > 0 ? 'صاعد' : 'هابط',
            trendColor: finalColor,
            futureTrend: futureTrend,
            volumeData: {
                delta1: delta1,
                delta2: delta2, 
                delta3: delta3,
                total1: total1,
                total2: total2,
                total3: total3,
                color1: color1,
                color2: color2,
                color3: color3
            },
            volDelta: volDelta,
            diff: diff
        };
    }

    formatVolume(vol) {
        if (Math.abs(vol) >= 1e9) return (vol / 1e9).toFixed(2) + 'B';
        if (Math.abs(vol) >= 1e6) return (vol / 1e6).toFixed(2) + 'M';
        if (Math.abs(vol) >= 1e3) return (vol / 1e3).toFixed(2) + 'K';
        return vol.toFixed(2);
    }

    formatPrice(price) {
        return price.toFixed(2);
    }

    generateHTML(analysis) {
        if (!analysis) {
            return '<div style="color: red; padding: 20px;">فشل في التحليل</div>';
        }

        // إنشاء الأهداف المتتابعة
        const targetsHTML = analysis.futureTrend.slice(0, 10).map(target => 
            `<div style="padding: 8px; border-bottom: 1px solid #eee; color: ${analysis.trendColor};">
                الهدف ${target.index + 1}: $${this.formatPrice(target.price)}
            </div>`
        ).join('');

        // جدول بيانات الحجم حرفياً من المؤشر
        const volumeTableHTML = `
            <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                <tr style="background: #f0f0f0;">
                    <th style="padding: 8px; border: 1px solid #ddd;">الفترة</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">Delta</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">Total</th>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${this.period * 2} - ${this.period}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; color: ${analysis.volumeData.color1};">${this.formatVolume(analysis.volumeData.delta1)}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${this.formatVolume(analysis.volumeData.total1)}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${this.period * 3} - ${this.period * 2}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; color: ${analysis.volumeData.color2};">${this.formatVolume(analysis.volumeData.delta2)}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${this.formatVolume(analysis.volumeData.total2)}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${this.period * 4} - ${this.period * 3}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; color: ${analysis.volumeData.color3};">${this.formatVolume(analysis.volumeData.delta3)}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${this.formatVolume(analysis.volumeData.total3)}</td>
                </tr>
            </table>
        `;

        return `
            <div style="max-width: 800px; margin: 20px auto; padding: 20px; border: 2px solid ${analysis.trendColor}; border-radius: 10px; background: #f9f9f9;">
                
                <h3 style="text-align: center; color: #333;">Three Step Future-Trend [BigBeluga] - Bitcoin Analysis</h3>
                
                <div style="background: white; padding: 15px; margin: 15px 0; border-radius: 8px;">
                    <div><strong>السعر الحالي:</strong> $${this.formatPrice(analysis.currentPrice)}</div>
                    <div><strong>الاتجاه:</strong> <span style="color: ${analysis.trendColor};">${analysis.trend}</span></div>
                    <div><strong>Volume Delta:</strong> <span style="color: ${analysis.trendColor};">${this.formatVolume(analysis.volDelta)}</span></div>
                    <div><strong>Price Diff:</strong> ${this.formatPrice(analysis.diff)}</div>
                </div>

                <h4 style="color: #333;">الأهداف المستقبلية المتتابعة:</h4>
                <div style="background: white; border-radius: 8px; margin: 15px 0;">
                    ${targetsHTML}
                </div>

                <h4 style="color: #333;">بيانات الحجم (Volume Data):</h4>
                <div style="background: white; padding: 15px; border-radius: 8px;">
                    ${volumeTableHTML}
                </div>

                <div style="text-align: center; margin-top: 15px; color: #666; font-size: 12px;">
                    Period: ${this.period} | آخر تحديث: ${new Date().toLocaleString('ar-SA')}
                </div>
            </div>
        `;
    }

    async run() {
        const data = await this.fetchBinanceData();
        if (!data) {
            return '<div style="color: red; padding: 20px;">فشل في جلب البيانات</div>';
        }

        const analysis = this.futureTrend(data);
        return this.generateHTML(analysis);
    }
}

// تشغيل التحليل
async function showAnalysis() {
    const container = document.getElementById('analysis-results');
    if (!container) return;

    container.innerHTML = '<div style="text-align: center; padding: 40px;">جاري التحليل...</div>';

    const analyzer = new BitcoinAnalyzer();
    const result = await analyzer.run();
    container.innerHTML = result;
}

showAnalysis();
setInterval(showAnalysis, 5 * 60 * 1000);
