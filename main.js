import anime from 'animejs';

const State = { LOCKED: 'locked', UNLOCKED: 'unlocked' };

const CONFIG = {
  timeScale: 1,
  collisionBounce: 10,
  panelOffsetMultiplier: 1.08
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
  centerLabel: document.querySelector('.center-label')
};

const getPanelOffset = () => el.columnLeft.offsetWidth * CONFIG.panelOffsetMultiplier;
const scaled = (ms) => ms * CONFIG.timeScale;

let blobAnimations = [];

function startBlobRotations() {
  const configs = [
    { target: el.blob1, degrees: 360, duration: 20000 },
    { target: el.blob2, degrees: -360, duration: 25000 },
    { target: el.blob3, degrees: 360, duration: 30000 }
  ];

  blobAnimations = configs.map(({ target, degrees, duration }) =>
    anime({ targets: target, rotate: [0, degrees], duration, easing: 'linear', loop: true })
  );
}

function stopBlobRotations() {
  blobAnimations.forEach(anim => anim.pause());
  blobAnimations = [];
}

function transitionToLocked() {
  const panelOffset = getPanelOffset();
  stopBlobRotations();

  anime.set(el.centerElement, { opacity: 1 });

  return [
    anime({
      targets: [el.centerLabel, el.centerIllus],
      translateY: [0, 8],
      opacity: [1, 0],
      duration: scaled(150),
      delay: (_, i) => scaled(i * 120),
      easing: 'easeInQuad'
    }),
    anime({
      targets: el.centerBlobs,
      scale: [1, 0.3],
      opacity: [1, 0],
      duration: scaled(300),
      delay: scaled(90),
      easing: 'easeInQuad'
    }),
    anime({
      targets: [el.centerBase, el.shadowCircle],
      scale: [1, 0.5],
      duration: scaled(600),
      delay: scaled(180),
      easing: 'easeOutCubic'
    }),
    anime({
      targets: [el.columnLeft, el.shadowLeftCaster, el.centerElement],
      translateX: -panelOffset,
      duration: scaled(600),
      delay: scaled(180),
      easing: 'easeOutCubic'
    }),
    anime({
      targets: [el.columnRight, el.shadowRight],
      translateX: panelOffset,
      duration: scaled(600),
      delay: scaled(180),
      easing: 'easeOutCubic'
    })
  ];
}

function transitionToUnlocked() {
  const bounce = CONFIG.collisionBounce;
  startBlobRotations();

  anime.set(el.centerElement, { opacity: 1 });
  anime.set(el.centerBase, { opacity: 1 });

  return [
    anime({
      targets: [el.columnLeft, el.shadowLeftCaster, el.centerElement],
      keyframes: [
        { translateX: 0, duration: scaled(360), easing: 'easeInQuad' },
        { translateX: -bounce, duration: scaled(120), easing: 'easeOutQuad' },
        { translateX: 0, duration: scaled(120), easing: 'easeInOutQuad' }
      ],
      delay: scaled(150)
    }),
    anime({
      targets: [el.columnRight, el.shadowRight],
      keyframes: [
        { translateX: 0, duration: scaled(360), easing: 'easeInQuad' },
        { translateX: bounce, duration: scaled(120), easing: 'easeOutQuad' },
        { translateX: 0, duration: scaled(120), easing: 'easeInOutQuad' }
      ],
      delay: scaled(150)
    }),
    anime({
      targets: [el.centerBase, el.shadowCircle],
      scale: [0.5, 1],
      duration: scaled(360),
      delay: scaled(150),
      easing: 'easeInQuad'
    }),
    anime({
      targets: el.centerBlobs,
      keyframes: [
        { scale: 0, opacity: 0, duration: 0 },
        { scale: 1.12, opacity: 1, duration: scaled(300), easing: 'easeOutCubic' },
        { scale: 1, duration: scaled(200), easing: 'easeInOutQuad' }
      ],
      delay: scaled(400)
    }),
    anime({
      targets: [el.centerIllus, el.centerLabel],
      translateY: [32, 0],
      opacity: [0, 1],
      duration: scaled(460),
      delay: (_, i) => scaled(400 + i * 60),
      easing: 'easeOutCubic'
    })
  ];
}

function createStateMachine(initialState) {
  let currentState = initialState;
  let isTransitioning = false;

  const executors = {
    [State.LOCKED]: transitionToLocked,
    [State.UNLOCKED]: transitionToUnlocked
  };

  async function transition(targetState) {
    if (isTransitioning || currentState === targetState) return;

    isTransitioning = true;
    const animations = executors[targetState]?.() ?? [];
    await Promise.all(animations.map(anim => anim.finished));

    currentState = targetState;
    isTransitioning = false;

    document.dispatchEvent(new CustomEvent('statechange', { detail: { state: currentState } }));
  }

  return {
    transition,
    toggle: () => transition(currentState === State.LOCKED ? State.UNLOCKED : State.LOCKED),
    getState: () => currentState,
    State
  };
}

function setInitialLockedState() {
  const panelOffset = getPanelOffset();

  anime.set([el.columnLeft, el.shadowLeftCaster, el.centerElement], { translateX: -panelOffset });
  anime.set([el.columnRight, el.shadowRight], { translateX: panelOffset });
  anime.set([el.centerBlobs, el.centerIllus, el.centerLabel], { opacity: 0 });
  anime.set([el.centerBase, el.shadowCircle], { scale: 0.5 });
}

const stateMachine = createStateMachine(State.LOCKED);
setInitialLockedState();

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
