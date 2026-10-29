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


  // --- 4. Goal Progress Bars (Monthly Goal & PC Upgrade Goal) ---
  const progressCards = document.querySelectorAll('.progress-card');
  progressCards.forEach(card => {
    const currentVal = parseFloat(card.getAttribute('data-current') || '0');
    const targetVal = parseFloat(card.getAttribute('data-target') || '100');
    const rawPercentage = targetVal > 0 ? (currentVal / targetVal) * 100 : 0;
    const barWidth = Math.min(100, Math.max(0, rawPercentage));

    const progressAmountEl = card.querySelector('.progress-amount');
    const progressPercentEl = card.querySelector('.progress-percent');
    const progressFillEl = card.querySelector('.progress-fill');

    if (progressAmountEl) {
      const currentFormatted = currentVal.toLocaleString('en-US');
      const targetFormatted = targetVal.toLocaleString('en-US');
      progressAmountEl.textContent = `$${currentFormatted} / $${targetFormatted}`;
    }
    if (rawPercentage >= 100) {
      card.classList.add('goal-funded');
      if (progressPercentEl) {
        progressPercentEl.innerHTML = `${Math.round(rawPercentage)}% &bull; Funded`;
      }
    } else {
      card.classList.remove('goal-funded');
      if (progressPercentEl) {
        progressPercentEl.textContent = `${Math.round(rawPercentage)}%`;
      }
    }
    if (progressFillEl) {
      // Trigger animation on next frame
      requestAnimationFrame(() => {
        progressFillEl.style.width = `${barWidth}%`;
      });
    }
  });


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
            <i data-lucide="coffee"></i>
            <span class="schedule-empty-title">Rest Day &bull; Encoding Backlog</span>
            <p>No regular releases scheduled for this day. Shridhuu is catching up on school & backlog.</p>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      scheduleGrid.innerHTML = '';

      filteredShows.forEach(show => {
        const card = document.createElement('div');
        const isCompleted = show.status === 'completed';
        const isRest = show.status === 'rest';
        card.className = `schedule-card ${isCompleted ? 'completed' : ''}`;

        const nextReleaseDate = (isCompleted || isRest) ? null : calculateNextReleaseDate(show.day, show.releaseTimeUTC);
        const localTimeFormatted = isRest ? 'Rest Day' : (show.releaseTimeUTC ? formatLocalTime(show.releaseTimeUTC) : 'Non-weekly');
        const initialCountdown = isCompleted
          ? { text: 'Completed', isNow: false }
          : (isRest ? { text: 'Resting', isNow: false } : formatCountdown(nextReleaseDate));

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
        } else if (isRest) {
          badgeHtml = `
            <span class="schedule-countdown-badge resting-badge">
              <i data-lucide="coffee"></i>
              <span>Resting</span>
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

        // Image thumbnail HTML
        const imageHtml = show.image
          ? `<img src="${show.image}" alt="${show.show || 'Show Poster'}" class="schedule-thumb" loading="lazy" onerror="this.style.display='none'">`
          : '';

        card.innerHTML = `
          <div class="schedule-top-row">
            <div class="schedule-time-box">
              <div class="schedule-local-time">
                <i data-lucide="${isRest ? 'coffee' : 'clock-3'}"></i>
                <span>${localTimeFormatted}</span>
              </div>
              ${(show.releaseTimeUTC && !isRest) ? `<span class="schedule-utc-time">${show.releaseTimeUTC} UTC</span>` : ''}
            </div>
            ${badgeHtml}
          </div>

          <div class="schedule-main-info">
            ${imageHtml}
            <div class="schedule-text-info">
              <h3 class="schedule-show-name">${show.show || 'Untitled Show'}</h3>
              ${noteHtml}
            </div>
          </div>

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


  // --- 6. Transparency Page Controller ---
  const transactionsContainer = document.getElementById('transactionsContainer');
  if (transactionsContainer) {
    const DEFAULT_TRANSACTIONS_DATA = {
      exchangeRate: 84.00,
      rateNote: '1 USD \u2248 INR 84.00 (based on average deposit rate)',
      transactions: [
        {
          date: '2026-10-15',
          type: '-',
          usd: 120.00,
          inr: 10080.00,
          account: 'Hardware',
          proxied: false,
          note: '16GB DDR4 3200 MT/s RAM stick (PC Upgrade)'
        },
        {
          date: '2026-10-02',
          type: '+',
          usd: 50.00,
          inr: 4200.00,
          account: 'Crypto',
          proxied: true,
          note: 'Donation from X3r/Blade River King'
        },
        {
          date: '2026-10-02',
          type: '+',
          usd: 40.00,
          inr: 3360.00,
          account: 'Crypto',
          proxied: true,
          note: 'Donation from Tempershot'
        },
        {
          date: '2026-10-01',
          type: '+',
          usd: 10.00,
          inr: 840.00,
          account: 'Crypto',
          proxied: true,
          note: 'Donation from Lonewolf'
        },
        {
          date: '2026-09-20',
          type: '+',
          usd: 20.00,
          inr: 1680.00,
          account: 'Crypto',
          proxied: false,
          note: 'Initial PC Upgrade Fund carry-over'
        }
      ]
    };

    const MONTH_NAMES = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];

    let allNormalizedTransactions = [];

    function formatCurrency(val) {
      return Number(val || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    function normalizeTransactions(rawData) {
      const rate = parseFloat(rawData.exchangeRate || 84.00);
      const list = Array.isArray(rawData.transactions) ? rawData.transactions : [];

      return list
        .map(tx => {
          const dateStr = String(tx.date || '2026-01-01');
          const parts = dateStr.split('-');
          const year = parts[0] || '2026';
          const monthIdx = Math.max(0, Math.min(11, parseInt(parts[1] || '1', 10) - 1));
          const dayNum = parseInt(parts[2] || '1', 10);
          const usdVal = parseFloat(tx.usd || 0);
          const inrVal = tx.inr !== undefined ? parseFloat(tx.inr) : usdVal * rate;

          return {
            date: dateStr,
            year,
            monthIdx,
            monthName: MONTH_NAMES[monthIdx],
            dayNum,
            type: tx.type === '-' ? '-' : '+',
            usd: usdVal,
            inr: inrVal,
            account: tx.account || 'Crypto',
            proxied: Boolean(tx.proxied),
            note: tx.note || ''
          };
        })
        .sort((a, b) => b.date.localeCompare(a.date));
    }

    function renderTransparencyPage(rawData) {
      allNormalizedTransactions = normalizeTransactions(rawData);

      // Calculate net balance unless explicitly overridden
      let totalUsd = 0;
      let totalInr = 0;
      allNormalizedTransactions.forEach(tx => {
        if (tx.type === '+') {
          totalUsd += tx.usd;
          totalInr += tx.inr;
        } else {
          totalUsd -= tx.usd;
          totalInr -= tx.inr;
        }
      });

      if (rawData.currentBalanceUSD !== undefined) totalUsd = parseFloat(rawData.currentBalanceUSD);
      if (rawData.currentBalanceINR !== undefined) totalInr = parseFloat(rawData.currentBalanceINR);

      const balanceInrEl = document.getElementById('balanceInr');
      const balanceUsdEl = document.getElementById('balanceUsd');
      const balanceRateNoteEl = document.getElementById('balanceRateNote');

      if (balanceInrEl) balanceInrEl.textContent = formatCurrency(totalInr);
      if (balanceUsdEl) balanceUsdEl.textContent = formatCurrency(totalUsd);
      if (balanceRateNoteEl && rawData.rateNote) {
        balanceRateNoteEl.textContent = rawData.rateNote;
      }

      // Group by year -> month
      const yearsMap = new Map();
      allNormalizedTransactions.forEach(tx => {
        if (!yearsMap.has(tx.year)) {
          yearsMap.set(tx.year, new Map());
        }
        const monthsMap = yearsMap.get(tx.year);
        if (!monthsMap.has(tx.monthName)) {
          monthsMap.set(tx.monthName, []);
        }
        monthsMap.get(tx.monthName).push(tx);
      });

      transactionsContainer.innerHTML = '';

      yearsMap.forEach((monthsMap, year) => {
        const yearBlock = document.createElement('div');
        yearBlock.className = 'year-record-block';

        let tbodyHtml = '';
        monthsMap.forEach((txList, monthName) => {
          tbodyHtml += `
            <tr class="tx-month-row">
              <td colspan="6">${monthName}</td>
            </tr>
          `;
          txList.forEach(tx => {
            const rowClass = tx.type === '-' ? 'tx-negative' : 'tx-positive';
            const proxyBadgeHtml = tx.proxied
              ? `<span class="proxy-badge" title="Proxied / Crypto account"><i data-lucide="repeat"></i></span>`
              : '';
            tbodyHtml += `
              <tr class="tx-row ${rowClass}">
                <td class="col-date">${tx.dayNum}</td>
                <td class="col-type">${tx.type}</td>
                <td class="col-usd">${formatCurrency(tx.usd)}</td>
                <td class="col-inr">${formatCurrency(tx.inr)}</td>
                <td class="col-account">
                  <span class="account-cell-inner">
                    <span>${tx.account}</span>
                    ${proxyBadgeHtml}
                  </span>
                </td>
                <td class="col-note">${tx.note}</td>
              </tr>
            `;
          });
        });

        yearBlock.innerHTML = `
          <div class="year-header-row">
            <h3 class="year-heading"><span class="year-hash">###</span> ${year}</h3>
            <div class="export-controls">
              <span class="export-label">export as:</span>
              <button type="button" class="export-btn" data-export-year="${year}" data-export-format="csv">csv</button>
              <span class="export-sep">|</span>
              <button type="button" class="export-btn" data-export-year="${year}" data-export-format="xlsx">xlsx</button>
            </div>
          </div>
          <div class="tx-table-wrapper">
            <table class="tx-table">
              <thead>
                <tr>
                  <th class="col-date">date</th>
                  <th class="col-type">type</th>
                  <th class="col-usd">usd</th>
                  <th class="col-inr">inr</th>
                  <th class="col-account">account</th>
                  <th class="col-note">note</th>
                </tr>
              </thead>
              <tbody>
                ${tbodyHtml}
              </tbody>
            </table>
          </div>
        `;

        transactionsContainer.appendChild(yearBlock);
      });

      if (window.lucide) {
        lucide.createIcons();
      }
    }

    function exportRecords(yearFilter, format) {
      const filtered = yearFilter === 'all'
        ? allNormalizedTransactions
        : allNormalizedTransactions.filter(tx => tx.year === String(yearFilter));

      const filenameBase = `shridhuu-transparency-${yearFilter === 'all' ? 'all-time' : yearFilter}`;

      if (format === 'xlsx' && window.XLSX) {
        const rows = filtered.map(tx => ({
          Date: tx.date,
          Type: tx.type,
          USD: Number(tx.usd.toFixed(2)),
          INR: Number(tx.inr.toFixed(2)),
          Account: tx.account,
          Proxied: tx.proxied ? 'Yes' : 'No',
          Note: tx.note
        }));
        const worksheet = window.XLSX.utils.json_to_sheet(rows);
        const workbook = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
        window.XLSX.writeFile(workbook, `${filenameBase}.xlsx`);
        return;
      }

      // CSV export (or fallback if SheetJS unavailable)
      const headers = ['Date', 'Type', 'USD', 'INR', 'Account', 'Proxied', 'Note'];
      const csvLines = [headers.join(',')];
      filtered.forEach(tx => {
        const escapedNote = `"${String(tx.note).replace(/"/g, '""')}"`;
        const escapedAccount = `"${String(tx.account).replace(/"/g, '""')}"`;
        csvLines.push([
          tx.date,
          tx.type,
          tx.usd.toFixed(2),
          tx.inr.toFixed(2),
          escapedAccount,
          tx.proxied ? 'Yes' : 'No',
          escapedNote
        ].join(','));
      });

      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filenameBase}.${format === 'xlsx' ? 'csv' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    document.addEventListener('click', e => {
      const exportBtn = e.target.closest('.export-btn');
      if (!exportBtn) return;
      const year = exportBtn.getAttribute('data-export-year') || 'all';
      const format = exportBtn.getAttribute('data-export-format') || 'csv';
      exportRecords(year, format);
    });

    fetch('data/transactions.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        renderTransparencyPage(data);
      })
      .catch(() => {
        renderTransparencyPage(DEFAULT_TRANSACTIONS_DATA);
      });
  }

});


