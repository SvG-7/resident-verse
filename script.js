/* ==========================================================================
   RESIDENT-VERSE : SPIDER-MAN MULTIVERSE MOVIE TITLE ENGINE
   Features: Overlapping Web-Pull Transitions, Hobbies Scene, 3D Parallax,
   Multi-Layer Cards, Production Google Sheets Submission System.
   ========================================================================== */

// ===== PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE =====
const RESPONSE_ENDPOINT = "PASTE_GOOGLE_APPS_SCRIPT_URL_HERE";

// ===== STATE MANAGEMENT (NO ROOM NUMBER!) =====
const residentProfile = {
  name: "",
  preferredName: "",
  hometown: "",
  major: "",
  year: "",
  classThought: "",
  organizations: "",
  hobbies: [],
  interests: [],
  otherHobby: "",
  eventPreferences: [],
  eventSuggestion: "",
  additionalMessage: ""
};

// Scene Progress Checkpoints (10 Total Scenes: 0 to 9)
const PROGRESS_MAP = {
  0: 0,   // Intro Landing
  1: 15,  // Identity
  2: 30,  // Academics
  3: 45,  // Campus Alliances
  4: 60,  // Hobbies & Side Quests
  5: 75,  // Select Your Powers
  6: 90,  // Community Missions
  7: 95,  // Final Message
  8: 98,  // Verifying
  9: 100  // Final Reveal
};

// Transition Variation Counter
let transitionStyleIndex = 0;
let currentSceneIndex = 0;
let isTransitioning = false;
let submissionInProgress = false;

// ===== DOM REFERENCES =====
const DOM = {
  canvas: document.getElementById('bg-canvas'),
  topBar: document.getElementById('top-bar'),
  progressContainer: document.getElementById('progress-container'),
  progressPercent: document.getElementById('progress-percent'),
  progressFill: document.getElementById('progress-fill'),
  fxLayer: document.getElementById('fx-layer'),
  impactFlash: document.getElementById('impact-flash'),
  webOverlay: document.getElementById('web-transition-overlay'),
  
  // Scenes
  scenes: document.querySelectorAll('.scene'),
  
  // Intro Elements
  introLine1: document.querySelector('.line-1'),
  introLine2: document.querySelector('.line-2'),
  introLine3: document.querySelector('.line-3'),
  introHeroCard: document.getElementById('intro-hero-card'),
  btnStart: document.getElementById('btn-start'),
  
  // Identity Inputs (NO ROOM NUMBER!)
  inputName: document.getElementById('input-name'),
  inputPrefName: document.getElementById('input-prefname'),
  inputHometown: document.getElementById('input-hometown'),
  errName: document.getElementById('err-name'),
  errHometown: document.getElementById('err-hometown'),
  
  // Academic Inputs
  inputMajor: document.getElementById('input-major'),
  gridYear: document.getElementById('grid-year'),
  inputClassThought: document.getElementById('input-class-thought'),
  errMajor: document.getElementById('err-major'),
  errYear: document.getElementById('err-year'),
  
  // Campus Inputs
  inputOrgs: document.getElementById('input-orgs'),
  netNodes: document.querySelectorAll('.net-node'),

  // Hobbies Inputs
  gridHobbies: document.getElementById('grid-hobbies'),
  
  // Powers Inputs
  gridInterests: document.getElementById('grid-interests'),
  powerCountText: document.getElementById('power-count-text'),
  inputOtherHobby: document.getElementById('input-other-hobby'),
  
  // Events Inputs
  gridEvents: document.getElementById('grid-events'),
  inputEventSuggestion: document.getElementById('input-event-suggestion'),
  
  // Message Inputs & Controls
  inputMessage: document.getElementById('input-message'),
  btnSkipMessage: document.getElementById('btn-skip-message'),
  btnFinish: document.getElementById('btn-finish'),
  
  // Final Ending & Summary
  finalResidentName: document.getElementById('final-resident-name'),
  sumMajor: document.getElementById('sum-major'),
  sumYear: document.getElementById('sum-year'),
  sumPowers: document.getElementById('sum-powers'),
  btnRestart: document.getElementById('btn-restart'),
  
  // Error Modal
  errorModal: document.getElementById('dimensional-error-modal'),
  btnRetrySubmit: document.getElementById('btn-retry-submit')
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  initCanvasBackground();
  restoreAnswersFromSession();
  setupEventListeners();
  setup3DParallax();
  playIntroCinematicSequence();
});

// ===== INTRO MOVIE OPENING CINEMATIC SEQUENCE =====
function playIntroCinematicSequence() {
  setTimeout(() => DOM.introLine1 && DOM.introLine1.classList.remove('hidden-step'), 150);
  setTimeout(() => DOM.introLine2 && DOM.introLine2.classList.remove('hidden-step'), 550);
  setTimeout(() => DOM.introLine3 && DOM.introLine3.classList.remove('hidden-step'), 950);
  setTimeout(() => {
    if (DOM.introHeroCard) DOM.introHeroCard.classList.remove('hidden-step');
    triggerScreenShake();
  }, 1350);
}

// ===== DESKTOP 3D MOUSE PARALLAX =====
function setup3DParallax() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return; // Disable on touch devices

  const layers = document.querySelectorAll('.parallax-layer');
  window.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    layers.forEach(layer => {
      const depth = parseFloat(layer.getAttribute('data-depth')) || 0.2;
      const moveX = dx * depth * 24;
      const moveY = dy * depth * 24;
      layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
  });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Intro Start Button
  DOM.btnStart.addEventListener('click', (e) => {
    animateButtonPress(DOM.btnStart);
    triggerSoundEffect('WHAM!', window.innerWidth / 2 - 60, window.innerHeight / 2);
    transitionToScene(1);
  });

  // Global Navigation Buttons (Next / Back)
  document.querySelectorAll('.btn-comic[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      animateButtonPress(btn);
      const action = btn.getAttribute('data-action');
      if (action === 'next') handleNextScene(e);
      if (action === 'back') handleBackScene();
    });
  });

  // Academic Year Radio Cards
  DOM.gridYear.querySelectorAll('.tile-radio').forEach(tile => {
    tile.addEventListener('click', () => {
      DOM.gridYear.querySelectorAll('.tile-radio').forEach(t => t.classList.remove('selected'));
      tile.classList.add('selected');
      residentProfile.year = tile.getAttribute('data-value');
      DOM.errYear.classList.add('hidden-error');
      triggerSoundEffect('LOCKED IN!', tile.getBoundingClientRect().left, tile.getBoundingClientRect().top);
      saveAnswersToSession();
    });
  });

  // Hobbies Multi-Select Cards
  if (DOM.gridHobbies) {
    DOM.gridHobbies.querySelectorAll('.hobby-chip').forEach(tile => {
      tile.addEventListener('click', () => {
        tile.classList.toggle('selected');
        const val = tile.getAttribute('data-value');
        if (tile.classList.contains('selected')) {
          if (!residentProfile.hobbies.includes(val)) residentProfile.hobbies.push(val);
          triggerSoundEffect('QUEST UNLOCKED!', tile.getBoundingClientRect().left, tile.getBoundingClientRect().top);
        } else {
          residentProfile.hobbies = residentProfile.hobbies.filter(item => item !== val);
        }
        saveAnswersToSession();
      });
    });
  }

  // Interest Multi-Select Cards
  DOM.gridInterests.querySelectorAll('.tile-checkbox').forEach(tile => {
    tile.addEventListener('click', () => {
      tile.classList.toggle('selected');
      const val = tile.getAttribute('data-value');
      if (tile.classList.contains('selected')) {
        if (!residentProfile.interests.includes(val)) residentProfile.interests.push(val);
        triggerSoundEffect('POWER ADDED!', tile.getBoundingClientRect().left, tile.getBoundingClientRect().top);
      } else {
        residentProfile.interests = residentProfile.interests.filter(item => item !== val);
      }
      updatePowerCounter();
      saveAnswersToSession();
    });
  });

  // Floor Events Multi-Select Cards
  DOM.gridEvents.querySelectorAll('.mission-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      tile.classList.toggle('selected');
      const val = tile.getAttribute('data-value');
      if (tile.classList.contains('selected')) {
        if (!residentProfile.eventPreferences.includes(val)) residentProfile.eventPreferences.push(val);
        triggerSoundEffect('ACCEPTED!', tile.getBoundingClientRect().left, tile.getBoundingClientRect().top);
      } else {
        residentProfile.eventPreferences = residentProfile.eventPreferences.filter(item => item !== val);
      }
      saveAnswersToSession();
    });
  });

  // Campus Orgs Interactive SVG Nodes
  DOM.inputOrgs.addEventListener('input', (e) => {
    const len = e.target.value.length;
    DOM.netNodes.forEach((node, i) => {
      if (len > i * 4) {
        node.style.fill = 'var(--cyan-accent)';
        node.setAttribute('r', '16');
      } else {
        node.style.fill = 'var(--purple-accent)';
        node.setAttribute('r', '10');
      }
    });
  });

  // Skip Optional Message Button
  DOM.btnSkipMessage.addEventListener('click', () => {
    animateButtonPress(DOM.btnSkipMessage);
    DOM.inputMessage.value = "";
    residentProfile.additionalMessage = "";
    triggerFinishMission();
  });

  // Finish Mission Button
  DOM.btnFinish.addEventListener('click', () => {
    animateButtonPress(DOM.btnFinish);
    triggerFinishMission();
  });

  // Retry Submission Button inside Error Modal
  DOM.btnRetrySubmit.addEventListener('click', () => {
    DOM.errorModal.classList.add('hidden-modal');
    triggerFinishMission();
  });

  // Restart / Edit Profile Button
  DOM.btnRestart.addEventListener('click', () => {
    transitionToScene(1);
  });

  // Keyboard Enter key support
  document.querySelectorAll('.comic-input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNextScene(e);
      }
    });
  });

  // Input change state sync
  DOM.inputName.addEventListener('input', saveAnswersToSession);
  DOM.inputPrefName.addEventListener('input', saveAnswersToSession);
  DOM.inputHometown.addEventListener('input', saveAnswersToSession);
  DOM.inputMajor.addEventListener('input', saveAnswersToSession);
  DOM.inputClassThought.addEventListener('input', saveAnswersToSession);
  DOM.inputOrgs.addEventListener('input', saveAnswersToSession);
  DOM.inputOtherHobby.addEventListener('input', saveAnswersToSession);
  DOM.inputEventSuggestion.addEventListener('input', saveAnswersToSession);
  DOM.inputMessage.addEventListener('input', saveAnswersToSession);
}

// ===== BUTTON COMPRESSION MICROINTERACTION =====
function animateButtonPress(btn) {
  if (!btn) return;
  btn.style.transform = 'scale(0.95)';
  setTimeout(() => { btn.style.transform = ''; }, 150);
}

// ===== SCENE NAVIGATION CONTROLLER =====
function handleNextScene(e) {
  if (isTransitioning) return;
  
  if (validateScene(currentSceneIndex)) {
    collectCurrentSceneAnswers();
    if (currentSceneIndex < 7) {
      transitionToScene(currentSceneIndex + 1);
    }
  }
}

function handleBackScene() {
  if (isTransitioning || currentSceneIndex <= 1) return;
  collectCurrentSceneAnswers();
  transitionToScene(currentSceneIndex - 1, true);
}

// ===== 4 OVERLAPPING TRANSITION ENGINE =====
function transitionToScene(targetSceneIndex, isBack = false) {
  isTransitioning = true;
  triggerImpactFlash();
  
  const currentScene = document.querySelector(`[data-scene-index="${currentSceneIndex}"]`);
  const targetScene = document.querySelector(`[data-scene-index="${targetSceneIndex}"]`);

  const styles = ['web-wipe', 'panel-slam', 'portal-expand', 'web-swing'];
  const currentStyle = styles[transitionStyleIndex % styles.length];
  transitionStyleIndex++;

  if (currentStyle === 'web-wipe') {
    playWebTransition();
  } else {
    triggerScreenShake();
  }

  setTimeout(() => {
    if (currentScene) {
      if (currentStyle === 'web-swing') {
        currentScene.classList.add('scene-transition-swing-exit');
      } else {
        currentScene.classList.add('scene-exit');
      }
    }
  }, 120);

  setTimeout(() => {
    DOM.scenes.forEach(s => {
      if (s !== currentScene && s !== targetScene) {
        s.classList.remove('active-scene', 'scene-exit', 'scene-enter', 'scene-transition-slam', 'scene-transition-portal', 'scene-transition-swing-exit', 'scene-transition-swing-enter');
      }
    });
    
    if (targetScene) {
      targetScene.classList.add('active-scene');
      if (currentStyle === 'web-swing') {
        targetScene.classList.add('scene-transition-swing-enter');
      } else if (currentStyle === 'panel-slam') {
        targetScene.classList.add('scene-transition-slam');
      } else if (currentStyle === 'portal-expand') {
        targetScene.classList.add('scene-transition-portal');
      } else {
        targetScene.classList.add('scene-enter');
      }
      currentSceneIndex = targetSceneIndex;
    }

    if (targetSceneIndex > 0 && targetSceneIndex < 8) {
      DOM.progressContainer.classList.remove('hidden');
      updateProgress(PROGRESS_MAP[targetSceneIndex]);
    } else if (targetSceneIndex === 9) {
      DOM.progressContainer.classList.remove('hidden');
      updateProgress(100);
    } else {
      DOM.progressContainer.classList.add('hidden');
    }
  }, 350);

  setTimeout(() => {
    DOM.webOverlay.classList.remove('web-wipe-active');
    if (currentScene) {
      currentScene.classList.remove('active-scene', 'scene-exit', 'scene-transition-swing-exit');
    }
    isTransitioning = false;
  }, 750);
}

function playWebTransition() {
  DOM.webOverlay.classList.add('web-wipe-active');
}

// ===== VALIDATION =====
function validateScene(sceneIndex) {
  let isValid = true;
  
  if (sceneIndex === 1) {
    if (!DOM.inputName.value.trim()) {
      DOM.errName.classList.remove('hidden-error');
      DOM.inputName.focus();
      isValid = false;
    } else {
      DOM.errName.classList.add('hidden-error');
    }

    if (!DOM.inputHometown.value.trim()) {
      DOM.errHometown.classList.remove('hidden-error');
      if (isValid) DOM.inputHometown.focus();
      isValid = false;
    } else {
      DOM.errHometown.classList.add('hidden-error');
    }
  }

  if (sceneIndex === 2) {
    if (!DOM.inputMajor.value.trim()) {
      DOM.errMajor.classList.remove('hidden-error');
      DOM.inputMajor.focus();
      isValid = false;
    } else {
      DOM.errMajor.classList.add('hidden-error');
    }

    if (!residentProfile.year) {
      DOM.errYear.classList.remove('hidden-error');
      isValid = false;
    } else {
      DOM.errYear.classList.add('hidden-error');
    }
  }

  if (!isValid) triggerScreenShake();
  return isValid;
}

// ===== ANSWER COLLECTION & STORAGE =====
function collectCurrentSceneAnswers() {
  residentProfile.name = DOM.inputName.value.trim();
  residentProfile.preferredName = DOM.inputPrefName.value.trim();
  residentProfile.hometown = DOM.inputHometown.value.trim();
  residentProfile.major = DOM.inputMajor.value.trim();
  residentProfile.classThought = DOM.inputClassThought.value.trim();
  residentProfile.organizations = DOM.inputOrgs.value.trim();
  residentProfile.otherHobby = DOM.inputOtherHobby.value.trim();
  residentProfile.eventSuggestion = DOM.inputEventSuggestion.value.trim();
  residentProfile.additionalMessage = DOM.inputMessage.value.trim();
  
  saveAnswersToSession();
}

function updatePowerCounter() {
  const count = residentProfile.interests.length;
  DOM.powerCountText.textContent = `${count} POWER${count === 1 ? '' : 'S'} SELECTED`;
}

function updateProgress(percent) {
  DOM.progressPercent.textContent = `${percent}%`;
  DOM.progressFill.style.width = `${percent}%`;
}

// ===== FINISH MISSION & PRODUCTION GOOGLE SHEETS SUBMISSION =====
function triggerFinishMission() {
  if (submissionInProgress) return;
  submissionInProgress = true;
  
  if (DOM.btnFinish) {
    DOM.btnFinish.disabled = true;
    DOM.btnFinish.querySelector('.btn-text').textContent = "TRANSMITTING...";
  }

  collectCurrentSceneAnswers();
  transitionToScene(8); // Verifying scene
  
  submitResidentProfile(residentProfile);
}

function submitResidentProfile(profile) {
  const payload = {
    ...profile,
    timestamp: new Date().toISOString()
  };

  console.log("FINAL FORM DATA", payload);
  console.log("GOOGLE SCRIPT URL", RESPONSE_ENDPOINT);
  console.log("SUBMISSION STARTED");

  const isEndpointConfigured = RESPONSE_ENDPOINT && 
    RESPONSE_ENDPOINT !== "PASTE_GOOGLE_APPS_SCRIPT_URL_HERE" &&
    RESPONSE_ENDPOINT.includes("script.google.com/macros/s/");

  if (!isEndpointConfigured) {
    console.error("❌ CRITICAL ERROR: Google Apps Script Web App URL is NOT configured or invalid!");
    console.error("Please replace RESPONSE_ENDPOINT in script.js with your Google Apps Script /exec URL.");
    
    setTimeout(() => {
      submissionInProgress = false;
      if (DOM.btnFinish) {
        DOM.btnFinish.disabled = false;
        DOM.btnFinish.querySelector('.btn-text').textContent = "FINISH MISSION";
      }
      runVerifyingLogSequence(false);
    }, 1200);
    return;
  }

  // Attempt POST request via fetch with text/plain (no-cors) to bypass preflight OPTIONS
  fetch(RESPONSE_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  })
  .then(() => {
    console.log("⚡ TRANSMISSION SENT TO GOOGLE APPS SCRIPT ENDPOINT SUCCESSFULLY!");
    runVerifyingLogSequence(true);
  })
  .catch(err => {
    console.error("❌ Submission transmission fetch error:", err);
    submissionInProgress = false;
    if (DOM.btnFinish) {
      DOM.btnFinish.disabled = false;
      DOM.btnFinish.querySelector('.btn-text').textContent = "FINISH MISSION";
    }
    runVerifyingLogSequence(false);
  });
}

function runVerifyingLogSequence(isSuccess) {
  const logLines = [
    { id: 'log-1', delay: 250 },
    { id: 'log-2', delay: 650 },
    { id: 'log-3', delay: 1050 },
    { id: 'log-4', delay: 1450 },
    { id: 'log-5', delay: 1850 },
    { id: 'log-6', delay: 2250 }
  ];

  logLines.forEach(item => {
    setTimeout(() => {
      const el = document.getElementById(item.id);
      if (el) {
        if (isSuccess) {
          el.classList.add('log-success');
        } else {
          el.classList.remove('log-success');
        }
      }
    }, item.delay);
  });

  setTimeout(() => {
    submissionInProgress = false;
    if (DOM.btnFinish) {
      DOM.btnFinish.disabled = false;
      DOM.btnFinish.querySelector('.btn-text').textContent = "FINISH MISSION";
    }

    if (isSuccess) {
      triggerImpactFlash();
      renderFinalEnding();
      transitionToScene(9); // Final reveal scene (Scene 9)
      sessionStorage.removeItem('residentProfileData'); // Clear session on success ONLY
    } else {
      DOM.errorModal.classList.remove('hidden-modal');
    }
  }, 2700);
}

function renderFinalEnding() {
  const displayName = residentProfile.preferredName || residentProfile.name.split(' ')[0] || 'HERO';
  DOM.finalResidentName.textContent = displayName.toUpperCase();
  DOM.sumMajor.textContent = residentProfile.major || 'UNDECIDED';
  DOM.sumYear.textContent = (residentProfile.year || 'HERO').toUpperCase();
  
  const totalLogged = (residentProfile.interests ? residentProfile.interests.length : 0) + 
                      (residentProfile.hobbies ? residentProfile.hobbies.length : 0);
  DOM.sumPowers.textContent = `${totalLogged} LOGGED`;
}

// ===== SESSION STORAGE REFRESH PROTECTION =====
function saveAnswersToSession() {
  try {
    sessionStorage.setItem('residentProfileData', JSON.stringify(residentProfile));
  } catch (e) {
    console.warn("Session storage unavailable.");
  }
}

function restoreAnswersFromSession() {
  try {
    const data = sessionStorage.getItem('residentProfileData');
    if (data) {
      const saved = JSON.parse(data);
      Object.assign(residentProfile, saved);
      
      DOM.inputName.value = residentProfile.name || '';
      DOM.inputPrefName.value = residentProfile.preferredName || '';
      DOM.inputHometown.value = residentProfile.hometown || '';
      DOM.inputMajor.value = residentProfile.major || '';
      DOM.inputClassThought.value = residentProfile.classThought || '';
      DOM.inputOrgs.value = residentProfile.organizations || '';
      DOM.inputOtherHobby.value = residentProfile.otherHobby || '';
      DOM.inputEventSuggestion.value = residentProfile.eventSuggestion || '';
      DOM.inputMessage.value = residentProfile.additionalMessage || '';

      if (residentProfile.year) {
        DOM.gridYear.querySelectorAll('.tile-radio').forEach(t => {
          if (t.getAttribute('data-value') === residentProfile.year) t.classList.add('selected');
        });
      }

      if (DOM.gridHobbies && Array.isArray(residentProfile.hobbies)) {
        DOM.gridHobbies.querySelectorAll('.hobby-chip').forEach(t => {
          if (residentProfile.hobbies.includes(t.getAttribute('data-value'))) t.classList.add('selected');
        });
      }

      if (Array.isArray(residentProfile.interests)) {
        DOM.gridInterests.querySelectorAll('.tile-checkbox').forEach(t => {
          if (residentProfile.interests.includes(t.getAttribute('data-value'))) t.classList.add('selected');
        });
        updatePowerCounter();
      }

      if (Array.isArray(residentProfile.eventPreferences)) {
        DOM.gridEvents.querySelectorAll('.mission-tile').forEach(t => {
          if (residentProfile.eventPreferences.includes(t.getAttribute('data-value'))) t.classList.add('selected');
        });
      }
    }
  } catch (e) {
    console.warn("Failed to restore session data.");
  }
}

// ===== SOUND EFFECTS & MICROINTERACTIONS =====
function triggerSoundEffect(text, x, y) {
  const fx = document.createElement('div');
  fx.className = 'fx-popup';
  fx.textContent = text;
  fx.style.left = `${Math.max(10, Math.min(x, window.innerWidth - 180))}px`;
  fx.style.top = `${Math.max(10, Math.min(y, window.innerHeight - 80))}px`;
  
  DOM.fxLayer.appendChild(fx);
  setTimeout(() => fx.remove(), 600);
}

function triggerImpactFlash() {
  DOM.impactFlash.classList.add('flash-active');
  setTimeout(() => DOM.impactFlash.classList.remove('flash-active'), 120);
}

function triggerScreenShake() {
  document.body.classList.add('screen-shake');
  setTimeout(() => document.body.classList.remove('screen-shake'), 350);
}

// ===== ANIMATED CANVAS BACKGROUND =====
function initCanvasBackground() {
  const ctx = DOM.canvas.getContext('2d');
  let width = DOM.canvas.width = window.innerWidth;
  let height = DOM.canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = DOM.canvas.width = window.innerWidth;
    height = DOM.canvas.height = window.innerHeight;
  });

  const particleCount = window.innerWidth < 600 ? 12 : 25;
  const particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2 + 1,
    speedX: (Math.random() - 0.5) * 0.4,
    speedY: (Math.random() - 0.5) * 0.4,
    color: Math.random() > 0.5 ? 'rgba(0, 221, 235, 0.4)' : 'rgba(255, 49, 93, 0.4)'
  }));

  function animate() {
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i - 40, height);
      ctx.stroke();
    }

    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}
