/* ------------------------------------------------------------------
   Three-Card Tarot Spread JS – based on your single-card script
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
  function fit() { cv.width = innerWidth; cv.height = innerHeight; }
  fit();
  addEventListener('resize', fit);

  const stars = [...Array(160)].map(() => ({
    x:  Math.random() * cv.width,
    y:  Math.random() * cv.height,
    r:  Math.random() * 1.2 + .3,
    vx: (Math.random() - .5) * .05,
    vy: (Math.random() - .5) * .05,
    a:  Math.random(),
    da: Math.random() * .015 + .005
  }));

  (function tick() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (const s of stars) {
      s.x += s.vx; s.y += s.vy;
      if (s.x < 0 || s.x > cv.width)  s.vx *= -1;
      if (s.y < 0 || s.y > cv.height) s.vy *= -1;
      s.a += s.da;
      if (s.a <= 0 || s.a >= 1)       s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 2*Math.PI);
      ctx.fillStyle   = `rgba(255,255,255,${s.a})`;
      ctx.shadowBlur  = s.r * 4;
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
    promptTxt.textContent = 'Select your PAST card';
    fanWrap.appendChild(promptTxt);
  }

  /* ---------- 3. Set up a 3-section result panel ---------- */
  let result = document.getElementById('result');
  if (!result) {
    result = document.createElement('div');
    result.id = 'result';
    result.style.display = 'none';
    result.innerHTML = `
      <div class="result-section" id="past">
        <div class="view"></div><div class="info"></div>
      </div>
      <div class="result-section" id="present">
        <div class="view"></div><div class="info"></div>
      </div>
      <div class="result-section" id="future">
        <div class="view"></div><div class="info"></div>
      </div>`;
    hero.appendChild(result);
  }
  const sections = Array.from(result.querySelectorAll('.result-section'));

  /* ---------- 4. Prepare multi-pick state ---------- */
  const labels         = ['Past','Present','Future'];
  const selectedCards  = [];
  let   DECK           = [];

  fetch('tarot-details.json')
    .then(r => r.json())
    .then(d => {
      DECK = d.cards;
      buildFan();
    });

    const drawAllBtn = document.getElementById('draw-all');
    if (drawAllBtn) {
        drawAllBtn.addEventListener('click', () => {
            // only allow one batch
            if (selectedCards.length) return;
            // pick the first three cards in the fan
            const cards = Array.from(document.querySelectorAll('#fan .card'))
                                .slice(0, 3);
            // simulate user clicks
            cards.forEach(c => c.click());
        });
    }

  /* ---------- 5. Fan-building (attach onMultiPick) ---------- */
  function buildFan() {
    const mobile = innerWidth < 768,
          picks  = [...DECK]
                     .sort(() => 0.5 - Math.random())
                     .slice(0, mobile ? 11 : 19),
          total  = picks.length,
          r      = fan.clientWidth * .95 / 2,
          cx     = fan.clientWidth / 2,
          cy     = 60;

    picks.forEach((card, i) => {
      let final, z = 0;
      const arcSpread   = 120,
            startOffset = 30;

      if (mobile) {
        const mid   = Math.floor(total/2),
              step  = 26,
              x     = (i-mid)*step + cx - 59,
              y     = cy,
              scale = 1 - Math.abs(i-mid)*.05;
        final = `translate(${x}px,${y}px) scale(${scale})`;
        z     = 100 - Math.abs(i-mid);
      } else {
        const ang = startOffset + (arcSpread/(total-1))*i,
              rad = ang * Math.PI/180,
              x   = cx + Math.cos(rad)*r - 59,
              y   = cy + Math.sin(rad)*r - 85;
        final = `translate(${x}px,${y}px) rotateZ(${ang-90}deg)`;
      }

      const el = document.createElement('div');
      el.className        = 'card init';
      el.style.zIndex     = z;
      el.style.transform  = final + ' scale(.05)';
      el.style.opacity    = 0;
      el.innerHTML        = `
        <div class="face back"></div>
        <div class="face front"><img alt=""></div>`;
      el._data            = card;
      el.addEventListener('click', onMultiPick);
      fan.appendChild(el);

      setTimeout(() => {
        el.classList.add('show');
        el.style.transition = 'transform .9s ease, opacity .9s ease';
        el.style.transform  = final;
        el.style.opacity    = 1;
      }, i * 70);
    });
  }

  /* ---------- 6. Handle each of the three picks ---------- */
function onMultiPick(e) {
  const card = e.currentTarget;
  // guard against double-clicking the same card
  if (card.classList.contains('selected')) return;

  // reveal its face
  card.querySelector('.front img')
      .src = `assets/cards/${card._data.img}`;

  // highlight & lock it in
  card.classList.add('selected');
  card.removeEventListener('click', onMultiPick);
  selectedCards.push(card);

  // prompt the next pick (unless we just picked the 3rd)
  if (selectedCards.length < 3) {
    promptTxt.textContent =
      `Select your ${labels[selectedCards.length]} card`;
    return;
  }

  // on the 3rd pick: hide the deck + prompt and jump straight to results
  fanWrap.style.display   = 'none';
  promptTxt.style.display = 'none';

  // make sure your #result container is visible
  result.style.display = 'flex';

  // now lay out the spread
  showThreeCardResults();
}

  /* ---------- 7. Render the Past/Present/Future sections ---------- */
    function showThreeCardResults() {
        // if you have a “fade-in” on .show, you can re-trigger it:
        requestAnimationFrame(() => result.classList.add('show'));

        // When the result is displayed: 1. Hide draw all btn  2. Reduce the padding-bottom of the hero section.
        drawAllBtn.style.display = 'none';
        document.querySelector('.hero').style.paddingBottom = '0px';

        selectedCards.forEach((card, i) => {
            const section = sections[i];
            const view    = section.querySelector('.view');
            const info    = section.querySelector('.info');

            // flip and move into its slot
            card.style.transition = 'none';
            card.style.transform  = 'rotateY(180deg)';
            card.style.position   = 'relative';
            view.appendChild(card);

            // add “Past: The Fool” etc.
            const title = document.createElement('p');
            title.className   = 'card-title';
            title.textContent = `${labels[i]}: ${card._data.name}`;
            view.appendChild(title);

            // fill in the details
            fillDetailsMulti(card._data, info);
        });

        const againBtn = document.getElementById('again');
        againBtn.addEventListener('click', () => location.reload());
    }



  function fillDetailsMulti(c, container) {
    const rev = Math.random() > .5;
    container.innerHTML = `
      <h2>${c.name}</h2>
      <h3>${c.arcana}</h3>
      <p><strong>Orientation:</strong> 
         ${rev ? 'Reversed' : 'Upright'}</p>
      <p><strong>Meaning:</strong> 
         ${(rev ? c.meanings.shadow : c.meanings.light).join(', ')}</p>
      <p><strong>Fortune Telling:</strong> 
         ${c.fortune_telling.join(', ')}</p>
      <p><strong>Focus On:</strong> 
         ${c.keywords.join(', ')}</p>`;
  }

});
