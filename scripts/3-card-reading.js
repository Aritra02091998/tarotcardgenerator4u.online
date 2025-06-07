// index.js

// ─────────────────────────────────────────────────────────────────────────────
// 1) BACKGROUND EFFECTS (Stars, Particles, Swirl)
// ─────────────────────────────────────────────────────────────────────────────

// Generate starry background
function createStars() {
    const container = document.getElementById('starry-bg');
    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Random position and size
        const size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;

        // Random animation duration and delay
        const duration = 3 + Math.random() * 10;
        star.style.setProperty('--duration', `${duration}s`);
        star.style.animationDelay = `${Math.random() * 5}s`;

        container.appendChild(star);
    }
}

// Create floating particle effects
function createParticles() {
    const container = document.getElementById('particles');
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Random position and size
        const size = Math.random() * 3 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;

        // Random animation duration and delay
        const duration = 10 + Math.random() * 20;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;

        container.appendChild(particle);
    }
}

// Create a short swirl animation over the center card
function createSwirl() {
    const container = document.getElementById('swirlContainer');
    container.innerHTML = '';

    const swirl = document.createElement('div');
    swirl.classList.add('swirl-animation');

    // Position at the center of the card container
    swirl.style.top = '50%';
    swirl.style.left = '50%';
    swirl.style.transform = 'translate(-50%, -50%)';

    container.appendChild(swirl);

    // Remove swirl after it finishes (1.5s)
    setTimeout(() => {
        swirl.remove();
    }, 1500);
}


// ─────────────────────────────────────────────────────────────────────────────
// 2) TAROT DECK DATA LOADING
// ─────────────────────────────────────────────────────────────────────────────

// We'll load tarot card data from a JSON file named 'tarot-details.json'.
let tarotDeck = [];  // Will hold the array fetched from data.cards

// Fetch the JSON file on page load
fetch('tarot-details.json')
    .then(response => response.json())
    .then(data => {
        // Assume the JSON has a top-level "cards" array
        tarotDeck = data.cards.map(card => {
            return {
                name: card.name,
                number: card.number,
                arcana: card.arcana,
                suit: card.suit,
                img: '/assets/cards/' + card.img,         // full image path
                fortune_telling: card.fortune_telling,     // array
                keywords: card.keywords,                   // array
                meanings: card.meanings,                   // object { light: [...], shadow: [...] }
                Archetype: card.Archetype,
                HebrewAlphabet: card["Hebrew Alphabet"],
                Numerology: card.Numerology,
                Elemental: card.Elemental,
                Mythical: card["Mythical/Spiritual"],
                questionsToAsk: card["Questions to Ask"]
            };
        });
    })
    .catch(error => {
        console.error('Error loading tarot-details.json:', error);
        // tarotDeck remains empty; drawCard() will alert the user if they try to draw too soon.
    });


// ─────────────────────────────────────────────────────────────────────────────
// 3) DOM ELEMENT REFERENCES
// ─────────────────────────────────────────────────────────────────────────────

const centerCard       = document.getElementById('centerCard');             // The container that flips
const centerCardImage  = document.getElementById('centerCardImage');        // <img> inside center card front
const leftCard         = document.getElementById('leftCard');               // Left card container
const leftCardImage    = document.getElementById('leftCardImage');          // Left card image
const rightCard        = document.getElementById('rightCard');              // Right card container
const rightCardImage   = document.getElementById('rightCardImage');         // Right card image

// Card details elements
const leftCardNameElem     = document.getElementById('leftCardName');
const leftCardArcanaElem   = document.getElementById('leftCardArcana');
const centerCardNameElem   = document.getElementById('centerCardName');
const centerCardArcanaElem = document.getElementById('centerCardArcana');
const rightCardNameElem    = document.getElementById('rightCardName');
const rightCardArcanaElem  = document.getElementById('rightCardArcana');
const cardDetailsBox       = document.getElementById('cardDetails');

const drawButton       = document.getElementById('drawButton');
const drawAgainButton  = document.getElementById('drawAgainButton');
const shareButton      = document.getElementById('shareButton');

const preReadingSection   = document.getElementById('preReading');
const readingSection      = document.getElementById('readingSection');
const startButton         = document.getElementById('startButton');

const userQuestion        = document.getElementById('userQuestion');
const questionDisplay     = document.getElementById('questionDisplay');
const displayedQuestion   = document.getElementById('displayedQuestion');

const flipSound           = document.getElementById('flipSound') || null;

const historyButton        = document.getElementById('historyButton');
const historyButtonReading = document.getElementById('historyButtonReading');
const historyPanel         = document.getElementById('historyPanel');
const closeHistory         = document.getElementById('closeHistory');
const clearHistory         = document.getElementById('clearHistory');
const saveHistory          = document.getElementById('saveHistory');
const historyList          = document.getElementById('historyList');
const emptyHistory         = document.getElementById('emptyHistory');

const shareModal       = document.getElementById('shareModal');
const closeShare       = document.getElementById('closeShare');
const copyTextBtn      = document.getElementById('copyTextBtn');
const downloadImageBtn = document.getElementById('downloadImageBtn');
const twitterShare     = document.getElementById('twitterShare');
const facebookShare    = document.getElementById('facebookShare');
const shareText        = document.getElementById('shareText');
const shareQuote       = document.getElementById('shareQuote');
const shareTimestamp   = document.getElementById('shareTimestamp');

const themeOptions        = document.querySelectorAll('.theme-option');
const backButton          = document.getElementById('backButton');
const changeDeckButton    = document.getElementById('changeDeckButton');

const leftCardInterpret    = document.getElementById('leftCardInterpret');
const centerCardInterpret  = document.getElementById('centerCardInterpret');
const rightCardInterpret   = document.getElementById('rightCardInterpret');
const interpretContainer   = document.getElementById('interpretContainer');

const pdfButton           = document.getElementById('pdfButton');


// ─────────────────────────────────────────────────────────────────────────────
// 4) STATE VARIABLES
// ─────────────────────────────────────────────────────────────────────────────

let currentQuestion = "";
let readingHistory  = JSON.parse(localStorage.getItem('tarotHistory')) || [];
let currentTheme    = "1";
let currentThemeIcon    = "fa-moon";
let currentCenterSymbol = "☾";

// Store the three drawn cards
let currentReading = {
    past: null,
    present: null,
    future: null
};


// ─────────────────────────────────────────────────────────────────────────────
// 5) INITIAL SETUP
// ─────────────────────────────────────────────────────────────────────────────

updateHistoryList();
updateCardBackIcons();

// On page load, add a small shake to the center card to draw attention
setTimeout(() => {
    centerCard.classList.add('card-shake');
    setTimeout(() => centerCard.classList.remove('card-shake'), 600);
}, 1000);


// ─────────────────────────────────────────────────────────────────────────────
// 6) EVENT LISTENERS FOR NAVIGATION & UI
// ─────────────────────────────────────────────────────────────────────────────

// Start the reading experience (fade out pre-reading, show reading section)
startButton.addEventListener('click', () => {
  preReadingSection.classList.add('fade-out');
  setTimeout(() => {
    preReadingSection.classList.add('hidden');
    readingSection.classList.remove('hidden');
    readingSection.classList.add('fade-in');

    // now reveal the reading-mode buttons
    backButton.classList.remove('hidden');
    changeDeckButton.classList.remove('hidden');
  }, 800);
});

// Back to home button
backButton.addEventListener('click', () => {
    readingSection.classList.add('fade-out');
    setTimeout(() => {
        readingSection.classList.add('hidden');
        preReadingSection.classList.remove('hidden');
        preReadingSection.classList.add('fade-in');
        resetReading();
    }, 800);
});

// Change deck button (same behavior as Back Home)
changeDeckButton.addEventListener('click', () => {
    readingSection.classList.add('fade-out');
    setTimeout(() => {
        readingSection.classList.add('hidden');
        preReadingSection.classList.remove('hidden');
        preReadingSection.classList.add('fade-in');
    }, 800);
});

// History panel toggles
historyButton.addEventListener('click', () => historyPanel.classList.add('open'));
historyButtonReading.addEventListener('click', () => historyPanel.classList.add('open'));
closeHistory.addEventListener('click', () => historyPanel.classList.remove('open'));

// Clear reading history
clearHistory.addEventListener('click', () => {
    readingHistory = [];
    localStorage.removeItem('tarotHistory');
    updateHistoryList();
});

// Save history (just a notification—our data is already in localStorage)
saveHistory.addEventListener('click', () => {
    alert('Your reading history has been saved to your browser storage. It will persist even if you close the browser.');
});

// Share modal toggles
shareButton.addEventListener('click', () => openShareModal(readingHistory[0]));
closeShare.addEventListener('click', closeShareModal);
copyTextBtn.addEventListener('click', copyText);
twitterShare.addEventListener('click', shareOnTwitter);
facebookShare.addEventListener('click', shareOnFacebook);
downloadImageBtn.addEventListener('click', () => {
    alert('In a production environment, this would generate and download an image of your reading.');
});

// “Draw Again” resets the center card to face-down
drawAgainButton.addEventListener('click', resetReading);

// PDF generation
pdfButton.addEventListener('click', generatePDF);

// Theme selection
themeOptions.forEach(option => {
    option.addEventListener('click', () => {
        themeOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        setTheme(option.dataset.theme);
    });
});

// Add a shake animation on hover when the center card is not yet flipped
centerCard.addEventListener('mouseenter', () => {
    if (!centerCard.classList.contains('flipped')) {
        centerCard.classList.add('card-shake');
        setTimeout(() => centerCard.classList.remove('card-shake'), 600);
    }
});


function resetBoard() {
  // wrappers
  document.querySelectorAll('.card-wrapper')
    .forEach(w => w.classList.remove('move-left','move-right'));

  // cards
  ['leftCard','centerCard','rightCard'].forEach(id => {
    const c = document.getElementById(id);
    c.classList.remove('flipped','glow');
  });

  // labels
  ['leftCardLabel','presentCardLabel','rightCardLabel'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
}

// :
drawButton.addEventListener('click', () => {
  resetBoard();
  drawThreeCards();
});


// 7) CORE FUNCTION: drawThreeCards()
function drawThreeCards() {
  // ─── RESET from any previous draw ───────────────────────────────

    document.getElementById('questionInputSection').classList.add('hidden');
    userQuestion.classList.add('hidden');
    drawButton.classList.add('hidden');

    // 1) remove move-left/move-right from the wrappers
    document.querySelectorAll('.card-wrapper')
    .forEach(w => w.classList.remove('move-left','move-right'));

    // 2) remove flip/glow/shuffle from the cards themselves
    [leftCard, centerCard, rightCard].forEach(c =>
    c.classList.remove('flipped','glow','shuffle-animation')
    );

    // 3) clear out any old labels
    [leftCardLabel, presentCardLabel, rightCardLabel].forEach(lbl =>lbl.textContent = '');

    // ─── OLD startup logic (deck check, question grab, hide UI) ──────
    if (tarotDeck.length === 0) {
    alert("Tarot deck data is not yet loaded. Please wait a moment and try again.");
    return;
    }
    currentQuestion = userQuestion.value.trim() || "Seeking general guidance";
    displayedQuestion.textContent = currentQuestion;
    questionDisplay.classList.remove('hidden');
    userQuestion.classList.add('hidden');
    drawButton.classList.add('hidden');

    // play sound, particles, shuffle classes…
    if (flipSound) {
    flipSound.currentTime = 0;
    flipSound.play().catch(e => console.log("Sound play prevented"));
    }
    createParticles();
    document.querySelectorAll('.tarot-card')
    .forEach(card => card.classList.add('shuffle-animation'));

    // ─── after 1.5s: pick + show ────────────────────────────────────
    setTimeout(() => {
    // remove shuffle, swirl, pick cards…
    document.querySelectorAll('.tarot-card')
        .forEach(card => card.classList.remove('shuffle-animation'));
    createSwirl();

    const pastCard    = getRandomCard();
    const presentCard = getRandomCard();
    const futureCard  = getRandomCard();

    currentReading.past    = pastCard;
    currentReading.present = presentCard;
    currentReading.future  = futureCard;

    // 7d) set the images & reversed classes
    leftCardImage.src   = pastCard.card.img;
    centerCardImage.src = presentCard.card.img;
    rightCardImage.src  = futureCard.card.img;
    leftCardImage.classList.toggle('reversed', pastCard.isReversed);
    centerCardImage.classList.toggle('reversed', presentCard.isReversed);
    rightCardImage.classList.toggle('reversed', futureCard.isReversed);

    // ─── 7e) NEW: set your single label under each card ───────────
    leftCardLabel.textContent    = `${pastCard.card.name} — ${pastCard.card.arcana}`;
    presentCardLabel.textContent = `${presentCard.card.name} — ${presentCard.card.arcana}`;
    rightCardLabel.textContent   = `${futureCard.card.name} — ${futureCard.card.arcana}`;

    // hide any old detail boxes…
    cardDetailsBox.classList.remove('show');

    // ─── 7f) FLIP & MOVE ──────────────────────────────────────────
    setTimeout(() => {
        const leftWrapper  = document.querySelector('.card-wrapper.left');
        const rightWrapper = document.querySelector('.card-wrapper.right');
        leftWrapper.classList.add('move-left');
        rightWrapper.classList.add('move-right');

        leftCard.classList.add('flipped','glow');
        centerCard.classList.add('flipped','glow');
        rightCard.classList.add('flipped','glow');

        // 7g) show your post-flip buttons
        setTimeout(() => {
        drawAgainButton.classList.remove('hidden');
        shareButton.classList.remove('hidden');
        }, 500);

        // 7h) interpretations & history
        populateInterpretation(leftCardInterpret,   pastCard);
        populateInterpretation(centerCardInterpret, presentCard);
        populateInterpretation(rightCardInterpret,  futureCard);
        interpretContainer.classList.remove('hidden');

        const reading = {
        past:      pastCard,
        present:   presentCard,
        future:    futureCard,
        question:  currentQuestion,
        timestamp: new Date().toLocaleString()
        };
        readingHistory.unshift(reading);
        if (readingHistory.length > 10) readingHistory.pop();
        localStorage.setItem('tarotHistory', JSON.stringify(readingHistory));
        updateHistoryList();
    }, 300);
    }, 1500);
}
// Helper to get a random card with reversal status
function getRandomCard() {
    const randomIndex = Math.floor(Math.random() * tarotDeck.length);
    const isReversed = Math.random() > 0.5;
    return {
        card: tarotDeck[randomIndex],
        isReversed
    };
}

// Populate interpretation section for a card
function populateInterpretation(container, cardData) {
    const card = cardData.card;
    const isReversed = cardData.isReversed;
    const meaningArray = isReversed ? card.meanings.shadow : card.meanings.light;
    const chosenMeaning = meaningArray.join(', ');

    container.innerHTML = `
        <p><span class="font-bold">Orientation:</span> ${isReversed ? '(Reversed)' : '(Forward)'}</p>
        <p><span class="font-bold">Meaning:</span> ${chosenMeaning}</p>
        <p><span class="font-bold">Fortune Telling:</span> ${card.fortune_telling.join(', ')}</p>
        <p><span class="font-bold">Focus On:</span> ${card.keywords.join(', ')}</p>
    `;
}


// ─────────────────────────────────────────────────────────────────────────────
// 8) AFTER THE FLIP: SHOW CARD NAME & ARCANA

// Wait for the CSS transition (flip) to finish, then reveal #cardDetails
leftCard.addEventListener('transitionend', handleCardFlip);
centerCard.addEventListener('transitionend', handleCardFlip);
rightCard.addEventListener('transitionend', handleCardFlip);

function handleCardFlip(evt) {
    if (evt.propertyName === 'transform' && 
        leftCard.classList.contains('flipped') &&
        centerCard.classList.contains('flipped') &&
        rightCard.classList.contains('flipped')) {
        cardDetailsBox.classList.add('show');
    }
}


// 9) RESET FUNCTION (for “Draw Again” or going back home)

function resetReading() {
    // Remove glow & flipped state from all cards
    [leftCard, centerCard, rightCard].forEach(card => {
        card.classList.remove('glow');
        card.classList.remove('flipped');
    });

    // Hide Draw Again & Share Reading
    drawAgainButton.classList.add('hidden');
    shareButton.classList.add('hidden');

    // Hide dynamic interpretation box
    interpretContainer.classList.add('hidden');

    // Hide card details
    cardDetailsBox.classList.remove('show');

    // Clear card images
    leftCardImage.src = '';
    centerCardImage.src = '';
    rightCardImage.src = '';

    // Remove reversed classes
    leftCardImage.classList.remove('reversed');
    centerCardImage.classList.remove('reversed');
    rightCardImage.classList.remove('reversed');

    // Clear interpretations
    leftCardInterpret.innerHTML = '';
    centerCardInterpret.innerHTML = '';
    rightCardInterpret.innerHTML = '';

    // Clear card details
    leftCardNameElem.textContent = '';
    leftCardArcanaElem.textContent = '';
    centerCardNameElem.textContent = '';
    centerCardArcanaElem.textContent = '';
    rightCardNameElem.textContent = '';
    rightCardArcanaElem.textContent = '';

    // Reset current reading
    currentReading = {
        past: null,
        present: null,
        future: null
    };

    // After a short pause, show the draw button and question input again
    setTimeout(() => {
        drawButton.classList.remove('hidden');
        userQuestion.classList.remove('hidden');
    }, 800);
}


// 10) HISTORY LIST MANAGEMENT
function updateHistoryList() {
  // Show “no history” only when there really is none
  if (readingHistory.length === 0) {
    emptyHistory.classList.remove('hidden');
    historyList.innerHTML = '';
    return;
  }
  emptyHistory.classList.add('hidden');
  historyList.innerHTML = '';

  readingHistory.forEach((reading, index) => {
    // 1) Skip any malformed entry
    if (!reading.present?.card) {
      console.warn(`Skipping bad history entry #${index}:`, reading);
      return;
    }

    // 2) Build your snippet from the real meanings array
    const arr = reading.present.isReversed
      ? reading.present.card.meanings.shadow
      : reading.present.card.meanings.light;
    const snippet = arr.join(', ').substring(0, 60);

    // 3) Now safely render your history item
    const item = document.createElement('div');
    item.classList.add('history-item');
    item.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <h4 class="font-cinzel text-lg">3-Card Reading</h4>
          <p class="text-xs text-purple-300 mb-1">${reading.timestamp}</p>
        </div>
        <button class="text-purple-400 hover:text-white share-history" data-index="${index}">
          <i class="fas fa-share-alt"></i>
        </button>
      </div>
      <p class="mt-2 text-sm text-gray-300">
        <span class="font-bold">Q:</span> ${reading.question}
      </p>
      <p class="mt-1 text-sm text-gray-400 italic">
        <span class="font-bold">Present Card:</span>
        ${reading.present.card.name}
        (${reading.present.isReversed ? 'Reversed' : 'Forward'})
      </p>
      <p class="mt-1 text-sm text-gray-400">
        ${snippet}…
      </p>
    `;
    historyList.appendChild(item);
  });

  // 4) Re-attach your share buttons as before
  document.querySelectorAll('.share-history').forEach(btn => {
    btn.addEventListener('click', e => {
      openShareModal(readingHistory[e.currentTarget.dataset.index]);
    });
  });
}



// 11) SHARE MODAL HANDLERS
function openShareModal(reading) {
    const presentCard = reading.present.card;
    shareQuote.textContent = `Past: ${reading.past.card.name}, Present: ${presentCard.name}, Future: ${reading.future.card.name}`;
    shareTimestamp.textContent = reading.timestamp;
    shareText.textContent = `
        I just drew 3 cards on Mystic Tarot!
        Question: ${reading.question}
        
        Past: ${reading.past.card.name} (${reading.past.isReversed ? 'Reversed' : 'Forward'})
        Meaning: ${reading.past.card.meanings[reading.past.isReversed ? 'shadow' : 'light'].join(', ')}
        
        Present: ${presentCard.name} (${reading.present.isReversed ? 'Reversed' : 'Forward'})
        Meaning: ${presentCard.meanings[reading.present.isReversed ? 'shadow' : 'light'].join(', ')}
        
        Future: ${reading.future.card.name} (${reading.future.isReversed ? 'Reversed' : 'Forward'})
        Meaning: ${reading.future.card.meanings[reading.future.isReversed ? 'shadow' : 'light'].join(', ')}
        
        #TarotReading`.trim();

    shareModal.classList.add('active');
}

function closeShareModal() {
    shareModal.classList.remove('active');
}

function copyText() {
    navigator.clipboard.writeText(shareText.textContent.trim())
        .then(() => {
            const originalText = copyTextBtn.innerHTML;
            copyTextBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
            setTimeout(() => {
                copyTextBtn.innerHTML = originalText;
            }, 2000);
        })
        .catch(console.error);
}

function shareOnTwitter() {
    const text = encodeURIComponent(`I just drew 3 tarot cards on Mystic Tarot! #TarotReading`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
}

function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}


// 12) THEME SELECTION

function setTheme(theme) {
    currentTheme = theme;

    document.documentElement.style.setProperty(
        '--primary',
        theme === '1' ? '#7e22ce'
                      : theme === '2' ? '#0d9488'
                      : theme === '3' ? '#b45309'
                                      : '#4338ca'
    );
    document.documentElement.style.setProperty(
        '--primary-dark',
        theme === '1' ? '#4c1d95'
                      : theme === '2' ? '#115e59'
                      : theme === '3' ? '#7c2d12'
                                      : '#312e81'
    );
    document.documentElement.style.setProperty(
        '--primary-light',
        theme === '1' ? '#c084fc'
                      : theme === '2' ? '#5eead4'
                      : theme === '3' ? '#fcd34d'
                                      : '#818cf8'
    );
    document.documentElement.style.setProperty(
        '--accent',
        theme === '1' ? '#f0abfc'
                      : theme === '2' ? '#99f6e4'
                      : theme === '3' ? '#fde68a'
                                      : '#a5b4fc'
    );

    if (theme === '1') {
        currentThemeIcon    = "fa-moon";
        currentCenterSymbol = "☾";
    } else if (theme === '2') {
        currentThemeIcon    = "fa-leaf";
        currentCenterSymbol = "♣";
    } else if (theme === '3') {
        currentThemeIcon    = "fa-sun";
        currentCenterSymbol = "☀";
    } else {
        currentThemeIcon    = "fa-star";
        currentCenterSymbol = "★";
    }

    updateCardBackIcons();
}

function updateCardBackIcons() {
    // Update the icon on all card backs
    document.querySelectorAll('.card-icon').forEach(icon => {
        icon.className = `fas ${currentThemeIcon} text-5xl text-purple-800 card-icon`;
    });

    // Update the central symbol on the back of the center card
    document.querySelectorAll('.center-card-symbol').forEach(symbol => {
        symbol.textContent = currentCenterSymbol;
    });
}


// 13) PDF GENERATION
// 13) PDF GENERATION (fixed & multi-page)
function generatePDF() {
  const originalText = pdfButton.innerHTML;
  pdfButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Generating...';

  // grab up to three readings
  const readings = readingHistory.slice(0, 3);
  if (!readings.length) {
    alert('No readings to export. Draw some cards first!');
    pdfButton.innerHTML = originalText;
    return;
  }

  // your brand colors
  const primaryColor    = '#c084fc';
  const backgroundColor = '#0a0e1d';
  const mutedText       = '#d1d5db';

  // 1) build off-screen container
  const container = document.createElement('div');
  Object.assign(container.style, {
    width:       '800px',
    padding:     '40px',
    boxSizing:   'border-box',
    minHeight:   '1120px',
    background:  backgroundColor,
    color:       'white',
    fontFamily:  'Playfair Display, serif',
  });

  // 2) fill it (paste your existing template here)
  container.innerHTML = `
    <h1 style="color:${primaryColor}; font-size:32px; text-align:center; margin-bottom:20px;">
      Mystic Tarot Readings
    </h1>
    <p style="color:${mutedText}; text-align:center; margin-bottom:40px;">
      Question: ${readings[0].question}
    </p>
    ${readings.map((r, idx) => {
      const pos = ['Past','Present','Future'][idx];
      const card = r.present.card;
      const orientation = r.present.isReversed ? 'Reversed' : 'Forward';
      const meaning = [
        ...card.meanings.light || [],
        ...card.meanings.shadow || []
      ].join(', ');
      return `
        <div style="margin-bottom:60px;">
          <h2 style="color:${primaryColor}; font-size:24px; margin-bottom:8px;">
            ${pos} (${orientation})
          </h2>
          <p style="line-height:1.5;">${meaning}</p>
        </div>
      `;
    }).join('')}
    <footer style="
      position:absolute;
      bottom:40px;
      width:100%;
      text-align:center;
      color:${mutedText};
      font-size:12px;
    ">
      Generated: ${new Date().toLocaleString()}
    </footer>
  `;

  document.body.appendChild(container);

  // Wait for fonts & images
  Promise.all([
    document.fonts.ready,
    ...Array.from(container.querySelectorAll('img')).map(img => new Promise(res => {
      if (img.complete) return res();
      img.onload = img.onerror = res;
    }))
  ]).then(() => {
    // 4) capture to canvas (allow taint/CORS so local images & fonts draw)
    return html2canvas(container, {
      backgroundColor: null,
      useCORS: true,
      allowTaint: true,
      scale: window.devicePixelRatio
    });
  })
  .then(canvas => {
    document.body.removeChild(container);

    // 5) slice & export via jsPDF
    const pdf = new jspdf.jsPDF('p', 'pt', 'a4');
    const pW  = pdf.internal.pageSize.getWidth();
    const pH  = pdf.internal.pageSize.getHeight();
    const ratio       = pW / canvas.width;
    const sliceHeight = pH / ratio;   // px per page

    let y = 0;
    while (y < canvas.height) {
      // grab a slice
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width  = canvas.width;
      pageCanvas.height = Math.min(sliceHeight, canvas.height - y);

      pageCanvas.getContext('2d')
        .drawImage(canvas, 0, y, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);

      const imgData = pageCanvas.toDataURL('image/png');
      if (y > 0) pdf.addPage();
      // draw background & then the slice
      pdf.setFillColor(backgroundColor);
      pdf.rect(0, 0, pW, pH, 'F');
      pdf.addImage(imgData, 'PNG', 0, 0, pW, pageCanvas.height * ratio);

      y += sliceHeight;
    }

    pdf.save('Mystic_Tarot_Readings.pdf');
  })
  .catch(err => {
    console.error('PDF error:', err);
    alert('Sorry, PDF generation failed.');
  })
  .finally(() => {
    pdfButton.innerHTML = originalText;
  });
}


// 14) INITIALIZE BACKGROUND & PARTICLES
createStars();
createParticles();