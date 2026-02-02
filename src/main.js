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

  // --- Cloudflare Zaraz Event Tracking ---
  const trackEvent = (eventName, params = {}) => {
    if (typeof zaraz !== 'undefined' && typeof zaraz.track === 'function') {
      zaraz.track(eventName, params);
    } else {
      console.warn('Zaraz is not loaded. Event not tracked:', eventName, params);
    }
  };

  // 1. Track CTA Button Clicks
  const ctaButtons = document.querySelectorAll('.btn-primary, .btn-ghost');
  ctaButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const buttonText = button.textContent.trim();
      const sectionId = button.closest('section')?.id || 'nav';
      trackEvent('generate_lead', {
        button_text: buttonText,
        button_location: sectionId
      });
    });
  });

  // 2. Track Resource Link Clicks
  const resourceLinks = document.querySelectorAll('.resource-link, .sample-link');
  resourceLinks.forEach(link => {
    link.addEventListener('click', () => {
      const linkText = link.textContent.trim();
      trackEvent('select_content', {
        content_type: 'resource',
        item_id: linkText,
        link_url: link.href
      });
    });
  });

  // 3. Track Workshop Form Submissions
  const workshopForm = document.querySelector('.workshop-form');
  if (workshopForm) {
    workshopForm.addEventListener('submit', () => {
      const org = workshopForm.querySelector('[name="organization"]')?.value;
      const type = workshopForm.querySelector('[name="participation_type"]')?.value;
      trackEvent('sign_up', {
        method: 'workshop_form',
        organization: org,
        participation_type: type
      });
    });
  }

  // 4. Track External Contact Links (LinkedIn)
  const externalLinks = document.querySelectorAll('a[href*="linkedin.com"], a[href^="mailto:"]');
  externalLinks.forEach(link => {
    link.addEventListener('click', () => {
      trackEvent('click', {
        link_url: link.href,
        link_text: link.textContent.trim()
      });
    });
  });

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
