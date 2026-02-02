import { animate, spring, utils } from 'animejs';

const State = { LOCKED: 'locked', UNLOCKED: 'unlocked' };

const CONFIG = {
  timeScale: 1.2,
  collisionBounce: 10,
  panelOffsetMultiplier: 1.1,
  spring: {
    panel: 0,
    scale: 0.5,
    content: 0.15
  }
};

const el = {
  columnLeft: document.querySelector('.column-left'),
  columnRight: document.querySelector('.column-right'),
  shadowLeftCaster: document.querySelector('.shadow-left-caster'),
  shadowCircle: document.querySelector('.shadow-circle'),
  shadowRight: document.querySelector('.shadow-right'),
  centerElement: document.querySelector('.center-element'),
  centerBase: document.querySelector('.center-base'),
  centerBlobs: document.querySelector('.center-blobs'),
  blob1: document.querySelector('.blob-1'),
  blob2: document.querySelector('.blob-2'),
  blob3: document.querySelector('.blob-3'),
  centerIllus: document.querySelector('.center-illus'),
  centerLabel: document.querySelector('.center-label'),
  faviconLocked: document.querySelector('.favicon-locked'),
  faviconUnlocked: document.querySelector('.favicon-unlocked')
};

const getPanelOffset = () => el.columnLeft.offsetWidth * CONFIG.panelOffsetMultiplier;
const scaled = (ms) => ms * CONFIG.timeScale;
const springEase = (bounce, ms) => spring({ bounce, duration: scaled(ms) });

function startBlobRotations() {
  const configs = [
    { target: el.blob1, degrees: 360, duration: 8000 },
    { target: el.blob2, degrees: -360, duration: 10000 },
    { target: el.blob3, degrees: 360, duration: 12000 }
  ];

  configs.forEach(({ target, degrees, duration }) =>
    animate(target, { rotate: [0, degrees], duration, ease: 'linear', loop: true })
  );
}

function transitionToUnlocked() {
  const panelOffset = getPanelOffset();

  utils.set(el.centerElement, { opacity: 1 });

  return [
    animate(el.faviconLocked, {
      opacity: [1, 0],
      ease: springEase(CONFIG.spring.content, 200)
    }),
    animate(el.faviconUnlocked, {
      opacity: [0, 1],
      ease: springEase(CONFIG.spring.content, 200)
    }),
    animate([el.centerLabel, el.centerIllus], {
      translateY: [0, 8],
      scale: [1, 0.8],
      opacity: [1, 0],
      delay: (_, i) => scaled(i * 120),
      ease: springEase(CONFIG.spring.content, 300)
    }),
    animate(el.centerBlobs, {
      scale: [1, 0.8],
      delay: scaled(90),
      ease: springEase(CONFIG.spring.scale, 800)
    }),
    animate(el.centerBlobs, {
      opacity: [1, 0],
      delay: scaled(90),
      ease: springEase(CONFIG.spring.scale, 800)
    }),
    animate([el.centerBase, el.shadowCircle], {
      scale: [1, 0.5],
      delay: scaled(180),
      ease: springEase(CONFIG.spring.scale, 600)
    }),
    (() => {
      const state = { opacity: 0.9 };
      return animate(state, {
        opacity: 1,
        delay: scaled(180),
        ease: springEase(CONFIG.spring.panel, 600),
        onUpdate: () => {
          document.documentElement.style.setProperty('--center-base-opacity', state.opacity);
        }
      });
    })(),
    animate([el.columnLeft, el.shadowLeftCaster, el.centerElement], {
      translateX: -panelOffset,
      delay: scaled(180),
      ease: springEase(CONFIG.spring.panel, 600)
    }),
    animate([el.columnRight, el.shadowRight], {
      translateX: panelOffset,
      delay: scaled(180),
      ease: springEase(CONFIG.spring.panel, 600)
    })
  ];
}

function transitionToLocked() {
  const bounce = CONFIG.collisionBounce;

  utils.set(el.centerElement, { opacity: 1 });
  utils.set(el.centerBase, { opacity: 1 });

  return [
    animate(el.faviconUnlocked, {
      opacity: [1, 0],
      delay: scaled(400),
      ease: springEase(CONFIG.spring.content, 200)
    }),
    animate(el.faviconLocked, {
      opacity: [0, 1],
      delay: scaled(400),
      ease: springEase(CONFIG.spring.content, 200)
    }),
    animate([el.columnLeft, el.shadowLeftCaster, el.centerElement], {
      keyframes: [
        { translateX: 0, duration: scaled(360), ease: 'inQuad' },
        { translateX: -bounce, duration: scaled(120), ease: 'outQuad' },
        { translateX: 0, duration: scaled(120), ease: 'inOutQuad' }
      ],
      delay: scaled(150)
    }),
    animate([el.columnRight, el.shadowRight], {
      keyframes: [
        { translateX: 0, duration: scaled(360), ease: 'inQuad' },
        { translateX: bounce, duration: scaled(120), ease: 'outQuad' },
        { translateX: 0, duration: scaled(120), ease: 'inOutQuad' }
      ],
      delay: scaled(150)
    }),
    animate([el.centerBase, el.shadowCircle], {
      scale: [0.5, 1],
      delay: scaled(150),
      ease: springEase(CONFIG.spring.scale, 600)
    }),
    (() => {
      const state = { opacity: 1 };
      return animate(state, {
        opacity: 0.9,
        delay: scaled(150),
        ease: springEase(CONFIG.spring.content, 600),
        onUpdate: () => {
          document.documentElement.style.setProperty('--center-base-opacity', state.opacity);
        }
      });
    })(),
    animate(el.centerBlobs, {
      scale: [0, 1],
      opacity: [0, 1],
      delay: scaled(300),
      ease: springEase(CONFIG.spring.scale + 0.05, 600)
    }),
    animate([el.centerIllus, el.centerLabel], {
      translateY: [32, 0],
      scale: [0.8, 1],
      opacity: [0, 1],
      delay: (_, i) => scaled(400 + i * 60),
      ease: springEase(CONFIG.spring.content, 460)
    })
  ];
}

function createStateMachine(initialState) {
  let currentState = initialState;
  let targetState = initialState;
  let runningAnimations = [];

  const executors = {
    [State.LOCKED]: transitionToLocked,
    [State.UNLOCKED]: transitionToUnlocked
  };

  function cancelRunning() {
    runningAnimations.forEach(anim => anim.cancel());
    runningAnimations = [];
  }

  async function transition(newTarget) {
    if (newTarget === targetState) return;

    cancelRunning();
    targetState = newTarget;

    const animations = executors[targetState]?.() ?? [];
    runningAnimations = animations;

    await Promise.all(animations);

    if (targetState === newTarget) {
      currentState = targetState;
      runningAnimations = [];
      document.dispatchEvent(new CustomEvent('statechange', { detail: { state: currentState } }));
    }
  }

  return {
    transition,
    toggle: () => transition(targetState === State.LOCKED ? State.UNLOCKED : State.LOCKED),
    getState: () => currentState,
    State
  };
}

function setInitialUnlockedState() {
  const panelOffset = getPanelOffset();

  utils.set([el.columnLeft, el.shadowLeftCaster, el.centerElement], { translateX: -panelOffset });
  utils.set([el.columnRight, el.shadowRight], { translateX: panelOffset });
  utils.set([el.centerBlobs, el.centerIllus, el.centerLabel], { opacity: 0 });
  utils.set([el.centerBase, el.shadowCircle], { scale: 0.5 });
  document.documentElement.style.setProperty('--center-base-opacity', '1');
}

const stateMachine = createStateMachine(State.UNLOCKED);
setInitialUnlockedState();
startBlobRotations();

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    stateMachine.toggle();
  }
});

document.getElementById('toggle-btn').addEventListener('click', () => stateMachine.toggle());

const timeScaleSlider = document.getElementById('time-scale');
const timeScaleValue = document.getElementById('time-scale-value');

timeScaleSlider.addEventListener('input', (e) => {
  CONFIG.timeScale = parseFloat(e.target.value);
  timeScaleValue.textContent = `${CONFIG.timeScale}x`;
});

window.stateMachine = stateMachine;
window.animConfig = CONFIG;
