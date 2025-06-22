/* Tarot page JS – now wrapped in DOMContentLoaded & self-healing */
document.addEventListener('DOMContentLoaded', () => {

    AOS.init();

    // get/set history in localStorage
    function getHistory() {
        return JSON.parse(localStorage.getItem('tarotHistory') || '[]');
    }

    function saveHistory(arr) {
        localStorage.setItem('tarotHistory', JSON.stringify(arr));
    }

    // helper to turn an image URL into base64 for embedding
    function toBase64(url) {
        return new Promise(resolve => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.width;
            c.height = img.height;
            c.getContext('2d').drawImage(img, 0, 0);
            resolve(c.toDataURL('image/png'));
            };
            img.src = url;
        });
    }

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

    // simple toast helper
    function showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    /* ---------- Result / details panel (same guard) ---------- */
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

    fetch('/assets/jsons/tarot-card-health.json')
        .then(r => r.json())
        .then(d => {
            DECK = d.cards;
            buildFan();
        });

    function buildFan() {
        const mobile = innerWidth < 768;
        const picks = [...DECK].sort(() => 0.5 - Math.random()).slice(0, mobile ? 11 : 19);
        const total = picks.length;
        const r = fan.clientWidth * 0.95 / 2;
        const cx = fan.clientWidth / 2;
        const cy = 60;

        picks.forEach((card, i) => {
            let final, z = 0;
            const arcSpread = 120;
            const startOffset = 30;

            if (mobile) {
                const mid = Math.floor(total / 2);
                const step = 26;
                const x = (i - mid) * step + cx - 59;
                const y = cy;
                const scale = 1 - Math.abs(i - mid) * 0.05;

                final = `translate(${x}px,${y}px) scale(${scale})`;
                z = 100 - Math.abs(i - mid);
            } else {
                const ang = startOffset + (arcSpread / (total - 1)) * i;
                const rad = ang * Math.PI / 180;
                const x = cx + Math.cos(rad) * r - 59;
                const y = cy + Math.sin(rad) * r - 85;

                final = `translate(${x}px,${y}px) rotateZ(${ang - 90}deg)`;
            }

            const el = document.createElement('div');
            el.className = 'card init';
            el.style.zIndex = z;
            el.style.transform = final + ' scale(.05)';
            el.style.opacity = 0;
            el.innerHTML = `
                <div class="face back"></div>
                <div class="face front"><img alt=""></div>`;
            el._data = card;
            el.addEventListener('click', onPick);
            fan.appendChild(el);

            setTimeout(() => {
                el.classList.add('show');
                el.style.transition = 'transform .9s ease, opacity .9s ease';
                el.style.transform = final;
                el.style.opacity = 1;
            }, i * 70);
        });
    }

    /* ---------- Button only works for small screens ---------- */
    const drawBtn = document.getElementById('draw-btn');
    if (drawBtn) {
        drawBtn.addEventListener('click', () => {
            // pick the middle available card
            const cards = fan.querySelectorAll('.card:not(.fade)');
            if (!cards.length) return;
            const mid = Math.floor(cards.length / 2);
            cards[mid].click(); 
        });
    }

    /* ---------- 5. Click-to-draw functionality ---------- */
    function onPick(e) {
        const card = e.currentTarget;
        const mobile = innerWidth < 768;

        // — hide the mobile Draw-Card helper as soon as a draw starts
        if (mobile && drawBtn) drawBtn.style.display = 'none';

        fan.querySelectorAll('.card').forEach(c => {
            if (c !== card) c.classList.add('fade');
        });

        fan.style.pointerEvents = 'none';
        promptTxt.style.opacity = 0;

        card.querySelector('.front img').src = `assets/cards/${card._data.img}`;

        const spark = document.createElement('div');
        spark.className = 'spark';
        card.appendChild(spark);
        spark.addEventListener('animationend', () => spark.remove(), { once: true });

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
            const first = card.getBoundingClientRect();
            const last = view.getBoundingClientRect();
            const dx = last.left - first.left;
            const dy = last.top - first.top + 20;

            card.style.transition = 'transform 1.8s cubic-bezier(.25,.7,.3,1)';
            card.style.transform = `translate(${dx + 130}px,${dy + 40}px) rotateY(180deg)`;

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
        const details = document.getElementById('details');

        // store this draw in history (keep last 5)
        const hist = getHistory();
        hist.unshift({
            name: c.name,
            orientation: rev ? 'Reversed' : 'Upright',
            meaning: (rev ? c.meanings.shadow : c.meanings.light).split(',').join(', ')
        });
        if (hist.length > 5) hist.pop();
        saveHistory(hist);

        // Populate each tab
        details.querySelector('#arcana').innerHTML = `
            <h2>${c.name}</h2>
            <h3>${c.arcana}</h3>
            <p><strong>Orientation:</strong> ${rev ? 'Reversed' : 'Upright'}</p>`;
        details.querySelector('#meaning').textContent =
            (rev ? c.meanings.shadow : c.meanings.light).split(',').join(', ');
        details.querySelector('#fortune').textContent =
            c.fortune_telling.split(',').join(', ');
        details.querySelector('#keywords').textContent =
            c.keywords.join(', ');

        // Render history list
        const htab = details.querySelector('#history');
        const past = getHistory();
        if (past.length === 0) {
            htab.innerHTML = '<p>No history yet.</p>';
        } else {
            htab.innerHTML = '<ul>' + past.map(entry =>
                `<li><strong>${entry.name}</strong> (${entry.orientation}): ${entry.meaning}</li>`
            ).join('') + '</ul>';
        }

        // Tab switching
        details.querySelectorAll('.tab-buttons li').forEach(btn => {
            btn.addEventListener('click', () => {
            // deactivate
            details.querySelectorAll('.tab-buttons li').forEach(b => b.classList.remove('active'));
            details.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            // activate
            btn.classList.add('active');
            details.querySelector(`#${btn.dataset.tab}`).classList.add('active');
            });
        });


        // wire up Copy button
        document.getElementById('copy-btn').addEventListener('click', () => {
            const details = document.getElementById('details');
            const active = details.querySelector('.tab-content.active');
            if (!active) return;
            navigator.clipboard.writeText(active.textContent.trim())
                .then(() => showToast('Copied!'))
                .catch(err => console.error('Copy failed', err));
        });


        document.getElementById('draw-again-btn').addEventListener('click', () => {
            location.reload();
        });

        // Download PDF
        document.getElementById('pdf-btn').addEventListener('click', async () => {
            const doc = new window.jspdf.jsPDF();
            const { width, height } = doc.internal.pageSize;
            // 1) background fill (solid purple fallback for gradient)
            doc.setFillColor(33, 0, 68); // #210044
            doc.rect(0, 0, width, height, 'F');

            // 2) embed the card image
            const imgEl = document.querySelector('#view .card img');
            const imgData = await toBase64(imgEl.src);
            const imgW = 60, imgH = (imgEl.naturalHeight / imgEl.naturalWidth) * imgW;
            doc.addImage(imgData, 'PNG', 15, 15, imgW, imgH);

            // 3) header text
            const accent = getComputedStyle(document.documentElement)
                            .getPropertyValue('--accent').trim();
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(accent);
            doc.setFontSize(18);
            doc.text(`${c.name} Tarot Reading`, 15 + imgW + 10, 25);

            // 4) body sections
            let y = 15 + Math.max(imgH, 30) + 10;
            for (const tabId of ['arcana','meaning','fortune','keywords','history']) {
                const title = details.querySelector(`.tab-buttons li[data-tab="${tabId}"]`).textContent;
                const content = details.querySelector(`#${tabId}`).textContent.trim();
                doc.setFont('helvetica','bold');
                doc.setTextColor(accent);
                doc.setFontSize(14);
                doc.text(title, 15, y);
                y += 6;

                doc.setFont('helvetica','normal');
                doc.setTextColor(255,255,255);
                doc.setFontSize(11);
                const lines = doc.splitTextToSize(content, width - 30);
                doc.text(lines, 15, y);
                y += lines.length * 6 + 8;
                if (y > height - 40) {
                doc.addPage();
                // re-fill page background
                doc.setFillColor(33, 0, 68);
                doc.rect(0, 0, width, height, 'F');
                y = 20;
                }
            }

            // 5) big footer with link
            doc.setFontSize(16);
            doc.setTextColor(accent);
            doc.textWithLink(
                'TarotCardGenerator.online',
                width / 2, height - 20,
                { align: 'center', url: 'http://tarotcardgenerator.online/' }
            );
            doc.save(`${c.name}-reading.pdf`);
        });

        // Share via Web Share API
        document.getElementById('share-btn').addEventListener('click', () => {
            const shareData = {
            title: `${c.name} Tarot Reading`,
            text: `I just drew the ${c.name} tarot card!`,
            url: window.location.href
            };
            if (navigator.share) navigator.share(shareData);
            else alert('Sharing is not supported on this browser.');
        });
    }

    // Simple count-up animation for the statistics.
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


    // When AOS reveals a .stat-item, kick off its counter
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            item.classList.toggle('open');
        });
    });

});
