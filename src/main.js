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

  // 3. Workshop Form Submission (Google Sheets)
  const workshopForm = document.getElementById('workshop-interest-form');
  if (workshopForm) {
    workshopForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = workshopForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;

      // Honeypot spam check — if filled, silently "succeed" without submitting
      const honeypot = workshopForm.querySelector('[name="website"]').value;
      if (honeypot) {
        workshopForm.classList.add('is-hidden');
        document.getElementById('workshop-form-success').classList.remove('is-hidden');
        return;
      }

      const formData = {
        name: workshopForm.querySelector('[name="name"]').value,
        email: workshopForm.querySelector('[name="email"]').value,
        organization: workshopForm.querySelector('[name="organization"]').value,
        participation_type: workshopForm.querySelector('[name="participation_type"]').value,
      };

      // Track with Zaraz
      trackEvent('sign_up', {
        method: 'workshop_form',
        organization: formData.organization,
        participation_type: formData.participation_type
      });

      try {
        await fetch('https://script.google.com/macros/s/AKfycby7eBONJCHKFYrDa1F67p6l97ip-sytogzAxAkV_MpvvgBbdL78_lBA6mEt6EZJdN-A/exec', {
          method: 'POST',
          body: JSON.stringify(formData),
        });

        workshopForm.classList.add('is-hidden');
        document.getElementById('workshop-form-success').classList.remove('is-hidden');
      } catch (error) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        alert('Something went wrong. Please try again or email hello@chivheng.consulting directly.');
      }
    });
  }

  // 4. Resources Lead Magnet Form
  const resourcesForm = document.getElementById('resources-lead-form');
  if (resourcesForm) {
    resourcesForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = resourcesForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Accessing...';
      submitBtn.disabled = true;

      // Honeypot check
      const honeypot = resourcesForm.querySelector('[name="website"]').value;
      if (honeypot) {
        document.getElementById('resources-lead-capture').classList.add('is-hidden');
        document.getElementById('resources-unlocked').classList.remove('is-hidden');
        return;
      }

      const formData = {
        name: resourcesForm.querySelector('[name="name"]').value,
        email: resourcesForm.querySelector('[name="email"]').value,
        form_type: resourcesForm.querySelector('[name="form_type"]').value,
      };

      // Track with Zaraz
      trackEvent('generate_lead', {
        method: 'resources_form'
      });

      try {
        await fetch('https://script.google.com/macros/s/AKfycby7eBONJCHKFYrDa1F67p6l97ip-sytogzAxAkV_MpvvgBbdL78_lBA6mEt6EZJdN-A/exec', {
          method: 'POST',
          body: JSON.stringify(formData),
        });

        // Hide form, reveal resources
        document.getElementById('resources-lead-capture').classList.add('is-hidden');
        document.getElementById('resources-unlocked').classList.remove('is-hidden');
      } catch (error) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        alert('Something went wrong. Please try again or email hello@chivheng.consulting directly.');
      }
    });
  }

  // 5. Track External Contact Links (LinkedIn)
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
