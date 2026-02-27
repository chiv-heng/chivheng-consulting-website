import './style.css'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby7eBONJCHKFYrDa1F67p6l97ip-sytogzAxAkV_MpvvgBbdL78_lBA6mEt6EZJdN-A/exec';

function clearSelect(select) {
  while (select.options.length > 0) {
    select.remove(0);
  }
}

function formatSessionDate(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

document.addEventListener('DOMContentLoaded', async () => {
  const sessionSelect = document.getElementById('workshop-session');
  const sessionNotice = document.getElementById('session-notice');
  const signupForm = document.getElementById('workshop-signup-form');
  let sessionsData = [];

  // Load workshop sessions from Google Sheets
  try {
    const res = await fetch(SCRIPT_URL);
    const data = await res.json();
    sessionsData = data.sessions || [];

    clearSelect(sessionSelect);
    const openSessions = sessionsData.filter(s => s.status !== 'CLOSED');

    if (openSessions.length > 0) {
      const placeholder = new Option('Select a session', '', true, true);
      placeholder.disabled = true;
      sessionSelect.appendChild(placeholder);

      openSessions.forEach(session => {
        const remaining = session.seats - session.registered;
        let label = session.displayName || session.name;
        if (remaining <= 4 && remaining > 0) {
          label += ' (few seats left)';
        }
        sessionSelect.appendChild(new Option(label, session.name));
      });
    } else {
      const noSessions = new Option('No sessions available', '', true, true);
      noSessions.disabled = true;
      sessionSelect.appendChild(noSessions);
      sessionSelect.disabled = true;
    }
  } catch {
    clearSelect(sessionSelect);
    const errorOption = new Option('Unable to load sessions', '', true, true);
    errorOption.disabled = true;
    sessionSelect.appendChild(errorOption);
    sessionSelect.disabled = true;
  }

  // Show session details when selected
  sessionSelect.addEventListener('change', () => {
    const selected = sessionsData.find(s => s.name === sessionSelect.value);
    if (selected) {
      const remaining = selected.seats - selected.registered;

      // Seat notice
      if (remaining <= 4 && remaining > 0) {
        sessionNotice.textContent = 'Space is limited, only a couple of seats remain.';
        sessionNotice.classList.remove('is-hidden');
      } else {
        sessionNotice.classList.add('is-hidden');
      }

    } else {
      sessionNotice.classList.add('is-hidden');
    }
  });

  // Handle form submission
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = signupForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;

      // Honeypot check
      const honeypot = signupForm.querySelector('[name="website"]').value;
      if (honeypot) {
        signupForm.classList.add('is-hidden');
        document.getElementById('signup-form-success').classList.remove('is-hidden');
        return;
      }

      const formData = {
        form_type: 'Sign-up',
        name: signupForm.querySelector('[name="name"]').value,
        email: signupForm.querySelector('[name="email"]').value,
        role: signupForm.querySelector('[name="role"]').value,
        organization: signupForm.querySelector('[name="organization"]').value,
        workshop: signupForm.querySelector('[name="workshop"]').value,
      };

      try {
        const res = await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        const result = await res.json();

        if (result.result === 'error') {
          throw new Error(result.error || 'Registration failed');
        }

        signupForm.classList.add('is-hidden');

        if (result.result === 'waitlisted') {
          document.getElementById('signup-form-waitlisted').classList.remove('is-hidden');
        } else {
          document.getElementById('signup-form-success').classList.remove('is-hidden');
        }
      } catch {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        alert('Something went wrong. Please try again or email hello@chivheng.consulting directly.');
      }
    });
  }
});
