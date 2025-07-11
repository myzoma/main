class FearGreedWidget {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            width: options.width || '100%',
            height: options.height || 'auto',
            theme: options.theme || 'default',
            language: options.language || 'ar',
            autoUpdate: options.autoUpdate !== false,
            updateInterval: options.updateInterval || 5 * 60 * 1000, // 5 دقائق
            ...options
        };
        this.apiUrl = 'https://api.alternative.me/fng/';
        this.init();
    }

    async init() {
        this.createContainer();
        await this.loadData();
        if (this.options.autoUpdate) {
            this.startAutoUpdate();
        }
    }

    createContainer() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with id "${this.containerId}" not found`);
            return;
        }

        container.innerHTML = `
            <div class="fear-greed-widget" style="${this.getContainerStyles()}">
                <div class="widget-header">
                    <h3 style="margin: 0 0 15px 0; color: white;">مؤشر الخوف والطمع</h3>
                </div>
                <div class="widget-content">
                    <div id="${this.containerId}-value" class="index-value">-</div>
                    <div id="${this.containerId}-label" class="index-label">جاري التحميل...</div>
                    <div class="gauge-container">
                        <div class="gauge">
                            <div class="gauge-needle" id="${this.containerId}-needle"></div>
                        </div>
                    </div>
                    <div id="${this.containerId}-historical" class="historical-data"></div>
                </div>
                <div class="widget-footer">
                    <small style="opacity: 0.8;">آخر تحديث: <span id="${this.containerId}-update">-</span></small>
                </div>
            </div>
        `;

        this.addStyles();
    }

    getContainerStyles() {
        return `
            width: ${this.options.width};
            max-width: 400px;
            margin: 20px auto;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            text-align: center;
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        `;
    }

    addStyles() {
        if (document.getElementById('fear-greed-widget-styles')) return;

        const style = document.createElement('style');
        style.id = 'fear-greed-widget-styles';
        style.textContent = `
            .fear-greed-widget .index-value {
                font-size: 3em;
                font-weight: bold;
                margin: 20px 0;
                transition: color 0.3s ease;
            }
            
            .fear-greed-widget .index-label {
                font-size: 1.2em;
                margin-bottom: 20px;
            }
            
            .fear-greed-widget .gauge-container {
                position: relative;
                width: 150px;
                height: 75px;
                margin: 20px auto;
            }
            
            .fear-greed-widget .gauge {
                width: 150px;
                height: 75px;
                border-radius: 75px 75px 0 0;
                background: conic-gradient(
                    from 180deg,
                    #ff4444 0deg,
                    #ff8800 36deg,
                    #ffaa00 72deg,
                    #88cc00 108deg,
                    #00cc44 144deg
                );
                position: relative;
            }
            
            .fear-greed-widget .gauge-needle {
                position: absolute;
                bottom: 0;
                left: 50%;
                width: 2px;
                height: 60px;
                background: #333;
                transform-origin: bottom;
                transition: transform 0.5s ease;
                transform: translateX(-50%) rotate(-90deg);
            }
            
            .fear-greed-widget .historical-data {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-top: 15px;
            }
            
            .fear-greed-widget .historical-item {
                background: rgba(255,255,255,0.1);
                padding: 8px;
                border-radius: 6px;
                font-size: 0.9em;
            }
        `;
        document.head.appendChild(style);
    }

    async loadData() {
        try {
            const response = await fetch(this.apiUrl);
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                this.updateWidget(data.data[0]);
                await this.loadHistoricalData();
            }
        } catch (error) {
            this.showError('خطأ في تحميل البيانات');
        }
    }

    async loadHistoricalData() {
        try {
            const response = await fetch(`${this.apiUrl}?limit=10`);
            const data = await response.json();
            
            if (data.data && data.data.length > 1) {
                this.updateHistoricalData(data.data);
            }
        } catch (error) {
            console.error('Error loading historical data:', error);
        }
    }

    updateWidget(data) {
        const value = parseInt(data.value);
        const classification = this.getArabicClassification(data.value_classification);
        const color = this.getColorByValue(value);
        
        document.getElementById(`${this.containerId}-value`).textContent = value;
        document.getElementById(`${this.containerId}-value`).style.color = color;
        document.getElementById(`${this.containerId}-label`).textContent = classification;
        
        this.updateNeedle(value);
        
        const lastUpdate = new Date(data.timestamp * 1000);
        document.getElementById(`${this.containerId}-update`).textContent = 
            lastUpdate.toLocaleString('ar-SA');
    }

    updateHistoricalData(data) {
        const container = document.getElementById(`${this.containerId}-historical`);
        if (!container || data.length < 2) return;

        const yesterday = data[1];
        const weekAgo = data[Math.min(7, data.length - 1)];

        container.innerHTML = `
            <div class="historical-item">
                <div>أمس</div>
                <div style="font-weight: bold; color: ${this.getColorByValue(yesterday.value)}">
                    ${yesterday.value}
                </div>
            </div>
            <div class="historical-item">
                <div>الأسبوع الماضي</div>
                <div style="font-weight: bold; color: ${this.getColorByValue(weekAgo.value)}">
                    ${weekAgo.value}
                </div>
            </div>
        `;
    }

    updateNeedle(value) {
        const needle = document.getElementById(`${this.containerId}-needle`);
        if (needle) {
            const rotation = (value / 100) * 180 - 90;
            needle.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
        }
    }

    getArabicClassification(classification) {
        const translations = {
            'Extreme Fear': 'خوف شديد',
            'Fear': 'خوف',
            'Neutral': 'محايد',
            'Greed': 'طمع',
            'Extreme Greed': 'طمع شديد'
        };
        return translations[classification] || classification;
    }

    getColorByValue(value) {
        if (value <= 20) return '#ff4444';
        if (value <= 40) return '#ff8800';
        if (value <= 60) return '#ffaa00';
        if (value <= 80) return '#88cc00';
        return '#00cc44';
    }

    showError(message) {
        document.getElementById(`${this.containerId}-label`).textContent = message;
        document.getElementById(`${this.containerId}-label`).style.color = '#ff6b6b';
    }

    startAutoUpdate() {
        setInterval(() => {
            this.loadData();
        }, this.options.updateInterval);
    }

    // طرق للتحكم في المؤشر
    refresh() {
        this.loadData();
    }

    destroy() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
}

// جعل الكلاس متاح عالمياً
window.FearGreedWidget = FearGreedWidget;
