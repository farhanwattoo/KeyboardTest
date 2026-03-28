document.addEventListener('DOMContentLoaded', () => {
    const targetText = document.getElementById('target-text');
    const typingInput = document.getElementById('typing-input');
    const startBtn = document.getElementById('start-typing');
    const wpmDisplay = document.getElementById('wpm-display');
    const accuracyDisplay = document.getElementById('accuracy-display');
    const timerDisplay = document.getElementById('timer-display');
    const testStatus = document.getElementById('test-status');
    const resultOverlay = document.getElementById('result-overlay');
    const restartBtn = document.getElementById('restart-btn');

    // Stats display in modal
    const finalWpm = document.getElementById('final-wpm-val');
    const finalKpm = document.getElementById('final-kpm-val');
    const finalAccuracy = document.getElementById('final-accuracy-val');
    const finalErrors = document.getElementById('final-errors-val');

    const quotes = [
        "The quick brown fox jumps over the lazy dog.",
        "Your time is limited, so don't waste it living someone else's life.",
        "Stay hungry, stay foolish.",
        "Knowledge is power.",
        "Technology is best when it brings people together.",
        "The only way to do great work is to love what you do.",
        "Action is the foundational key to all success.",
        "Innovation distinguishes between a leader and a follower.",
        "Success is a journey, not a destination.",
        "Dream big and dare to fail."
    ];

    let currentQuote = "";
    let startTime = null;
    let timerInterval = null;
    let isTesting = false;
    let totalChars = 0;
    let errors = 0;
    let typedChars = 0;

    function initTest() {
        currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
        targetText.innerHTML = currentQuote.split('').map(char => `<span>${char}</span>`).join('');
        typingInput.value = "";
        wpmDisplay.textContent = "0";
        accuracyDisplay.textContent = "0%";
        timerDisplay.textContent = "00:00";
        testStatus.textContent = "タイピング中...";
        testStatus.style.color = "var(--primary)";
        errors = 0;
        typedChars = 0;
        
        // Auto-focus the input
        typingInput.focus();
        
        startTime = new Date();
        isTesting = true;
        
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        const now = new Date();
        const diff = Math.floor((now - startTime) / 1000);
        const mins = Math.floor(diff / 60).toString().padStart(2, '0');
        const secs = (diff % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${mins}:${secs}`;
        
        // Update live WPM
        if (diff > 0) {
            const wpm = Math.round((typedChars / 5) / (diff / 60));
            wpmDisplay.textContent = wpm;
        }
    }

    typingInput.addEventListener('input', (e) => {
        if (!isTesting) return;

        const val = typingInput.value;
        const spans = targetText.querySelectorAll('span');
        
        typedChars = val.length;
        errors = 0;

        spans.forEach((span, i) => {
            const char = val[i];
            if (char == null) {
                span.classList.remove('typing-correct', 'typing-error');
                span.style.color = "var(--text-muted)";
                span.style.background = "transparent";
            } else if (char === span.innerText) {
                span.classList.add('typing-correct');
                span.classList.remove('typing-error');
                span.style.color = "var(--text-main)";
                span.style.background = "rgba(16, 185, 129, 0.2)";
            } else {
                span.classList.add('typing-error');
                span.classList.remove('typing-correct');
                span.style.color = "var(--danger)";
                span.style.background = "rgba(239, 68, 68, 0.2)";
                errors++;
            }
        });

        // Update accuracy
        const accuracy = typedChars > 0 ? Math.round(((typedChars - errors) / typedChars) * 100) : 0;
        accuracyDisplay.textContent = `${accuracy}%`;

        // Check completion
        if (val.length >= currentQuote.length) {
            finishTest();
        }
    });

    function finishTest() {
        isTesting = false;
        clearInterval(timerInterval);
        
        const endTime = new Date();
        const durationSecs = (endTime - startTime) / 1000;
        const durationMins = durationSecs / 60;
        
        const wpm = Math.round((currentQuote.length / 5) / durationMins);
        const kpm = Math.round(currentQuote.length / durationMins);
        const accuracy = Math.round(((currentQuote.length - errors) / currentQuote.length) * 100);

        finalWpm.textContent = wpm;
        finalKpm.textContent = kpm;
        finalAccuracy.textContent = `${accuracy}%`;
        finalErrors.textContent = errors;

        resultOverlay.style.display = "flex";
        testStatus.textContent = "テスト完了";
        testStatus.style.color = "var(--accent)";
    }

    // Keep focus on input when clicking the display area
    document.getElementById('typing-test-area').addEventListener('click', () => {
        if (isTesting) typingInput.focus();
    });

    startBtn.addEventListener('click', initTest);
    restartBtn.addEventListener('click', () => {
        resultOverlay.style.display = "none";
        initTest();
    });

    // Handle space start/restart?
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Enter' && resultOverlay.style.display === "flex") {
            restartBtn.click();
        }
    });
});
