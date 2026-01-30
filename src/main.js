import './style.css'

// Scroll Reveal Animation
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Add a small delay based on index if siblings? 
      // For now simple reveal
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target); // Only animate once
    }
  });
}, observerOptions);

// Target elements to animate
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.hero-title, .hero-subtitle, .card, .step, .section-title, .value-item, .win-card, .cta-box');

  elements.forEach((el) => {
    el.classList.add('reveal-on-scroll');
    observer.observe(el);
  });

  console.log('Chiv Heng Consulting: Animations initialized');

  // Mobile Navigation Logic
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const body = document.body;

  if (mobileToggle && mobileMenu) {
    // Toggle Menu
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('is-active');
      mobileMenu.classList.toggle('is-active');
      body.classList.toggle('menu-open');
    });

    // Close menu when a link is clicked
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('is-active');
        mobileMenu.classList.remove('is-active');
        body.classList.remove('menu-open');
      });
    });
  }
});
