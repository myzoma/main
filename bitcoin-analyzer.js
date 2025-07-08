class BitcoinAnalyzer {
    constructor() {
        this.period = 25;
        this.colorUp = '#28a745';
        this.colorDown = '#dc3545';
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
            return '<div style="color: #dc3545; padding: 20px; text-align: center;">فشل في التحليل</div>';
        }

        // جدول بيانات الحجم مع تصميم متناسق
        const volumeTableHTML = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <thead>
                        <tr style="background: linear-gradient(135deg, #f8f9fa, #e9ecef);">
                            <th style="padding: 12px; border: 1px solid #dee2e6; color: #495057; font-weight: 600;">الفترة</th>
                            <th style="padding: 12px; border: 1px solid #dee2e6; color: #495057; font-weight: 600;">Delta Volume</th>
                            <th style="padding: 12px; border: 1px solid #dee2e6; color: #495057; font-weight: 600;">Total Volume</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="background: #fff;">
                            <td style="padding: 12px; border: 1px solid #dee2e6; color: #6c757d;">${this.period * 2} - ${this.period}</td>
                            <td style="padding: 12px; border: 1px solid #dee2e6; color: ${analysis.volumeData.color1}; font-weight: 500;">${this.formatVolume(analysis.volumeData.delta1)}</td>
                            <td style="padding: 12px; border: 1px solid #dee2e6; color: #495057;">${this.formatVolume(analysis.volumeData.total1)}</td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 12px; border: 1px solid #dee2e6; color: #6c757d;">${this.period * 3} - ${this.period * 2}</td>
                            <td style="padding: 12px; border: 1px solid #dee2e6; color: ${analysis.volumeData.color2}; font-weight: 500;">${this.formatVolume(analysis.volumeData.delta2)}</td>
                            <td style="padding: 12px; border: 1px solid #dee2e6; color: #495057;">${this.formatVolume(analysis.volumeData.total2)}</td>
                        </tr>
                        <tr style="background: #fff;">
                            <td style="padding: 12px; border: 1px solid #dee2e6; color: #6c757d;">${this.period * 4} - ${this.period * 3}</td>
                            <td style="padding: 12px; border: 1px solid #dee2e6; color: ${analysis.volumeData.color3}; font-weight: 500;">${this.formatVolume(analysis.volumeData.delta3)}</td>
                            <td style="padding: 12px; border: 1px solid #dee2e6; color: #495057;">${this.formatVolume(analysis.volumeData.total3)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        // الأهداف المستقبلية بشكل أفقي
        const targetsHTML = analysis.futureTrend.slice(0, 10).map(target => 
            `<div style="
                display: inline-block; 
                margin: 8px; 
                padding: 12px 16px; 
                background: linear-gradient(135deg, #fff, #f8f9fa); 
                border: 2px solid ${analysis.trendColor}; 
                border-radius: 8px; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: transform 0.2s ease;
                min-width: 120px;
                text-align: center;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="font-size: 12px; color: #6c757d; margin-bottom: 4px;">الهدف ${target.index + 1}</div>
                <div style="font-size: 16px; font-weight: 600; color: ${analysis.trendColor};">$${this.formatPrice(target.price)}</div>
            </div>`
        ).join('');

        return `
            <div style="max-width: 1000px; margin: 20px auto; padding: 25px; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                
                <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e9ecef;">
                    <h2 style="color: #343a40; margin: 0; font-size: 24px; font-weight: 700;">Three Step Future-Trend</h2>
                    <p style="color: #6c757d; margin: 8px 0 0 0; font-size: 14px;">Bitcoin Analysis - BigBeluga Indicator</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 20px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 14px; color: #6c757d; margin-bottom: 8px;">السعر الحالي</div>
                        <div style="font-size: 24px; font-weight: 700; color: #343a40;">$${this.formatPrice(analysis.currentPrice)}</div>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, ${analysis.trendColor}15, ${analysis.trendColor}25); padding: 20px; border-radius: 10px; text-align: center; border: 2px solid ${analysis.trendColor};">
                        <div style="font-size: 14px; color: #6c757d; margin-bottom: 8px;">الاتجاه</div>
                        <div style="font-size: 20px; font-weight: 600; color: ${analysis.trendColor};">${analysis.trend}</div>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 20px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 14px; color: #6c757d; margin-bottom: 8px;">Volume Delta</div>
                        <div style="font-size: 18px; font-weight: 600; color: ${analysis.trendColor};">${this.formatVolume(analysis.volDelta)}</div>
                    </div>
                </div>

                <div style="margin-bottom: 30px;">
                    <h3 style="color: #343a40; margin-bottom: 20px; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">
                        📊 بيانات الحجم (Volume Data)
                    </h3>
                    ${volumeTableHTML}
                </div>

                              <div style="margin-bottom: 20px;">
                    <h3 style="color: #343a40; margin-bottom: 20px; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">
                        🎯 الأهداف المستقبلية المتتابعة
                    </h3>
                    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f8f9fa, #ffffff); border-radius: 10px; border: 1px solid #dee2e6;">
                        ${targetsHTML}
                    </div>
                </div>

                <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                    <div style="display: inline-flex; align-items: center; gap: 15px; color: #6c757d; font-size: 13px;">
                        <span>📈 Period: ${this.period}</span>
                        <span>•</span>
                        <span>🕐 آخر تحديث: ${new Date().toLocaleString('ar-SA')}</span>
                        <span>•</span>
                        <span>💹 Price Diff: ${this.formatPrice(analysis.diff)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    async run() {
        const data = await this.fetchBinanceData();
        if (!data) {
            return '<div style="color: #dc3545; padding: 20px; text-align: center; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; margin: 20px;">فشل في جلب البيانات من Binance API</div>';
        }

        const analysis = this.futureTrend(data);
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

    container.innerHTML = `
        <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 10px; margin: 20px auto; max-width: 400px;">
            <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #e9ecef; border-top: 4px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <div style="margin-top: 15px; color: #6c757d; font-size: 16px;">جاري تحليل البيانات...</div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;

    try {
        const analyzer = new BitcoinAnalyzer();
        const result = await analyzer.run();
        container.innerHTML = result;
    } catch (error) {
        console.error('خطأ في التحليل:', error);
        container.innerHTML = `
            <div style="color: #dc3545; padding: 20px; text-align: center; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; margin: 20px;">
                ❌ حدث خطأ في التحليل: ${error.message}
            </div>
        `;
    }
}

// تشغيل فوري
showAnalysis();

// تحديث كل 5 دقائق
setInterval(showAnalysis, 5 * 60 * 1000);
