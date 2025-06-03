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

// Tarot card data
const tarotDeck = [
    {
        name: "The Fool",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/RWS_Tarot_00_Fool.jpg/220px-RWS_Tarot_00_Fool.jpg",
        upright: "New beginnings, innocence, spontaneity, free spirit",
        reversed: "Recklessness, poor judgment, naivety, risk-taking"
    },
    {
        name: "The Magician",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/RWS_Tarot_01_Magician.jpg/220px-RWS_Tarot_01_Magician.jpg",
        upright: "Manifestation, resourcefulness, inspired action, power",
        reversed: "Manipulation, untapped talents, trickery, poor planning"
    },
    {
        name: "The High Priestess",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/RWS_Tarot_02_High_Priestess.jpg/220px-RWS_Tarot_02_High_Priestess.jpg",
        upright: "Intuition, unconscious knowledge, divine feminine, mystery",
        reversed: "Secrets, disconnected from intuition, withdrawal, silence"
    },
    {
        name: "The Empress",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/RWS_Tarot_03_Empress.jpg/220px-RWS_Tarot_03_Empress.jpg",
        upright: "Femininity, beauty, nature, abundance, nurturing",
        reversed: "Creative block, dependence, neglect, overbearing"
    },
    {
        name: "The Emperor",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/RWS_Tarot_04_Emperor.jpg/220px-RWS_Tarot_04_Emperor.jpg",
        upright: "Authority, structure, control, fatherhood, leadership",
        reversed: "Domination, rigidity, lack of discipline, inflexibility"
    },
    {
        name: "The Lovers",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/RWS_Tarot_06_Lovers.jpg/220px-RWS_Tarot_06_Lovers.jpg",
        upright: "Love, harmony, relationships, alignment, choices",
        reversed: "Disharmony, imbalance, misalignment, difficult choices"
    },
    {
        name: "The Chariot",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/RWS_Tarot_07_Chariot.jpg/220px-RWS_Tarot_07_Chariot.jpg",
        upright: "Control, willpower, victory, assertion, determination",
        reversed: "Lack of direction, aggression, forcefulness, no control"
    },
    {
        name: "Strength",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/RWS_Tarot_08_Strength.jpg/220px-RWS_Tarot_08_Strength.jpg",
        upright: "Bravery, compassion, inner strength, influence",
        reversed: "Self-doubt, weakness, low confidence, insecurity"
    }
];

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

// User's question and reading history
let currentQuestion = "";
let readingHistory = JSON.parse(localStorage.getItem('tarotHistory')) || [];
let currentTheme = "1";
let currentThemeIcon = "fa-moon";
let currentCenterSymbol = "☾";

// Initialize
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
    // Get and store user's question
    currentQuestion = userQuestion.value || "Seeking general guidance";
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
    cards.forEach(card => {
        card.classList.add('shuffle-animation');
    });

    setTimeout(() => {
        // Create mystical swirl animation
        createSwirl();

        // Remove shuffling animation
        cards.forEach(card => {
            card.classList.remove('shuffle-animation');
        });

        // Random card and orientation
        const randomIndex = Math.floor(Math.random() * tarotDeck.length);
        const isReversed = Math.random() > 0.5;
        const card = tarotDeck[randomIndex];

        // Build card content
        cardContent.innerHTML = `
            ${isReversed ? '<div class="reversed-indicator">Reversed</div>' : ''}
            <h3 class="font-cinzel text-2xl text-center mb-4">${card.name}</h3>
            <div class="flex-1 w-full flex items-center justify-center">
                <img src="${card.image}" alt="${card.name}" class="max-h-52 rounded-lg ${
            isReversed ? 'reversed' : ''
        }">
            </div>
            <div class="meaning-container mt-4">
                <p class="font-playfair italic text-center text-sm">
                    <span class="font-bold">${isReversed ? 'Reversed' : 'Upright'}:</span>
                    ${
                        isReversed ? card.reversed : card.upright
                    }
                </p>
            </div>
        `;

        // Add reversed class if needed
        const cardFront = centerCard.querySelector('.card-front');
        if (isReversed) {
            cardFront.classList.add('reversed');
        } else {
            cardFront.classList.remove('reversed');
        }

        // Hide revealing message
        revealingMessage.classList.add('fade-out');
        setTimeout(() => {
            revealingMessage.classList.add('hidden');
            revealingMessage.classList.remove('fade-out');
        }, 500);

        // Flip the card after a short delay
        setTimeout(() => {
            centerCard.classList.add('flipped');

            // Add glow effect to the revealed card
            centerCard.classList.add('glow');

            // Show action buttons
            setTimeout(() => {
                drawAgainButton.classList.remove('hidden');
                shareButton.classList.remove('hidden');
            }, 500);

            // Add to reading history
            const reading = {
                card: card.name,
                orientation: isReversed ? "Reversed" : "Upright",
                meaning: isReversed ? card.reversed : card.upright,
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
    // Remove glow effect
    centerCard.classList.remove('glow');

    // Hide action buttons
    drawAgainButton.classList.add('hidden');
    shareButton.classList.add('hidden');

    // Flip card back
    centerCard.classList.remove('flipped');

    // Clear card content
    cardContent.innerHTML = '';

    // Show draw button after flip completes
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
        const item = document.createElement('div');
        item.classList.add('history-item');
        item.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-cinzel text-lg">${reading.card} <span class="text-sm ${
            reading.orientation === 'Reversed' ? 'text-red-400' : 'text-green-400'
        }">(${reading.orientation})</span></h4>
                    <p class="text-sm text-purple-300">${reading.timestamp}</p>
                </div>
                <button class="text-purple-400 hover:text-white share-history" data-index="${index}">
                    <i class="fas fa-share-alt"></i>
                </button>
            </div>
            <p class="mt-2 text-sm text-gray-300">${reading.question}</p>
            <p class="mt-1 text-sm text-gray-400 italic">${reading.meaning.substring(0, 60)}...</p>
        `;
        historyList.appendChild(item);
    });

    // Add event listeners to share buttons in history
    document.querySelectorAll('.share-history').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.currentTarget.dataset.index;
            openShareModal(readingHistory[index]);
        });
    });
}

// Open share modal
function openShareModal(reading) {
    shareQuote.textContent = `${reading.card} (${reading.orientation}): ${reading.meaning}`;
    shareTimestamp.textContent = reading.timestamp;
    shareText.textContent = `I just drew ${reading.card} (${reading.orientation}) on Mystic Tarot! 
        Question: ${reading.question}
        Meaning: ${reading.meaning}
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
            // Show a confirmation message
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

    // Set theme colors
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

    // Set theme icons
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

// Generate PDF report.
function generatePDF() {
    const originalText = pdfButton.innerHTML;
    pdfButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Generating...';

    const readings = readingHistory;

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
            <h2 style="color: ${primaryColor}; margin-bottom: 6px; font-size: 1.4em;">${reading.card} <span style="font-size: 0.9em; color: ${reading.orientation === 'Reversed' ? '#f87171' : '#34d399'}">(${reading.orientation})</span></h2>
            <div style="display: flex; justify-content: space-between; font-size: 0.9em; margin-bottom: 10px;">
                <span>${reading.timestamp}</span>
                <span style="color: ${mutedText};">Question: ${reading.question}</span>
            </div>
            <p style="font-weight: bold; font-size: 1em; margin-top: 10px;">Meaning: <span style="font-weight: normal;">${reading.meaning}</span></p>
        </div>`).join('');

    const footer = `
        <p style="font-style: italic; text-align: center; font-size: 1em; color: #f3f4f6; margin-top: 30px;">
            The tarot reveals possibilities, not certainties. Your free will and actions shape your destiny.
        </p>
        <h3 style="color: ${primaryColor}; text-align: center; margin-top: 20px; font-size: 1.2em;">TAROTCARDGENERATOR.COM</h3>
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
