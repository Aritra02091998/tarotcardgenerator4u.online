// index.js

// ─────────────────────────────────────────────────────────────────────────────
// 1) BACKGROUND EFFECTS (Stars, Particles, Swirl)
// ─────────────────────────────────────────────────────────────────────────────

function createStars() {
  const container = document.getElementById('starry-bg');
  if (!container) return;
  const starCount = 200;

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.classList.add('star');

    // Random position, size, and animation duration
    const size = Math.random() * 2 + 1; // 1px–3px
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDuration = `${Math.random() * 2 + 1}s`;
    star.style.opacity = `${Math.random() * 0.5 + 0.3}`;

    container.appendChild(star);
  }
}

function createParticles() {
  // Placeholder if you want floating dust or other particles
  // For now, nothing happens here.
}

// ─────────────────────────────────────────────────────────────────────────────
// 2) WRAP EVERYTHING IN DOMContentLoaded
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // ───────────────────────────────────────────────────────────────────────────
  // 2.1) CACHE DOM ELEMENTS
  // ───────────────────────────────────────────────────────────────────────────
  // Note: If any of these IDs/classes are not present in your HTML, the variable will be null or empty.
  const drawButton          = document.getElementById('drawButton');
  const drawAgainButton     = document.getElementById('drawAgainButton');
  const shareButton         = document.getElementById('shareButton');
  const userQuestion        = document.getElementById('userQuestion');
  const questionDisplay     = document.getElementById('questionDisplay');
  const displayedQuestion   = document.getElementById('displayedQuestion');
  const cardWrappers        = document.querySelectorAll('.card-wrapper');
  const cardDetailsBox      = document.getElementById('cardDetails');
  const cardNameElem        = document.getElementById('cardName');
  const cardArcanaElem      = document.getElementById('cardArcana');
  const interpretContainer  = document.getElementById('interpretContainer');
  const dynamicInterpret    = document.getElementById('dynamicInterpret');
  const noteContainer       = document.getElementById('noteContainer');
  const historyList         = document.getElementById('historyList');
  const emptyHistory        = document.getElementById('emptyHistory');
  const changeDeckButton    = document.getElementById('changeDeckButton');
  const pdfButton           = document.getElementById('pdfButton');
  const downloadImageBtn    = document.getElementById('downloadImageBtn');
  const themeOptions        = document.querySelectorAll('.theme-option');

  // State
  let tarotDeck         = [];
  let currentQuestion   = '';
  let readingHistory    = JSON.parse(localStorage.getItem('tarotHistory') || '[]');

  // ───────────────────────────────────────────────────────────────────────────
  // 2.2) INITIAL SETUP FOR CARDS
  // ───────────────────────────────────────────────────────────────────────────
  cardWrappers.forEach((wrapper, idx) => {
    const i = idx + 1; // 1..11 if you have 11 cards
    wrapper.style.setProperty('--i', i);
    // No rotation: CSS will handle horizontal line placement via translateX(var(--offset)).
  });

  // Initially hide “Draw Again” and “Share Reading” buttons
  if (drawAgainButton) drawAgainButton.classList.add('hidden');
  if (shareButton) shareButton.classList.add('hidden');

  // Initially hide card details and interpretation/note sections
  if (cardDetailsBox)       cardDetailsBox.classList.remove('show');
  if (interpretContainer)   interpretContainer.classList.add('hidden');
  if (noteContainer)        noteContainer.classList.add('hidden');

  // ───────────────────────────────────────────────────────────────────────────
  // 3) FETCH TAROT DECK DATA (from JSON file)
  // ───────────────────────────────────────────────────────────────────────────
  fetch('tarot-details.json')
    .then(response => response.json())
    .then(data => {
      // Expecting data.cards to be an array of card objects
      tarotDeck = data.cards.map(card => ({
        name: card.name,
        number: card.number,
        arcana: card.arcana,
        suit: card.suit,
        img: '/assets/cards/' + card.img,        // adjust path if needed
        fortune_telling: card.fortune_telling,   // array of strings
        keywords: card.keywords,                 // array of keywords
        meanings: card.meanings                   // { light: [...], shadow: [...] }
      }));
    })
    .catch(error => {
      console.error('Error loading tarot-details.json:', error);
      // If the deck fails to load, drawCard() will alert the user.
    });

  // ───────────────────────────────────────────────────────────────────────────
  // 4) EVENT LISTENERS
  // ───────────────────────────────────────────────────────────────────────────

  // 4.1) Draw a card when “Draw” button is clicked
  if (drawButton) {
    drawButton.addEventListener('click', drawCard);
  }

  // 4.2) “Draw Again” resets the center card to face-down
  if (drawAgainButton) {
    drawAgainButton.addEventListener('click', resetReading);
  }

  // 4.3) “Share Reading” placeholder
  if (shareButton) {
    shareButton.addEventListener('click', () => {
      alert('Share functionality would open here.');
    });
  }

  // 4.4) Change deck button (if you have it)
  if (changeDeckButton) {
    changeDeckButton.addEventListener('click', () => {
      // For simplicity, just reload the page
      window.location.reload();
    });
  }

  // 4.5) PDF generation placeholder
  if (pdfButton) {
    pdfButton.addEventListener('click', () => {
      const originalText = pdfButton.innerText;
      pdfButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Generating...';
      setTimeout(() => {
        alert('PDF generation placeholder: your reading would be exported as a PDF.');
        pdfButton.innerText = originalText;
      }, 1200);
    });
  }

  // 4.6) “Download Image” placeholder
  if (downloadImageBtn) {
    downloadImageBtn.addEventListener('click', () => {
      alert('Download image placeholder: this would generate an image of your reading.');
    });
  }

  // 4.7) Theme selection (if you have deck‐theme tiles)
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      themeOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      setTheme(option.dataset.theme);
    });
  });

  // 4.8) Initialize reading history in side panel
  updateHistoryList();

  // ───────────────────────────────────────────────────────────────────────────
  // 5) DRAW CARD LOGIC (SHAKE → FLIP → SHOW DETAILS & INTERPRETATION)
  // ───────────────────────────────────────────────────────────────────────────

  function drawCard() {
    // 5.1) Ensure the deck is loaded
    if (tarotDeck.length === 0) {
      alert("Tarot deck data is not yet loaded. Please wait a moment and try again.");
      return;
    }

    // 5.2) Grab the user’s question (or default to “Seeking general guidance”)
    currentQuestion = (userQuestion && userQuestion.value.trim()) || "Seeking general guidance";
    if (displayedQuestion) {
      displayedQuestion.textContent = currentQuestion;
    }
    if (questionDisplay) {
      questionDisplay.classList.remove('hidden');
    }

    // 5.3) Hide input & Draw button
    if (userQuestion) userQuestion.classList.add('hidden');
    if (drawButton)    drawButton.classList.add('hidden');

    // 5.4) Pick a random card index
    const randomIndex = Math.floor(Math.random() * tarotDeck.length);
    const chosenCard  = tarotDeck[randomIndex];
    const isReversed  = Math.random() > 0.5;

    // 5.5) Find the corresponding DOM wrapper and inner card
    const chosenWrapper = cardWrappers[randomIndex];
    const chosenDomCard = chosenWrapper ? chosenWrapper.querySelector('.deck-card') : null;
    if (!chosenWrapper || !chosenDomCard) {
      console.error("Card wrapper or .deck-card not found for index:", randomIndex);
      return;
    }

    // 5.6) Populate the front‐image of the chosen card
    const frontImg = chosenDomCard.querySelector('.card-front-img');
    if (frontImg) {
      frontImg.src = chosenCard.img;
      if (isReversed) {
        frontImg.classList.add('reversed');
      } else {
        frontImg.classList.remove('reversed');
      }
    }

    // 5.7) Populate & hide “Card Details” until after flip
    if (cardNameElem)   cardNameElem.textContent   = chosenCard.name + (isReversed ? ' (Reversed)' : '');
    if (cardArcanaElem) cardArcanaElem.textContent = chosenCard.arcana;
    if (cardDetailsBox) cardDetailsBox.classList.remove('show');

    // 5.8) Hide “Interpreting Your Card” & “Note to You” sections before flip
    if (interpretContainer) interpretContainer.classList.add('hidden');
    if (noteContainer)      noteContainer.classList.add('hidden');

    // 5.9) Reset all cards (remove any flipped/shake/glow classes, restore z-index)
    cardWrappers.forEach(wrapper => {
      const card = wrapper.querySelector('.deck-card');
      if (card) {
        card.classList.remove('flipped', 'glow', 'shake-animation');
        wrapper.classList.remove('flipping-wrapper', 'flipped-wrapper');
        // Reset wrapper’s z-index to default based on --i
        const iVal = parseInt(wrapper.style.getPropertyValue('--i')) || 0;
        wrapper.style.zIndex = `${100 - iVal}`;
      }
      // Clear any previous front‐img
      const imgElem = wrapper.querySelector('.card-front-img');
      if (imgElem) {
        imgElem.src = '';
        imgElem.classList.remove('reversed');
      }
    });

    // 5.10) After a brief “pause” (e.g., allow any swirl animation to finish), start shake+flip
    setTimeout(() => {
      // a) Bring chosen wrapper to center and on top by adding “flipping-wrapper”
      chosenWrapper.classList.add('flipping-wrapper');

      // b) Trigger a “shake” on the inner .deck-card for 0.6 seconds
      chosenDomCard.classList.add('shake-animation');

      // c) After 0.6s, remove the shake and perform the actual flip
      setTimeout(() => {
        chosenDomCard.classList.remove('shake-animation');

        // i) Add “flipped” so the card rotates on its Y-axis
        chosenDomCard.classList.add('flipped');

        // ii) Bring the flipped card fully on top
        chosenWrapper.style.zIndex = '750';
        chosenWrapper.classList.remove('flipping-wrapper');
        chosenWrapper.classList.add('flipped-wrapper');

        // iii) Optionally add a glow effect (you can remove if not desired)
        chosenDomCard.classList.add('glow');

        // iv) Show the “Card Details” box
        if (cardDetailsBox) cardDetailsBox.classList.add('show');

        // v) After an additional delay (0.6s after flip), reveal buttons & interpretation
        setTimeout(() => {
          if (drawAgainButton) drawAgainButton.classList.remove('hidden');
          if (shareButton)     shareButton.classList.remove('hidden');

          // Populate “Interpreting Your Card”
          const meaningArray = isReversed
            ? chosenCard.meanings.shadow
            : chosenCard.meanings.light;
          const chosenMeaning = meaningArray.join(', ');

          if (dynamicInterpret) {
            dynamicInterpret.innerHTML = `
              <p><span class="font-bold">Name:</span> ${chosenCard.name} ${isReversed ? '(Reversed)' : ''}</p>
              <p><span class="font-bold">Arcana:</span> ${chosenCard.arcana}</p>
              <p><span class="font-bold">Meaning:</span> ${chosenMeaning}</p>
              <p><span class="font-bold">Fortune Telling:</span> ${chosenCard.fortune_telling.join(', ')}</p>
              <p><span class="font-bold">Keywords:</span> ${chosenCard.keywords.join(', ')}</p>
            `;
            interpretContainer.classList.remove('hidden');
          }

          // Show “Note to You” section
          if (noteContainer) noteContainer.classList.remove('hidden');

          // Save reading to history
          const reading = {
            name: chosenCard.name,
            arcana: chosenCard.arcana,
            fortune_telling: chosenCard.fortune_telling,
            orientation: isReversed ? "Reversed" : "Light",
            chosenMeaning: chosenMeaning,
            question: currentQuestion,
            timestamp: new Date().toLocaleString()
          };
          readingHistory.unshift(reading);
          if (readingHistory.length > 10) readingHistory.pop();
          localStorage.setItem('tarotHistory', JSON.stringify(readingHistory));
          updateHistoryList();

        }, 600);
      }, 600);
    }, 500); // short pause before shaking (adjust if you have swirl animations)
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 6) RESET READING (flip cards face-down, clear images & hide details)
  // ───────────────────────────────────────────────────────────────────────────

  function resetReading() {
    cardWrappers.forEach(wrapper => {
      const card = wrapper.querySelector('.deck-card');
      if (card) {
        card.classList.remove('flipped', 'glow', 'shake-animation');
      }
      wrapper.classList.remove('flipping-wrapper', 'flipped-wrapper');

      // Clear front‐img src and reversed class
      const imgElem = wrapper.querySelector('.card-front-img');
      if (imgElem) {
        imgElem.src = '';
        imgElem.classList.remove('reversed');
      }

      // Reset wrapper’s z-index to default
      const iVal = parseInt(wrapper.style.getPropertyValue('--i')) || 0;
      wrapper.style.zIndex = `${100 - iVal}`;
    });

    // Hide buttons, card details, interpretation, and note sections
    if (drawAgainButton) drawAgainButton.classList.add('hidden');
    if (shareButton)     shareButton.classList.add('hidden');
    if (cardDetailsBox)  cardDetailsBox.classList.remove('show');
    if (interpretContainer) interpretContainer.classList.add('hidden');
    if (noteContainer)      noteContainer.classList.add('hidden');

    // Show question input & Draw button again
    setTimeout(() => {
      if (drawButton)    drawButton.classList.remove('hidden');
      if (userQuestion)  userQuestion.classList.remove('hidden');
    }, 400);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 7) UPDATE HISTORY LIST (populate side‐panel with past readings)
  // ───────────────────────────────────────────────────────────────────────────

  function updateHistoryList() {
    if (!historyList) return;
    historyList.innerHTML = '';

    if (readingHistory.length === 0) {
      if (emptyHistory) emptyHistory.classList.remove('hidden');
      return;
    }
    if (emptyHistory) emptyHistory.classList.add('hidden');

    readingHistory.forEach((reading, idx) => {
      const item = document.createElement('div');
      item.classList.add('history-item');
      item.innerHTML = `
        <p><strong>${reading.name}</strong> (${reading.orientation})</p>
        <p><em>${reading.arcana}</em></p>
        <p>${reading.question}</p>
        <button class="share-history btn" data-index="${idx}">
          <i class="fas fa-share-alt"></i> Share
        </button>
      `;
      historyList.appendChild(item);
    });

    // Attach listeners to “Share” buttons in history items
    document.querySelectorAll('.share-history').forEach(button => {
      button.addEventListener('click', e => {
        const idx = e.currentTarget.dataset.index;
        openShareModal(readingHistory[idx]);
      });
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 8) SHARE MODAL HANDLERS (placeholder)
  // ───────────────────────────────────────────────────────────────────────────

  function openShareModal(reading) {
    alert(`Share functionality for "${reading.name}" would open now.`);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 9) THEME HANDLING (placeholder, if you have multiple card designs)
  // ───────────────────────────────────────────────────────────────────────────

  function setTheme(theme) {
    console.log(`Theme changed to: ${theme}`);
    // Implement actual theme‐switch logic here if you have other styles/assets
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 10) INITIALIZE BACKGROUND & PARTICLES
  // ───────────────────────────────────────────────────────────────────────────

  createStars();
  createParticles();
});
