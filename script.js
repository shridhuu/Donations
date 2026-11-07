/* ==========================================================
   SHRIDHUU SITE - UNIFIED JAVASCRIPT CONTROLLER
   Theme, clipboard, accessible QR panels, live schedule,
   single-source donation sync (goals + Hall of Fame + ledger),
   and on-demand SheetJS XLSX export
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const MONTH_NAMES = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  const DEFAULT_TRANSACTIONS_DATA = {
    exchangeRate: 84.00,
    monthlyTarget: 50,
    pcTarget: 1000,
    rateNote: '1 USD \u2248 INR 84.00 (based on average deposit rate)',
    transactions: [
      {
        date: '2026-11-01',
        type: '+',
        usd: 1.00,
        inr: 84.00,
        account: 'Crypto',
        proxied: true,
        donor: 'Tx~MANO\u267E\uFE0F',
        note: 'Donation from Tx~MANO\u267E\uFE0F'
      },
      {
        date: '2026-10-15',
        type: '-',
        usd: 120.00,
        inr: 10080.00,
        account: 'Hardware',
        proxied: false,
        donor: null,
        note: '16GB DDR4 3200 MT/s RAM stick (PC Upgrade)'
      },
      {
        date: '2026-10-02',
        type: '+',
        usd: 50.00,
        inr: 4200.00,
        account: 'Crypto',
        proxied: true,
        donor: 'X3r/Blade River King',
        note: 'Donation from X3r/Blade River King'
      },
      {
        date: '2026-10-02',
        type: '+',
        usd: 40.00,
        inr: 3360.00,
        account: 'Crypto',
        proxied: true,
        donor: 'Tempershot',
        note: 'Donation from Tempershot'
      },
      {
        date: '2026-10-01',
        type: '+',
        usd: 10.00,
        inr: 840.00,
        account: 'Crypto',
        proxied: true,
        donor: 'Lonewolf',
        note: 'Donation from Lonewolf'
      },
      {
        date: '2026-09-20',
        type: '+',
        usd: 20.00,
        inr: 1680.00,
        account: 'Crypto',
        proxied: false,
        donor: null,
        note: 'Initial PC Upgrade Fund carry-over'
      }
    ]
  };

  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  refreshIcons();

  // --- 1. Theme Management (Dark / Light / System) ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const htmlEl = document.documentElement;
  let currentTheme = localStorage.getItem('fansub_theme') || 'dark';

  function applyTheme(theme) {
    let effectiveTheme = theme;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? 'dark' : 'light';
    }

    htmlEl.setAttribute('data-theme', effectiveTheme);
    localStorage.setItem('fansub_theme', theme);

    if (themeToggleBtn && themeLabel) {
      const iconName = theme === 'dark' ? 'moon' : (theme === 'light' ? 'sun' : 'monitor');
      const labelText = theme === 'dark' ? 'Dark' : (theme === 'light' ? 'Light' : 'System');
      themeLabel.textContent = labelText;

      const existingIcon = themeToggleBtn.querySelector('#theme-icon, svg');
      if (existingIcon) {
        const freshIcon = document.createElement('i');
        freshIcon.id = 'theme-icon';
        freshIcon.setAttribute('data-lucide', iconName);
        freshIcon.setAttribute('aria-hidden', 'true');
        existingIcon.replaceWith(freshIcon);
      }
      refreshIcons();
    }
  }

  applyTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : (currentTheme === 'light' ? 'system' : 'dark');
      applyTheme(currentTheme);
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'system') {
      applyTheme('system');
    }
  });

  // --- 2. Accessible Toast & Clipboard Functionality ---
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

  function handleCopySuccess(triggerEl) {
    showToast('Copied to clipboard');
    if (!triggerEl || !triggerEl.classList.contains('btn-copy')) return;

    const span = triggerEl.querySelector('span');
    const originalText = triggerEl.getAttribute('data-orig-label') || (span ? span.textContent : 'Copy');
    triggerEl.setAttribute('data-orig-label', originalText);

    triggerEl.classList.add('copied');
    if (span) span.textContent = 'Copied';

    setTimeout(() => {
      triggerEl.classList.remove('copied');
      if (span) span.textContent = originalText;
    }, 1800);
  }

  function fallbackCopy(text, triggerEl) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      handleCopySuccess(triggerEl);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
    document.body.removeChild(textArea);
  }

  function copyToClipboard(text, triggerEl) {
    if (!text) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => handleCopySuccess(triggerEl))
        .catch(() => fallbackCopy(text, triggerEl));
    } else {
      fallbackCopy(text, triggerEl);
    }
  }

  document.querySelectorAll('[data-copy]').forEach(el => {
    el.addEventListener('click', () => {
      const address = el.getAttribute('data-copy');
      const rowWrapper = el.closest('.donate-row');
      const copyBtn = el.classList.contains('btn-copy')
        ? el
        : (rowWrapper ? rowWrapper.querySelector('.btn-copy') : el);
      copyToClipboard(address, copyBtn);
    });
  });

  // --- 3. Accessible Inline QR Panels (Escape + Outside-Click Close) ---
  function closeAllQrPanels() {
    document.querySelectorAll('.donate-row-wrapper').forEach(wrapper => {
      wrapper.classList.remove('qr-active');
      const panel = wrapper.querySelector('.qr-inline-panel');
      const qrBtn = wrapper.querySelector('.btn-qr');
      if (panel) panel.hidden = true;
      if (qrBtn) {
        qrBtn.classList.remove('active');
        qrBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.querySelectorAll('.btn-qr').forEach(button => {
    button.addEventListener('click', e => {
      e.stopPropagation();
      const wrapper = button.closest('.donate-row-wrapper');
      if (!wrapper) return;

      const panel = wrapper.querySelector('.qr-inline-panel');
      const qrTarget = wrapper.querySelector('.qr-code-target');
      const address = button.getAttribute('data-qr-address');
      const isAlreadyOpen = panel && !panel.hidden;

      closeAllQrPanels();

      if (!isAlreadyOpen && panel && qrTarget && address) {
        qrTarget.innerHTML = '';
        if (window.QRCode) {
          new window.QRCode(qrTarget, {
            text: address,
            width: 170,
            height: 170,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: window.QRCode.CorrectLevel.H
          });
        } else {
          qrTarget.innerHTML = '<p style="color:#be123c; font-size:0.75rem;">QR generator offline</p>';
        }

        panel.hidden = false;
        wrapper.classList.add('qr-active');
        button.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.donate-row-wrapper.qr-active')) {
      closeAllQrPanels();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const openBtn = document.querySelector('.donate-row-wrapper.qr-active .btn-qr');
      if (openBtn) {
        closeAllQrPanels();
        openBtn.focus();
      }
    }
  });

  // --- 4. Goal Progress Bar Renderer ---
  function updateProgressCard(card, currentVal, targetVal) {
    if (!card) return;
    card.setAttribute('data-current', String(currentVal));
    card.setAttribute('data-target', String(targetVal));

    const rawPercentage = targetVal > 0 ? (currentVal / targetVal) * 100 : 0;
    const barWidth = Math.min(100, Math.max(0, rawPercentage));

    const progressAmountEl = card.querySelector('.progress-amount');
    const progressPercentEl = card.querySelector('.progress-percent');
    const progressTrackEl = card.querySelector('.progress-track');
    const progressFillEl = card.querySelector('.progress-fill');

    if (progressAmountEl) {
      const currentFormatted = Number(currentVal).toLocaleString('en-US', { maximumFractionDigits: 2 });
      const targetFormatted = Number(targetVal).toLocaleString('en-US', { maximumFractionDigits: 0 });
      progressAmountEl.textContent = `$${currentFormatted} / $${targetFormatted}`;
    }

    if (progressTrackEl) {
      progressTrackEl.setAttribute('aria-valuenow', String(Math.round(currentVal)));
      progressTrackEl.setAttribute('aria-valuemax', String(Math.round(targetVal)));
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
      progressFillEl.style.width = `${barWidth}%`;
    }
  }

  document.querySelectorAll('.progress-card').forEach(card => {
    const currentVal = parseFloat(card.getAttribute('data-current') || '0');
    const targetVal = parseFloat(card.getAttribute('data-target') || '100');
    updateProgressCard(card, currentVal, targetVal);
  });

  // --- 5. Shared Transactions Normalization & Single-Source Hydration ---
  function formatCurrency(val) {
    return Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function extractDonorName(tx) {
    if (tx.donor !== undefined) return tx.donor;
    const match = String(tx.note || '').match(/^Donation from\s+(.+)$/i);
    return match ? match[1].trim() : null;
  }

  function normalizeTransactions(rawData) {
    const rate = parseFloat(rawData.exchangeRate || 84.00);
    const list = Array.isArray(rawData.transactions) ? rawData.transactions : [];

    return list
      .map(tx => {
        const dateStr = String(tx.date || '2026-01-01');
        const parts = dateStr.split('-');
        const year = parts[0] || '2026';
        const monthPart = parts[1] || '01';
        const monthIdx = Math.max(0, Math.min(11, parseInt(monthPart, 10) - 1));
        const dayNum = parseInt(parts[2] || '1', 10);
        const usdVal = parseFloat(tx.usd || 0);
        const inrVal = tx.inr !== undefined ? parseFloat(tx.inr) : usdVal * rate;

        return {
          date: dateStr,
          year,
          yearMonth: `${year}-${monthPart.padStart(2, '0')}`,
          monthIdx,
          monthName: MONTH_NAMES[monthIdx],
          dayNum,
          type: tx.type === '-' ? '-' : '+',
          usd: usdVal,
          inr: inrVal,
          account: tx.account || 'Crypto',
          proxied: Boolean(tx.proxied),
          donor: extractDonorName(tx),
          note: tx.note || ''
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  function buildDonorCardHtml(donor, index, monthDisplay) {
    const isTop = index === 0;
    const avatarRankClass = index === 0 ? 'avatar-gold' : (index === 1 ? 'avatar-silver' : (index === 2 ? 'avatar-bronze' : ''));
    const rankTagClass = index === 0 ? 'rank-gold' : (index === 1 ? 'rank-silver' : 'rank-bronze');
    const rankLabel = index === 0 ? '#1 Top Supporter' : `#${index + 1} Supporter`;
    const initial = escapeHtml(Array.from(donor.name.trim())[0] || '?').toUpperCase();
    const amountFormatted = Number.isInteger(donor.usd) ? donor.usd.toString() : donor.usd.toFixed(2);
    const badgeHtml = isTop
      ? '<span class="donator-badge badge-top"><i data-lucide="crown" aria-hidden="true"></i> Top Donator</span>'
      : '<span class="donator-badge badge-donator"><i data-lucide="heart" aria-hidden="true"></i> Donator</span>';
    const crownHtml = isTop
      ? '<span class="avatar-crown"><i data-lucide="crown" aria-hidden="true"></i></span>'
      : '';

    return `
      <div class="donator-card ${isTop ? 'top-backer' : ''}">
        <div class="donator-card-header">
          <div class="donator-avatar ${avatarRankClass}">
            <span>${initial}</span>
            ${crownHtml}
          </div>
          <div class="donator-meta">
            <span class="donator-name">${escapeHtml(donor.name)}</span>
            ${badgeHtml}
          </div>
          <span class="donator-amount">$${amountFormatted}</span>
        </div>
        <div class="donator-footer">
          <span class="donator-rank-tag ${rankTagClass}">${rankLabel}</span>
          <span class="donator-date">${escapeHtml(monthDisplay)}</span>
        </div>
      </div>
    `;
  }

  function hydrateDonatePageFromLedger(rawData) {
    const monthlyCard = document.getElementById('progressCard');
    const pcCard = document.getElementById('pcProgressCard');
    const currentGrid = document.getElementById('currentDonatorsGrid');
    const archiveContainer = document.getElementById('archiveDonatorsContainer');

    if (!monthlyCard && !pcCard && !currentGrid) return;

    const txs = normalizeTransactions(rawData);
    const now = new Date();
    const currentYearMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const currentMonthTitle = MONTH_NAMES[now.getUTCMonth()];
    const currentMonthCapitalized = currentMonthTitle.charAt(0).toUpperCase() + currentMonthTitle.slice(1);

    let monthlyInUsd = 0;
    let totalInUsd = 0;

    // Group named donor contributions by YYYY-MM
    const monthlyDonorsMap = new Map();

    txs.forEach(tx => {
      if (tx.type !== '+') return;
      totalInUsd += tx.usd;
      if (tx.yearMonth === currentYearMonth) {
        monthlyInUsd += tx.usd;
      }

      if (tx.donor) {
        if (!monthlyDonorsMap.has(tx.yearMonth)) {
          monthlyDonorsMap.set(tx.yearMonth, new Map());
        }
        const monthGroup = monthlyDonorsMap.get(tx.yearMonth);
        monthGroup.set(tx.donor, (monthGroup.get(tx.donor) || 0) + tx.usd);
      }
    });

    const monthlyTarget = parseFloat(rawData.monthlyTarget || (monthlyCard && monthlyCard.getAttribute('data-target')) || '50');
    const pcTarget = parseFloat(rawData.pcTarget || (pcCard && pcCard.getAttribute('data-target')) || '1000');

    const monthlyLabelEl = document.getElementById('monthlyGoalLabel');
    if (monthlyLabelEl) {
      monthlyLabelEl.textContent = `${currentMonthCapitalized} Goal`;
    }

    updateProgressCard(monthlyCard, monthlyInUsd, monthlyTarget);
    updateProgressCard(pcCard, totalInUsd, pcTarget);

    if (currentGrid && archiveContainer) {
      const sortedMonths = Array.from(monthlyDonorsMap.keys()).sort((a, b) => b.localeCompare(a));
      const activeDonorsMap = monthlyDonorsMap.get(currentYearMonth) || new Map();
      const activeDonors = Array.from(activeDonorsMap.entries())
        .map(([name, usd]) => ({ name, usd }))
        .sort((a, b) => b.usd - a.usd);

      const currentMonthLabel = `${currentMonthCapitalized} ${now.getUTCFullYear()}`;
      const cardsHtml = activeDonors
        .map((d, idx) => buildDonorCardHtml(d, idx, currentMonthLabel))
        .join('');

      const joinCardHtml = `
        <div class="donator-card join-showcase-card">
          <div class="join-icon-box">
            <i data-lucide="user-plus" aria-hidden="true"></i>
          </div>
          <div class="join-content">
            <span class="join-title">${activeDonors.length === 0 ? `Be First in ${currentMonthCapitalized}` : 'Join The Showcase'}</span>
            <p class="join-desc">
              Include your Discord handle with your donation or DM @shridhuu to get featured here.
            </p>
          </div>
        </div>
      `;

      currentGrid.innerHTML = cardsHtml + joinCardHtml;

      // Render previous months archive
      const archiveMonths = sortedMonths.filter(ym => ym !== currentYearMonth);
      archiveContainer.innerHTML = archiveMonths.map(ym => {
        const [yr, mo] = ym.split('-');
        const mName = MONTH_NAMES[Math.max(0, Math.min(11, parseInt(mo, 10) - 1))];
        const mCap = mName.charAt(0).toUpperCase() + mName.slice(1);
        const donorsList = Array.from(monthlyDonorsMap.get(ym).entries())
          .map(([name, usd]) => ({ name, usd }))
          .sort((a, b) => b.usd - a.usd);

        return `
          <div class="donators-archive">
            <h3 class="section-title archive-heading">${mCap} Donators</h3>
            <div class="donators-grid">
              ${donorsList.map((d, idx) => buildDonorCardHtml(d, idx, `${mCap} ${yr}`)).join('')}
            </div>
          </div>
        `;
      }).join('');

      refreshIcons();
    }
  }

  // --- 6. Transparency Page Controller & Lazy SheetJS Loader ---
  const transactionsContainer = document.getElementById('transactionsContainer');
  let allNormalizedTransactions = [];
  let sheetJsPromise = null;

  function loadSheetJs() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (sheetJsPromise) return sheetJsPromise;

    sheetJsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      script.onload = () => (window.XLSX ? resolve(window.XLSX) : reject(new Error('XLSX missing')));
      script.onerror = () => {
        sheetJsPromise = null;
        reject(new Error('Failed to load XLSX bundle'));
      };
      document.head.appendChild(script);
    });
    return sheetJsPromise;
  }

  function renderTransparencyPage(rawData) {
    if (!transactionsContainer) return;
    allNormalizedTransactions = normalizeTransactions(rawData);

    let totalInUsd = 0;
    let totalOutUsd = 0;
    let totalUsd = 0;
    let totalInr = 0;

    allNormalizedTransactions.forEach(tx => {
      if (tx.type === '+') {
        totalInUsd += tx.usd;
        totalUsd += tx.usd;
        totalInr += tx.inr;
      } else {
        totalOutUsd += tx.usd;
        totalUsd -= tx.usd;
        totalInr -= tx.inr;
      }
    });

    if (rawData.currentBalanceUSD !== undefined) totalUsd = parseFloat(rawData.currentBalanceUSD);
    if (rawData.currentBalanceINR !== undefined) totalInr = parseFloat(rawData.currentBalanceINR);

    const balanceInrEl = document.getElementById('balanceInr');
    const balanceUsdEl = document.getElementById('balanceUsd');
    const totalInUsdEl = document.getElementById('totalInUsd');
    const totalOutUsdEl = document.getElementById('totalOutUsd');
    const balanceRateNoteEl = document.getElementById('balanceRateNote');

    if (balanceInrEl) balanceInrEl.textContent = `\u20B9${formatCurrency(totalInr)}`;
    if (balanceUsdEl) balanceUsdEl.textContent = `$${formatCurrency(totalUsd)}`;
    if (totalInUsdEl) totalInUsdEl.textContent = `+$${formatCurrency(totalInUsd)}`;
    if (totalOutUsdEl) totalOutUsdEl.textContent = `-$${formatCurrency(totalOutUsd)}`;
    if (balanceRateNoteEl && rawData.exchangeRate) {
      balanceRateNoteEl.textContent = `1 USD \u2248 \u20B9${Number(rawData.exchangeRate).toFixed(2)}`;
    }

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
      yearBlock.className = 'ledger-year-card';

      let tbodyHtml = '';
      monthsMap.forEach((txList, monthName) => {
        const monthLabel = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        tbodyHtml += `
          <tr class="tx-month-row">
            <td colspan="6">
              <span class="month-row-label"><span class="month-chevron">&gt;</span> ${escapeHtml(monthLabel)} ${escapeHtml(year)}</span>
            </td>
          </tr>
        `;

        txList.forEach(tx => {
          const isOut = tx.type === '-';
          const rowClass = isOut ? 'tx-negative' : 'tx-positive';
          const signPrefix = isOut ? '-' : '+';
          const typeBadge = isOut
            ? '<span class="spec-price">Expense</span>'
            : '<span class="spec-badge-bought">Donation</span>';
          const dayPadded = String(tx.dayNum).padStart(2, '0');

          tbodyHtml += `
            <tr class="tx-row ${rowClass}">
              <td class="col-date">${dayPadded}</td>
              <td class="col-type">${typeBadge}</td>
              <td class="col-usd">${signPrefix}$${formatCurrency(tx.usd)}</td>
              <td class="col-inr">${signPrefix}\u20B9${formatCurrency(tx.inr)}</td>
              <td class="col-account">
                <span class="tag-pill">${escapeHtml(tx.account)}</span>
              </td>
              <td class="col-note">${escapeHtml(tx.note)}</td>
            </tr>
          `;
        });
      });

      const entryCount = allNormalizedTransactions.filter(t => t.year === year).length;
      yearBlock.innerHTML = `
        <div class="ledger-year-header">
          <div class="ledger-year-title">
            <i data-lucide="calendar" aria-hidden="true"></i>
            <span>${escapeHtml(year)} Ledger</span>
            <span class="spec-badge current-badge">${entryCount} ${entryCount === 1 ? 'Entry' : 'Entries'}</span>
          </div>
          <div class="export-actions-group">
            <button type="button" class="btn-action export-btn" data-export-year="${escapeHtml(year)}" data-export-format="csv" aria-label="Export ${escapeHtml(year)} records as CSV">
              <i data-lucide="download" aria-hidden="true"></i>
              <span>${escapeHtml(year)} CSV</span>
            </button>
            <button type="button" class="btn-action export-btn" data-export-year="${escapeHtml(year)}" data-export-format="xlsx" aria-label="Export ${escapeHtml(year)} records as XLSX">
              <i data-lucide="file-spreadsheet" aria-hidden="true"></i>
              <span>${escapeHtml(year)} XLSX</span>
            </button>
          </div>
        </div>
        <div class="tx-table-wrapper">
          <table class="tx-table">
            <thead>
              <tr>
                <th scope="col" class="col-date">Day</th>
                <th scope="col" class="col-type">Type</th>
                <th scope="col" class="col-usd">USD</th>
                <th scope="col" class="col-inr">INR</th>
                <th scope="col" class="col-account">Channel</th>
                <th scope="col" class="col-note">Description</th>
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

    refreshIcons();
  }

  async function exportRecords(yearFilter, format, btnEl) {
    const filtered = yearFilter === 'all'
      ? allNormalizedTransactions
      : allNormalizedTransactions.filter(tx => tx.year === String(yearFilter));

    const filenameBase = `shridhuu-transparency-${yearFilter === 'all' ? 'all-time' : yearFilter}`;

    if (format === 'xlsx') {
      const labelSpan = btnEl ? btnEl.querySelector('span') : null;
      const prevLabel = labelSpan ? labelSpan.textContent : '';
      if (btnEl) btnEl.disabled = true;
      if (labelSpan) labelSpan.textContent = 'Preparing...';

      try {
        const XLSX = await loadSheetJs();
        const rows = filtered.map(tx => ({
          Date: tx.date,
          Type: tx.type,
          USD: Number(tx.usd.toFixed(2)),
          INR: Number(tx.inr.toFixed(2)),
          Account: tx.account,
          Proxied: tx.proxied ? 'Yes' : 'No',
          Note: tx.note
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
        XLSX.writeFile(workbook, `${filenameBase}.xlsx`);
        showToast(`Downloaded ${filenameBase}.xlsx`);
        return;
      } catch (err) {
        console.warn('XLSX load failed, falling back to CSV:', err);
      } finally {
        if (btnEl) btnEl.disabled = false;
        if (labelSpan) labelSpan.textContent = prevLabel;
      }
    }

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
    a.download = `${filenameBase}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filenameBase}.csv`);
  }

  if (transactionsContainer) {
    document.addEventListener('click', e => {
      const exportBtn = e.target.closest('.export-btn');
      if (!exportBtn) return;
      const year = exportBtn.getAttribute('data-export-year') || 'all';
      const format = exportBtn.getAttribute('data-export-format') || 'csv';
      exportRecords(year, format, exportBtn);
    });
  }

  // Hydrate Donate page & Transparency page from single source of truth
  if (transactionsContainer || document.getElementById('progressCard') || document.getElementById('currentDonatorsGrid')) {
    fetch('data/transactions.json', { cache: 'no-cache' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        hydrateDonatePageFromLedger(data);
        renderTransparencyPage(data);
      })
      .catch(() => {
        hydrateDonatePageFromLedger(DEFAULT_TRANSACTIONS_DATA);
        renderTransparencyPage(DEFAULT_TRANSACTIONS_DATA);
      });
  }

  // --- 7. Schedule Page Controller (Rollover Fix, Local Day Clarity, Accessible Tabs) ---
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
    const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const UTC_DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const ONE_HOUR_MS = 3600000;
    const ONE_WEEK_MS = 7 * 86400000;

    let scheduleData = [];
    let activeDay = '';
    let countdownInterval = null;

    const currentUtcDayKey = UTC_DAY_KEYS[new Date().getUTCDay()];

    // Populate local timezone badge
    const localTzBadge = document.getElementById('localTzBadge');
    if (localTzBadge) {
      try {
        const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
        const offsetMin = -new Date().getTimezoneOffset();
        const sign = offsetMin >= 0 ? '+' : '-';
        const absMin = Math.abs(offsetMin);
        const hrs = Math.floor(absMin / 60);
        const mins = absMin % 60;
        const utcOffset = `UTC${sign}${hrs}${mins ? ':' + String(mins).padStart(2, '0') : ''}`;
        localTzBadge.textContent = `${tzName} (${utcOffset})`;
      } catch {
        localTzBadge.textContent = 'Local Timezone';
      }
    }

    function calculateNextReleaseDate(dayKey, utcTimeStr) {
      if (dayKey === 'nonweekly' || !utcTimeStr) return null;
      const targetDayNum = DAY_NAMES[dayKey];
      if (targetDayNum === undefined) return null;

      const [targetHours, targetMinutes] = utcTimeStr.split(':').map(Number);
      const now = new Date();

      const target = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        targetHours,
        targetMinutes,
        0,
        0
      ));

      const currentDayNum = now.getUTCDay();
      let dayDiff = targetDayNum - currentDayNum;

      if (dayDiff < 0) {
        dayDiff += 7;
      } else if (dayDiff === 0 && (target.getTime() - now.getTime()) < -ONE_HOUR_MS) {
        dayDiff += 7;
      }

      target.setUTCDate(target.getUTCDate() + dayDiff);
      return target;
    }

    function formatLocalSlot(dayKey, utcTimeStr, includeDayAlways) {
      if (!utcTimeStr) return 'TBA';
      const nextDate = calculateNextReleaseDate(dayKey, utcTimeStr);
      if (!nextDate) return 'TBA';

      const timePart = nextDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      const localDayIdx = nextDate.getDay();
      const utcDayIdx = DAY_NAMES[dayKey];
      const dayShifted = utcDayIdx !== undefined && localDayIdx !== utcDayIdx;

      if (includeDayAlways || dayShifted) {
        return `${SHORT_WEEKDAYS[localDayIdx]} \u00B7 ${timePart}`;
      }
      return timePart;
    }

    function formatCountdown(targetTimestamp) {
      if (!targetTimestamp) return { text: 'Non-weekly', isNow: false, nextTimestamp: null };

      let ts = targetTimestamp;
      const nowMs = Date.now();
      let diffMs = ts - nowMs;

      // Advance past expired 1-hour release windows so "Releasing now" never gets stuck
      while (diffMs < -ONE_HOUR_MS) {
        ts += ONE_WEEK_MS;
        diffMs = ts - nowMs;
      }

      if (diffMs <= 0 && diffMs >= -ONE_HOUR_MS) {
        return { text: 'Releasing now', isNow: true, nextTimestamp: ts };
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (days > 0) return { text: `in ${days}d ${hours}h`, isNow: false, nextTimestamp: ts };
      if (hours > 0) return { text: `in ${hours}h ${minutes}m`, isNow: false, nextTimestamp: ts };
      if (minutes > 0) return { text: `in ${minutes}m ${seconds}s`, isNow: false, nextTimestamp: ts };
      return { text: `in ${seconds}s`, isNow: false, nextTimestamp: ts };
    }

    function updateCountdowns() {
      const countdownElements = scheduleGrid.querySelectorAll('[data-target-timestamp]');
      countdownElements.forEach(el => {
        const timestamp = parseInt(el.getAttribute('data-target-timestamp'), 10);
        if (!timestamp) return;

        const { text, isNow, nextTimestamp } = formatCountdown(timestamp);
        if (nextTimestamp && nextTimestamp !== timestamp) {
          el.setAttribute('data-target-timestamp', String(nextTimestamp));
        }

        const textSpan = el.querySelector('.countdown-text');
        if (textSpan) textSpan.textContent = text;
        el.classList.toggle('releasing-now', isNow);
      });
    }

    function activateTab(day, focusBtn) {
      if (activeDay === day) return;
      activeDay = day;

      dayTabsContainer.querySelectorAll('.day-tab-btn').forEach(b => {
        const isMatch = b.getAttribute('data-day') === day;
        b.classList.toggle('active', isMatch);
        b.setAttribute('aria-selected', isMatch ? 'true' : 'false');
        b.setAttribute('tabindex', isMatch ? '0' : '-1');
        if (isMatch && focusBtn) b.focus();
      });

      renderScheduleGrid();
    }

    function renderDayTabs(availableDays) {
      dayTabsContainer.innerHTML = '';
      const tabsList = [...availableDays, 'all'];

      tabsList.forEach(day => {
        const isSelected = day === activeDay;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.role = 'tab';
        btn.id = `tab-${day}`;
        btn.className = `day-tab-btn ${isSelected ? 'active' : ''}`;
        btn.setAttribute('data-day', day);
        btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        btn.setAttribute('aria-controls', 'scheduleGrid');
        btn.setAttribute('tabindex', isSelected ? '0' : '-1');

        const labelText = day === 'all'
          ? 'All Week'
          : (day === 'nonweekly' ? 'Non-weekly' : day.charAt(0).toUpperCase() + day.slice(1));
        btn.textContent = labelText;

        if (day === currentUtcDayKey) {
          const dot = document.createElement('span');
          dot.className = 'day-dot';
          dot.title = 'Today (UTC)';
          dot.setAttribute('aria-hidden', 'true');
          btn.appendChild(dot);
        }

        btn.addEventListener('click', () => activateTab(day, false));
        dayTabsContainer.appendChild(btn);
      });

      dayTabsContainer.addEventListener('keydown', e => {
        const buttons = Array.from(dayTabsContainer.querySelectorAll('.day-tab-btn'));
        const idx = buttons.findIndex(b => b.getAttribute('data-day') === activeDay);
        if (idx === -1) return;

        let nextIdx = null;
        if (e.key === 'ArrowRight') nextIdx = (idx + 1) % buttons.length;
        if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + buttons.length) % buttons.length;
        if (e.key === 'Home') nextIdx = 0;
        if (e.key === 'End') nextIdx = buttons.length - 1;

        if (nextIdx !== null) {
          e.preventDefault();
          activateTab(buttons[nextIdx].getAttribute('data-day'), true);
        }
      });
    }

    function renderScheduleGrid() {
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }

      scheduleGrid.setAttribute('aria-labelledby', `tab-${activeDay}`);

      let filteredShows = activeDay === 'all'
        ? scheduleData.filter(show => show.status !== 'rest')
        : scheduleData.filter(show => (show.day || '').toLowerCase() === activeDay.toLowerCase());

      if (activeDay === 'all') {
        filteredShows = [...filteredShows].sort((a, b) => {
          const nextA = calculateNextReleaseDate(a.day, a.releaseTimeUTC);
          const nextB = calculateNextReleaseDate(b.day, b.releaseTimeUTC);
          return (nextA ? nextA.getTime() : Infinity) - (nextB ? nextB.getTime() : Infinity);
        });
      }

      if (filteredShows.length === 0) {
        scheduleGrid.innerHTML = `
          <div class="schedule-empty">
            <i data-lucide="coffee" aria-hidden="true"></i>
            <span class="schedule-empty-title">Rest Day &bull; Encoding Backlog</span>
            <p>No regular releases scheduled for this day. Catching up on school and commissioned batches.</p>
          </div>
        `;
        refreshIcons();
        return;
      }

      scheduleGrid.innerHTML = '';

      filteredShows.forEach(show => {
        const card = document.createElement('article');
        const isCompleted = show.status === 'completed';
        const isRest = show.status === 'rest';
        card.className = `schedule-card ${isCompleted ? 'completed' : ''}`;

        const nextReleaseDate = (isCompleted || isRest) ? null : calculateNextReleaseDate(show.day, show.releaseTimeUTC);
        const nextTs = nextReleaseDate ? nextReleaseDate.getTime() : null;
        const localTimeFormatted = isRest
          ? 'Rest Day'
          : (show.releaseTimeUTC ? formatLocalSlot(show.day, show.releaseTimeUTC, activeDay === 'all') : 'Non-weekly');
        const initialCountdown = isCompleted
          ? { text: 'Completed', isNow: false }
          : (isRest ? { text: 'Resting', isNow: false } : formatCountdown(nextTs));

        const tagsHtml = (show.tags || [])
          .map(tag => `<span class="tag-pill">${escapeHtml(tag)}</span>`)
          .join('');

        const noteHtml = show.note ? `<p class="schedule-note">${escapeHtml(show.note)}</p>` : '';

        let badgeHtml = '';
        if (isCompleted) {
          badgeHtml = `
            <span class="schedule-countdown-badge completed-badge">
              <i data-lucide="check-circle-2" aria-hidden="true"></i>
              <span>Completed</span>
            </span>
          `;
        } else if (isRest) {
          badgeHtml = `
            <span class="schedule-countdown-badge resting-badge">
              <i data-lucide="coffee" aria-hidden="true"></i>
              <span>Resting</span>
            </span>
          `;
        } else if (show.day === 'nonweekly' || !show.releaseTimeUTC) {
          badgeHtml = `
            <span class="schedule-countdown-badge">
              <i data-lucide="calendar" aria-hidden="true"></i>
              <span>No fixed slot</span>
            </span>
          `;
        } else {
          badgeHtml = `
            <span class="schedule-countdown-badge ${initialCountdown.isNow ? 'releasing-now' : ''}" data-target-timestamp="${nextTs || ''}">
              <i data-lucide="clock" aria-hidden="true"></i>
              <span class="countdown-text">${escapeHtml(initialCountdown.text)}</span>
            </span>
          `;
        }

        const imageHtml = show.image
          ? `<img src="${escapeHtml(show.image)}" alt="${escapeHtml(show.show || 'Show poster')}" width="58" height="58" class="schedule-thumb" loading="lazy" decoding="async" onerror="this.style.display='none'">`
          : '';

        const utcDayShort = show.day && DAY_NAMES[show.day] !== undefined
          ? `${SHORT_WEEKDAYS[DAY_NAMES[show.day]]} `
          : '';

        card.innerHTML = `
          <div class="schedule-top-row">
            <div class="schedule-time-box">
              <div class="schedule-local-time">
                <i data-lucide="${isRest ? 'coffee' : 'clock-3'}" aria-hidden="true"></i>
                <span>${escapeHtml(localTimeFormatted)}</span>
              </div>
              ${(show.releaseTimeUTC && !isRest) ? `<span class="schedule-utc-time">${escapeHtml(utcDayShort + show.releaseTimeUTC)} UTC</span>` : ''}
            </div>
            ${badgeHtml}
          </div>

          <div class="schedule-main-info">
            ${imageHtml}
            <div class="schedule-text-info">
              <h2 class="schedule-show-name">${escapeHtml(show.show || 'Untitled Show')}</h2>
              ${noteHtml}
            </div>
          </div>

          ${tagsHtml ? `<div class="schedule-tags">${tagsHtml}</div>` : ''}
        `;

        scheduleGrid.appendChild(card);
      });

      refreshIcons();
      countdownInterval = setInterval(updateCountdowns, 1000);
    }

    function loadSchedule() {
      fetch('data/schedule.json', { cache: 'no-cache' })
        .then(response => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then(data => {
          scheduleData = Array.isArray(data) ? data : [];
          const presentDays = new Set(scheduleData.map(s => (s.day || '').toLowerCase()));
          const availableDays = DAY_ORDER.filter(day => presentDays.has(day));

          if (availableDays.length === 0) {
            scheduleGrid.innerHTML = `
              <div class="schedule-empty">
                <i data-lucide="calendar-x" aria-hidden="true"></i>
                <span class="schedule-empty-title">No shows scheduled right now</span>
                <p>Check Discord for the latest release announcements.</p>
              </div>
            `;
            refreshIcons();
            return;
          }

          activeDay = availableDays.includes(currentUtcDayKey) ? currentUtcDayKey : availableDays[0];
          renderDayTabs(availableDays);
          renderScheduleGrid();
        })
        .catch(() => {
          scheduleGrid.innerHTML = `
            <div class="schedule-error">
              <i data-lucide="alert-triangle" aria-hidden="true"></i>
              <span class="schedule-empty-title">Couldn't load the weekly lineup</span>
              <p>Check your connection and retry, or view release updates in Discord.</p>
              <button type="button" class="btn-action" id="retryScheduleBtn">
                <i data-lucide="refresh-cw" aria-hidden="true"></i>
                <span>Retry</span>
              </button>
            </div>
          `;
          refreshIcons();
          const retryBtn = document.getElementById('retryScheduleBtn');
          if (retryBtn) retryBtn.addEventListener('click', loadSchedule);
        });
    }

    loadSchedule();
  }
});
