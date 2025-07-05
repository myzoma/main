// بيانات الصفحات - يمكنك تعديلها حسب احتياجاتك
const pages = [
    {
        id: 1,
        title: "الصفحة الرئيسية",
        description: "الصفحة الرئيسية للموقع تحتوي على نظرة عامة شاملة",
        icon: "fas fa-home",
        url: "https://edraone.blogspot.com/",
        features: [
            "افضل 60 عملة",
            "من حيث السيولة",
            "صفقات الشراء",
            "من حيث اختراق المقاومات"
        ]
    },
    {
        id: 2,
        title: "نقـــاط الارتكـــــاز",
        description: "تحليل نقاط الارتكاز Pivot",
        icon: "fa-solid fa-chart-area",
        url: "https://myzoma.github.io/pivot/",
        features: [
            "تحديد نقاط الارتكاز",
            "البحث عن النقاط المفقودة",
            "تحديد الترند",
            "تحديد الاهداف ووقف الخسارة",
            "تحديد القمم والقيعان التاريخية"
        ]
    },
    {
        id: 3,
        title: "سبـــاق العملات",
        description: "سباق العملات وافضل العملات من حيث النقاط الاجابية",
        icon: "fas fa-tachometer-alt",
        url: "https://myzoma.github.io/yaser-crypto/",
        features: [
            "الاعلى تداول",
            "الافضل فنيا",
            "الاكثر صعودا",
            "الافضل من حيث المؤشرات الفنيه"
        ]
    },
    {
        id: 4,
        title: "الصياد الذكي",
        description: "بوت اكتشاف افضل الفرص",
        icon: "fa-solid fa-user-secret",
        url: "https://myzoma.github.io/bott/",
        features: [
            "فرص الشراء",
            "فرص البيع",
            "تحديد الاهداف",
            "تحديد وقف الخسارة"
        ]
    },
    {
        id: 5,
        title: "اخبار السوق",
        description: "اقرأ أحدث المقالات والأخبار",
        icon: "fas fa-blog",
        url: "https://myzoma.github.io/news/",
        features: [
            "مقالات تقنية متخصصة",
            "نصائح وإرشادات",
            "اخبار العملات",
            "اراء الخبراء"
        ]
    },
    {
        id: 6,
        title: "القيمة السوقية للعملات",
        description: "معلومات شاملة عن العملات",
        icon: "fa-solid fa-trophy",
        url: "https://tj155.blogspot.com/",
        features: [
            "أعلى 4 عملات من حيث القيمة السوقية",
            "أدنى 4 عملات من حيث القيمة السوقية",
            "أعلى 4 عملات من حيث العدد المعروض",
            "أدنى 4 عملات من حيث العدد المعروض",
            "أعلى 4 عملات من حيث النشاط المجتمعي"
        ]
    }
];

// متغيرات عامة
let currentPageUrl = '';
let currentPageTitle = '';

// تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    renderCards();
    setupEventListeners();
});

// رسم البطاقات
function renderCards() {
    const cardsGrid = document.querySelector('.cards-grid'); // تغيير من getElementById إلى querySelector
    if (!cardsGrid) {
        console.error('لم يتم العثور على عنصر .cards-grid');
        return;
    }
    
    cardsGrid.innerHTML = '';
    pages.forEach((page, index) => {
        const card = createCard(page, index);
        cardsGrid.appendChild(card);
    });
}

// إنشاء بطاقة
function createCard(page, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-page-id', page.id);
    card.style.animationDelay = `${index * 0.1}s`;
    
    const featuresHTML = page.features.map(feature =>
        `<li>${feature}</li>`
    ).join('');
    
    card.innerHTML = `
        <div class="card-icon">
            <i class="${page.icon}"></i>
        </div>
        <h3 class="card-title">${page.title}</h3>
        <p class="card-description">${page.description}</p>
        <ul class="card-features">
            ${featuresHTML}
        </ul>
        <div class="card-footer">
            <button class="card-btn" onclick="openModal('${page.url}', '${page.title.replace(/'/g, "\\'")}')">
                <i class="fas fa-eye"></i>
                عرض الصفحة
            </button>
        </div>
    `;
    
    // إضافة حدث النقر على البطاقة
    card.addEventListener('click', function(e) {
        if (!e.target.closest('.card-btn')) {
            openModal(page.url, page.title);
        }
    });
    
    return card;
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    const modalOverlay = document.getElementById('modalOverlay');
    
    if (!modalOverlay) {
        console.error('لم يتم العثور على عنصر modalOverlay');
        return;
    }
    
    // إغلاق عند النقر خارج النافذة
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModalWindow();
        }
    });
    
    // إغلاق بمفتاح Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModalWindow();
        }
    });
    
    // زر فتح في نافذة جديدة
    const openInNewTabBtn = document.querySelector('.btn-primary');
    if (openInNewTabBtn) {
        openInNewTabBtn.addEventListener('click', function() {
            if (currentPageUrl) {
                window.open(currentPageUrl, '_blank');
            }
        });
    }
}

// فتح النافذة المنبثقة
function openModal(url, title) {
    currentPageUrl = url;
    currentPageTitle = title;
    
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalFrame = document.getElementById('modalFrame');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    if (!modalOverlay || !modalTitle || !modalFrame || !loadingOverlay) {
        console.error('لم يتم العثور على عناصر النافذة المنبثقة');
        return;
    }
    
    modalTitle.textContent = title;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // إظهار شاشة التحميل
    loadingOverlay.style.display = 'flex';
    
    // تحميل الصفحة
    modalFrame.src = url;
    
    // إخفاء شاشة التحميل عند اكتمال التحميل
    modalFrame.onload = function() {
        loadingOverlay.style.display = 'none';
    };
    
    // إخفاء شاشة التحميل بعد 5 ثوان في حالة عدم التحميل
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
    }, 5000);
}

// إغلاق النافذة المنبثقة
function closeModalWindow() {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalFrame = document.getElementById('modalFrame');
    
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // تأخير إزالة المحتوى لإتمام الرسوم المتحركة
    setTimeout(() => {
        if (modalFrame) {
            modalFrame.src = '';
        }
    }, 300);
}

// دالة إغلاق للاستخدام في HTML
function closeModal() {
    closeModalWindow();
}

// إضافة تأثيرات إضافية للبطاقات
function addCardAnimations() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in-up');
    });
}

// تأثير الظهور التدريجي للبطاقات
function observeCards() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.card').forEach(card => {
        observer.observe(card);
    });
}

// تشغيل التأثيرات عند تحميل الصفحة
window.addEventListener('load', function() {
    addCardAnimations();
    observeCards();
});

// إضافة وظائف البحث
function addSearchFunctionality() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.style.cssText = `
        margin-top: 20px;
        text-align: center;
    `;
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'ابحث عن صفحة...';
    searchInput.className = 'search-input';
    searchInput.style.cssText = `
        padding: 12px 20px;
        border: 2px solid #333;
        border-radius: 25px;
        background: #1a1a1a;
        color: white;
        font-size: 1rem;
        width: 300px;
        max-width: 100%;
        transition: all 0.3s ease;
    `;
    
    searchContainer.appendChild(searchInput);
    header.appendChild(searchContainer);
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        filterCards(searchTerm);
    });
    
    searchInput.addEventListener('focus', function() {
        this.style.borderColor = '#00d4ff';
        this.style.boxShadow = '0 0 10px rgba(0, 212, 255, 0.3)';
    });
    
    searchInput.addEventListener('blur', function() {
        this.style.borderColor = '#333';
        this.style.boxShadow = 'none';
    });
}

// تصفية البطاقات
function filterCards(searchTerm) {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const description = card.querySelector('.card-description').textContent.toLowerCase();
        const features = Array.from(card.querySelectorAll('.card-features li'))
            .map(li => li.textContent.toLowerCase())
            .join(' ');
        
        if (title.includes(searchTerm) || description.includes(searchTerm) || features.includes(searchTerm)) {
            card.style.display = 'block';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        } else {
            card.style.display = 'none';
        }
    });
}

// تشغيل الوظائف الإضافية
setTimeout(() => {
    addSearchFunctionality();
}, 1000);
