// Rate Limiting & Storage State
let failedAttempts = 0;
let isLockedOut = false;

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  loadSavedEmail();
});

// Golden Ember Particle System
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: 45 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 0.5,
    dY: Math.random() * 0.5 + 0.1,
    dX: (Math.random() - 0.5) * 0.3,
    alpha: Math.random() * 0.5 + 0.2
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
      ctx.fill();

      p.y -= p.dY;
      p.x += p.dX;

      if (p.y < 0) {
        p.y = canvas.height;
        p.x = Math.random() * canvas.width;
      }
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// Background Video Toggle
function toggleVideoPlayback() {
  const video = document.getElementById('bg-video');
  const btn = document.getElementById('toggle-video-btn');
  if (video.paused) {
    video.play();
    btn.textContent = '⏸';
    btn.setAttribute('aria-label', 'Pause background video');
  } else {
    video.pause();
    btn.textContent = '▶';
    btn.setAttribute('aria-label', 'Play background video');
  }
}

// Tab Switching
function switchTab(mode) {
  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');
  const tabSignin = document.getElementById('tab-signin');
  const tabSignup = document.getElementById('tab-signup');
  const headerSubtitle = document.getElementById('header-subtitle');
  const footerText = document.getElementById('footer-text');

  clearErrors();

  if (mode === 'signin') {
    signinForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    tabSignin.classList.add('active');
    tabSignin.setAttribute('aria-selected', 'true');
    tabSignup.classList.remove('active');
    tabSignup.setAttribute('aria-selected', 'false');
    headerSubtitle.textContent = 'Enter your credentials to access your portal';
    footerText.innerHTML = `Don't have an account? <a href="#" class="create-account" onclick="switchTab('signup'); return false;">Create an account</a>`;
  } else {
    signupForm.classList.remove('hidden');
    signinForm.classList.add('hidden');
    tabSignup.classList.add('active');
    tabSignup.setAttribute('aria-selected', 'true');
    tabSignin.classList.remove('active');
    tabSignin.setAttribute('aria-selected', 'false');
    headerSubtitle.textContent = 'Create your account to join Aureus';
    footerText.innerHTML = `Already have an account? <a href="#" class="create-account" onclick="switchTab('signin'); return false;">Sign In</a>`;
  }
}

// Password Visibility Toggle with Accessibility
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  const isSecret = input.type === 'password';
  input.type = isSecret ? 'text' : 'password';
  btn.style.color = isSecret ? 'var(--gold-primary)' : 'var(--text-muted)';
  btn.setAttribute('aria-expanded', isSecret);
  btn.setAttribute('aria-label', isSecret ? 'Hide password' : 'Show password');
}

// Live Validation Helpers
function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function validateInput(inputEl, validatorFn) {
  const group = inputEl.closest('.field-group');
  const statusIcon = group.querySelector('.status-icon');
  const value = inputEl.value;

  if (value.length === 0) {
    inputEl.classList.remove('valid', 'invalid');
    if (statusIcon) statusIcon.className = 'status-icon';
    return;
  }

  const isValid = validatorFn(value);
  if (isValid) {
    inputEl.classList.add('valid');
    inputEl.classList.remove('invalid');
    if (statusIcon) statusIcon.className = 'status-icon valid';
  } else {
    inputEl.classList.add('invalid');
    inputEl.classList.remove('valid');
    if (statusIcon) statusIcon.className = 'status-icon invalid';
  }
}

function onSignUpPasswordInput(val) {
  const inputEl = document.getElementById('signup-password');
  checkPasswordStrength(val);
  validateInput(inputEl, v => v.length >= 8);
}

function validateConfirmPassword(inputEl) {
  const passVal = document.getElementById('signup-password').value;
  validateInput(inputEl, val => val.length > 0 && val === passVal);
}

// Password Strength Meter
function checkPasswordStrength(val) {
  const bar = document.getElementById('strength-bar');
  let score = 0;

  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  if (val.length === 0) {
    bar.style.width = '0%';
  } else if (score <= 1) {
    bar.style.width = '25%';
    bar.style.backgroundColor = '#ff5252';
  } else if (score === 2 || score === 3) {
    bar.style.width = '65%';
    bar.style.backgroundColor = '#ffa500';
  } else {
    bar.style.width = '100%';
    bar.style.backgroundColor = '#2ed573';
  }
}

// Storage Handling for "Remember Device"
function saveEmail(email) {
  localStorage.setItem('aureus_remembered_email', email);
}

function loadSavedEmail() {
  const saved = localStorage.getItem('aureus_remembered_email');
  if (saved) {
    const input = document.getElementById('signin-email');
    const checkbox = document.getElementById('remember-me');
    if (input && checkbox) {
      input.value = saved;
      checkbox.checked = true;
      validateInput(input, validateEmail);
    }
  }
}

// Error Clearing & Notifications
function showError(inputId, errId, message) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(errId);
  input.classList.add('invalid');
  if (err) err.textContent = message;
}

function clearErrors() {
  document.querySelectorAll('.invalid, .valid').forEach(el => el.classList.remove('invalid', 'valid'));
  document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
  document.querySelectorAll('.status-icon').forEach(el => el.className = 'status-icon');
  hideToast();
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast-message');
  toast.textContent = msg;
  toast.className = `toast ${type}`;
}

function hideToast() {
  const toast = document.getElementById('toast-message');
  toast.className = 'toast hidden';
}

// Simulated Cooldown Rate Limiter
function triggerCooldown() {
  isLockedOut = true;
  const banner = document.getElementById('cooldown-banner');
  const timerEl = document.getElementById('cooldown-timer');
  let timeLeft = 30;

  banner.classList.remove('hidden');
  document.querySelectorAll('.submit-btn').forEach(btn => btn.disabled = true);

  const interval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(interval);
      isLockedOut = false;
      failedAttempts = 0;
      banner.classList.add('hidden');
      document.querySelectorAll('.submit-btn').forEach(btn => btn.disabled = false);
    }
  }, 1000);
}

// Loading Spinner Handler
function toggleLoading(btnId, isLoading) {
  const btn = document.getElementById(btnId);
  const text = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');
  const arrow = btn.querySelector('.btn-arrow');

  btn.disabled = isLoading;
  if (isLoading) {
    text.classList.add('hidden');
    arrow.classList.add('hidden');
    spinner.classList.remove('hidden');
  } else {
    text.classList.remove('hidden');
    arrow.classList.remove('hidden');
    spinner.classList.add('hidden');
  }
}

// Form Handlers
function handleSignIn(e) {
  e.preventDefault();
  if (isLockedOut) return;

  clearErrors();
  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;
  const remember = document.getElementById('remember-me').checked;

  let isValid = true;

  if (!validateEmail(email)) {
    showError('signin-email', 'signin-email-err', 'Please enter a valid email address');
    isValid = false;
  }

  if (!password) {
    showError('signin-password', 'signin-password-err', 'Password is required');
    isValid = false;
  }

  if (!isValid) return;

  toggleLoading('signin-submit', true);

  setTimeout(() => {
    toggleLoading('signin-submit', false);

    if (password !== 'aureus123') { // Demo credentials test
      failedAttempts++;
      showToast(`Invalid credentials. Attempt ${failedAttempts}/5`, 'error');
      if (failedAttempts >= 5) {
        triggerCooldown();
      }
    } else {
      if (remember) saveEmail(email);
      showToast('Signed in successfully! Redirecting...', 'success');
    }
  }, 1200);
}

function handleSignUp(e) {
  e.preventDefault();
  if (isLockedOut) return;

  clearErrors();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm-password').value;
  const terms = document.getElementById('accept-terms').checked;

  let isValid = true;

  if (name.length < 3) {
    showError('signup-name', 'signup-name-err', 'Full name required');
    isValid = false;
  }

  if (!validateEmail(email)) {
    showError('signup-email', 'signup-email-err', 'Valid email required');
    isValid = false;
  }

  if (password.length < 8) {
    showError('signup-password', 'signup-password-err', 'Password must be at least 8 characters');
    isValid = false;
  }

  if (password !== confirm) {
    showError('signup-confirm-password', 'signup-confirm-err', 'Passwords do not match');
    isValid = false;
  }

  if (!terms) {
    showToast('You must accept the terms of service', 'error');
    isValid = false;
  }

  if (!isValid) return;

  toggleLoading('signup-submit', true);

  setTimeout(() => {
    toggleLoading('signup-submit', false);
    showToast('Account created successfully!', 'success');
  }, 1200);
}

function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('signin-email').value.trim();
  if (!validateEmail(email)) {
    showError('signin-email', 'signin-email-err', 'Enter email to receive reset link');
  } else {
    showToast(`Password reset link sent to ${email}`, 'success');
  }
}

function triggerSocialAuth(provider) {
  showToast(`Redirecting to ${provider} authentication...`, 'success');
}