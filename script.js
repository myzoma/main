// بيانات الصفحات - يمكنك تعديلها حسب احتياجاتك
const pages = [
    {
        id: 1,
        title: "الصفحة الرئيسية",
        description: "الصفحة الرئيسية للموقع تحتوي على نظرة عامة شاملة",
        icon: "fas fa-home",
        url: "https://edraone.blogspot.com/", // ضع رابط صفحتك هنا
        features: [
            "اافضل 60 عملة",
            "من حيث السيولة",
            "صفقات الشراء",
            "من حيث اختراق المقاومات"
        ]
    },
    {
        id: 2,
        title: "من نحن",
        description: "تعرف على فريقنا ورؤيتنا ورسالتنا",
        icon: "fas fa-exchange-alt",
        url: "https://myzoma.github.io/pivot/",
        features: [
            "معلومات شاملة عن الشركة",
            "تاريخ وإنجازات",
            "فريق العمل",
            "القيم والمبادئ"
        ]
    },
    { id: 3,
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
        title: "االقيمة السوقية للعملات",
        description: "معلومات شاملة عن العملات",
        icon: "fas fa-phone",
        url: "pages/contact.html",
        features: [
            "أعلى 4 عملات من حيث القيمة السوقية",
"أدنى 4 عملات من حيث القيمة السوقية",
            "أعلى 4 عملات من حيث العدد المعروض",
"أدنى 4 عملات من حيث العدد المعروض",
            "أعلى 4 عملات من حيث النشاط المجتمعي",
    
        ]
    },
    {
        id: 7,
        title: "المعرض",
        description: "شاهد معرض الصور والأعمال",
        icon: "fas fa-images",
        url: "pages/gallery.html",
        features: [
            "صور عالية الجودة",
            "عرض تفاعلي",
            "تصنيفات متنوعة",
            "تحميل سريع"
        ]
    },
    {
        id: 8,
        title: "الأسئلة الشائعة",
        description: "إجابات على الأسئلة الأكثر شيوعاً",
        icon: "fas fa-question-circle",
        url: "pages/faq.html",
        features: [
            "أسئلة شاملة",
            "إجابات مفصلة",
            "بحث سريع",
            "تحديث مستمر"
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
    const cardsGrid = document.getElementById('cardsGrid');
    cardsGrid.innerHTML = '';

    pages.forEach(page => {
        const card = createCard(page);
        cardsGrid.appendChild(card);
    });
}

// إنشاء بطاقة
function createCard(page) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-page-id', page.id);
    
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
            <button class="card-btn" onclick="openModal('${page.url}', '${page.title}')">
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
    const closeBtn = document.getElementById('closeBtn');
    const closeModal = document.getElementById('closeModal');
    const openInNewTab = document.getElementById('openInNewTab');

    // إغلاق النافذة المنبثقة
    closeBtn.addEventListener('click', closeModalWindow);
    closeModal.addEventListener('click', closeModalWindow);
    
    // إغلاق عند النقر خارج النافذة
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModalWindow();
        }
    });

    // فتح في تبويب جديد
    openInNewTab.addEventListener('click', function() {
        if (currentPageUrl) {
            window.open(currentPageUrl, '_blank');
        }
    });

    // إغلاق بمفتاح Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModalWindow();
        }
    });
}

// فتح النافذة المنبثقة
function openModal(url, title) {
    currentPageUrl = url;
    currentPageTitle = title;
    
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalFrame = document.getElementById('modalFrame');

    modalTitle.textContent = title;
    modalFrame.src = url;
    
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // إضافة تأثير التحميل
    showLoadingState();
    
    // إزالة تأثير التحميل عند اكتمال التحميل
    modalFrame.onload = function() {
        hideLoadingState();
    };
}

// إغلاق النافذة المنبثقة
function closeModalWindow() {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalFrame = document.getElementById('modalFrame');
    
    modalOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // تأخير إزالة المحتوى لإتمام الرسوم المتحركة
    setTimeout(() => {
        modalFrame.src = '';
    }, 300);
}

// عرض حالة التحميل
function showLoadingState() {
    const modalBody = document.querySelector('.modal-body');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-overlay';
    loadingDiv.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>جاري التحميل...</p>
        </div>
    `;
    modalBody.appendChild(loadingDiv);
}

// إخفاء حالة التحميل
function hideLoadingState() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
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

// إضافة وظائف إضافية للبحث والتصفية
function addSearchFunctionality() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'ابحث عن صفحة...';
    searchInput.className = 'search-input';
    
    const header = document.querySelector('.header');
    header.appendChild(searchInput);
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        filterCards(searchTerm);
    });
}

// تصفية البطاقات
function filterCards(searchTerm) {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const description = card.querySelector('.card-description').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
            card.classList.add('fade-in');
        } else {
            card.style.display = 'none';
        }
    });
}

// إضافة المزيد من الرسوم المتحركة
function addMoreAnimations() {
    // تأثير الجسيمات في الخلفية
    createParticles();
    
    // تأثير الموجة عند التمرير
    addScrollWaveEffect();
}

// إنشاء جسيمات متحركة في الخلفية
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    document.body.appendChild(particlesContainer);
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// تأثير الموجة عند التمرير
function addScrollWaveEffect() {
    let ticking = false;
    
    function updateCards() {
        const cards = document.querySelectorAll('.card');
        const scrollTop = window.pageYOffset;
        
        cards.forEach((card, index) => {
            const cardTop = card.offsetTop;
            const cardHeight = card.offsetHeight;
            const windowHeight = window.innerHeight;
            
            if (scrollTop + windowHeight > cardTop && scrollTop < cardTop + cardHeight) {
                const progress = (scrollTop + windowHeight - cardTop) / (windowHeight + cardHeight);
                const wave = Math.sin(progress * Math.PI * 2 + index * 0.5) * 10;
                card.style.transform = `translateY(${wave}px)`;
            }
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateCards);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// تشغيل الوظائف الإضافية
setTimeout(() => {
    addSearchFunctionality();
    addMoreAnimations();
}, 1000);
