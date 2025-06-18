/* ------------------------------------------------------------------
   Tarot page JS – now wrapped in DOMContentLoaded & self-healing
------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Starfield canvas (auto-create if absent) ---------- */
  let cv = document.getElementById('star');
  if (!cv) {
    cv = document.createElement('canvas');
    cv.id = 'star';
    cv.setAttribute('aria-hidden', 'true');
    document.body.prepend(cv);
  }
  const ctx = cv.getContext('2d');
  function fit() {
    cv.width = innerWidth;
    cv.height = innerHeight;
  }
  fit();
  addEventListener('resize', fit);

  const stars = [...Array(160)].map(() => ({
    x: Math.random() * cv.width,
    y: Math.random() * cv.height,
    r: Math.random() * 1.2 + 0.3,
    vx: (Math.random() - 0.5) * 0.05,
    vy: (Math.random() - 0.5) * 0.05,
    a: Math.random(),
    da: Math.random() * 0.015 + 0.005
  }));

  (function tick() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (const s of stars) {
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0 || s.x > cv.width) s.vx *= -1;
      if (s.y < 0 || s.y > cv.height) s.vy *= -1;
      s.a += s.da;
      if (s.a <= 0 || s.a >= 1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(255,255,255,${s.a})`;
      ctx.shadowBlur = s.r * 4;
      ctx.shadowColor = '#fff';
      ctx.fill();
    }
    requestAnimationFrame(tick);
  })();

  /* ---------- 2. Ensure the hero/fan markup exists ---------- */
  const hero = document.querySelector('.hero') || document.body;

  let fanWrap = document.getElementById('fanWrap');
  if (!fanWrap) {
    fanWrap = document.createElement('div');
    fanWrap.id = 'fanWrap';
    hero.prepend(fanWrap);
  }

  let fan = document.getElementById('fan');
  if (!fan) {
    fan = document.createElement('div');
    fan.id = 'fan';
    fanWrap.appendChild(fan);
  }

  let promptTxt = document.getElementById('prompt');
  if (!promptTxt) {
    promptTxt = document.createElement('p');
    promptTxt.id = 'prompt';
    promptTxt.textContent = 'Select a card for today';
    fanWrap.appendChild(promptTxt);
  }

  /* ---------- 3. Result / details panel (same guard) ---------- */
  let result = document.getElementById('result');
  if (!result) {
    result = document.createElement('div');
    result.id = 'result';
    result.innerHTML = `
      <div class="view" id="view"></div>
      <div class="info" id="details"></div>`;
    hero.appendChild(result);
  }
  const view = document.getElementById('view');
  const details = document.getElementById('details');

  /* ---------- 4. Tarot-fan code (unchanged behaviour) ---------- */
  let DECK = [];
  fetch('tarot-details.json')
    .then(r => r.json())
    .then(d => {
      DECK = d.cards;
      buildFan();
    });

    function buildFan () {

        const mobile = innerWidth < 768,
        // Controls the number of cards 11 on small screens, otherwise 21.
        picks  = [...DECK].sort(() => 0.5 - Math.random()).slice(0, mobile ? 11 : 19),
        total  = picks.length,

        // r is the radius of the deck fan circle.
        r = fan.clientWidth * 0.95 / 2, 
        cx = fan.clientWidth / 2,
        cy = 60;

        picks.forEach((card, i) => {

            let final, z = 0;

            // arcSpread controls the total degrees the deck fan covers.
            // startOffset controls where the deck fan will start in the circle
            const arcSpread  = 120;   
            const startOffset = 30; 

            if (mobile) {                            /* stacked concertina */
                const mid = Math.floor(total / 2),
                step  = 26,                      // horizontal gap
                x = (i - mid) * step + cx - 59,
                y = cy,
                scale = 1 - Math.abs(i - mid) * 0.05;

                final = `translate(${x}px,${y}px) scale(${scale})`;
                z = 100 - Math.abs(i - mid);       // middle card on top
            }
            else {            
                // Original arc fan for Desktop screens.                     
                const ang = startOffset + (arcSpread / (total - 1)) * i,

                        rad = ang * Math.PI / 180,
                        x   = cx + Math.cos(rad) * r - 59,
                        y   = cy + Math.sin(rad) * r - 85;

                final = `translate(${x}px,${y}px) rotateZ(${ang - 90}deg)`;
            }

            /* ---------- element creation (unchanged) ---------- */
            const el = document.createElement('div');
            el.className      = 'card init';
            el.style.zIndex   = z;
            el.style.transform= final + ' scale(.05)';
            el.style.opacity  = 0;
            el.innerHTML      = `
            <div class="face back"></div>
            <div class="face front"><img alt=""></div>`;
            el._data = card;
            el.addEventListener('click', onPick);
            fan.appendChild(el);

            /* stagger-in animation */
            setTimeout(() => {
            el.classList.add('show');
            el.style.transition = 'transform .9s ease, opacity .9s ease';
            el.style.transform  = final;
            el.style.opacity    = 1;
            }, i * 70);
        });
    }

  /* ---------- click-to-draw (same as previous answer) ---------- */
  function onPick(e) {
    const card = e.currentTarget,
      mobile = innerWidth < 768;

    fan.querySelectorAll('.card').forEach(c => {
      if (c !== card) c.classList.add('fade');
    });
    fan.style.pointerEvents = 'none';
    promptTxt.style.opacity = 0;

    card.querySelector('.front img').src = `assets/cards/${card._data.img}`;

    // sparkle
    const spark = document.createElement('div');
    spark.className = 'spark';
    card.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove(), { once: true });

    // promote to fixed layer
    const start = card.getBoundingClientRect();
    document.body.appendChild(card);
    Object.assign(card.style, {
      position: 'fixed',
      margin: 0,
      zIndex: 5,
      left: start.left + 'px',
      top: start.top + 'px',
      transform: 'translate(0,0)',
      transition: 'none'
    });

    fanWrap.style.opacity = 0;
    fanWrap.addEventListener('transitionend', () => {
      fanWrap.remove();
      showResult(card, mobile);
    }, { once: true });
  }

  function showResult(card, mobile) {
    result.style.display = 'flex';
    document.querySelector('.hero').style.paddingBottom = '0px';


    requestAnimationFrame(() => {
      const first = card.getBoundingClientRect(),
        last = view.getBoundingClientRect(),
        dx = last.left - first.left,
        dy = last.top - first.top + 20;

      card.style.transition = 'transform 1.8s cubic-bezier(.25,.7,.3,1)';

      /* Below line controls the final position of the card after flipping*/ 
      card.style.transform = `translate(${dx+130}px,${dy+40}px) rotateY(180deg)`;

      card.addEventListener('transitionend', () => {
        card.style.transition = 'none';
        card.style.position = 'relative';
        card.style.left = '';
        card.style.top = '';
        card.style.transform = 'rotateY(180deg)';
        view.appendChild(card);
        card.removeEventListener('click', onPick);

        const title = document.createElement('p');
        title.className = 'card-title';
        title.textContent = card._data.name;
        view.appendChild(title);

        result.classList.add('show');
      }, { once: true });
    });

    fillDetails(card._data);
  }

  function fillDetails(c) {
    const rev = Math.random() > 0.5;
    details.innerHTML = `
      <h2>${c.name}</h2>
      <h3>${c.arcana}</h3>
      <p><strong>Orientation:</strong> ${rev ? 'Reversed' : 'Upright'}</p>
      <p><strong>Meaning:</strong> ${(rev ? c.meanings.shadow : c.meanings.light).join(', ')}</p>
      <p><strong>Fortune Telling:</strong> ${c.fortune_telling.join(', ')}</p>
      <p><strong>Focus&nbsp;On:</strong> ${c.keywords.join(', ')}</p>
        <div class="draw-again">
            <button id="again">Draw Again</button>
        </div>`;
    details.querySelector('#again').addEventListener('click', () => location.reload());
  }

});