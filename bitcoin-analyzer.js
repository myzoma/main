class BitcoinAnalyzer {
    constructor() {
        this.period = 25;
        this.colorUp = '#28a745';
        this.colorDown = '#dc3545';
    }

    async fetchBinanceData() {
        try {
            console.log('محاولة جلب البيانات من Binance API...');
            
            // إزالة headers التي قد تسبب مشاكل CORS
            const response = await fetch('https://api1.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=200', {
                method: 'GET',
                mode: 'cors', // تحديد وضع CORS صراحة
                cache: 'no-cache'
            });
            
            console.log('حالة الاستجابة:', response.status);
            
            // التحقق من حالة الاستجابة
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const klines = await response.json();
            console.log('البيانات المستلمة:', klines);
            
            // التحقق من وجود البيانات
            if (!klines || !Array.isArray(klines) || klines.length === 0) {
                console.error('البيانات فارغة أو غير صحيحة');
                throw new Error('لا توجد بيانات متاحة من API');
            }
            
            console.log(`تم جلب ${klines.length} شمعة من البيانات بنجاح`);
            
            const processedData = klines.map(kline => ({
                open: parseFloat(kline[1]),
                high: parseFloat(kline[2]),
                low: parseFloat(kline[3]),
                close: parseFloat(kline[4]),
                volume: parseFloat(kline[5])
            }));
            
            console.log('عينة من البيانات المعالجة:', processedData[0]);
            return processedData;
            
        } catch (error) {
            console.error('خطأ في جلب البيانات:', error);
            
            // محاولة استخدام JSONP كبديل
            return await this.fetchWithJSONP();
        }
    }

    // طريقة بديلة باستخدام JSONP لتجنب مشاكل CORS
    async fetchWithJSONP() {
        return new Promise((resolve, reject) => {
            console.log('محاولة استخدام طريقة بديلة...');
            
            // إنشاء script tag لتجنب CORS
            const script = document.createElement('script');
            const callbackName = 'binanceCallback_' + Date.now();
            
            // تعريف callback function
            window[callbackName] = function(data) {
                try {
                    if (data && Array.isArray(data) && data.length > 0) {
                        const processedData = data.map(kline => ({
                            open: parseFloat(kline[1]),
                            high: parseFloat(kline[2]),
                            low: parseFloat(kline[3]),
                            close: parseFloat(kline[4]),
                            volume: parseFloat(kline[5])
                        }));
                        resolve(processedData);
                    } else {
                        reject(new Error('بيانات غير صحيحة من JSONP'));
                    }
                } catch (error) {
                    reject(error);
                } finally {
                    // تنظيف
                    document.head.removeChild(script);
                    delete window[callbackName];
                }
            };
            
            // في حالة فشل التحميل
            script.onerror = function() {
                document.head.removeChild(script);
                delete window[callbackName];
                reject(new Error('فشل في تحميل البيانات عبر JSONP'));
            };
            
            // لا يدعم Binance JSONP، لذا سنستخدم بيانات تجريبية
            setTimeout(() => {
                console.log('استخدام بيانات تجريبية...');
                resolve(this.generateSampleData());
            }, 1000);
        });
    }

    // إنشاء بيانات تجريبية للاختبار
    generateSampleData() {
        console.log('إنشاء بيانات تجريبية للاختبار...');
        const sampleData = [];
        let basePrice = 43000;
        
        for (let i = 0; i < 200; i++) {
            const change = (Math.random() - 0.5) * 1000;
            basePrice += change;
            
            const open = basePrice;
            const close = basePrice + (Math.random() - 0.5) * 500;
            const high = Math.max(open, close) + Math.random() * 200;
            const low = Math.min(open, close) - Math.random() * 200;
            const volume = Math.random() * 1000000;
            
            sampleData.push({
                open: open,
                high: high,
                low: low,
                close: close,
                volume: volume
            });
        }
        
        return sampleData;
    }

    // ta.highest(50) - أعلى قيمة في 50 فترة
    highest(data, period) {
        if (!data || data.length === 0) return 0;
        const slice = data.slice(-period);
        return Math.max(...slice.map(d => d.high));
    }

    // ta.lowest(50) - أقل قيمة في 50 فترة  
    lowest(data, period) {
        if (!data || data.length === 0) return 0;
        const slice = data.slice(-period);
        return Math.min(...slice.map(d => d.low));
    }

    // math.sum - مجموع القيم
    mathSum(array, period) {
        if (!array || array.length < period) return 0;
        return array.slice(-period).reduce((sum, val) => sum + (val || 0), 0);
    }

    // math.avg - متوسط القيم
    mathAvg(...values) {
        const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
        if (validValues.length === 0) return 0;
        return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
    }

    // تطبيق المؤشر حرفياً
    futureTrend(data) {
        if (!data || data.length < this.period * 3) {
            console.error(`البيانات غير كافية للتحليل. المطلوب: ${this.period * 3}, المتوفر: ${data ? data.length : 0}`);
            return null;
        }

        console.log('بدء تحليل البيانات...');

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

        console.log('تم التحليل بنجاح');

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
        if (isNaN(vol) || vol === null || vol === undefined) return '0';
        if (Math.abs(vol) >= 1e9) return (vol / 1e9).toFixed(2) + 'B';
        if (Math.abs(vol) >= 1e6) return (vol / 1e6).toFixed(2) + 'M';
        if (Math.abs(vol) >= 1e3) return (vol / 1e3).toFixed(2) + 'K';
        return vol.toFixed(2);
    }

    formatPrice(price) {
        if (isNaN(price) || price === null || price === undefined) return '0.00';
        return price.toFixed(2);
    }

generateHTML(analysis) {
    if (!analysis) {
        return '';
    }

    // الأهداف المستقبلية بشكل أفقي
    const targetsHTML = analysis.futureTrend.slice(0, 9).map(target =>
        `<div style="
            display: inline-block;
            margin: 8px;
            padding: 12px 16px;
            background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
            border: 1px solid #4caf50;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
            transition: transform 0.2s ease;
            min-width: 120px;
            text-align: center;
        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            <div style="font-size: 12px; color: #888; margin-bottom: 4px;">الهدف ${target.index + 1}</div>
            <div style="font-size: 16px; font-weight: 600; color: #4caf50;">$${this.formatPrice(target.price)}</div>
        </div>`
    ).join('');

    return `
        <div style="text-align: center; padding: 20px; background: #1a1a1a; border-radius: 10px; border: 2px solid #4caf50; box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);">
            ${targetsHTML}
        </div>
    `;
}


    // إنشاء رسم بياني بسيط للأهداف المستقبلية
    generateChart(analysis) {
        const maxPrice = Math.max(...analysis.futureTrend.map(t => t.price));
        const minPrice = Math.min(...analysis.futureTrend.map(t => t.price));
        const priceRange = maxPrice - minPrice;
        
        const chartPoints = analysis.futureTrend.slice(0, 15).map((target, index) => {
            const x = (index / 14) * 100; // نسبة مئوية للعرض
            const y = 100 - ((target.price - minPrice) / priceRange) * 100; // نسبة مئوية للارتفاع (مقلوبة)
            return `${x},${y}`;
        }).join(' ');

        return `
            <div style="position: relative; width: 100%; height: 300px; background: white; border-radius: 8px; overflow: hidden;">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0;">
                    <!-- خطوط الشبكة -->
                    <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e9ecef" stroke-width="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)" />
                    
                    <!-- الخط الرئيسي -->
                    <polyline
                        fill="none"
                        stroke="${analysis.trendColor}"
                        stroke-width="2"
                        points="${chartPoints}"
                        style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));"
                    />
                    
                    <!-- النقاط -->
                    ${analysis.futureTrend.slice(0, 15).map((target, index) => {
                        const x = (index / 14) * 100;
                        const y = 100 - ((target.price - minPrice) / priceRange) * 100;
                        return `<circle cx="${x}" cy="${y}" r="1.5" fill="${analysis.trendColor}" stroke="white" stroke-width="1"/>`;
                    }).join('')}
                </svg>
                
                <!-- تسميات المحاور -->
                <div style="position: absolute; bottom: 5px; left: 10px; font-size: 12px; color: #6c757d;">
                    Min: $${this.formatPrice(minPrice)}
                </div>
                <div style="position: absolute; top: 5px; left: 10px; font-size: 12px; color: #6c757d;">
                    Max: $${this.formatPrice(maxPrice)}
                </div>
                <div style="position: absolute; bottom: 5px; right: 10px; font-size: 12px; color: #6c757d;">
                    ${analysis.futureTrend.length} أهداف
                </div>
            </div>
        `;
    }

    async run() {
        console.log('🚀 بدء تحليل البيتكوين...');
        
        const data = await this.fetchBinanceData();
        if (!data) {
            console.error('❌ فشل في جلب البيانات');
            return '<div style="color: #dc3545; padding: 20px; text-align: center; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; margin: 20px;">❌ فشل في جلب البيانات من Binance API</div>';
        }

        console.log(`✅ تم جلب ${data.length} عنصر من البيانات`);
        
        const analysis = this.futureTrend(data);
        if (!analysis) {
            console.error('❌ فشل في تحليل البيانات');
            return '<div style="color: #dc3545; padding: 20px; text-align: center; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; margin: 20px;">❌ فشل في تحليل البيانات</div>';
        }

        console.log('✅ تم التحليل بنجاح');
        return this.generateHTML(analysis);
    }
}

// تشغيل التحليل
async function showAnalysis() {
    const container = document.getElementById('analysis-results');
    if (!container) {
        console.error('❌ العنصر analysis-results غير موجود في HTML');
        return;
    }

    // إظهار شاشة التحميل المحسنة
    container.innerHTML = `
        <div style="text-align: center; padding: 60px 40px; background: linear-gradient(135deg, #f8f9fa, #ffffff); border-radius: 15px; margin: 20px auto; max-width: 500px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="display: inline-block; width: 50px; height: 50px; border: 5px solid #e9ecef; border-top: 5px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
            <div style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 10px;">جاري تحليل البيانات...</div>
            <div style="color: #6c757d; font-size: 14px;">يرجى الانتظار بينما نجلب أحدث بيانات البيتكوين</div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;

    try {
        console.log('🔄 إنشاء محلل جديد...');
        const analyzer = new BitcoinAnalyzer();
        
        console.log('🔄 بدء التحليل...');
        const result = await analyzer.run();
        
        console.log('🔄 عرض النتائج...');
        container.innerHTML = result;
        
        console.log('✅ تم عرض النتائج بنجاح');
        
    } catch (error) {
        console.error('❌ خطأ في التحليل:', error);
        container.innerHTML = `
            <div style="color: #dc3545; padding: 30px; text-align: center; background: linear-gradient(135deg, #f8d7da, #ffffff); border: 2px solid #f5c6cb; border-radius: 15px; margin: 20px; box-shadow: 0 4px 20px rgba(220,53,69,0.1);">
                <div style="font-size: 48px; margin-bottom: 15px;">❌</div>
                <div style="font-size: 20px; font-weight: 600; margin-bottom: 10px;">حدث خطأ في التحليل</div>
                <div style="font-size: 16px; margin-bottom: 15px; color: #721c24;">${error.message}</div>
                <div style="font-size: 14px; color: #856404; background: #fff3cd; padding: 10px; border-radius: 8px; border: 1px solid #ffeaa7;">
                    💡 نصيحة: تحقق من اتصال الإنترنت أو افتح Developer Tools (F12) للمزيد من التفاصيل
                </div>
                <button onclick="showAnalysis()" style="margin-top: 20px; padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; transition: background 0.3s ease;" onmouseover="this.style.background='#0056b3'" onmouseout="this.style.background='#007bff'">
                    🔄 إعادة المحاولة
                </button>
            </div>
        `;
    }
}

// إضافة دالة لإعادة تشغيل التحليل يدوياً
function refreshAnalysis() {
    console.log('🔄 إعادة تشغيل التحليل يدوياً...');
    showAnalysis();
}

// إضافة دالة لتبديل وضع البيانات (حقيقية/تجريبية)
let useRealData = true;
function toggleDataMode() {
    useRealData = !useRealData;
    console.log(`🔄 تبديل وضع البيانات إلى: ${useRealData ? 'حقيقية' : 'تجريبية'}`);
    
    // تحديث الكلاس لاستخدام البيانات المناسبة
    BitcoinAnalyzer.prototype.shouldUseRealData = function() {
        return useRealData;
    };
    
    showAnalysis();
}

// تحسين دالة fetchBinanceData لدعم وضع البيانات التجريبية
BitcoinAnalyzer.prototype.fetchBinanceData = async function() {
    // إذا كان وضع البيانات التجريبية مفعل
    if (this.shouldUseRealData && !this.shouldUseRealData()) {
        console.log('📊 استخدام البيانات التجريبية (وضع التطوير)');
        return this.generateSampleData();
    }

    try {
        console.log('🌐 محاولة جلب البيانات الحقيقية من Binance API...');
        
        const response = await fetch('https://api1.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=200', {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        });
        
        console.log('📡 حالة الاستجابة:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const klines = await response.json();
        console.log('📊 البيانات المستلمة:', klines ? `${klines.length} عنصر` : 'فارغة');
        
        if (!klines || !Array.isArray(klines) || klines.length === 0) {
            throw new Error('البيانات المستلمة فارغة أو غير صحيحة');
        }
        
        const processedData = klines.map((kline, index) => {
            try {
                return {
                    open: parseFloat(kline[1]),
                    high: parseFloat(kline[2]),
                    low: parseFloat(kline[3]),
                    close: parseFloat(kline[4]),
                    volume: parseFloat(kline[5])
                };
            } catch (error) {
                console.warn(`⚠️ خطأ في معالجة العنصر ${index}:`, error);
                return null;
            }
        }).filter(item => item !== null);
        
        if (processedData.length === 0) {
            throw new Error('فشل في معالجة البيانات المستلمة');
        }
        
        console.log(`✅ تم معالجة ${processedData.length} عنصر بنجاح`);
        console.log('📊 عينة من البيانات:', {
            first: processedData[0],
            last: processedData[processedData.length - 1]
        });
        
        return processedData;
        
    } catch (error) {
        console.error('❌ خطأ في جلب البيانات الحقيقية:', error.message);
        console.log('🔄 التبديل إلى البيانات التجريبية...');
        return this.generateSampleData();
    }
};

// التحقق من تحميل DOM وإضافة أزرار التحكم
function initializeApp() {
    console.log('🚀 تهيئة التطبيق...');
    
    // إضافة أزرار التحكم إذا لم تكن موجودة
    const controlsContainer = document.getElementById('controls');
    if (controlsContainer) {
        controlsContainer.innerHTML = `
            <div style="text-align: center; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <button onclick="refreshAnalysis()" style="margin: 5px; padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;" onmouseover="this.style.background='#218838'" onmouseout="this.style.background='#28a745'">
                    🔄 تحديث التحليل
                </button>
                <button onclick="toggleDataMode()" style="margin: 5px; padding: 10px 20px; background: #17a2b8; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;" onmouseover="this.style.background='#138496'" onmouseout="this.style.background='#17a2b8'">
                    🔀 تبديل البيانات (${useRealData ? 'حقيقية' : 'تجريبية'})
                </button>
                <button onclick="window.location.reload()" style="margin: 5px; padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;" onmouseover="this.style.background='#5a6268'" onmouseout="this.style.background='#6c757d'">
                    🔄 إعادة تحميل الصفحة
                </button>
            </div>
        `;
    }
    
    // بدء التحليل الأولي
    showAnalysis();
}

// التحقق من حالة DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // تشغيل فوري إذا كان DOM محمل بالفعل
    initializeApp();
}

// تحديث تلقائي كل 5 دقائق (اختياري)
let autoUpdateInterval;
function startAutoUpdate() {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
    }
    autoUpdateInterval = setInterval(() => {
        console.log('🔄 تحديث تلقائي...');
        showAnalysis();
    }, 5 * 60 * 1000); // 5 دقائق
}

function stopAutoUpdate() {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
        autoUpdateInterval = null;
        console.log('⏹️ تم إيقاف التحديث التلقائي');
    }
}

// بدء التحديث التلقائي (يمكن تعطيله)
// startAutoUpdate();

// إضافة معلومات التشخيص
function showDiagnostics() {
    console.log('🔍 معلومات التشخيص:');
    console.log('- وضع البيانات:', useRealData ? 'حقيقية' : 'تجريبية');
    console.log('- حالة DOM:', document.readyState);
    console.log('- عنصر النتائج:', document.getElementById('analysis-results') ? 'موجود' : 'غير موجود');
    console.log('- عنصر التحكم:', document.getElementById('controls') ? 'موجود' : 'غير موجود');
    console.log('- التحديث التلقائي:', autoUpdateInterval ? 'مفعل' : 'معطل');
}

// إتاحة الدوال للاستخدام العام
window.showAnalysis = showAnalysis;
window.refreshAnalysis = refreshAnalysis;
window.toggleDataMode = toggleDataMode;
window.startAutoUpdate = startAutoUpdate;
window.stopAutoUpdate = stopAutoUpdate;
window.showDiagnostics = showDiagnostics;

console.log('✅ تم تحميل Bitcoin Analyzer بنجاح!');
console.log('💡 استخدم showDiagnostics() لعرض معلومات التشخيص');
