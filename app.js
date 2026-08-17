// Initialize Web Worker for taxonomy matching and weighted scoring
const worker = new Worker('worker.js');

// Global Application State & History Stack
const historyStack = [];
let historyIndex = -1;
let state = null;
let currentAudio = null;

const el = {
  backBtn: document.getElementById('backBtn'),
  soundBtn: document.getElementById('soundBtn'),
  minimapCard: document.getElementById('minimapCard'),
  minimapImg: document.getElementById('minimapImg'),
  obsPhoto: document.getElementById('obsPhoto'),
  skeleton: document.getElementById('skeleton'),
  ladder: document.getElementById('ladder'),
  feed: document.getElementById('feed'),
  bestLine: document.getElementById('bestLine'),
  advanceBtn: document.getElementById('advanceBtn')
};

// Web Worker Response Handler
worker.onmessage = (e) => {
  const { type, payload } = e.data;
  if (type === 'TAXONOMY_RESULTS') {
    updateTaxonomyOptions(payload);
  }
};

function updateTaxonomyOptions(candidates) {
  // Update candidate options on UI
}

// Render dynamic static map tile on solution reveal
function showMinimap(obs) {
  if (!obs || !obs.location) {
    el.minimapCard.classList.remove('show');
    return;
  }
  const [lat, lng] = obs.location.split(',');
  el.minimapImg.src = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=4&size=200x200&markers=${lat},${lng},ol-marker`;
  el.minimapCard.classList.add('show');
}

function hideMinimap() {
  el.minimapCard.classList.remove('show');
  el.minimapImg.src = '';
}

// Archive current round state before moving forward
function archiveCurrentRound() {
  if (!state) return;
  const snapshot = JSON.parse(JSON.stringify(state));
  snapshot.feedHTML = el.feed.innerHTML;
  snapshot.bestLineText = el.bestLine.textContent;

  if (historyIndex < historyStack.length - 1) {
    historyStack.splice(historyIndex + 1);
  }
  historyStack.push(snapshot);
  historyIndex = historyStack.length - 1;
  el.backBtn.disabled = historyIndex <= 0;
}

// Restore state from history stack
function restoreRound(snapshot) {
  state = JSON.parse(JSON.stringify(snapshot));
  el.feed.innerHTML = snapshot.feedHTML || '';
  el.bestLine.textContent = snapshot.bestLineText || '';

  if (state.finished) {
    showMinimap(state.obs);
  } else {
    hideMinimap();
  }

  el.backBtn.disabled = historyIndex <= 0;
}

// Navigation Listeners
el.backBtn.addEventListener('click', () => {
  if (historyIndex > 0) {
    historyIndex--;
    restoreRound(historyStack[historyIndex]);
  }
});

el.advanceBtn.addEventListener('click', () => {
  if (state && state.finished) {
    archiveCurrentRound();
    // Proceed to load next observation
  } else if (state) {
    state.finished = true;
    showMinimap(state.obs);
  }
});

el.soundBtn.addEventListener('click', () => {
  if (currentAudio) {
    currentAudio.paused ? currentAudio.play() : currentAudio.pause();
  }
});