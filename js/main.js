document.addEventListener('DOMContentLoaded', () => {

  /* ───────── WOW.js ───────── */
  new WOW({ offset: 80, mobile: true, live: true }).init();

  /* ───────── Navbar scroll shadow ───────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  /* ───────── Custom Hamburger + Slide Drawer ───────── */
  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('mobile-drawer');

  function toggleDrawer(open) {
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    if (open) {
      drawer.style.display = 'block';
      requestAnimationFrame(() => drawer.classList.add('open'));
    } else {
      drawer.classList.remove('open');
      setTimeout(() => { drawer.style.display = 'none'; }, 320);
    }
  }

  hamburger.addEventListener('click', () => toggleDrawer(!hamburger.classList.contains('open')));
  hamburger.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDrawer(!hamburger.classList.contains('open')); }
  });
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleDrawer(false)));
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target) && !drawer.contains(e.target)) toggleDrawer(false);
  });

  /* ───────── Active nav highlight on scroll ───────── */
  const sections = document.querySelectorAll('section[id]');
  const navAs    = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
    navAs.forEach(a => {
      a.parentElement.style.background = '';
      if (a.getAttribute('href') === '#' + cur) a.parentElement.style.background = 'var(--green-light)';
    });
  }, { passive: true });

  /* ───────── Scroll to top button ───────── */
  const scrollTopBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ═══════════════════════════════════════════════════
     CONTACT FORM → contact.php → PHPMailer → Gmail
     Chống spam: Honeypot + Rate-limit 60s client-side
  ═══════════════════════════════════════════════════ */
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const successBox = document.getElementById('form-success');
  const errorBox   = document.getElementById('form-error');
  const errorMsg   = document.getElementById('form-error-msg');

  let lastSubmit   = 0;
  const RATE_LIMIT = 60_000;

  function showFeedback(type, msg) {
    successBox.classList.remove('show');
    errorBox.classList.remove('show');
    if (type === 'success') successBox.classList.add('show');
    if (type === 'error')   { errorMsg.textContent = msg || 'Có lỗi xảy ra.'; errorBox.classList.add('show'); }
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    /* 1. Honeypot */
    if ((this.querySelector('[name="website"]') || {}).value) {
      showFeedback('success'); return;
    }

    /* 2. Rate-limit client */
    const now = Date.now();
    if (now - lastSubmit < RATE_LIMIT) {
      const remain = Math.ceil((RATE_LIMIT - (now - lastSubmit)) / 1000);
      showFeedback('error', `Vui lòng chờ ${remain} giây trước khi gửi lại.`);
      return;
    }

    /* 3. Validate */
    const name  = this.name.value.trim();
    const phone = this.phone.value.trim().replace(/\s/g, '');
    const email = this.email.value.trim();

    if (!name || name.length < 2) {
      showFeedback('error', 'Vui lòng nhập họ tên hợp lệ (ít nhất 2 ký tự).'); return;
    }
    if (!/^(0|\+84)[0-9]{8,10}$/.test(phone)) {
      showFeedback('error', 'Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.'); return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFeedback('error', 'Địa chỉ email không hợp lệ.'); return;
    }

    /* 4. Loading UI */
    submitBtn.disabled     = true;
    submitText.textContent = 'Đang gửi...';
    successBox.classList.remove('show');
    errorBox.classList.remove('show');

    try {
      const API_URL = 'https://aas-api-i8if.onrender.com/contact';
      const res  = await fetch(API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name,
          phone,
          email,
          service: this.service.value,
          note:    this.note.value.trim(),
          website: (this.querySelector('[name="website"]') || {}).value || '',
        }),
      });
      const json = await res.json();

      if (json.ok) {
        lastSubmit = Date.now();
        showFeedback('success');
        form.reset();
      } else {
        showFeedback('error', json.error || 'Gửi thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('[GreenClean] Form error:', err);
      showFeedback('error', 'Không thể kết nối. Vui lòng gọi hotline hoặc thử lại sau.');
    } finally {
      submitBtn.disabled     = false;
      submitText.textContent = 'Gửi yêu cầu tư vấn';
    }
  });

});
