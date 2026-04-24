document.addEventListener('DOMContentLoaded', function () {

    // ============================================================
    // 1. SECTION SCROLL ANIMATE — fires once on enter, stays visible
    // ============================================================
    const scrollSections = document.querySelectorAll('.section-scroll-animate');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.querySelectorAll('.stagger-item').forEach(el => {
                    el.classList.add('stagger-visible');
                });
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    scrollSections.forEach(s => sectionObserver.observe(s));

    // ============================================================
    // 2. ACTIVE NAV LINK ON SCROLL
    // ============================================================
    const navLinks = document.querySelectorAll('nav a.nav-link[href^="#"]');
    const sections = ['home', 'about', 'portfolio', 'contact']
        .map(id => document.getElementById(id))
        .filter(Boolean);

    const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { threshold: 0.45 });
    sections.forEach(s => activeObserver.observe(s));

    // ============================================================
    // 3. HEADER DARKENS ON SCROLL
    // ============================================================
    const header = document.querySelector('header');
    function onScroll() {
        header.classList.toggle('scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ============================================================
    // 4. SCROLL PROGRESS BAR
    // ============================================================
    const progressBar = document.getElementById('scroll-progress');
    function updateProgress() {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
        if (progressBar) progressBar.style.width = progress + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });

    // ============================================================
    // 5. BACK-TO-TOP BUTTON
    // ============================================================
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    function toggleBackBtn() {
        backToHomeBtn.classList.toggle('visible', window.scrollY > 300);
    }
    if (backToHomeBtn) {
        window.addEventListener('scroll', toggleBackBtn, { passive: true });
        toggleBackBtn();
        backToHomeBtn.addEventListener('click', () => {
            document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // ============================================================
    // 6. SMOOTH SCROLL NAV LINKS
    // ============================================================
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            const target = document.getElementById(href.replace('#', ''));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
                closeMobileMenu();
            }
        });
    });

    // ============================================================
    // 7. MOBILE MENU — open / close with aria-expanded
    // ============================================================
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBtn    = document.getElementById('menuBtn');
    const closeBtn   = document.getElementById('mobileMenuClose');

    function openMobileMenu() {
        mobileMenu.classList.remove('-translate-y-full');
        mobileMenu.classList.add('translate-y-0');
        menuBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('translate-y-0');
        mobileMenu.classList.add('-translate-y-full');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('translate-y-0');
            isOpen ? closeMobileMenu() : openMobileMenu();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeMobileMenu);
    }

    // ============================================================
    // 8. TECH BADGE IMAGE SKELETON
    // ============================================================
    document.querySelectorAll('.tech-badge img').forEach(img => {
        img.classList.add('img-skeleton');
        img.addEventListener('load', () => img.classList.remove('img-skeleton'));
        img.addEventListener('error', () => { img.style.display = 'none'; });
    });

    // ============================================================
    // 9. CONTACT FORM — validation + Formspree submit
    // ============================================================
    const form       = document.getElementById('contactForm');
    const submitBtn  = document.getElementById('cf-submit');
    const submitText = document.getElementById('cf-submit-text');
    const spinner    = document.getElementById('cf-spinner');
    const successMsg = document.getElementById('cf-success');
    const errorMsg   = document.getElementById('cf-error');

    function validateField(input) {
        const errEl = input.parentElement.querySelector('.form-error');
        const valid = input.checkValidity();
        input.classList.toggle('input-error', !valid);
        if (errEl) errEl.classList.toggle('hidden', valid);
        return valid;
    }

    if (form) {
        form.querySelectorAll('input[required], textarea[required]').forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('input-error')) validateField(input);
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            let allValid = true;
            form.querySelectorAll('input[required], textarea[required]').forEach(input => {
                if (!validateField(input)) allValid = false;
            });
            if (!allValid) return;

            submitBtn.disabled = true;
            submitText.textContent = 'Sending…';
            spinner.classList.remove('hidden');
            successMsg.classList.add('hidden');
            errorMsg.classList.add('hidden');

            try {
                const res = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });
                if (res.ok) {
                    form.reset();
                    successMsg.classList.remove('hidden');
                } else {
                    errorMsg.classList.remove('hidden');
                }
            } catch {
                errorMsg.classList.remove('hidden');
            } finally {
                submitBtn.disabled = false;
                submitText.textContent = 'Send message';
                spinner.classList.add('hidden');
            }
        });
    }

    // ============================================================
    // 10. TYPEWRITER
    // ============================================================
    const typewriterEl = document.getElementById('typewriter');
    const words = ["a Full Stack Developer", "a Web Enthusiast", "a Problem Solver"];
    let wordIndex = 0, charIndex = 0, isDeleting = false;

    function type() {
        const word = words[wordIndex];
        typewriterEl.textContent = isDeleting
            ? word.substring(0, --charIndex)
            : word.substring(0, ++charIndex);

        let delay = 90;
        if (!isDeleting && charIndex === word.length) {
            delay = 1200; isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            delay = 500;
        }
        setTimeout(type, delay);
    }
    if (typewriterEl) type();

    // ============================================================
    // 11. FOOTER — dynamic year
    // ============================================================
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

});
