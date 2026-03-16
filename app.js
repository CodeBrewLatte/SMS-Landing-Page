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

  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');

  const VALID_CODE = '12345';

  // Format phone as (XXX) XXX-XXXX
  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function getDigits(value) {
    return value.replace(/\D/g, '');
  }

  function updateVerifyBtn() {
    const digits = getDigits(phoneInput.value);
    verifyBtn.disabled = !(digits.length === 10 && consentCheckbox.checked);
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
  });

  consentCheckbox.addEventListener('change', updateVerifyBtn);

  // Open modal
  verifyBtn.addEventListener('click', () => {
    const formatted = phoneInput.value;
    document.getElementById('modalPhoneDisplay').textContent = formatted;
    document.getElementById('codeSentTo').textContent = formatted;
    document.getElementById('optedInNumber').textContent = formatted;

    showStep(1);
    modalOverlay.classList.add('active');
  });

  // Close modal
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
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

  // Send code button — simulate sending
  sendCodeBtn.addEventListener('click', () => {
    sendCodeBtn.classList.add('loading');
    setTimeout(() => {
      sendCodeBtn.classList.remove('loading');
      showStep(2);
    }, 1200);
  });

  // Code digit inputs — auto advance
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

    // Allow pasting full code
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

  // Verify code
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

  // Resend link
  resendLink.addEventListener('click', (e) => {
    e.preventDefault();
    resendLink.textContent = 'Code sent!';
    resendLink.style.pointerEvents = 'none';
    setTimeout(() => {
      resendLink.textContent = 'Resend';
      resendLink.style.pointerEvents = '';
    }, 2000);
  });

  // Done button — close and reset
  doneBtn.addEventListener('click', () => {
    closeModal();
    // Update the main page to show opted-in state
    verifyBtn.textContent = 'Opted In';
    verifyBtn.disabled = true;
    verifyBtn.style.background = '#2D6B2D';
    verifyBtn.style.opacity = '1';
  });
})();
