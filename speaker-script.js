document.addEventListener('DOMContentLoaded', () => {
    const channelVal = document.getElementById('current-channel');
    const freqVal = document.getElementById('current-freq');
    const balanceVal = document.getElementById('current-balance');
    const freqSlider = document.getElementById('freq-slider');
    const playBtn = document.getElementById('play-freq');
    const stopBtn = document.getElementById('stop-freq');
    const triggers = document.querySelectorAll('.test-trigger');
    
    let audioCtx = null;
    let oscillator = null;
    let gainNode = null;
    let panner = null;
    let resetTimer = null;

    const initAudio = () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            gainNode = audioCtx.createGain();
            panner = audioCtx.createStereoPanner();
            gainNode.connect(panner);
            panner.connect(audioCtx.destination);
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        }
    };

    const playTone = (freq, pan = 0, duration = 0) => {
        initAudio();
        if (oscillator) oscillator.stop();
        
        oscillator = audioCtx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
        oscillator.connect(gainNode);
        
        panner.pan.setValueAtTime(pan, audioCtx.currentTime);
        gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
        
        oscillator.start();
        
        if (duration > 0) {
            gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
            setTimeout(() => { if (oscillator) oscillator.stop(); }, duration * 1000);
        }
    };

    const stopTone = () => {
        if (gainNode) {
            gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
            setTimeout(() => { 
                if (oscillator) oscillator.stop(); 
                oscillator = null;
            }, 150);
        }
    };

    triggers.forEach(btn => {
        btn.addEventListener('click', () => {
            const side = btn.dataset.side;
            const pan = side === 'left' ? -1 : 1;
            const container = document.getElementById(`spk-${side}`);
            
            channelVal.textContent = side === 'left' ? '左 (LEFT)' : '右 (RIGHT)';
            balanceVal.textContent = side === 'left' ? '左寄せ' : '右寄せ';

            playTone(440, pan, 1.5);

            // Animation
            container.style.borderColor = 'var(--primary)';
            container.querySelector('.spk-cone').style.transform = 'scale(1.1)';
            if (resetTimer) clearTimeout(resetTimer);
            resetTimer = setTimeout(() => {
                document.querySelectorAll('.spk-cone').forEach(c => { c.style.transform = 'scale(1)'; });
                document.querySelectorAll('#spk-left, #spk-right').forEach(s => { s.style.borderColor = 'var(--card-border)'; });
                channelVal.textContent = '未再生';
                balanceVal.textContent = 'センター';
            }, 1500);
        });
    });

    playBtn.addEventListener('click', () => {
        playTone(freqSlider.value, 0);
        playBtn.disabled = true;
    });

    stopBtn.addEventListener('click', () => {
        stopTone();
        playBtn.disabled = false;
    });

    freqSlider.addEventListener('input', () => {
        const val = freqSlider.value;
        freqVal.textContent = val + 'Hz';
        if (oscillator) {
            oscillator.frequency.setTargetAtTime(val, audioCtx.currentTime, 0.01);
        }
    });
});
