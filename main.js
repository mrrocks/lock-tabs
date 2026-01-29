import anime from 'animejs';

// ============================================================================
// SECTION 1: STATES
// ============================================================================

const State = {
  LOCKED: 'locked',
  UNLOCKED: 'unlocked'
};

// ============================================================================
// SECTION 2: CONFIGURATION
// ============================================================================

const CONFIG = {
  baseDuration: 600,
  defaultEasing: 'easeOutCubic',
  collisionBounce: 10,
  timeScale: 1,
  panelOffsetMultiplier: 1.08
};

const EASING = {
  easeOutCubic: 'easeOutCubic',
  easeInQuad: 'easeInQuad',
  easeOutQuad: 'easeOutQuad',
  easeInOutQuad: 'easeInOutQuad',
  easeOutBack: 'easeOutBack',
  linear: 'linear'
};

// ============================================================================
// SECTION 3: ELEMENT MAP
// ============================================================================

const ELEMENTS = {
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

const getPanelOffset = () => ELEMENTS.columnLeft.offsetWidth * CONFIG.panelOffsetMultiplier;

// ============================================================================
// SECTION 4: ANIMATION SPECIFICATIONS
// ============================================================================

const TRANSITION_TO_LOCKED = {
  phase1_fadeOutContent: {
    targets: [ELEMENTS.centerIllus, ELEMENTS.centerLabel],
    properties: {
      translateY: { from: 0, to: 8 },
      opacity: { from: 1, to: 0 }
    },
    duration: 150,
    stagger: 30,
    easing: EASING.easeInQuad
  },

  phase2_shrinkBlobs: {
    targets: [ELEMENTS.centerBlobs],
    properties: {
      scale: { from: 1, to: 0.3 },
      opacity: { from: 1, to: 0 }
    },
    duration: 300,
    delay: 90,
    easing: EASING.easeInQuad
  },

  phase3_shrinkCenterBase: {
    targets: [ELEMENTS.centerBase, ELEMENTS.shadowCircle],
    properties: {
      scale: { from: 1, to: 0.3 }
    },
    duration: 600,
    delay: 180,
    easing: EASING.easeInQuad
  },

  phase4_slideLeftPanel: {
    targets: [ELEMENTS.columnLeft, ELEMENTS.shadowLeftCaster, ELEMENTS.centerElement],
    properties: {
      translateX: { from: 0, to: '-panelOffset' }
    },
    duration: 600,
    delay: 180,
    easing: EASING.easeOutCubic
  },

  phase5_slideRightPanel: {
    targets: [ELEMENTS.columnRight, ELEMENTS.shadowRight],
    properties: {
      translateX: { from: 0, to: '+panelOffset' }
    },
    duration: 600,
    delay: 180,
    easing: EASING.easeOutCubic
  }
};

const TRANSITION_TO_UNLOCKED = {
  phase1_slideLeftPanelWithBounce: {
    targets: [ELEMENTS.columnLeft, ELEMENTS.shadowLeftCaster, ELEMENTS.centerElement],
    keyframes: [
      { translateX: 0, duration: 360, easing: EASING.easeInQuad },
      { translateX: -10, duration: 120, easing: EASING.easeOutQuad },
      { translateX: 0, duration: 120, easing: EASING.easeInOutQuad }
    ],
    totalDuration: 600
  },

  phase2_slideRightPanelWithBounce: {
    targets: [ELEMENTS.columnRight, ELEMENTS.shadowRight],
    keyframes: [
      { translateX: 0, duration: 360, easing: EASING.easeInQuad },
      { translateX: 10, duration: 120, easing: EASING.easeOutQuad },
      { translateX: 0, duration: 120, easing: EASING.easeInOutQuad }
    ],
    totalDuration: 600
  },

  phase3_expandCenterBase: {
    targets: [ELEMENTS.centerBase, ELEMENTS.shadowCircle],
    properties: {
      scale: { from: 0.3, to: 1 }
    },
    duration: 720,
    delay: 0,
    easing: EASING.easeOutBack
  },

  phase4_expandBlobs: {
    targets: [ELEMENTS.centerBlobs],
    properties: {
      scale: { from: 0.2, to: 1 },
      opacity: { from: 0, to: 1 }
    },
    duration: 792,
    delay: 100,
    easing: EASING.easeOutBack
  },

  phase5_revealContent: {
    targets: [ELEMENTS.centerIllus, ELEMENTS.centerLabel],
    properties: {
      translateY: { from: 16, to: 0 },
      opacity: { from: 0, to: 1 }
    },
    duration: 360,
    delay: 504,
    stagger: 60,
    easing: EASING.easeOutCubic
  }
};

// ============================================================================
// SECTION 5: CONTINUOUS ANIMATIONS (Blob Rotations)
// ============================================================================

const BLOB_ROTATIONS = {
  blob1: { duration: 20000, direction: 'clockwise', degrees: 360 },
  blob2: { duration: 25000, direction: 'counterClockwise', degrees: -360 },
  blob3: { duration: 30000, direction: 'clockwise', degrees: 360 }
};

let activeBlobAnimations = [];

function startBlobRotations() {
  const blobs = [ELEMENTS.blob1, ELEMENTS.blob2, ELEMENTS.blob3];
  const configs = [BLOB_ROTATIONS.blob1, BLOB_ROTATIONS.blob2, BLOB_ROTATIONS.blob3];

  activeBlobAnimations = blobs.map((blob, i) =>
    anime({
      targets: blob,
      rotate: [0, configs[i].degrees],
      duration: configs[i].duration,
      easing: EASING.linear,
      loop: true
    })
  );
}

function stopBlobRotations() {
  activeBlobAnimations.forEach(anim => anim.pause());
  activeBlobAnimations = [];
}

// ============================================================================
// SECTION 6: ANIMATION EXECUTORS
// ============================================================================

const applyTimeScale = (ms) => ms * CONFIG.timeScale;

function executeTransitionToLocked() {
  const panelOffset = getPanelOffset();
  stopBlobRotations();

  anime.set(ELEMENTS.centerElement, { opacity: 1 });

  const spec = TRANSITION_TO_LOCKED;

  return [
    anime({
      targets: spec.phase1_fadeOutContent.targets,
      translateY: [
        spec.phase1_fadeOutContent.properties.translateY.from,
        spec.phase1_fadeOutContent.properties.translateY.to
      ],
      opacity: [
        spec.phase1_fadeOutContent.properties.opacity.from,
        spec.phase1_fadeOutContent.properties.opacity.to
      ],
      duration: applyTimeScale(spec.phase1_fadeOutContent.duration),
      delay: (_, i) => applyTimeScale(i * spec.phase1_fadeOutContent.stagger),
      easing: spec.phase1_fadeOutContent.easing
    }),

    anime({
      targets: spec.phase2_shrinkBlobs.targets,
      scale: [
        spec.phase2_shrinkBlobs.properties.scale.from,
        spec.phase2_shrinkBlobs.properties.scale.to
      ],
      opacity: [
        spec.phase2_shrinkBlobs.properties.opacity.from,
        spec.phase2_shrinkBlobs.properties.opacity.to
      ],
      duration: applyTimeScale(spec.phase2_shrinkBlobs.duration),
      delay: applyTimeScale(spec.phase2_shrinkBlobs.delay),
      easing: spec.phase2_shrinkBlobs.easing
    }),

    anime({
      targets: spec.phase3_shrinkCenterBase.targets,
      scale: [
        spec.phase3_shrinkCenterBase.properties.scale.from,
        spec.phase3_shrinkCenterBase.properties.scale.to
      ],
      duration: applyTimeScale(spec.phase3_shrinkCenterBase.duration),
      delay: applyTimeScale(spec.phase3_shrinkCenterBase.delay),
      easing: spec.phase3_shrinkCenterBase.easing
    }),

    anime({
      targets: spec.phase4_slideLeftPanel.targets,
      translateX: -panelOffset,
      duration: applyTimeScale(spec.phase4_slideLeftPanel.duration),
      delay: applyTimeScale(spec.phase4_slideLeftPanel.delay),
      easing: spec.phase4_slideLeftPanel.easing
    }),

    anime({
      targets: spec.phase5_slideRightPanel.targets,
      translateX: panelOffset,
      duration: applyTimeScale(spec.phase5_slideRightPanel.duration),
      delay: applyTimeScale(spec.phase5_slideRightPanel.delay),
      easing: spec.phase5_slideRightPanel.easing
    })
  ];
}

function executeTransitionToUnlocked() {
  startBlobRotations();

  anime.set(ELEMENTS.centerElement, { opacity: 1 });
  anime.set(ELEMENTS.centerBase, { opacity: 1 });

  const spec = TRANSITION_TO_UNLOCKED;
  const bounce = CONFIG.collisionBounce;

  return [
    anime({
      targets: spec.phase1_slideLeftPanelWithBounce.targets,
      keyframes: [
        { translateX: 0, duration: applyTimeScale(360), easing: EASING.easeInQuad },
        { translateX: -bounce, duration: applyTimeScale(120), easing: EASING.easeOutQuad },
        { translateX: 0, duration: applyTimeScale(120), easing: EASING.easeInOutQuad }
      ]
    }),

    anime({
      targets: spec.phase2_slideRightPanelWithBounce.targets,
      keyframes: [
        { translateX: 0, duration: applyTimeScale(360), easing: EASING.easeInQuad },
        { translateX: bounce, duration: applyTimeScale(120), easing: EASING.easeOutQuad },
        { translateX: 0, duration: applyTimeScale(120), easing: EASING.easeInOutQuad }
      ]
    }),

    anime({
      targets: spec.phase3_expandCenterBase.targets,
      scale: [
        spec.phase3_expandCenterBase.properties.scale.from,
        spec.phase3_expandCenterBase.properties.scale.to
      ],
      duration: applyTimeScale(spec.phase3_expandCenterBase.duration),
      easing: spec.phase3_expandCenterBase.easing
    }),

    anime({
      targets: spec.phase4_expandBlobs.targets,
      scale: [
        spec.phase4_expandBlobs.properties.scale.from,
        spec.phase4_expandBlobs.properties.scale.to
      ],
      opacity: [
        spec.phase4_expandBlobs.properties.opacity.from,
        spec.phase4_expandBlobs.properties.opacity.to
      ],
      duration: applyTimeScale(spec.phase4_expandBlobs.duration),
      delay: applyTimeScale(spec.phase4_expandBlobs.delay),
      easing: spec.phase4_expandBlobs.easing
    }),

    anime({
      targets: spec.phase5_revealContent.targets,
      translateY: [
        spec.phase5_revealContent.properties.translateY.from,
        spec.phase5_revealContent.properties.translateY.to
      ],
      opacity: [
        spec.phase5_revealContent.properties.opacity.from,
        spec.phase5_revealContent.properties.opacity.to
      ],
      duration: applyTimeScale(spec.phase5_revealContent.duration),
      delay: (_, i) => applyTimeScale(spec.phase5_revealContent.delay + i * spec.phase5_revealContent.stagger),
      easing: spec.phase5_revealContent.easing
    })
  ];
}

// ============================================================================
// SECTION 7: STATE MACHINE
// ============================================================================

function createStateMachine(initialState) {
  let currentState = initialState;
  let isTransitioning = false;

  const executors = {
    [State.LOCKED]: executeTransitionToLocked,
    [State.UNLOCKED]: executeTransitionToUnlocked
  };

  async function transition(targetState) {
    if (isTransitioning || currentState === targetState) return;

    isTransitioning = true;
    const animations = executors[targetState]?.() ?? [];

    await Promise.all(animations.map(anim => anim.finished));

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

// ============================================================================
// SECTION 8: INITIAL STATE SETUP
// ============================================================================

const INITIAL_STATE_LOCKED = {
  leftPanelGroup: { translateX: '-panelOffset' },
  rightPanelGroup: { translateX: '+panelOffset' },
  centerBlobs: { opacity: 0 },
  centerIllus: { opacity: 0 },
  centerLabel: { opacity: 0 },
  centerBase: { scale: 0.3 },
  shadowCircle: { scale: 0.3 }
};

function setInitialLockedState() {
  const panelOffset = getPanelOffset();

  anime.set([ELEMENTS.columnLeft, ELEMENTS.shadowLeftCaster, ELEMENTS.centerElement], {
    translateX: -panelOffset
  });

  anime.set([ELEMENTS.columnRight, ELEMENTS.shadowRight], {
    translateX: panelOffset
  });

  anime.set([ELEMENTS.centerBlobs, ELEMENTS.centerIllus, ELEMENTS.centerLabel], {
    opacity: 0
  });

  anime.set([ELEMENTS.centerBase, ELEMENTS.shadowCircle], {
    scale: 0.3
  });
}

// ============================================================================
// SECTION 9: INITIALIZATION & EVENT HANDLERS
// ============================================================================

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
