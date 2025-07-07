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
            "من حيث اختراق المقاومات",
  "مدعوم بمؤشر ST,Yas-1 و ST,Yas-2",
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
            "تحديد القمم والقيعان التاريخية",
             "مدعوم بمؤشر ST,Yas-1 و ST,Yas-2",
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
            "الافضل من حيث المؤشرات الفنيه",
             "مدعوم بمؤشر ST,Yas-1 و ST,Yas-2",
        ]
    },
    {
        id: 4,
        title: "الصياد الذكي",
        description: "بوت استراتيجية خاصة لاكتشاف افضل الفرص في السوق",
        icon: "fa-solid fa-user-secret",
        url: "https://myzoma.github.io/bott/",
        features: [
            "فرص الشراء",
            "فرص البيع",
            "تحديد الاهداف",
            "تحديد وقف الخسارة",
            "فريمات متعددة",
             "مدعوم بمؤشر ST,Yas-1 و ST,Yas-2",
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
            "أعلى 4 عملات من حيث النشاط المجتمعي",
        ]
    },
    {
        id: 7,
        title: "مستويات الدعم والمقاومة",
        description: "تحديد مستويات الدعم والمقاومة آليا",
        icon: "fa-solid fa-not-equal",
        url: "https://myzoma.github.io/fep/",
        features: [
            "انسب فيبوناتشي",
            "تجديد نقاط الاختراقات",
            "تحديد نقاط كسر الدعم",
            "تحديد الاهداف الصاعدة",
            "تحديد قوة الاختراقات",
        ]
}
};

// متغيرات عامة
let currentPageUrl = '';
let currentPageTitle = '';

// تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    renderCards();
    setupEventListeners();
    setupFooterAnimations();
});

// رسم البطاقات
function renderCards() {
    const cardsGrid = document.querySelector('.cards-grid');
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
            closeModal();
        }
    });
    
    // إغلاق بمفتاح Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
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

// فتح النافذة المنبثقة العادية (للبطاقات)
function openModal(url, title) {
    currentPageUrl = url;
    currentPageTitle = title;
    
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalFrame = document.getElementById('modalFrame');
    const modalContent = document.getElementById('modalContent');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const externalBtn = document.querySelector('.btn-primary');
    
    if (!modalOverlay || !modalTitle || !modalFrame || !loadingOverlay) {
        console.error('لم يتم العثور على عناصر النافذة المنبثقة');
        return;
    }
    
    modalTitle.textContent = title;
    
    // إظهار الإطار وإخفاء المحتوى النصي
    modalFrame.style.display = 'block';
    if (modalContent) {
        modalContent.style.display = 'none';
    }
    
    // إظهار زر "فتح في نافذة جديدة"
    if (externalBtn) {
        externalBtn.style.display = 'inline-flex';
    }
    
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

// فتح نوافذ الفوتر (للمحتوى النصي)
function openFooterModal(title, type) {
    const modal = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalFrame = document.getElementById('modalFrame');
    const modalContent = document.getElementById('modalContent');
    const externalBtn = document.querySelector('.btn-primary');
    
    if (!modal || !modalTitle || !modalContent) {
        console.error('لم يتم العثور على عناصر النافذة المنبثقة');
        return;
    }
    
    modalTitle.textContent = title;
    
    // إخفاء الإطار وإظهار المحتوى النصي
    modalFrame.style.display = 'none';
    modalContent.style.display = 'block';
    
    // إخفاء زر "فتح في نافذة جديدة" للمحتوى النصي
    if (externalBtn) {
        externalBtn.style.display = 'none';
    }
    
    // محتوى كل صفحة
    let content = '';
    
    switch(type) {
        case 'site-policy':
            content = `
                <h3>سياسة الموقع</h3>
                <p>مرحباً بك في موقع CRYPTO YASER. باستخدامك لهذا الموقع، فإنك توافق على الشروط والأحكام التالية:</p>
                <ul>
                    <li>المحتوى المقدم هو لأغراض تعليمية فقط</li>
                    <li>التداول في العملات المشفرة ينطوي على مخاطر عالية</li>
                    <li>نحن لا نقدم نصائح استثمارية مالية</li>
                    <li>يجب عليك إجراء بحثك الخاص قبل اتخاذ أي قرارات استثمارية</li>
                    <li>الموقع محمي بحقوق الطبع والنشر</li>
                </ul>
                <p>نحتفظ بالحق في تعديل هذه السياسة في أي وقت دون إشعار مسبق.</p>
            `;
            break;
            
        case 'privacy-policy':
            content = `
                <h3>سياسة الخصوصية</h3>
                <p>نحن نحترم خصوصيتك ونلتزم بحماية معلوماتك الشخصية:</p>
                <ul>
                    <li>لا نجمع معلومات شخصية إلا بموافقتك</li>
                    <li>نستخدم ملفات تعريف الارتباط لتحسين تجربة المستخدم</li>
                    <li>لا نشارك معلوماتك مع أطراف ثالثة</li>
                    <li>نحمي بياناتك باستخدام أحدث تقنيات الأمان</li>
                    <li>يمكنك طلب حذف بياناتك في أي وقت</li>
                </ul>
                <p>للاستفسارات حول الخصوصية، يرجى التواصل معنا.</p>
            `;
            break;
            
        case 'contact-us':
            content = `
                <h3>اتصل بنا</h3>
                <p>نحن هنا لمساعدتك! يمكنك التواصل معنا من خلال:</p>
                <div style="text-align: center; margin: 2rem 0;">
                    <p><i class="fas fa-envelope" style="color: #007bff; margin-left: 10px;"></i> البريد الإلكتروني: info@cryptoyaser.com</p>
                    <p><i class="fab fa-telegram" style="color: #007bff; margin-left: 10px;"></i> تليجرام: @CryptoYaser</p>
                    <p><i class="fab fa-twitter" style="color: #007bff; margin-left: 10px;"></i> تويتر: @CryptoYaser</p>
                    <p><i class="fas fa-clock" style="color: #007bff; margin-left: 10px;"></i> أوقات العمل: 24/7</p>
                </div>
                <p>نحن نرد على جميع الاستفسارات خلال 24 ساعة. لا تتردد في التواصل معنا لأي استفسار أو اقتراح.</p>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <p style="margin: 0; color: #666;"><strong>ملاحظة:</strong> نحن لا نقدم نصائح استثمارية شخصية. جميع المحتوى المقدم هو لأغراض تعليمية فقط.</p>
                </div>
            `;
            break;
            
        default:
                       content = '<p>المحتوى غير متوفر حالياً.</p>';
    }
    
    modalContent.innerHTML = content;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// إغلاق النافذة المنبثقة (دالة موحدة)
function closeModal() {
    const modal = document.getElementById('modalOverlay');
    const modalFrame = document.getElementById('modalFrame');
    const modalContent = document.getElementById('modalContent');
    const externalBtn = document.querySelector('.btn-primary');
    
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // إعادة تعيين الحالة الافتراضية
    if (modalFrame) {
        modalFrame.style.display = 'block';
        // تأخير إزالة المحتوى لإتمام الرسوم المتحركة
        setTimeout(() => {
            modalFrame.src = '';
        }, 300);
    }
    
    if (modalContent) {
        modalContent.style.display = 'none';
        modalContent.innerHTML = '';
    }
    
    // إظهار زر "فتح في نافذة جديدة" مرة أخرى
    if (externalBtn) {
        externalBtn.style.display = 'inline-flex';
    }
    
    // إخفاء شاشة التحميل
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
    
    // إعادة تعيين المتغيرات
    currentPageUrl = '';
    currentPageTitle = '';
}

// إعداد تأثيرات الفوتر
function setupFooterAnimations() {
    // تأثير الظهور التدريجي للفوتر عند التمرير
    const footer = document.querySelector('.footer');
    
    if (footer) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const footerObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        footer.style.opacity = '0';
        footer.style.transform = 'translateY(30px)';
        footer.style.transition = 'all 0.6s ease';
        footerObserver.observe(footer);
    }
    
    // تأثير التحريك للروابط
    const footerLinks = document.querySelectorAll('.footer-link');
    footerLinks.forEach((link, index) => {
        link.style.animationDelay = `${index * 0.1}s`;
        link.classList.add('fade-in-up');
    });
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

// دالة البحث (اختيارية)
function addSearchFunctionality() {
    console.log('Search functionality initialized');
    // يمكنك إضافة وظيفة البحث هنا لاحقاً
}

// تشغيل التأثيرات عند تحميل الصفحة
window.addEventListener('load', function() {
    addCardAnimations();
    observeCards();
});

// تشغيل الوظائف الإضافية
setTimeout(() => {
    addSearchFunctionality();
}, 1000);

