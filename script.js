document.addEventListener('DOMContentLoaded', () => {

  // --- Scroll progress bar ---
  const progressBar = document.getElementById('scrollProgress');
  function updateProgress() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (window.scrollY / h * 100) + '%';
  }

  // --- Nav scroll ---
  const nav = document.getElementById('nav');
  function updateNav() {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  }

  // --- Scroll reveal ---
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('v'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.r, .line-reveal').forEach(el => observer.observe(el));

  // --- Scroll listener (throttled) ---
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        updateNav();
        parallaxShapes();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // --- Smooth scroll anchors ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute('href'));
      if (t) {
        const y = t.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // --- Parallax floating shapes ---
  const shapes = document.querySelectorAll('.hero-shape');
  function parallaxShapes() {
    const sy = window.scrollY;
    shapes.forEach((s, i) => {
      const speed = (i + 1) * 0.08;
      s.style.transform = `translateY(${sy * speed}px)`;
    });
  }

  // --- Magnetic button effect ---
  document.querySelectorAll('.magnetic').forEach(wrap => {
    const btn = wrap.querySelector('.btn') || wrap;
    wrap.addEventListener('mousemove', e => {
      const r = wrap.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      wrap.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });
    wrap.addEventListener('mouseleave', () => {
      wrap.style.transform = '';
    });
  });

  // --- Hero title hover tilt ---
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle) {
    const heroSection = document.querySelector('.hero');
    heroSection.addEventListener('mousemove', e => {
      const r = heroSection.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      heroTitle.style.transform = `translate(${x * 8}px, ${y * 5}px)`;
    });
    heroSection.addEventListener('mouseleave', () => {
      heroTitle.style.transform = '';
    });
  }

  // --- Registration form ---
  const regForm = document.getElementById('registrationForm');
  const formSuccess = document.getElementById('formSuccess');
  regForm.addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      name: document.getElementById('reg-name').value,
      email: document.getElementById('reg-email').value,
      phone: document.getElementById('reg-phone').value,
      age: document.getElementById('reg-age').value,
      excited: document.getElementById('reg-excited').value,
      timestamp: new Date().toISOString()
    };
    const list = JSON.parse(localStorage.getItem('her_reg') || '[]');
    list.push(data);
    localStorage.setItem('her_reg', JSON.stringify(list));
    regForm.style.display = 'none';
    formSuccess.classList.add('show');
  });

  // --- Whisper Wall ---
  const whisperInput = document.getElementById('whisperInput');
  const whisperWall = document.getElementById('whisperWall');
  let selectedMood = null;

  document.querySelectorAll('.mood-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const was = selectedMood === tag.dataset.mood;
      document.querySelectorAll('.mood-tag').forEach(t => t.classList.remove('active'));
      selectedMood = was ? null : tag.dataset.mood;
      if (!was) tag.classList.add('active');
    });
  });

  const seeds = [
    { text: "I've been carrying something for months and I didn't realize how heavy it was until I tried to say it out loud. I couldn't finish the sentence.", mood: "heavy", time: "2h ago" },
    { text: "Today I picked myself over the thing I thought I needed. It was terrifying. And really, really good.", mood: "free", time: "5h ago" },
    { text: "I keep waiting to feel ready. I'm starting to think ready isn't coming, and maybe I should just go anyway.", mood: "hopeful", time: "8h ago" },
    { text: "Someone told me my voice matters and I almost laughed. But then I thought about it for three days straight.", mood: "hopeful", time: "1d ago" },
    { text: "The bravest thing I did this week was admit I wasn't fine when someone asked.", mood: "heavy", time: "1d ago" },
    { text: "Found my people at 22. Late start but I'll take it.", mood: "grateful", time: "3d ago" },
    { text: "I used to mistake silence for strength. I don't anymore.", mood: "free", time: "5d ago" },
    { text: "Some nights you just need to know someone else is awake too, thinking too hard about everything.", mood: "lost", time: "1w ago" },
  ];

  function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

  function timeAgo(iso) {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
  }

  function renderWall() {
    whisperWall.innerHTML = '';
    const stored = JSON.parse(localStorage.getItem('her_whispers') || '[]');
    const all = [...stored.map(w => ({ ...w, time: timeAgo(w.timestamp) })), ...seeds];
    all.forEach((w, i) => {
      const card = document.createElement('div');
      card.className = 'wall-card';
      card.style.animationDelay = i * 0.06 + 's';
      card.innerHTML = `<p class="wall-card-text">${esc(w.text)}</p>
        <div class="wall-card-meta"><span>${w.time}</span>${w.mood ? `<span class="wall-card-mood">${w.mood}</span>` : ''}</div>`;
      whisperWall.appendChild(card);
    });
  }

  document.getElementById('whisperSubmit').addEventListener('click', () => {
    const text = whisperInput.value.trim();
    if (!text) return;
    const stored = JSON.parse(localStorage.getItem('her_whispers') || '[]');
    stored.unshift({ text, mood: selectedMood, timestamp: new Date().toISOString() });
    localStorage.setItem('her_whispers', JSON.stringify(stored));
    whisperInput.value = '';
    selectedMood = null;
    document.querySelectorAll('.mood-tag').forEach(t => t.classList.remove('active'));
    renderWall();
  });

  renderWall();

  // --- Newsletter ---
  document.getElementById('newsletterForm').addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('btn-newsletter');
    btn.textContent = 'Joined';
    btn.style.background = '#2D6A4F';
    setTimeout(() => { btn.textContent = 'Join'; btn.style.background = ''; document.getElementById('newsletter-email').value = ''; }, 2500);
  });

  // --- Init ---
  updateProgress();
  updateNav();
});
