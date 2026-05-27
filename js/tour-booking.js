/* ============================================================
   VINARIJA MIMICA – tour booking module
   Sends reservations via FormSubmit (static GitHub Pages).
   ============================================================ */

const TOUR_BOOKING_CONFIG = {
  endpoint: 'https://formsubmit.co/ajax/info@zin1714.com',
  ownerEmail: 'info@zin1714.com',
  tours: {
    tour1: { minGuests: 6, maxGuests: 20 },
    tour2: { minGuests: 5, maxGuests: 20 },
  },
};

(function initTourBooking() {
  const root = document.getElementById('tourReserve');
  const form = document.getElementById('tourBookingForm');
  if (!root || !form) return;

  const t = (key) => (window.i18n?.t(key) ?? key);

  const els = {
    tourType: document.getElementById('tourType'),
    tourDate: document.getElementById('tourDate'),
    tourDateDisplay: document.getElementById('tourDateDisplay'),
    tourGuests: document.getElementById('tourGuests'),
    tourName: document.getElementById('tourName'),
    tourEmail: document.getElementById('tourEmail'),
    tourPhone: document.getElementById('tourPhone'),
    tourNotes: document.getElementById('tourNotes'),
    submitBtn: document.getElementById('tourSubmitBtn'),
    success: document.getElementById('tourBookingSuccess'),
    againBtn: document.getElementById('tourBookingAgain'),
    calMonthLabel: document.getElementById('calMonthLabel'),
    calWeekdays: document.getElementById('calWeekdays'),
    calDays: document.getElementById('calDays'),
    calPrev: document.getElementById('calPrev'),
    calNext: document.getElementById('calNext'),
    guestsHint: document.getElementById('tourGuestsHint'),
    errors: {
      tourType: document.getElementById('tourTypeError'),
      tourDate: document.getElementById('tourDateError'),
      tourGuests: document.getElementById('tourGuestsError'),
      tourName: document.getElementById('tourNameError'),
      tourEmail: document.getElementById('tourEmailError'),
      tourPhone: document.getElementById('tourPhoneError'),
    },
  };

  const state = {
    viewYear: null,
    viewMonth: null,
    selectedDate: null,
  };

  function locale() {
    return window.i18n?.getLang() === 'en' ? 'en-GB' : 'hr-HR';
  }

  function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function formatDateISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatDateDisplay(date) {
    return new Intl.DateTimeFormat(locale(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  function currentMonthKey() {
    const today = startOfDay(new Date());
    return { year: today.getFullYear(), month: today.getMonth() };
  }

  function isBeforeCurrentMonth(year, month) {
    const current = currentMonthKey();
    return year < current.year || (year === current.year && month < current.month);
  }

  function clampViewToCurrentMonth() {
    const current = currentMonthKey();
    if (isBeforeCurrentMonth(state.viewYear, state.viewMonth)) {
      state.viewYear = current.year;
      state.viewMonth = current.month;
    }
  }

  function updateCalNavState() {
    if (!els.calPrev) return;
    const current = currentMonthKey();
    const atCurrentMonth =
      state.viewYear === current.year && state.viewMonth === current.month;
    els.calPrev.disabled = atCurrentMonth;
    els.calPrev.setAttribute('aria-disabled', atCurrentMonth ? 'true' : 'false');
  }

  function getGuestLimits() {
    const limits = TOUR_BOOKING_CONFIG.tours[els.tourType.value];
    return limits ?? null;
  }

  function updateGuestsHint() {
    if (!els.guestsHint) return;
    const limits = getGuestLimits();
    if (!limits) {
      els.guestsHint.textContent = t('booking.guestsHintSelectTour');
      return;
    }
    els.guestsHint.textContent = t('booking.guestsMinHint').replace('{n}', String(limits.minGuests));
  }

  function populateGuests() {
    const select = els.tourGuests;
    const limits = getGuestLimits();
    const previous = select.value;
    select.innerHTML = '';

    if (!limits) {
      select.disabled = true;
      select.required = false;
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.disabled = true;
      placeholder.selected = true;
      placeholder.textContent = t('booking.guestsHintSelectTour');
      select.appendChild(placeholder);
      updateGuestsHint();
      return;
    }

    select.disabled = false;
    select.required = true;

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.selected = !previous || Number(previous) < limits.minGuests;
    placeholder.textContent = t('booking.guestsPlaceholder');
    select.appendChild(placeholder);

    for (let i = limits.minGuests; i <= limits.maxGuests; i += 1) {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = t('booking.guestsOption').replace('{n}', String(i));
      if (previous === String(i)) {
        opt.selected = true;
        placeholder.selected = false;
      }
      select.appendChild(opt);
    }

    updateGuestsHint();
  }

  function renderWeekdays() {
    const base = new Date(2024, 0, 1);
    els.calWeekdays.innerHTML = '';
    for (let i = 0; i < 7; i += 1) {
      const day = new Date(base);
      day.setDate(base.getDate() + i);
      const span = document.createElement('span');
      span.className = 'treserve__cal-weekday';
      span.textContent = new Intl.DateTimeFormat(locale(), { weekday: 'short' }).format(day);
      els.calWeekdays.appendChild(span);
    }
  }

  function renderCalendar() {
    const today = startOfDay(new Date());
    if (state.viewYear == null) {
      state.viewYear = today.getFullYear();
      state.viewMonth = today.getMonth();
    }

    clampViewToCurrentMonth();

    const monthDate = new Date(state.viewYear, state.viewMonth, 1);
    els.calMonthLabel.textContent = new Intl.DateTimeFormat(locale(), {
      month: 'long',
      year: 'numeric',
    }).format(monthDate);

    const firstDay = (monthDate.getDay() + 6) % 7;
    const daysInMonth = new Date(state.viewYear, state.viewMonth + 1, 0).getDate();
    els.calDays.innerHTML = '';

    for (let i = 0; i < firstDay; i += 1) {
      const empty = document.createElement('span');
      empty.className = 'treserve__cal-day is-empty';
      empty.setAttribute('aria-hidden', 'true');
      els.calDays.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(state.viewYear, state.viewMonth, day);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'treserve__cal-day';
      btn.textContent = String(day);
      btn.setAttribute('role', 'gridcell');
      btn.dataset.date = formatDateISO(date);

      if (startOfDay(date) < today) {
        btn.disabled = true;
      }

      if (formatDateISO(date) === formatDateISO(today)) {
        btn.classList.add('is-today');
      }

      if (state.selectedDate && formatDateISO(date) === formatDateISO(state.selectedDate)) {
        btn.classList.add('is-selected');
        btn.setAttribute('aria-selected', 'true');
      }

      btn.addEventListener('click', () => selectDate(date));
      els.calDays.appendChild(btn);
    }

    updateCalNavState();
  }

  function selectDate(date) {
    state.selectedDate = startOfDay(date);
    els.tourDate.value = formatDateISO(state.selectedDate);
    els.tourDateDisplay.textContent = formatDateDisplay(state.selectedDate);
    els.tourDateDisplay.dataset.empty = 'false';
    clearError('tourDate');
    renderCalendar();
  }

  function clearError(field) {
    const errorEl = els.errors[field];
    const inputMap = {
      tourType: els.tourType,
      tourDate: els.tourDate,
      tourGuests: els.tourGuests,
      tourName: els.tourName,
      tourEmail: els.tourEmail,
      tourPhone: els.tourPhone,
    };
    if (errorEl) errorEl.textContent = '';
    inputMap[field]?.classList.remove('is-invalid');
  }

  function setError(field, message) {
    const errorEl = els.errors[field];
    const inputMap = {
      tourType: els.tourType,
      tourDate: els.tourDate,
      tourGuests: els.tourGuests,
      tourName: els.tourName,
      tourEmail: els.tourEmail,
      tourPhone: els.tourPhone,
    };
    if (errorEl) errorEl.textContent = message;
    inputMap[field]?.classList.add('is-invalid');
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validatePhone(value) {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 8;
  }

  function validateForm() {
    let valid = true;
    Object.keys(els.errors).forEach(clearError);

    if (!els.tourType.value) {
      setError('tourType', t('booking.error.tour'));
      valid = false;
    }

    if (!els.tourDate.value) {
      setError('tourDate', t('booking.error.date'));
      valid = false;
    }

    if (!els.tourGuests.value) {
      setError('tourGuests', t('booking.error.guests'));
      valid = false;
    } else {
      const limits = getGuestLimits();
      const guests = Number(els.tourGuests.value);
      if (limits && guests < limits.minGuests) {
        setError(
          'tourGuests',
          t('booking.error.guestsMin').replace('{n}', String(limits.minGuests)),
        );
        valid = false;
      }
    }

    const name = els.tourName.value.trim();
    if (name.length < 2) {
      setError('tourName', t('booking.error.name'));
      valid = false;
    }

    const email = els.tourEmail.value.trim();
    if (!validateEmail(email)) {
      setError('tourEmail', t('booking.error.email'));
      valid = false;
    }

    const phone = els.tourPhone.value.trim();
    if (!validatePhone(phone)) {
      setError('tourPhone', t('booking.error.phone'));
      valid = false;
    }

    return valid;
  }

  function tourLabel(value) {
    if (value === 'tour1') return t('booking.tour1');
    if (value === 'tour2') return t('booking.tour2');
    return value;
  }

  function setLoading(loading) {
    els.submitBtn.classList.toggle('is-loading', loading);
    els.submitBtn.disabled = loading;
  }

  function showSuccess() {
    root.classList.add('is-success');
    els.success.hidden = false;
  }

  function resetModule() {
    form.reset();
    state.selectedDate = null;
    state.viewYear = null;
    state.viewMonth = null;
    els.tourDate.value = '';
    els.tourDateDisplay.textContent = t('booking.dateEmpty');
    els.tourDateDisplay.dataset.empty = 'true';
    Object.keys(els.errors).forEach(clearError);
    root.classList.remove('is-success');
    els.success.hidden = true;
    populateGuests();
    renderWeekdays();
    renderCalendar();
    updateTexts();
  }

  function updateTexts() {
    if (els.tourNotes) {
      els.tourNotes.placeholder = t('booking.notesPlaceholder');
    }
    if (!state.selectedDate) {
      els.tourDateDisplay.textContent = t('booking.dateEmpty');
      els.tourDateDisplay.dataset.empty = 'true';
    }
  }

  async function submitForm(event) {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const payload = {
      _subject: t('booking.emailSubject'),
      _template: 'table',
      _captcha: 'false',
      _replyto: els.tourEmail.value.trim(),
      name: els.tourName.value.trim(),
      email: els.tourEmail.value.trim(),
      phone: els.tourPhone.value.trim(),
      tour: tourLabel(els.tourType.value),
      date: state.selectedDate ? formatDateDisplay(state.selectedDate) : els.tourDate.value,
      guests: els.tourGuests.value,
      notes: els.tourNotes.value.trim() || '—',
    };

    try {
      const response = await fetch(TOUR_BOOKING_CONFIG.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Submit failed');
      }

      showSuccess();
      form.reset();
    } catch (err) {
      setError('tourEmail', t('booking.error.send'));
      console.error('Tour booking submit failed:', err);
    } finally {
      setLoading(false);
    }
  }

  els.calPrev.addEventListener('click', () => {
    if (els.calPrev.disabled) return;
    state.viewMonth -= 1;
    if (state.viewMonth < 0) {
      state.viewMonth = 11;
      state.viewYear -= 1;
    }
    clampViewToCurrentMonth();
    renderCalendar();
  });

  els.calNext.addEventListener('click', () => {
    state.viewMonth += 1;
    if (state.viewMonth > 11) {
      state.viewMonth = 0;
      state.viewYear += 1;
    }
    renderCalendar();
  });

  els.tourType.addEventListener('change', () => {
    populateGuests();
    clearError('tourType');
    clearError('tourGuests');
  });

  form.addEventListener('submit', submitForm);
  els.againBtn.addEventListener('click', resetModule);

  ['input', 'change'].forEach((eventName) => {
    form.addEventListener(eventName, (e) => {
      const id = e.target.id;
      const map = {
        tourType: 'tourType',
        tourGuests: 'tourGuests',
        tourName: 'tourName',
        tourEmail: 'tourEmail',
        tourPhone: 'tourPhone',
      };
      if (map[id]) clearError(map[id]);
    });
  });

  document.addEventListener('languagechange', () => {
    populateGuests();
    renderWeekdays();
    renderCalendar();
    updateTexts();
    updateGuestsHint();
  });

  populateGuests();
  renderWeekdays();
  renderCalendar();
  updateTexts();
  updateGuestsHint();
})();
