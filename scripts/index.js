// script.js

// Generate stars for background
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

        // Random animation duration
        const duration = 3 + Math.random() * 10;
        star.style.setProperty('--duration', `${duration}s`);

        // Random delay
        star.style.animationDelay = `${Math.random() * 5}s`;

        container.appendChild(star);
    }
}

// Create particle effects
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

// Create swirl animation
function createSwirl() {
    const container = document.getElementById('swirlContainer');
    container.innerHTML = '';

    const swirl = document.createElement('div');
    swirl.classList.add('swirl-animation');

    // Position at center of card
    swirl.style.top = '50%';
    swirl.style.left = '50%';
    swirl.style.transform = 'translate(-50%, -50%)';

    container.appendChild(swirl);

    // Remove after animation completes
    setTimeout(() => {
        swirl.remove();
    }, 1500);
}

// We'll load tarot card data from a JSON file named 'tarot-details.json'.
let tarotDeck = [];  // Will hold the array from data.cards

// Fetch JSON on load
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

// DOM elements
const centerCard = document.getElementById('centerCard');
const cardContent = document.getElementById('cardContent');
const drawButton = document.getElementById('drawButton');
const drawAgainButton = document.getElementById('drawAgainButton');
const shareButton = document.getElementById('shareButton');
const preReadingSection = document.getElementById('preReading');
const readingSection = document.getElementById('readingSection');
const startButton = document.getElementById('startButton');
const userQuestion = document.getElementById('userQuestion');
const questionDisplay = document.getElementById('questionDisplay');
const displayedQuestion = document.getElementById('displayedQuestion');
const revealingMessage = document.getElementById('revealingMessage');
const flipSound = document.getElementById('flipSound');
const historyButton = document.getElementById('historyButton');
const historyButtonReading = document.getElementById('historyButtonReading');
const historyPanel = document.getElementById('historyPanel');
const closeHistory = document.getElementById('closeHistory');
const clearHistory = document.getElementById('clearHistory');
const saveHistory = document.getElementById('saveHistory');
const historyList = document.getElementById('historyList');
const emptyHistory = document.getElementById('emptyHistory');
const shareModal = document.getElementById('shareModal');
const closeShare = document.getElementById('closeShare');
const copyTextBtn = document.getElementById('copyTextBtn');
const downloadImageBtn = document.getElementById('downloadImageBtn');
const twitterShare = document.getElementById('twitterShare');
const facebookShare = document.getElementById('facebookShare');
const shareText = document.getElementById('shareText');
const shareQuote = document.getElementById('shareQuote');
const shareTimestamp = document.getElementById('shareTimestamp');
const themeOptions = document.querySelectorAll('.theme-option');
const backButton = document.getElementById('backButton');
const changeDeckButton = document.getElementById('changeDeckButton');
const pdfButton = document.getElementById('pdfButton');

// New: the container we’ll inject into
const dynamicInterpret = document.getElementById('dynamicInterpret');

let currentQuestion = "";
let readingHistory = JSON.parse(localStorage.getItem('tarotHistory')) || [];
let currentTheme = "1";
let currentThemeIcon = "fa-moon";
let currentCenterSymbol = "☾";

// Initialize after DOM is ready
updateHistoryList();
updateCardBackIcons();

// Start the reading experience
startButton.addEventListener('click', () => {
    preReadingSection.classList.add('fade-out');
    setTimeout(() => {
        preReadingSection.classList.add('hidden');
        readingSection.classList.remove('hidden');
        // Add slight delay before showing reading section
        setTimeout(() => {
            readingSection.classList.add('fade-in');
        }, 50);
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

// Change deck button
changeDeckButton.addEventListener('click', () => {
    readingSection.classList.add('fade-out');
    setTimeout(() => {
        readingSection.classList.add('hidden');
        preReadingSection.classList.remove('hidden');
        preReadingSection.classList.add('fade-in');
    }, 800);
});

// Add shake animation to card on hover
centerCard.addEventListener('mouseenter', () => {
    if (!centerCard.classList.contains('flipped')) {
        centerCard.classList.add('card-shake');
        setTimeout(() => {
            centerCard.classList.remove('card-shake');
        }, 600);
    }
});

// Draw a card with enhanced experience
function drawCard() {
    // Ensure tarotDeck is loaded
    if (tarotDeck.length === 0) {
        alert("Tarot deck data is not yet loaded. Please wait a moment and try again.");
        return;
    }

    // Get and store user's question
    currentQuestion = userQuestion.value.trim() || "Seeking general guidance";
    displayedQuestion.textContent = currentQuestion;
    questionDisplay.classList.remove('hidden');

    // Hide input and buttons temporarily
    userQuestion.classList.add('hidden');
    drawButton.classList.add('hidden');

    // Show revealing message
    revealingMessage.classList.remove('hidden');

    // Play flip sound
    if (flipSound) {
        flipSound.currentTime = 0;
        flipSound.play().catch(e => console.log("Sound play prevented by browser policy"));
    }

    // Create particle effects
    createParticles();

    // Simulate shuffling animation
    const cards = document.querySelectorAll('.tarot-card');
    cards.forEach(card => card.classList.add('shuffle-animation'));

    setTimeout(() => {
        // Create mystical swirl animation
        createSwirl();

        // Remove shuffling animation
        cards.forEach(card => card.classList.remove('shuffle-animation'));

        // Random card and orientation
        const randomIndex = Math.floor(Math.random() * tarotDeck.length);
        const isReversed = Math.random() > 0.5;
        const card = tarotDeck[randomIndex];

        // Determine which meaning array to use
        const chosenMeaningArray = isReversed
            ? card.meanings.shadow
            : card.meanings.light;
        // Join meanings into one string
        const chosenMeaning = chosenMeaningArray.join(', ');

        // Build card content in the flip card front
        cardContent.innerHTML = `
            ${isReversed ? '<div class="reversed-indicator">Reversed</div>' : ''}
            <h3 class="font-cinzel text-2xl text-center mb-2">${card.name}</h3>
            <p class="text-sm text-purple-400 italic mb-2">${card.arcana}</p>
            <div class="flex-1 w-full flex items-center justify-center">
                <img src="${card.img}" alt="${card.name}" class="rounded-lg ${isReversed ? 'reversed' : ''}">
            </div>
            <div class="mt-4">
                <p class="font-playfair italic text-center text-sm mb-2">
                    <span class="font-bold">${isReversed ? 'Shadow:' : 'Light:'}</span> ${chosenMeaning}
                </p>
                <p class="font-playfair text-sm text-center mb-2"><span class="font-bold">Fortune Telling:</span> ${card.fortune_telling.join(', ')}</p>
                <p class="font-playfair text-sm text-center"><span class="font-bold">Keywords:</span> ${card.keywords.join(', ')}</p>
            </div>
        `;

        // 1) Flip the card face
        const cardFront = centerCard.querySelector('.card-front');
        if (isReversed) {
            cardFront.classList.add('reversed');
        } else {
            cardFront.classList.remove('reversed');
        }

        // 2) Hide revealing message
        revealingMessage.classList.add('fade-out');
        setTimeout(() => {
            revealingMessage.classList.add('hidden');
            revealingMessage.classList.remove('fade-out');
        }, 500);

        // 3) After a short delay, perform the 3D flip
        setTimeout(() => {
            centerCard.classList.add('flipped');
            centerCard.classList.add('glow');

            // SHOW the “Interpreting Your Card” box now that we have a result:
            document.getElementById('interpretContainer').classList.remove('hidden');

            // SHOW the “Note to You” box as well:
            document.getElementById('noteContainer').classList.remove('hidden');

            // Show “Draw Again” & “Share Reading”
            setTimeout(() => {
                drawAgainButton.classList.remove('hidden');
                shareButton.classList.remove('hidden');
            }, 500);

            // 4) Populate the “Interpreting Your Card” dynamic content
            dynamicInterpret.innerHTML = `
                <p><span class="font-bold">Name:</span> ${card.name} (${isReversed ? 'Reversed' : 'Light'})</p>
                <p><span class="font-bold">Arcana:</span> ${card.arcana}</p>
                <p><span class="font-bold">Meaning:</span> ${chosenMeaning}</p>
                <p><span class="font-bold">Fortune Telling:</span> ${card.fortune_telling.join(', ')}</p>
                <p><span class="font-bold">Keywords:</span> ${card.keywords.join(', ')}</p>
            `;

            // 5) Add to reading history
            const reading = {
                name: card.name,
                arcana: card.arcana,
                fortune_telling: card.fortune_telling, // array
                orientation: isReversed ? "Reversed" : "Light",
                chosenMeaning: chosenMeaning,
                question: currentQuestion,
                timestamp: new Date().toLocaleString()
            };

            readingHistory.unshift(reading);
            if (readingHistory.length > 10) readingHistory.pop();

            localStorage.setItem('tarotHistory', JSON.stringify(readingHistory));
            updateHistoryList();
        }, 300);
    }, 1500);
}

// Update card back with selected theme icon for all cards
function updateCardBackIcons() {
    document.querySelectorAll('.card-icon').forEach(icon => {
        icon.className = `fas ${currentThemeIcon} text-5xl text-purple-800 card-icon`;
    });

    document.querySelectorAll('.center-card-symbol').forEach(symbol => {
        symbol.textContent = currentCenterSymbol;
    });
}

// Reset for new reading
function resetReading() {
    centerCard.classList.remove('glow');
    drawAgainButton.classList.add('hidden');
    shareButton.classList.add('hidden');
    centerCard.classList.remove('flipped');
    cardContent.innerHTML = '';
    dynamicInterpret.innerHTML = '';   // Clear the dynamic box

    // Remove the Interpretation box when the user clicks “Draw Again”:
    document.getElementById('interpretContainer').classList.add('hidden');

    setTimeout(() => {
        drawButton.classList.remove('hidden');
        userQuestion.classList.remove('hidden');
    }, 800);
}

// Update history list
function updateHistoryList() {
    if (readingHistory.length === 0) {
        emptyHistory.classList.remove('hidden');
        historyList.innerHTML = '';
        return;
    }

    emptyHistory.classList.add('hidden');
    historyList.innerHTML = '';

    readingHistory.forEach((reading, index) => {
        const snippet = (reading.chosenMeaning || '').substring(0, 60);

        const item = document.createElement('div');
        item.classList.add('history-item');
        item.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-cinzel text-lg">
                        ${reading.name} 
                        <span class="text-sm ${reading.orientation === 'Reversed' ? 'text-red-400' : 'text-green-400'}">
                            (${reading.orientation})
                        </span>
                    </h4>
                    <p class="text-xs text-purple-300 mb-1">${reading.arcana}</p>
                    <p class="text-sm text-gray-400 italic">${reading.timestamp}</p>
                </div>
                <button class="text-purple-400 hover:text-white share-history" data-index="${index}">
                    <i class="fas fa-share-alt"></i>
                </button>
            </div>
            <p class="mt-2 text-sm text-gray-300">
                <span class="font-bold">Q:</span> ${reading.question}
            </p>
            <p class="mt-1 text-sm text-gray-400 italic">
                <span class="font-bold">Meaning:</span> ${snippet}...
            </p>
        `;
        historyList.appendChild(item);
    });

    // Re‐attach share‐history listeners
    document.querySelectorAll('.share-history').forEach(button => {
        button.addEventListener('click', e => {
            const idx = e.currentTarget.dataset.index;
            openShareModal(readingHistory[idx]);
        });
    });
}

// Open share modal
function openShareModal(reading) {
    shareQuote.textContent = `${reading.name} (${reading.orientation}): ${reading.chosenMeaning}`;
    shareTimestamp.textContent = reading.timestamp;
    shareText.textContent = `I just drew ${reading.name} (${reading.orientation}) on Mystic Tarot! 
Question: ${reading.question}
Meaning: ${reading.chosenMeaning}
Arcana: ${reading.arcana}
Fortune: ${reading.fortune_telling.join(', ')}
#TarotReading`;

    shareModal.classList.add('active');
}

// Close share modal
function closeShareModal() {
    shareModal.classList.remove('active');
}

// Copy text to clipboard
function copyText() {
    navigator.clipboard.writeText(shareText.textContent)
        .then(() => {
            const originalText = copyTextBtn.innerHTML;
            copyTextBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
            setTimeout(() => {
                copyTextBtn.innerHTML = originalText;
            }, 2000);
        })
        .catch(console.error);
}

// Share on Twitter
function shareOnTwitter() {
    const text = encodeURIComponent(`I just drew ${shareQuote.textContent.split(':')[0]} on Mystic Tarot! #TarotReading`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
}

// Share on Facebook
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

// Set theme
function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.style.setProperty(
        '--primary',
        theme === '1' ? '#7e22ce' : theme === '2' ? '#0d9488' : theme === '3' ? '#b45309' : '#4338ca'
    );
    document.documentElement.style.setProperty(
        '--primary-dark',
        theme === '1' ? '#4c1d95' : theme === '2' ? '#115e59' : theme === '3' ? '#7c2d12' : '#312e81'
    );
    document.documentElement.style.setProperty(
        '--primary-light',
        theme === '1' ? '#c084fc' : theme === '2' ? '#5eead4' : theme === '3' ? '#fcd34d' : '#818cf8'
    );
    document.documentElement.style.setProperty(
        '--accent',
        theme === '1' ? '#f0abfc' : theme === '2' ? '#99f6e4' : theme === '3' ? '#fde68a' : '#a5b4fc'
    );

    if (theme === '1') {
        currentThemeIcon = "fa-moon";
        currentCenterSymbol = "☾";
    } else if (theme === '2') {
        currentThemeIcon = "fa-leaf";
        currentCenterSymbol = "♣";
    } else if (theme === '3') {
        currentThemeIcon = "fa-sun";
        currentCenterSymbol = "☀";
    } else {
        currentThemeIcon = "fa-star";
        currentCenterSymbol = "★";
    }

    updateCardBackIcons();
}

// Generate PDF report
function generatePDF() {
    const originalText = pdfButton.innerHTML;
    pdfButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Generating...';

    const readings = readingHistory.slice(0, 3);
    if (!readings || readings.length === 0) {
        alert('No readings available to generate a PDF. Please draw a card first.');
        pdfButton.innerHTML = originalText;
        return;
    }

    const primaryColor = '#c084fc';
    const backgroundColor = '#0a0e1d';
    const mutedText = '#d1d5db';

    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.padding = '40px';
    container.style.fontFamily = 'Playfair Display, serif';
    container.style.background = backgroundColor;
    container.style.color = 'white';
    container.style.minHeight = '1120px';
    container.style.boxSizing = 'border-box';

    const title = `<h1 style="font-family: Cinzel, serif; color: ${primaryColor}; text-align: center; font-size: 2.4em; margin-bottom: 20px;">Your personal guidance from the universe</h1>`;
    const intro = `<p style="font-size: 1.1em; text-align: center; margin-bottom: 30px;">Below are your recent tarot readings. Reflect on these messages and how they relate to your journey. The universe speaks through symbols and signs - trust your intuition as you interpret these insights.</p>`;

    const readingsHTML = readings.map(reading => `
        <div style="border: 1px solid ${primaryColor}; border-radius: 12px; padding: 20px; margin-bottom: 25px; background: rgba(255, 255, 255, 0.05);">
            <h2 style="color: ${primaryColor}; margin-bottom: 6px; font-size: 1.4em;">${reading.name} <span style="font-size: 0.9em; color: ${reading.orientation === 'Reversed' ? '#f87171' : '#34d399'}">(${reading.orientation})</span></h2>
            <p style="font-size: 0.9em; margin-bottom: 6px;"><span style="font-weight: bold;">Arcana:</span> ${reading.arcana}</p>
            <div style="display: flex; justify-content: space-between; font-size: 0.9em; margin-bottom: 10px;">
                <span>${reading.timestamp}</span>
                <span style="color: ${mutedText};">Q: ${reading.question}</span>
            </div>
            <p style="font-size: 0.9em; margin-bottom: 8px;"><span style="font-weight: bold;">Meaning:</span> ${reading.chosenMeaning}</p>
            <p style="font-size: 0.9em; margin-bottom: 8px;"><span style="font-weight: bold;">Fortune Telling:</span> ${reading.fortune_telling.join(', ')}</p>
        </div>`).join('');

    const footer = `
        <p style="font-style: italic; text-align: center; font-size: 1em; color: #f3f4f6; margin-top: 30px;">
            The tarot reveals possibilities, not certainties. Your free will and actions shape your destiny.
        </p>
        <h3 style="color: #f3f4f6; text-align: center; margin-top: 20px; font-size: 1.2em;">Brought to you with ❤️ by TAROTCARDGENERATOR.COM</h3>
        <p style="text-align: center; color: #f3f4f6; font-size: 0.9em;">Visit us anytime for more guidance on your journey</p>
    `;

    container.innerHTML = title + intro + readingsHTML + footer;
    document.body.appendChild(container);

    html2canvas(container, { backgroundColor: null })
        .then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'pt', 'a4');

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
            const imgWidth = canvas.width * ratio;
            const imgHeight = canvas.height * ratio;

            pdf.setFillColor(backgroundColor);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');

            pdf.addImage(imgData, 'PNG', (pageWidth - imgWidth) / 2, 20, imgWidth, imgHeight);
            pdf.save('Mystic_Tarot_Readings.pdf');

            pdfButton.innerHTML = originalText;
            document.body.removeChild(container);
        })
        .catch(error => {
            console.error('PDF generation error:', error);
            pdfButton.innerHTML = originalText;
            alert('Failed to generate PDF. Please try again.');
        });
}

// Event listeners
drawButton.addEventListener('click', drawCard);
drawAgainButton.addEventListener('click', resetReading);
shareButton.addEventListener('click', () => openShareModal(readingHistory[0]));
historyButton.addEventListener('click', () => historyPanel.classList.add('open'));
historyButtonReading.addEventListener('click', () => historyPanel.classList.add('open'));
closeHistory.addEventListener('click', () => historyPanel.classList.remove('open'));
clearHistory.addEventListener('click', () => {
    readingHistory = [];
    localStorage.removeItem('tarotHistory');
    updateHistoryList();
});
saveHistory.addEventListener('click', () => {
    alert('Your reading history has been saved to your browser storage. It will persist even if you close the browser.');
});
closeShare.addEventListener('click', closeShareModal);
copyTextBtn.addEventListener('click', copyText);
twitterShare.addEventListener('click', shareOnTwitter);
facebookShare.addEventListener('click', shareOnFacebook);
downloadImageBtn.addEventListener('click', () => {
    alert('In a production environment, this would generate and download an image of your reading.');
});
pdfButton.addEventListener('click', generatePDF);

// Theme selection
themeOptions.forEach(option => {
    option.addEventListener('click', () => {
        themeOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        setTheme(option.dataset.theme);
    });
});

// Initialize stars and particles
createStars();
createParticles();

// Initial animation for the card
setTimeout(() => {
    centerCard.classList.add('card-shake');
    setTimeout(() => {
        centerCard.classList.remove('card-shake');
    }, 600);
}, 1000);
