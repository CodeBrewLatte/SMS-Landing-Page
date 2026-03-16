(() => {
  // Elements
  const phoneInput = document.getElementById('phoneInput');
  const consentCheckbox = document.getElementById('consentCheckbox');
  const verifyBtn = document.getElementById('verifyBtn');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const sendCodeBtn = document.getElementById('sendCodeBtn');
  const verifyCodeBtn = document.getElementById('verifyCodeBtn');
  const doneBtn = document.getElementById('doneBtn');
  const resendLink = document.getElementById('resendLink');
  const codeError = document.getElementById('codeError');
  const codeDigits = document.querySelectorAll('.code-digit');
  const phoneMismatch = document.getElementById('phoneMismatch');
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  const consentText = document.getElementById('consentText');
  const successMessage = document.getElementById('successMessage');
  const orgSelector = document.getElementById('orgSelector');
  const debugToggles = document.querySelectorAll('.debug-toggle');

  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');

  const VALID_CODE = '12345';
  const PHONE_ON_FILE = '2123339313'; // (212) 333-9313

  let currentUserType = 'pro';

  // ==================== USER TYPE (DEBUG TOGGLE) ====================

  const content = {
    pro: {
      title: 'Sign up for SMS alerts',
      subtitle: 'Get real-time notifications when your clients take action — hub logins, lead form submissions, refinance rate views, and other high-intent activity — delivered straight to your phone.',
      consent: 'I agree to receive recurring automated SMS alerts from <strong>Greenfield Mortgage</strong> at the phone number provided, including notifications about client activity such as hub logins, lead submissions, and engagement events. Message & data rates may apply. Message frequency varies. Reply STOP to opt out at any time. Reply HELP for help. <a href="#">Privacy Policy</a> · <a href="#">Terms of Service</a>',
      success: (num) => `SMS alerts are now active for <strong>${num}</strong>. You'll receive real-time notifications when your clients take action.`
    },
    consumer: {
      title: 'Sign up for SMS updates',
      subtitle: 'Stay informed about your home\'s value, discover ways to save money on your mortgage, and get tips to build long-term wealth — all delivered straight to your phone.',
      consent: 'I agree to receive recurring automated SMS updates from <strong>Greenfield Mortgage</strong> at the phone number provided, including updates about my home value, mortgage savings opportunities, and wealth-building tips. Message & data rates may apply. Message frequency varies. Reply STOP to opt out at any time. Reply HELP for help. <a href="#">Privacy Policy</a> · <a href="#">Terms of Service</a>',
      success: (num) => `SMS updates are now active for <strong>${num}</strong>. You'll receive updates on your home's value, savings tips, and ways to build wealth.`
    }
  };

  function switchUserType(type) {
    if (type === currentUserType) return;
    currentUserType = type;

    debugToggles.forEach(b => b.classList.toggle('active', b.dataset.type === type));

    pageTitle.textContent = content[type].title;
    pageSubtitle.textContent = content[type].subtitle;
    consentText.innerHTML = content[type].consent;

    // Show/hide org selector (pro only)
    if (type === 'pro') {
      orgSelector.classList.remove('hidden');
    } else {
      orgSelector.classList.add('hidden');
    }
  }

  debugToggles.forEach(btn => {
    btn.addEventListener('click', () => switchUserType(btn.dataset.type));
  });

  // ==================== ORG SELECTOR ====================

  const orgDropdown = document.getElementById('orgDropdown');
  const orgTrigger = document.getElementById('orgTrigger');
  const orgSummary = document.getElementById('orgSummary');
  const orgCheckboxes = document.querySelectorAll('.org-checkbox');

  // Toggle dropdown
  orgTrigger.addEventListener('click', () => {
    orgDropdown.classList.toggle('open');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!orgDropdown.contains(e.target)) {
      orgDropdown.classList.remove('open');
    }
  });

  function updateOrgSummary() {
    const total = orgCheckboxes.length;
    const selected = document.querySelectorAll('.org-checkbox:checked');
    const count = selected.length;

    if (count === 0) {
      orgSummary.textContent = 'No organizations selected';
    } else if (count === total) {
      orgSummary.textContent = `All ${total} organizations selected`;
    } else if (count <= 2) {
      const names = Array.from(selected).map(c =>
        c.closest('.org-item').querySelector('span:last-child').textContent
      );
      orgSummary.textContent = names.join(', ');
    } else {
      orgSummary.textContent = `${count} of ${total} organizations selected`;
    }
  }

  orgCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      updateOrgSummary();

      const selected = document.querySelectorAll('.org-checkbox:checked');
      if (selected.length > 0) {
        const orgNames = Array.from(selected).map(c => {
          return c.closest('.org-item').querySelector('span:last-child').textContent;
        });
        const orgList = orgNames.length === 1
          ? `<strong>${orgNames[0]}</strong>`
          : orgNames.slice(0, -1).map(n => `<strong>${n}</strong>`).join(', ') + ` and <strong>${orgNames[orgNames.length - 1]}</strong>`;

        consentText.innerHTML = `I agree to receive recurring automated SMS alerts from ${orgList} at the phone number provided, including notifications about client activity such as hub logins, lead submissions, and engagement events. Message & data rates may apply. Message frequency varies. Reply STOP to opt out at any time. Reply HELP for help. <a href="#">Privacy Policy</a> · <a href="#">Terms of Service</a>`;
      }
      updateVerifyBtn();
    });
  });

  // ==================== PHONE MISMATCH ====================

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function getDigits(value) {
    return value.replace(/\D/g, '');
  }

  function checkPhoneMismatch() {
    const digits = getDigits(phoneInput.value);
    if (digits.length === 10 && digits !== PHONE_ON_FILE) {
      phoneMismatch.classList.remove('hidden');
    } else {
      phoneMismatch.classList.add('hidden');
    }
  }

  function updateVerifyBtn() {
    const digits = getDigits(phoneInput.value);
    const hasPhone = digits.length === 10;
    const hasConsent = consentCheckbox.checked;

    // For pro, need at least one org selected
    let hasOrg = true;
    if (currentUserType === 'pro') {
      hasOrg = document.querySelectorAll('.org-checkbox:checked').length > 0;
    }

    verifyBtn.disabled = !(hasPhone && hasConsent && hasOrg);
  }

  // Phone input formatting
  phoneInput.addEventListener('input', () => {
    const cursorPos = phoneInput.selectionStart;
    const oldLength = phoneInput.value.length;
    phoneInput.value = formatPhone(phoneInput.value);
    const newLength = phoneInput.value.length;
    const newPos = cursorPos + (newLength - oldLength);
    phoneInput.setSelectionRange(newPos, newPos);
    updateVerifyBtn();
    checkPhoneMismatch();
  });

  consentCheckbox.addEventListener('change', updateVerifyBtn);

  // ==================== MODAL ====================

  verifyBtn.addEventListener('click', () => {
    const formatted = phoneInput.value;
    const digits = getDigits(phoneInput.value);
    const isDifferent = digits !== PHONE_ON_FILE;

    document.getElementById('modalPhoneDisplay').textContent = formatted;
    document.getElementById('codeSentTo').textContent = formatted;
    document.getElementById('optedInNumber').textContent = formatted;

    // Build success message
    let successText = content[currentUserType].success(formatted);

    // For pro, list the selected orgs
    if (currentUserType === 'pro') {
      const selected = document.querySelectorAll('.org-checkbox:checked');
      if (selected.length > 0 && selected.length < orgCheckboxes.length) {
        const orgNames = Array.from(selected).map(c =>
          c.closest('.org-item').querySelector('span:last-child').textContent
        );
        successText += `<br><span style="font-size:13px; color:#555;">Subscribed to: ${orgNames.join(', ')}</span>`;
      }
    }

    if (isDifferent) {
      successText += '<br><span style="color:#7a6a1e; font-size:12.5px;">The phone number ending in 9313 has been replaced with this number.</span>';
    }

    successMessage.innerHTML = successText;

    showStep(1);
    modalOverlay.classList.add('active');
  });

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // "Go back" link in step 1 — close modal and focus phone input
  document.getElementById('changeNumberLink').addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
    phoneInput.focus();
    phoneInput.select();
  });

  function closeModal() {
    modalOverlay.classList.remove('active');
  }

  function showStep(n) {
    step1.classList.toggle('hidden', n !== 1);
    step2.classList.toggle('hidden', n !== 2);
    step3.classList.toggle('hidden', n !== 3);

    if (n === 2) {
      codeDigits.forEach(d => { d.value = ''; });
      codeError.classList.add('hidden');
      verifyCodeBtn.disabled = true;
      setTimeout(() => codeDigits[0].focus(), 100);
    }
  }

  sendCodeBtn.addEventListener('click', () => {
    sendCodeBtn.classList.add('loading');
    setTimeout(() => {
      sendCodeBtn.classList.remove('loading');
      showStep(2);
    }, 1200);
  });

  // Code digit inputs
  codeDigits.forEach((input, i) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '');
      e.target.value = val.slice(0, 1);
      if (val && i < codeDigits.length - 1) {
        codeDigits[i + 1].focus();
      }
      checkCodeComplete();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && i > 0) {
        codeDigits[i - 1].focus();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 5);
      pasted.split('').forEach((ch, idx) => {
        if (codeDigits[idx]) codeDigits[idx].value = ch;
      });
      if (pasted.length > 0) {
        const focusIdx = Math.min(pasted.length, codeDigits.length - 1);
        codeDigits[focusIdx].focus();
      }
      checkCodeComplete();
    });
  });

  function checkCodeComplete() {
    const code = Array.from(codeDigits).map(d => d.value).join('');
    verifyCodeBtn.disabled = code.length < 5;
  }

  verifyCodeBtn.addEventListener('click', () => {
    const code = Array.from(codeDigits).map(d => d.value).join('');

    if (code === VALID_CODE) {
      verifyCodeBtn.classList.add('loading');
      setTimeout(() => {
        verifyCodeBtn.classList.remove('loading');
        showStep(3);
      }, 800);
    } else {
      codeError.classList.remove('hidden');
      codeDigits.forEach(d => {
        d.value = '';
        d.style.borderColor = '#c0392b';
      });
      codeDigits[0].focus();
      setTimeout(() => {
        codeDigits.forEach(d => { d.style.borderColor = ''; });
      }, 1500);
    }
  });

  resendLink.addEventListener('click', (e) => {
    e.preventDefault();
    resendLink.textContent = 'Code sent!';
    resendLink.style.pointerEvents = 'none';
    setTimeout(() => {
      resendLink.textContent = 'Resend';
      resendLink.style.pointerEvents = '';
    }, 2000);
  });

  doneBtn.addEventListener('click', () => {
    closeModal();
    verifyBtn.textContent = 'Opted In';
    verifyBtn.disabled = true;
    verifyBtn.style.background = '#2D6B2D';
    verifyBtn.style.opacity = '1';
  });
})();
