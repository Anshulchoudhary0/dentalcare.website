
const navbar  = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

// Sticky shadow on scroll
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile menu toggle
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const bars = hamburger.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    bars[0].style.transform = 'translateY(7px) rotate(45deg)';
    bars[1].style.opacity   = '0';
    bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
  }
});

// Close menu when a link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    const bars = hamburger.querySelectorAll('span');
    bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
  });
});

// Active link highlight based on scroll position
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - (navbar.offsetHeight + 40);
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
});


/* =========================================
   2. SCROLL ANIMATIONS — Intersection Observer
   ========================================= */
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el    = entry.target;
      const delay = el.dataset.delay || 0;
      setTimeout(() => el.classList.add('animated'), parseInt(delay));
      animObserver.unobserve(el);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('[data-animate]').forEach(el => animObserver.observe(el));


/* =========================================
   3. COUNTER ANIMATION
   ========================================= */
function animateCount(el, target, duration = 1800) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start).toLocaleString();
    }
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      animateCount(el, parseInt(el.dataset.count));
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-count]').forEach(el => counterObserver.observe(el));


/* =========================================
   4. TESTIMONIALS SLIDER  (fixed)
   ========================================= */
const track    = document.getElementById('testimonialTrack');
const cards    = document.querySelectorAll('.testimonial-card');
const dotsWrap = document.getElementById('testiDots');
const prevBtn  = document.getElementById('testiPrev');
const nextBtn  = document.getElementById('testiNext');

const GAP = 24; // must match CSS gap value in px
let currentSlide = 0;
let autoSlideTimer;

/* How many cards fit side-by-side */
function visibleCount() {
  return window.innerWidth < 768 ? 1 : 3;
}

/* Total number of slide "pages" */
function totalSlides() {
  return Math.ceil(cards.length / visibleCount());
}

/* Set each card's pixel width so the maths works out exactly */
function setCardWidths() {
  const vc          = visibleCount();
  const wrapperW    = track.parentElement.offsetWidth;          // wrapper width
  const totalGap    = GAP * (vc - 1);                          // gaps between visible cards
  const cardW       = Math.floor((wrapperW - totalGap) / vc);  // each card's exact width
  cards.forEach(c => {
    c.style.width    = cardW + 'px';
    c.style.minWidth = cardW + 'px';
  });
  return cardW;
}

/* Rebuild the navigation dots */
function buildDots() {
  dotsWrap.innerHTML = '';
  for (let i = 0; i < totalSlides(); i++) {
    const dot = document.createElement('div');
    dot.className = 'testi-dot' + (i === currentSlide ? ' active' : '');
    dot.addEventListener('click', () => { resetAutoSlide(); goToSlide(i); });
    dotsWrap.appendChild(dot);
  }
}

function updateDots() {
  dotsWrap.querySelectorAll('.testi-dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentSlide);
  });
}

/* Core slide function — now uses correct pixel offset */
function goToSlide(index) {
  const total = totalSlides();
  currentSlide = ((index % total) + total) % total; // wrap around safely

  const cardW   = cards[0].offsetWidth;              // real rendered width
  const step    = cardW + GAP;                       // one card + one gap
  const vc      = visibleCount();
  const offset  = currentSlide * vc * step;          // ✅ correct: slide by a full "page"

  track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
  track.style.transform  = `translateX(-${offset}px)`;
  updateDots();
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide()  { goToSlide(currentSlide - 1); }

nextBtn.addEventListener('click', () => { resetAutoSlide(); nextSlide(); });
prevBtn.addEventListener('click', () => { resetAutoSlide(); prevSlide(); });

function startAutoSlide() {
  autoSlideTimer = setInterval(nextSlide, 5000);
}
function resetAutoSlide() {
  clearInterval(autoSlideTimer);
  startAutoSlide();
}

/* Touch / swipe support */
let touchStartX = 0;
track.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });
track.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    resetAutoSlide();
    diff > 0 ? nextSlide() : prevSlide();
  }
});

/* Init — run after DOM is painted so offsetWidth is reliable */
function initSlider() {
  setCardWidths();
  buildDots();
  goToSlide(0);
  startAutoSlide();
}

/* Re-init on resize */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    track.style.transition = 'none'; // no animation during resize
    setCardWidths();
    buildDots();
    goToSlide(0);
  }, 200);
});

// Wait for fonts + layout before measuring widths
if (document.readyState === 'complete') {
  initSlider();
} else {
  window.addEventListener('load', initSlider);
}


/* =========================================
   5. BACK-TO-TOP BUTTON
   ========================================= */
const backBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  backBtn.classList.toggle('visible', window.scrollY > 400);
});

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


/* =========================================
   6. TOAST NOTIFICATION HELPER
   ========================================= */
function showToast(message, duration = 3500) {
  const toast   = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  toastMsg.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}


/* =========================================
   7. BOOK APPOINTMENT (Quick Form)
   ========================================= */
function bookAppointment() {
  const fields = document.querySelectorAll('.qa-field input, .qa-field select');
  let allFilled = true;

  fields.forEach(f => {
    const val = f.value.trim();
    if (!val || val === 'Preferred Time' || val === '') {
      f.style.borderColor = '#EF4444';
      allFilled = false;
    } else {
      f.style.borderColor = '';
    }
  });

  if (!allFilled) {
    showToast('⚠️  Please fill in all appointment fields.');
    return;
  }

  // Simulate booking submission
  const btn = document.querySelector('.qa-btn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-check"></i> Booked!';
    showToast('✅  Appointment booked successfully! We\'ll call you shortly.');
    fields.forEach(f => f.value = '');
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 3000);
  }, 1500);
}


/* =========================================
   8. CONTACT FORM SUBMIT
   ========================================= */
function submitContact(event) {
  event.preventDefault();

  const form = document.getElementById('contactForm');
  const btn  = form.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;

  // Basic validation
  const name  = form.querySelector('input[type="text"]').value.trim();
  const email = form.querySelector('input[type="email"]').value.trim();

  if (!name || !email) {
    showToast('⚠️  Please fill in all required fields.');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('⚠️  Please enter a valid email address.');
    return;
  }

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
    showToast('📩  Message sent! We\'ll get back to you within 24 hours.');
    form.reset();
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 3000);
  }, 1800);
}


/* =========================================
   9. NEWSLETTER SUBSCRIBE
   ========================================= */
function subscribeNewsletter() {
  const input = document.querySelector('.newsletter-form input');
  const email = input.value.trim();

  if (!email) {
    showToast('⚠️  Please enter your email to subscribe.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('⚠️  Please enter a valid email address.');
    return;
  }

  showToast('🎉  You\'re subscribed! Welcome to DentaCare Pro.');
  input.value = '';
}


/* =========================================
   10. SMOOTH SCROLL FOR ALL ANCHOR LINKS
   ========================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = navbar.offsetHeight + 16;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


/* =========================================
   11. SERVICE CARD RIPPLE EFFECT
   ========================================= */
document.querySelectorAll('.service-card, .dentist-card, .blog-card').forEach(card => {
  card.addEventListener('click', function (e) {
    const ripple  = document.createElement('span');
    const rect    = this.getBoundingClientRect();
    const size    = Math.max(rect.width, rect.height);
    const x       = e.clientX - rect.left - size / 2;
    const y       = e.clientY - rect.top  - size / 2;

    ripple.style.cssText = `
      position:absolute; width:${size}px; height:${size}px;
      top:${y}px; left:${x}px;
      background:rgba(27,79,216,0.08);
      border-radius:50%; transform:scale(0);
      animation:rippleAnim 0.5s ease-out;
      pointer-events:none; z-index:0;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });
});

// Inject ripple keyframes
const styleEl = document.createElement('style');
styleEl.textContent = `@keyframes rippleAnim {
  to { transform: scale(2.5); opacity: 0; }
}`;
document.head.appendChild(styleEl);



/* =========================================
   12. LAZY-LOAD PLACEHOLDER SHIMMER
   ========================================= */
// Fixed the multi-line string and used classList for better performance
document.addEventListener("DOMContentLoaded", () => {
  const placeholders = document.querySelectorAll(
    '.hero-img-placeholder, .about-img-placeholder, .service-img-placeholder, .dentist-placeholder, .blog-img-placeholder'
  );

  placeholders.forEach(el => {
    el.classList.add('shimmer-effect');
  });
});
 
const shimmerStyle = document.createElement('style');
shimmerStyle.textContent = `@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}`;
document.head.appendChild(shimmerStyle);


/* =========================================
   13. PAGE LOAD — initial reveal
   ========================================= */
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });
});

console.log(
  '%c DentaCare Pro 🦷 ',
  'background:#1B4FD8;color:#fff;font-size:14px;padding:6px 12px;border-radius:8px;font-weight:bold;'
);
