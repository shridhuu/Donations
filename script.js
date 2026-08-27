/* ==========================================================
   SHRIDHUU DONATE PAGE - JAVASCRIPT CONTROLLER
   Theme toggle, copy-to-clipboard, inline QR expand & Lucide init
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // --- 1. Theme Management (Dark / Light / System) ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const themeLabel = document.getElementById('theme-label');
  const htmlEl = document.documentElement;

  // Saved theme or default to dark
  let currentTheme = localStorage.getItem('fansub_theme') || 'dark';

  function applyTheme(theme) {
    let effectiveTheme = theme;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? 'dark' : 'light';
    }

    htmlEl.setAttribute('data-theme', effectiveTheme);
    localStorage.setItem('fansub_theme', theme);

    // Update Button Icon & Text
    if (themeToggleBtn && themeIcon && themeLabel) {
      if (theme === 'dark') {
        themeIcon.setAttribute('data-lucide', 'moon');
        themeLabel.textContent = 'Dark';
      } else if (theme === 'light') {
        themeIcon.setAttribute('data-lucide', 'sun');
        themeLabel.textContent = 'Light';
      } else {
        themeIcon.setAttribute('data-lucide', 'monitor');
        themeLabel.textContent = 'System';
      }
      if (window.lucide) {
        lucide.createIcons();
      }
    }
  }

  // Initial Theme Application
  applyTheme(currentTheme);

  // Cycle Theme on Toggle Click: dark -> light -> system -> dark
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      if (currentTheme === 'dark') {
        currentTheme = 'light';
      } else if (currentTheme === 'light') {
        currentTheme = 'system';
      } else {
        currentTheme = 'dark';
      }
      applyTheme(currentTheme);
    });
  }

  // Listen to OS System Theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'system') {
      applyTheme('system');
    }
  });


  // --- 2. Copy to Clipboard Functionality ---
  const toast = document.getElementById('toast');
  let toastTimeout;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2200);
  }

  function copyToClipboard(text, buttonEl) {
    if (!text) return;

    // Use Clipboard API with fallback
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => handleCopySuccess(buttonEl))
        .catch(() => fallbackCopy(text, buttonEl));
    } else {
      fallbackCopy(text, buttonEl);
    }
  }

  function fallbackCopy(text, buttonEl) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      handleCopySuccess(buttonEl);
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textArea);
  }

  function handleCopySuccess(buttonEl) {
    showToast('Copied to clipboard!');

    if (!buttonEl) return;
    const span = buttonEl.querySelector('span');
    const originalText = span ? span.textContent : 'Copy';

    buttonEl.classList.add('copied');
    if (span) span.textContent = 'Copied!';

    setTimeout(() => {
      buttonEl.classList.remove('copied');
      if (span) span.textContent = originalText;
    }, 1800);
  }

  // Attach Copy Event Listeners
  document.querySelectorAll('.btn-copy').forEach(button => {
    button.addEventListener('click', () => {
      const address = button.getAttribute('data-copy');
      copyToClipboard(address, button);
    });
  });


  // --- 3. Inline Expand QR Code Functionality ---
  function closeAllQrPanels() {
    document.querySelectorAll('.donate-row-wrapper').forEach(wrapper => {
      wrapper.classList.remove('qr-active');
      const panel = wrapper.querySelector('.qr-inline-panel');
      const qrBtn = wrapper.querySelector('.btn-qr');
      if (panel) panel.style.display = 'none';
      if (qrBtn) qrBtn.classList.remove('active');
    });
  }

  document.querySelectorAll('.btn-qr').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrapper = button.closest('.donate-row-wrapper');
      if (!wrapper) return;

      const panel = wrapper.querySelector('.qr-inline-panel');
      const qrTarget = wrapper.querySelector('.qr-code-target');
      const address = button.getAttribute('data-qr-address');

      const isAlreadyOpen = panel && panel.style.display !== 'none';

      // Close any open panel first
      closeAllQrPanels();

      // If it wasn't open before, expand it
      if (!isAlreadyOpen && panel && qrTarget && address) {
        // Clear previous QR canvas
        qrTarget.innerHTML = '';

        // Generate QR code using QRCode.js
        if (window.QRCode) {
          new QRCode(qrTarget, {
            text: address,
            width: 170,
            height: 170,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
          });
        } else {
          qrTarget.innerHTML = '<p style="color:#e63946; font-size:0.75rem;">QR code unavailable</p>';
        }

        panel.style.display = 'flex';
        wrapper.classList.add('qr-active');
        button.classList.add('active');
      }
    });
  });

});
