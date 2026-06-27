/* ================================================
   THEME TOGGLE
   ================================================ */
const body = document.body;
const saved = localStorage.getItem('sr-theme') || 'light';
body.setAttribute('data-theme', saved);

document.querySelectorAll('.theme-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const next = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', next);
    localStorage.setItem('sr-theme', next);
  });
});

/* ================================================
   NAVBAR SCROLL
   ================================================ */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* ================================================
   HAMBURGER MENU
   ================================================ */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });
}

/* ================================================
   ACTIVE NAV LINK
   ================================================ */
const currentFile = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  const href = a.getAttribute('href').split('/').pop();
  a.classList.toggle('active', href === currentFile);
});

/* ================================================
   SCROLL REVEAL
   — Elements already visible on page load get
     revealed immediately (no scroll needed).
   — Elements below the fold reveal on scroll.
   ================================================ */
let revealObserver = null;

function revealAll() {
  // Use requestAnimationFrame so layout/paint has settled before we
  // measure bounding boxes — measuring too early (e.g. before fonts/
  // images finish, or right as the intro is removed) can produce a
  // stale rect, which left elements stuck invisible until the user
  // scrolled away and back and re-triggered the observer.
  requestAnimationFrame(() => {
    const reveals = document.querySelectorAll('.reveal:not(.visible)');

    // 1. Immediately reveal anything already in the viewport right now
    reveals.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });

    // 2. Watch the rest with IntersectionObserver as user scrolls
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObserver.unobserve(e.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    }

    document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
  });
}

// Run once DOM is ready
revealAll();
// Safety net: in case fonts/images shift layout after initial paint,
// re-check once more shortly after load so nothing is missed.
window.addEventListener('load', () => revealAll());

/* ================================================
   INTRO SCREEN
   — Plays on every fresh load/refresh of index.html
   — Skips only when arriving via an in-site link click
     (flag is set right before navigating away, and is
     consumed/cleared immediately on the next page load —
     so a refresh, new tab, or direct visit always plays it)
   ================================================ */
const intro = document.getElementById('intro-screen');
if (intro) {
  const cameFromNavClick = sessionStorage.getItem('sr-nav-click') === '1';
  sessionStorage.removeItem('sr-nav-click'); // consume immediately so refresh always replays

  if (cameFromNavClick) {
    // Came from clicking a link on another page of this site — skip animation
    intro.remove();
    revealAll();
  } else {
    // Fresh load / refresh / direct visit — play the animation
    setTimeout(() => {
      intro.remove();
      // Re-run reveal after intro clears so hero content appears
      revealAll();
    }, 3800);
  }
}

// Mark "this was an in-site navigation" ONLY when an actual internal link
// is clicked — not on every unload (which also fires on refresh).
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  // Only treat same-site, non-anchor, non-new-tab links as "navigation"
  if (
    href &&
    !href.startsWith('#') &&
    !href.startsWith('http') &&
    !href.startsWith('mailto:') &&
    link.target !== '_blank'
  ) {
    sessionStorage.setItem('sr-nav-click', '1');
  }
});

/* ================================================
   CONTACT FORM
   ================================================ */
const form    = document.getElementById('contact-form');
const success = document.getElementById('form-success');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.style.display = 'none';
    if (success) success.style.display = 'block';
  });
}

/* ================================================
   SOCIAL WALL TABS
   ================================================ */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = document.getElementById('tab-' + target);
    if (panel) panel.classList.add('active');
  });
});

/* ================================================
   NEWSLETTER SIGNUP (Mailchimp)
   — Submits to Mailchimp in a hidden iframe so the
     visitor never leaves the page, then shows an
     on-page confirmation message styled to match
     the site instead of Mailchimp's own page.
   ================================================ */
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
  // Hidden iframe as the submit target — Mailchimp's response loads
  // there instead of opening a new tab or navigating away.
  const iframe = document.createElement('iframe');
  iframe.name = 'mc-submit-frame';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  newsletterForm.setAttribute('target', 'mc-submit-frame');

  const msg = document.getElementById('newsletter-msg');
  const submitBtn = newsletterForm.querySelector('button[type="submit"]');

  newsletterForm.addEventListener('submit', () => {
    // We can't read Mailchimp's cross-origin response, so we optimistically
    // show success after a short delay (the request still completes normally).
    if (submitBtn) {
      submitBtn.textContent = 'Subscribed ✓';
      submitBtn.style.background = 'var(--teal)';
      submitBtn.disabled = true;
    }
    if (msg) {
      msg.textContent = "Thank you — please check your inbox to confirm your subscription.";
      msg.style.display = 'block';
    }
  });
}
