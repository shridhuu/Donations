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


  // --- 4. Monthly Goal Progress Bar ---
  const progressCard = document.getElementById('progressCard');
  if (progressCard) {
    const currentVal = parseFloat(progressCard.getAttribute('data-current') || '0');
    const targetVal = parseFloat(progressCard.getAttribute('data-target') || '20');
    const percentage = targetVal > 0 ? Math.min(100, Math.max(0, (currentVal / targetVal) * 100)) : 0;

    const progressAmountEl = progressCard.querySelector('.progress-amount');
    const progressPercentEl = progressCard.querySelector('.progress-percent');
    const progressFillEl = progressCard.querySelector('.progress-fill');

    if (progressAmountEl) {
      progressAmountEl.textContent = `$${currentVal} / $${targetVal}`;
    }
    if (progressPercentEl) {
      progressPercentEl.textContent = `${Math.round(percentage)}%`;
    }
    if (progressFillEl) {
      // Trigger animation on next frame
      requestAnimationFrame(() => {
        progressFillEl.style.width = `${percentage}%`;
      });
    }
  }


  // --- 5. Schedule Page Controller ---
  const dayTabsContainer = document.getElementById('dayTabs');
  const scheduleGrid = document.getElementById('scheduleGrid');

  if (dayTabsContainer && scheduleGrid) {
    const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'nonweekly'];
    const DAY_NAMES = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };
    const UTC_DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    let scheduleData = [];
    let activeDay = '';
    let countdownInterval = null;

    // Get current day key in UTC
    const currentUtcDayKey = UTC_DAY_KEYS[new Date().getUTCDay()];

    function formatLocalTime(utcTimeStr) {
      if (!utcTimeStr) return 'TBA';
      const [hours, minutes] = utcTimeStr.split(':').map(Number);
      const dummyDate = new Date();
      dummyDate.setUTCHours(hours, minutes, 0, 0);
      return dummyDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    function calculateNextReleaseDate(dayKey, utcTimeStr) {
      if (dayKey === 'nonweekly' || !utcTimeStr) return null;
      const targetDayNum = DAY_NAMES[dayKey];
      if (targetDayNum === undefined) return null;

      const [targetHours, targetMinutes] = utcTimeStr.split(':').map(Number);
      const now = new Date();

      // Start with current date in UTC
      const target = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        targetHours,
        targetMinutes,
        0,
        0
      ));

      // Calculate day difference
      const currentDayNum = now.getUTCDay();
      let dayDiff = targetDayNum - currentDayNum;

      if (dayDiff < 0) {
        dayDiff += 7;
      } else if (dayDiff === 0) {
        // Today! If past release by more than 1 hour (window), advance to next week
        const diffMs = target.getTime() - now.getTime();
        if (diffMs < -3600000) {
          dayDiff += 7;
        }
      }

      target.setUTCDate(target.getUTCDate() + dayDiff);
      return target;
    }

    function formatCountdown(targetDate) {
      if (!targetDate) return { text: 'Non-weekly', isNow: false };

      const now = new Date();
      const diffMs = targetDate.getTime() - now.getTime();

      // If within 1 hour after scheduled release time
      if (diffMs <= 0 && diffMs >= -3600000) {
        return { text: 'Releasing now', isNow: true };
      }

      if (diffMs < -3600000) {
        return { text: 'Releasing now', isNow: true };
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (days > 0) {
        return { text: `in ${days}d ${hours}h`, isNow: false };
      }
      if (hours > 0) {
        return { text: `in ${hours}h ${minutes}m`, isNow: false };
      }
      if (minutes > 0) {
        return { text: `in ${minutes}m ${seconds}s`, isNow: false };
      }
      return { text: `in ${seconds}s`, isNow: false };
    }

    function updateCountdowns() {
      const countdownElements = scheduleGrid.querySelectorAll('[data-target-timestamp]');
      countdownElements.forEach(el => {
        const timestamp = parseInt(el.getAttribute('data-target-timestamp'), 10);
        if (!timestamp) return;
        const targetDate = new Date(timestamp);
        const { text, isNow } = formatCountdown(targetDate);
        const textSpan = el.querySelector('.countdown-text');
        if (textSpan) {
          textSpan.textContent = text;
        }
        if (isNow) {
          el.classList.add('releasing-now');
        } else {
          el.classList.remove('releasing-now');
        }
      });
    }

    function renderDayTabs(availableDays) {
      dayTabsContainer.innerHTML = '';
      availableDays.forEach(day => {
        const btn = document.createElement('button');
        btn.className = `day-tab-btn ${day === activeDay ? 'active' : ''}`;
        btn.setAttribute('data-day', day);
        
        let labelText = day === 'nonweekly' ? 'Non-weekly' : day.charAt(0).toUpperCase() + day.slice(1);
        btn.textContent = labelText;

        // If today in UTC, add indicator dot
        if (day === currentUtcDayKey) {
          const dot = document.createElement('span');
          dot.className = 'day-dot';
          dot.title = 'Current UTC Day';
          btn.appendChild(dot);
        }

        btn.addEventListener('click', () => {
          if (activeDay === day) return;
          activeDay = day;
          document.querySelectorAll('.day-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderScheduleGrid();
        });

        dayTabsContainer.appendChild(btn);
      });
    }

    function renderScheduleGrid() {
      // Clear active interval
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }

      const filteredShows = scheduleData.filter(show => (show.day || '').toLowerCase() === activeDay.toLowerCase());

      if (filteredShows.length === 0) {
        scheduleGrid.innerHTML = `
          <div class="schedule-empty">
            <i data-lucide="calendar-x"></i>
            <p>Nothing scheduled for this day right now.</p>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      scheduleGrid.innerHTML = '';

      filteredShows.forEach(show => {
        const card = document.createElement('div');
        const isCompleted = show.status === 'completed';
        card.className = `schedule-card ${isCompleted ? 'completed' : ''}`;

        const nextReleaseDate = isCompleted ? null : calculateNextReleaseDate(show.day, show.releaseTimeUTC);
        const localTimeFormatted = show.releaseTimeUTC ? formatLocalTime(show.releaseTimeUTC) : 'Non-weekly';
        const initialCountdown = isCompleted 
          ? { text: 'Completed', isNow: false } 
          : formatCountdown(nextReleaseDate);

        // Tags HTML
        const tagsHtml = (show.tags || [])
          .map(tag => `<span class="tag-pill">${tag}</span>`)
          .join('');

        // Note HTML
        const noteHtml = show.note ? `<p class="schedule-note">${show.note}</p>` : '';

        // Badge HTML
        let badgeHtml = '';
        if (isCompleted) {
          badgeHtml = `
            <span class="schedule-countdown-badge completed-badge">
              <i data-lucide="check-circle-2"></i>
              <span>Completed</span>
            </span>
          `;
        } else if (show.day === 'nonweekly' || !show.releaseTimeUTC) {
          badgeHtml = `
            <span class="schedule-countdown-badge">
              <i data-lucide="calendar"></i>
              <span>No fixed slot</span>
            </span>
          `;
        } else {
          badgeHtml = `
            <span class="schedule-countdown-badge ${initialCountdown.isNow ? 'releasing-now' : ''}" data-target-timestamp="${nextReleaseDate ? nextReleaseDate.getTime() : ''}">
              <i data-lucide="clock"></i>
              <span class="countdown-text">${initialCountdown.text}</span>
            </span>
          `;
        }

        card.innerHTML = `
          <div class="schedule-top-row">
            <div class="schedule-time-box">
              <div class="schedule-local-time">
                <i data-lucide="clock-3"></i>
                <span>${localTimeFormatted}</span>
              </div>
              ${show.releaseTimeUTC ? `<span class="schedule-utc-time">${show.releaseTimeUTC} UTC</span>` : ''}
            </div>
            ${badgeHtml}
          </div>

          <h3 class="schedule-show-name">${show.show || 'Untitled Show'}</h3>
          ${noteHtml}

          ${tagsHtml ? `<div class="schedule-tags">${tagsHtml}</div>` : ''}
        `;

        scheduleGrid.appendChild(card);
      });

      if (window.lucide) {
        lucide.createIcons();
      }

      // Start live countdown interval
      countdownInterval = setInterval(updateCountdowns, 1000);
    }

    // Fetch schedule data
    fetch('data/schedule.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        scheduleData = Array.isArray(data) ? data : [];

        // Discover days that have entries
        const presentDays = new Set(scheduleData.map(s => (s.day || '').toLowerCase()));
        const availableDays = DAY_ORDER.filter(day => presentDays.has(day));

        if (availableDays.length === 0) {
          scheduleGrid.innerHTML = `
            <div class="schedule-empty">
              <i data-lucide="calendar-x"></i>
              <p>No schedule entries found.</p>
            </div>
          `;
          if (window.lucide) lucide.createIcons();
          return;
        }

        // Set initial active day: current UTC day if available, else first available
        activeDay = availableDays.includes(currentUtcDayKey) ? currentUtcDayKey : availableDays[0];

        renderDayTabs(availableDays);
        renderScheduleGrid();
      })
      .catch(err => {
        console.error('Failed to load schedule:', err);
        scheduleGrid.innerHTML = `
          <div class="schedule-error">
            <i data-lucide="alert-triangle"></i>
            <p>Failed to load schedule data. Please check data/schedule.json or try again later.</p>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
      });
  }

});

