import anime from 'animejs';

const State = { LOCKED: 'locked', UNLOCKED: 'unlocked' };

const config = {
  duration: 600,
  easing: 'easeOutCubic',
  collisionBounce: 10,
  timeScale: 1,
  panelOffset: 1.08
};

const t = (ms) => ms * config.timeScale;

const el = {
  columnLeft: document.querySelector('.column-left'),
  columnRight: document.querySelector('.column-right'),
  shadowLeftCaster: document.querySelector('.shadow-left-caster'),
  shadowCircle: document.querySelector('.shadow-circle'),
  shadowRight: document.querySelector('.shadow-right'),
  centerElement: document.querySelector('.center-element'),
  centerBase: document.querySelector('.center-base'),
  centerBlobs: document.querySelector('.center-blobs'),
  blobs: document.querySelectorAll('.blob'),
  centerIllus: document.querySelector('.center-illus'),
  centerLabel: document.querySelector('.center-label')
};

const getPanelOffset = () => el.columnLeft.offsetWidth * config.panelOffset;

let blobRotations = [];

const blobRotationConfig = [
  { duration: 20000, direction: 1 },
  { duration: 25000, direction: -1 },
  { duration: 30000, direction: 1 }
];

function startBlobRotations() {
  blobRotations = [...el.blobs].map((blob, i) => 
    anime({
      targets: blob,
      rotate: [0, 360 * blobRotationConfig[i].direction],
      duration: blobRotationConfig[i].duration,
      easing: 'linear',
      loop: true
    })
  );
}

function stopBlobRotations() {
  blobRotations.forEach(anim => anim.pause());
  blobRotations = [];
}

const animations = {
  [State.LOCKED]: () => {
    const offset = getPanelOffset();
    stopBlobRotations();
    const exitDuration = t(config.duration * 0.5);
    const panelDelay = exitDuration * 0.6;
    
    anime.set(el.centerElement, { opacity: 1 });
    
    return [
      anime({
        targets: [el.centerIllus, el.centerLabel],
        translateY: [0, 8],
        opacity: [1, 0],
        duration: exitDuration * 0.5,
        delay: (_, i) => t(i * 30),
        easing: 'easeInQuad'
      }),
      anime({
        targets: el.centerBlobs,
        scale: [1, 0.3],
        opacity: [1, 0],
        duration: exitDuration,
        delay: exitDuration * 0.3,
        easing: 'easeInQuad'
      }),
      anime({
        targets: [el.centerBase, el.shadowCircle],
        scale: [1, 0.5],
        duration: exitDuration,
        delay: exitDuration * 0.4,
        easing: 'easeInQuad'
      }),
      anime({
        targets: [el.columnLeft, el.shadowLeftCaster, el.centerElement],
        translateX: -offset,
        duration: t(config.duration),
        delay: panelDelay,
        easing: config.easing
      }),
      anime({
        targets: [el.columnRight, el.shadowRight],
        translateX: offset,
        duration: t(config.duration),
        delay: panelDelay,
        easing: config.easing
      })
    ];
  },
  [State.UNLOCKED]: () => {
    startBlobRotations();
    const baseDuration = t(config.duration * 1.2);
    const blobDelay = t(100);
    const contentDelay = baseDuration * 0.7;
    
    anime.set(el.centerElement, { opacity: 1 });
    anime.set(el.centerBase, { opacity: 1 });
    
    return [
      anime({
        targets: [el.columnLeft, el.shadowLeftCaster, el.centerElement],
        keyframes: [
          { translateX: 0, duration: t(config.duration * 0.6), easing: 'easeInQuad' },
          { translateX: -config.collisionBounce, duration: t(config.duration * 0.2), easing: 'easeOutQuad' },
          { translateX: 0, duration: t(config.duration * 0.2), easing: 'easeInOutQuad' }
        ]
      }),
      anime({
        targets: [el.columnRight, el.shadowRight],
        keyframes: [
          { translateX: 0, duration: t(config.duration * 0.6), easing: 'easeInQuad' },
          { translateX: config.collisionBounce, duration: t(config.duration * 0.2), easing: 'easeOutQuad' },
          { translateX: 0, duration: t(config.duration * 0.2), easing: 'easeInOutQuad' }
        ]
      }),
      anime({
        targets: [el.centerBase, el.shadowCircle],
        scale: [0.4, 1],
        duration: baseDuration,
        easing: 'easeOutBack'
      }),
      anime({
        targets: el.centerBlobs,
        scale: [0.2, 1],
        opacity: [0, 1],
        duration: baseDuration * 1.1,
        delay: blobDelay,
        easing: 'easeOutBack'
      }),
      anime({
        targets: [el.centerIllus, el.centerLabel],
        translateY: [16, 0],
        opacity: [0, 1],
        duration: t(config.duration * 0.6),
        delay: (_, i) => contentDelay + t(i * 60),
        easing: 'easeOutCubic'
      })
    ];
  }
};

function createStateMachine(initialState) {
  let currentState = initialState;
  let isTransitioning = false;

  async function transition(targetState) {
    if (isTransitioning || currentState === targetState) return;
    
    isTransitioning = true;
    const animationSet = animations[targetState]?.() ?? [];
    
    await Promise.all(animationSet.map(anim => anim.finished));
    
    currentState = targetState;
    isTransitioning = false;
    
    document.dispatchEvent(new CustomEvent('statechange', { 
      detail: { state: currentState } 
    }));
  }

  const toggle = () => transition(currentState === State.LOCKED ? State.UNLOCKED : State.LOCKED);
  const getState = () => currentState;

  return { transition, toggle, getState, State };
}

const stateMachine = createStateMachine(State.LOCKED);

function setInitialOpenState() {
  const offset = getPanelOffset();
  anime.set([el.columnLeft, el.shadowLeftCaster, el.centerElement], { translateX: -offset });
  anime.set([el.columnRight, el.shadowRight], { translateX: offset });
  anime.set([el.centerBlobs, el.centerIllus, el.centerLabel], { opacity: 0 });
  anime.set([el.centerBase, el.shadowCircle], { scale: 0.5 });
}

setInitialOpenState();

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
  config.timeScale = parseFloat(e.target.value);
  timeScaleValue.textContent = `${config.timeScale}x`;
});

window.stateMachine = stateMachine;
window.animConfig = config;
