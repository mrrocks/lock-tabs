import anime from 'animejs';

const State = {
  LOCKED: 'locked',
  UNLOCKED: 'unlocked'
};

const config = {
  duration: 800,
  easing: 'easeOutCubic',
  collisionBounce: 10
};

const elements = {
  background: document.querySelector('.asset-background'),
  columnLeft: document.querySelector('.column-left'),
  columnRight: document.querySelector('.column-right'),
  shadowLeft: document.querySelector('.shadow-left'),
  shadowRight: document.querySelector('.shadow-right')
};

const stateStyles = {
  [State.LOCKED]: {},
  [State.UNLOCKED]: {}
};

const getColumnWidth = () => elements.columnLeft.offsetWidth;

const animations = {
  [State.LOCKED]: () => {
    const offset = getColumnWidth();
    return [
      anime({
        targets: [elements.columnLeft, elements.shadowLeft],
        translateX: -offset,
        duration: config.duration,
        easing: config.easing
      }),
      anime({
        targets: [elements.columnRight, elements.shadowRight],
        translateX: offset,
        duration: config.duration,
        easing: config.easing
      })
    ];
  },
  [State.UNLOCKED]: () => [
    anime({
      targets: [elements.columnLeft, elements.shadowLeft],
      keyframes: [
        { translateX: 0, duration: config.duration * 0.6, easing: 'easeInQuad' },
        { translateX: -config.collisionBounce, duration: config.duration * 0.2, easing: 'easeOutQuad' },
        { translateX: 0, duration: config.duration * 0.2, easing: 'easeInOutQuad' }
      ]
    }),
    anime({
      targets: [elements.columnRight, elements.shadowRight],
      keyframes: [
        { translateX: 0, duration: config.duration * 0.6, easing: 'easeInQuad' },
        { translateX: config.collisionBounce, duration: config.duration * 0.2, easing: 'easeOutQuad' },
        { translateX: 0, duration: config.duration * 0.2, easing: 'easeInOutQuad' }
      ]
    })
  ]
};

function createStateMachine(initialState) {
  let currentState = initialState;
  let isTransitioning = false;

  function applyStaticStyles(state) {
    const styles = stateStyles[state];
    Object.entries(styles).forEach(([elementKey, props]) => {
      const el = elements[elementKey];
      if (el) Object.assign(el.style, props);
    });
  }

  async function transition(targetState) {
    if (isTransitioning || currentState === targetState) return;
    
    isTransitioning = true;
    const animationSet = animations[targetState]?.() || [];
    
    await Promise.all(animationSet.map(anim => anim.finished));
    
    applyStaticStyles(targetState);
    currentState = targetState;
    isTransitioning = false;
    
    document.dispatchEvent(new CustomEvent('statechange', { 
      detail: { state: currentState } 
    }));
  }

  function toggle() {
    const next = currentState === State.LOCKED ? State.UNLOCKED : State.LOCKED;
    return transition(next);
  }

  function getState() {
    return currentState;
  }

  applyStaticStyles(initialState);

  return { transition, toggle, getState, State };
}

const stateMachine = createStateMachine(State.UNLOCKED);

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    stateMachine.toggle();
  }
});

document.getElementById('toggle-btn').addEventListener('click', () => {
  stateMachine.toggle();
});

document.addEventListener('statechange', (e) => {
  console.log('State changed to:', e.detail.state);
});

window.stateMachine = stateMachine;
