// --- DOM Elements ---
const timerDisplay = document.getElementById('timer-display');
const modeText = document.getElementById('mode-text');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');
const progressCircle = document.querySelector('.progress-ring__circle');

// --- Constants & State ---
const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;
let timeLeft = WORK_MINUTES * 60;
let timerInterval = null;
let isRunning = false;
let isWorkMode = true;

// --- Progress Ring Setup ---
// Calculate circumference for SVG circle
const radius = progressCircle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;

progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = 0;

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
}

// --- Audio Notification ---
function playChime() {
    // Using Web Audio API to create a self-contained sound without external files
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Play two notes for a pleasant "ding-dong" effect
    function playNote(freq, startTime, duration) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + startTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + startTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start(audioCtx.currentTime + startTime);
        oscillator.stop(audioCtx.currentTime + startTime + duration);
    }
    
    playNote(880, 0, 0.5);   // A5
    playNote(659.25, 0.3, 0.8); // E5
}

// --- Initialize Display ---
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    timerDisplay.textContent = formattedTime;
    document.title = `${formattedTime} - ${isWorkMode ? 'Work' : 'Break'}`;

    // Update Progress Ring
    const totalSeconds = (isWorkMode ? WORK_MINUTES : BREAK_MINUTES) * 60;
    const percent = (timeLeft / totalSeconds) * 100;
    setProgress(percent);
}

// --- Timer Logic ---
function switchMode() {
    isWorkMode = !isWorkMode;
    timeLeft = (isWorkMode ? WORK_MINUTES : BREAK_MINUTES) * 60;
    
    modeText.textContent = isWorkMode ? 'Work Session' : 'Break Time';
    modeText.style.background = isWorkMode ? 'var(--secondary)' : 'var(--primary)';
    modeText.style.color = isWorkMode ? 'var(--secondary-text)' : 'white';
    
    // Change ring color based on mode
    progressCircle.style.stroke = isWorkMode ? 'var(--primary)' : 'var(--danger)';
    
    updateDisplay();
}

function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;

    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            
            playChime();
            switchMode();
        }
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    isWorkMode = true;
    timeLeft = WORK_MINUTES * 60;
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    modeText.textContent = 'Work Session';
    modeText.style.background = 'var(--secondary)';
    modeText.style.color = 'var(--secondary-text)';
    progressCircle.style.stroke = 'var(--primary)';
    
    updateDisplay();
}

// --- Theme Toggling ---
function toggleTheme() {
    const isDark = document.body.hasAttribute('data-theme');
    
    if (isDark) {
        document.body.removeAttribute('data-theme');
        moonIcon.classList.remove('hidden');
        sunIcon.classList.add('hidden');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.setAttribute('data-theme', 'dark');
        moonIcon.classList.add('hidden');
        sunIcon.classList.remove('hidden');
        localStorage.setItem('theme', 'dark');
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.setAttribute('data-theme', 'dark');
        moonIcon.classList.add('hidden');
        sunIcon.classList.remove('hidden');
    }
}

// --- Event Listeners ---
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
themeToggleBtn.addEventListener('click', toggleTheme);

// Initialize app
initTheme();
updateDisplay();
