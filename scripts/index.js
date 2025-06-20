const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();
function initStars(count = 120) {
    stars = [];
    for (let i = 0; i < count; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.3,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
        a: Math.random(),
        da: Math.random() * 0.02 + 0.005
    });
    }
}
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let s of stars) {
    s.x += s.vx; s.y += s.vy;
    if (s.x < 0 || s.x > canvas.width) s.vx *= -1;
    if (s.y < 0 || s.y > canvas.height) s.vy *= -1;
    s.a += s.da;
    if (s.a <= 0 || s.a >= 1) s.da *= -1;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(255,255,255,${s.a})`;
    ctx.shadowBlur = s.r * 4;
    ctx.shadowColor = '#fff';
    ctx.fill();
    }
    requestAnimationFrame(animate);
}
initStars();
animate();

// ── AOS Scroll Animations ──
AOS.init({
  duration: 800,
  once: true
});

// ── Animated Counters ──
const counters = document.querySelectorAll('.counter');
const speed = 200;
counters.forEach(counter => {
  const update = () => {
    const target = +counter.dataset.target;
    const count  = +counter.innerText;
    const inc    = target / speed;
    if (count < target) {
      counter.innerText = Math.ceil(count + inc);
      setTimeout(update, 20);
    } else {
      counter.innerText = target;
    }
  };
  // only start when scrolled into view
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      update();
      this.disconnect();
    }
  }, { threshold: 0.5 }).observe(counter);
});
