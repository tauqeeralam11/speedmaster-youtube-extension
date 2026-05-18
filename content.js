function createSpeedControls() {
    const controls = document.querySelector('.ytp-right-controls');
    if (!controls || document.getElementById('custom-speed-container')) {
        return;
    }
    const video = document.querySelector('video');
    if (!video) return;
    const container = document.createElement('div');
    container.id = 'custom-speed-container';
    const toast = document.createElement('div');
toast.id = 'speed-toast';
container.appendChild(toast);
function showToast(message) {
    toast.innerText = message;
    toast.classList.add('show');
    clearTimeout(toast.hideTimeout);
    toast.hideTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 1800);
}
    const defaultSpeeds = [1, 2, 3, 5];
    let savedSpeed =
        parseFloat(localStorage.getItem('yt-speed')) || 1;
    video.playbackRate = savedSpeed;
    function setActiveButton(rate) {

        container.querySelectorAll('.speed-btn').forEach(btn => {

            btn.classList.remove('active');

            if (parseFloat(btn.dataset.speed) === rate) {
                btn.classList.add('active');
            }
        });
    }
    function removeCustomButtons() {
        container.querySelectorAll('.custom-speed')
            .forEach(btn => btn.remove());
    }
    function createSpeedButton(speed, isCustom = false) {

        const btn = document.createElement('button');
        btn.className = 'speed-btn';
        if (isCustom) {
            btn.classList.add('custom-speed');
        }
        btn.innerText = speed + 'x';
        btn.dataset.speed = speed;
        btn.addEventListener('click', () => {
            video.defaultPlaybackRate = speed;
video.playbackRate = speed;
            localStorage.setItem('yt-speed', speed);
            setActiveButton(speed);
        });
        return btn;
    }
    defaultSpeeds.forEach(speed => {
        container.appendChild(createSpeedButton(speed));
    });
    const customWrapper = document.createElement('div');
customWrapper.className = 'custom-input-wrapper';
const customInput = document.createElement('input');
customInput.type = 'text';
customInput.inputMode = 'decimal';
customInput.placeholder = '+';
customInput.className = 'custom-speed-input';
customInput.addEventListener('keydown', (e) => {
    e.stopPropagation();
});
customInput.addEventListener('keyup', (e) => {
    e.stopPropagation();
    if (e.key !== 'Enter') return;
    let value = customInput.value.trim();
    value = value.replace('x', '');
    let speed = parseFloat(value);
    if (isNaN(speed)) {
        customInput.value = '';
        return;
    }
    if (speed > 5) {
    showToast('Maximum speed is 5x');
    customInput.value = '';
    return;
}
    if (speed < 0.25) {
        speed = 0.25;
    }
    speed = parseFloat(speed.toFixed(2));
    video.defaultPlaybackRate = speed;
video.playbackRate = speed;
    localStorage.setItem('yt-speed', speed);
    removeCustomButtons();
    if (defaultSpeeds.includes(speed)) {
        setActiveButton(speed);

    } else {
        const customBtn =
            createSpeedButton(speed, true);
        container.insertBefore(customBtn, customWrapper);
        setActiveButton(speed);
    }
    customInput.value = '';
    customInput.blur();
});
customInput.addEventListener('wheel', (e) => {
    e.preventDefault();
});
customInput.addEventListener('input', () => {
    let value = customInput.value
        .replace(/[^0-9.]/g, '');
    const parts = value.split('.');

    if (parts.length > 2) {
        value = parts[0] + '.' + parts[1];
    }
    if (parts[1]) {
        parts[1] = parts[1].slice(0, 2);
        value = parts[0] + '.' + parts[1];
    }
    customInput.value = value;
});
customWrapper.appendChild(customInput);
container.appendChild(customWrapper);
    controls.prepend(container);
    if (defaultSpeeds.includes(savedSpeed)) {
        setActiveButton(savedSpeed);
    } else {
        const customBtn =
            createSpeedButton(savedSpeed, true);
        container.insertBefore(customBtn, customWrapper);
        setActiveButton(savedSpeed);
    }
    video.addEventListener('ratechange', () => {
        const currentRate = video.playbackRate;
        setActiveButton(currentRate);
    });
}
function setupAdAcceleration() {
    let adPlaying = false;
    const observer = new MutationObserver(() => {
        const adShowing =
            document.querySelector('.ad-showing');
        const video =
            document.querySelector('video');
        const controls =
            document.getElementById('custom-speed-container');
        if (!video) return;
        if (adShowing) {
            if (controls) {
                controls.style.display = 'none';
            }
            video.muted = true;
            video.playbackRate = 10;
            const skipBtn = document.querySelector(
                '.ytp-ad-skip-button, .ytp-skip-ad-button'
            );

            if (skipBtn) {
                skipBtn.click();
            }

            adPlaying = true;
        }
        if (!adShowing && adPlaying) {
            adPlaying = false;
            if (controls) {
                controls.style.display = 'flex';
            }
            video.muted = false;
            const savedSpeed =
                parseFloat(localStorage.getItem('yt-speed')) || 1;
            video.playbackRate = savedSpeed;
        }
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
function persistPlaybackSpeed() {
    const applySavedSpeed = () => {
        const video = document.querySelector('video');
        if (!video) return;
        const savedSpeed =
            parseFloat(localStorage.getItem('yt-speed')) || 1;
        video.defaultPlaybackRate = savedSpeed;
        video.playbackRate = savedSpeed;
    };
    applySavedSpeed();
    document.addEventListener('yt-navigate-finish', () => {
        setTimeout(() => {
            applySavedSpeed();
        }, 1000);
    });
    const observer = new MutationObserver(() => {
        const video = document.querySelector('video');
        if (video && video.playbackRate !== parseFloat(localStorage.getItem('yt-speed'))) {
            applySavedSpeed();
        }
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
let controlsInitialized = false;
const observer = new MutationObserver(() => {
    const controls =
        document.querySelector('.ytp-right-controls');
    if (controls && !controlsInitialized) {
        createSpeedControls();
        controlsInitialized = true;
    }
    if (!document.getElementById('custom-speed-container')) {
        controlsInitialized = false;
    }
});
observer.observe(document.body, {
    childList: true,
    subtree: true
});
createSpeedControls();
setupAdAcceleration();
persistPlaybackSpeed(); 