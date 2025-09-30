// Minimal EMulator logic: device + skins + orientation + scale + motion + URL
(function () {
  const deviceFrame = document.getElementById('deviceFrame');
  const deviceIframe = document.getElementById('deviceIframe');

  // Controls
  const deviceButtons = document.querySelectorAll('[data-device]');
  const skinButtons = document.querySelectorAll('[data-skin]');
  const orientationButtons = document.querySelectorAll('[data-orientation]');
  const scaleButtons = document.querySelectorAll('[data-scale]');
  const motionButtons = document.querySelectorAll('[data-motion]');

  const urlInput = document.getElementById('urlInput');
  const urlBtn = document.getElementById('urlBtn');

  // State
  const state = {
    device: 'iphone-14-pro',
    skin: 'black',
    orientation: 'portrait',
    scale: 'scale-75',
    motion: 'animate-hover',
  };

  function normalizeUrl(u) {
    if (!u) {
      return '';
    }
    if (!/^https?:\/\//i.test(u)) {
      return 'https://' + u;
    }
    return u;
  }

  function applyState() {
    if (!deviceFrame) {
      return;
    }
    const classes = [
      'device-mockup',
      `device-${state.device}`,
      state.skin || '',
      state.orientation || '',
      state.scale || '',
      state.motion || '',
    ]
      .filter(Boolean)
      .join(' ');
    deviceFrame.className = classes;

    // Desktop browser header support
    if (state.device === 'desktop-chrome') {
      if (!deviceFrame.querySelector('.browser-header')) {
        const header = document.createElement('div');
        header.className = 'browser-header';
        const btns = document.createElement('div');
        btns.className = 'browser-buttons';
        ['close', 'minimize', 'maximize'].forEach(t => {
          const s = document.createElement('span');
          s.className = `browser-button ${t}`;
          btns.appendChild(s);
        });
        const bar = document.createElement('div');
        bar.className = 'browser-address-bar';
        bar.textContent = deviceIframe ? deviceIframe.src : '';
        header.appendChild(btns);
        header.appendChild(bar);
        deviceFrame.insertBefore(header, deviceFrame.firstChild);
      }
    } else {
      const header = deviceFrame.querySelector('.browser-header');
      if (header) {
        header.remove();
      }
    }
  }

  function setActive(btns, btn) {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  // Wire device buttons
  deviceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.device = btn.dataset.device;
      setActive(deviceButtons, btn);
      applyState();
    });
  });

  // Wire skins
  skinButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.skin = btn.dataset.skin; // black | white | gold | silver
      setActive(skinButtons, btn);
      applyState();
    });
  });

  // Wire orientation
  orientationButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.orientation = btn.dataset.orientation; // portrait | landscape
      setActive(orientationButtons, btn);
      applyState();
    });
  });

  // Wire scale
  scaleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.scale = btn.dataset.scale; // '', scale-50, scale-75, scale-125
      setActive(scaleButtons, btn);
      applyState();
    });
  });

  // Wire motion
  motionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.motion = btn.dataset.motion; // '', animate-hover, animate-float
      setActive(motionButtons, btn);
      applyState();
    });
  });

  // URL handling
  function loadUrl() {
    const u = normalizeUrl(urlInput.value.trim());
    if (u && deviceIframe) {
      deviceIframe.src = u;
      // update desktop address bar if present
      const bar = deviceFrame.querySelector('.browser-address-bar');
      if (bar) {
        bar.textContent = u;
      }
    }
  }
  urlBtn.addEventListener('click', loadUrl);
  urlInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      loadUrl();
    }
  });

  // Initial apply
  applyState();
})();
