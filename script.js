const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('#header');
const progress = document.querySelector('.progress');
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('#nav-menu');
const backTop = document.querySelector('.back-top');
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav-link')];

function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 20);
    if (backTop) backTop.classList.toggle('show', y > 600);
    
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) {
        progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    }

    sections.forEach(section => {
        const top = section.offsetTop - 130;
        const bottom = top + section.offsetHeight;
        if (y >= top && y < bottom) {
            navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${section.id}`));
        }
    });

    if (!prefersReduced) {
        document.querySelectorAll('[data-zoom]').forEach(el => {
            const rect = el.getBoundingClientRect();
            const visible = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
            el.style.transform = `scale(${0.94 + visible * 0.08})`;
        });
    }
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        const open = !navMenu.classList.contains('open');
        navMenu.classList.toggle('open', open);
        document.body.classList.toggle('menu-open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
    });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href === '#' || !href) return;
        const target = document.querySelector(href);
        if (!target) return;
        
        e.preventDefault();
        if (navMenu) navMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        
        const headerOffset = window.innerWidth <= 860 ? 68 : 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: prefersReduced ? 'auto' : 'smooth'
        });
    });
});

const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            if (entry.target.classList.contains('timeline')) entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
document.querySelectorAll('.reveal,.timeline').forEach(el => revealObserver.observe(el));

const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting || prefersReduced) return;
        const el = entry.target;
        const end = Number(el.dataset.count);
        let start = 0;
        const duration = 1200;
        const startTime = performance.now();
        function tick(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            el.textContent = Math.floor(start + (end - start) * progress);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
    });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// Portfolio Filter Buttons
const filterButtons = document.querySelectorAll('.filters button');
const portfolioCards = document.querySelectorAll('.portfolio-card');
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const filter = button.dataset.filter;
        portfolioCards.forEach(card => {
            const show = filter === 'all' || card.dataset.category === filter;
            card.classList.toggle('hide', !show);
        });
    });
});

// Allow clicking anywhere on a portfolio card to open the live site
portfolioCards.forEach(card => {
    card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return; // Already clicking the link
        const link = card.querySelector('.btn-project');
        if (link && link.href) {
            window.open(link.href, '_blank', 'noopener,noreferrer');
        }
    });
    card.style.cursor = 'pointer';
});

// FAQ Accordion
document.querySelectorAll('.faq-item button').forEach(button => {
    button.addEventListener('click', () => {
        const item = button.parentElement;
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(faq => {
            faq.classList.remove('open');
            const span = faq.querySelector('span');
            if (span) span.textContent = '+';
        });
        if (!isOpen) {
            item.classList.add('open');
            const span = button.querySelector('span');
            if (span) span.textContent = '−';
        }
    });
});

// Contact Form Validation & Feedback
const form = document.querySelector('#contact-form');
const message = document.querySelector('.form-message');
if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        const data = new FormData(form);
        const required = ['name', 'business', 'email', 'type', 'details'];
        let valid = true;
        form.querySelectorAll('input,select,textarea').forEach(field => field.removeAttribute('aria-invalid'));
        
        required.forEach(name => {
            const field = form.elements[name];
            if (field && !data.get(name).trim()) {
                valid = false;
                field.setAttribute('aria-invalid', 'true');
            }
        });
        
        const email = form.elements.email;
        if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            valid = false;
            email.setAttribute('aria-invalid', 'true');
        }
        
        if (message) {
            if (valid) {
                message.textContent = '✓ Thank you! Your project request has been received. We will connect shortly.';
                message.style.color = 'var(--success)';
                form.reset();
            } else {
                message.textContent = 'Please complete all required fields with a valid email address.';
                message.style.color = '#f87171';
            }
        }
    });
}

if (backTop) {
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));
}

// Custom Cursor for desktop
if (window.matchMedia('(pointer:fine)').matches && !prefersReduced) {
    const cursor = document.querySelector('.cursor');
    const dot = document.querySelector('.cursor-dot');
    if (cursor && dot) {
        let x = window.innerWidth / 2, y = window.innerHeight / 2, cx = x, cy = y;
        window.addEventListener('mousemove', e => {
            x = e.clientX; y = e.clientY;
            dot.style.left = `${x}px`; dot.style.top = `${y}px`;
            document.querySelectorAll('[data-parallax]').forEach(el => {
                const rect = el.getBoundingClientRect();
                const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
                const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
                el.style.transform = `translate3d(${dx * 14}px, ${dy * 14}px, 0)`;
            });
        });
        function animateCursor() {
            cx += (x - cx) * 0.16; cy += (y - cy) * 0.16;
            cursor.style.left = `${cx}px`; cursor.style.top = `${cy}px`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    }
}
