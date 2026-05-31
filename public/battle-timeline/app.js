// Main application - wires everything together
import { BATTLE_PRESETS, BATTLE_TIMELINES, ACTION_META } from './battle-data.js';
import { Renderer } from './renderer.js';
import { Animator } from './animator.js';
import { TimelineGenerator } from './timeline.js';

class App {
  constructor() {
    this.timeline = null;
    this.validationReport = null;
    this.currentStepIndex = 0;

    // Components
    this.canvas = document.getElementById('battleCanvas');
    this.renderer = new Renderer(this.canvas);
    this.animator = new Animator();
    this.generator = new TimelineGenerator();

    // UI Elements
    this.elements = {
      battleInput: document.getElementById('battleInput'),
      battlePreset: document.getElementById('battlePreset'),
      btnAnalyze: document.getElementById('btnAnalyze'),
      apiKey: document.getElementById('apiKey'),
      useSimulation: document.getElementById('useSimulation'),
      analysisStatus: document.getElementById('analysisStatus'),
      canvasOverlay: document.getElementById('canvasOverlay'),
      narrationStep: document.getElementById('narrationStep'),
      narrationText: document.getElementById('narrationText'),
      narrationEntities: document.getElementById('narrationEntities'),
      tlCount: document.getElementById('tlCount'),
      stepSlider: document.getElementById('stepSlider'),
      sliderLabels: document.getElementById('sliderLabels'),
      timelineSteps: document.getElementById('timelineSteps'),
      btnPlay: document.getElementById('btnPlay'),
      btnPrev: document.getElementById('btnPrev'),
      btnNext: document.getElementById('btnNext'),
      btnFirst: document.getElementById('btnFirst'),
      btnLast: document.getElementById('btnLast'),
      loopToggle: document.getElementById('loopToggle'),
      summaryModal: document.getElementById('summaryModal'),
      summaryBody: document.getElementById('summaryBody'),
      btnCloseSummary: document.getElementById('btnCloseSummary')
    };

    this.init();
  }

  init() {
    this.populatePresets();
    this.bindEvents();
    this.renderer.resize();
    this.renderer.clear();
    this.updateUI();

    // Handle resize
    window.addEventListener('resize', () => {
      this.renderer.resize();
      if (this.timeline) {
        this.renderToCurrentStep();
      }
    });
  }

  populatePresets() {
    const select = this.elements.battlePreset;
    BATTLE_PRESETS.forEach((preset) => {
      const opt = document.createElement('option');
      opt.value = preset.id;
      opt.textContent = preset.name;
      select.appendChild(opt);
    });
  }

  bindEvents() {
    // Preset selection
    this.elements.battlePreset.addEventListener('change', (e) => {
      const id = e.target.value;
      if (!id) return;
      const preset = BATTLE_PRESETS.find(p => p.id === id);
      if (preset) {
        this.elements.battleInput.value = preset.description;
        this.elements.btnAnalyze.disabled = false;
      }
    });

    // Input changes
    this.elements.battleInput.addEventListener('input', () => {
      this.elements.btnAnalyze.disabled = this.elements.battleInput.value.trim().length < 20;
    });

    // Analyze button
    this.elements.btnAnalyze.addEventListener('click', () => this.analyzeBattle());

    // Playback controls
    this.elements.btnPlay.addEventListener('click', () => this.togglePlay());
    this.elements.btnPrev.addEventListener('click', () => this.animator.prevStep());
    this.elements.btnNext.addEventListener('click', () => this.animator.nextStep());
    this.elements.btnFirst.addEventListener('click', () => this.animator.firstStep());
    this.elements.btnLast.addEventListener('click', () => this.animator.lastStep());
    this.elements.loopToggle.addEventListener('change', (e) => {
      this.animator.setLoop(e.target.checked);
    });

    // Step slider
    this.elements.stepSlider.addEventListener('input', (e) => {
      this.animator.goToStep(parseInt(e.target.value));
    });

    // Speed buttons
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.animator.setSpeed(parseFloat(btn.dataset.speed));
      });
    });

    // Modal close
    this.elements.btnCloseSummary.addEventListener('click', () => {
      this.elements.summaryModal.classList.remove('visible');
    });
    this.elements.summaryModal.querySelector('.modal-backdrop').addEventListener('click', () => {
      this.elements.summaryModal.classList.remove('visible');
    });

    // Simulation toggle
    this.elements.useSimulation.addEventListener('change', (e) => {
      const isSim = e.target.checked;
      this.elements.apiKey.disabled = isSim;
      if (isSim) this.elements.apiKey.style.opacity = '0.4';
      else this.elements.apiKey.style.opacity = '1';
    });

    // Animator callbacks
    this.animator.onStepChange = (stepIndex, animState) => {
      this.currentStepIndex = stepIndex;
      this.renderToCurrentStep(animState);
      this.updateUI();
    };

    this.animator.onPlayStateChange = (isPlaying) => {
      this.elements.btnPlay.innerHTML = isPlaying ? '&#10074;&#10074;' : '&#9654;';
      if (isPlaying) {
        this.elements.btnPlay.classList.add('playing');
      } else {
        this.elements.btnPlay.classList.remove('playing');
      }
    };
  }

  async analyzeBattle() {
    const text = this.elements.battleInput.value.trim();
    if (text.length < 20) return;

    // Check if preset text matches a known battle
    const presetId = this.elements.battlePreset.value;
    let timeline;

    if (presetId && BATTLE_TIMELINES[presetId]) {
      // Use pre-generated timeline from data
      this.setStatus('Loading preset timeline...', 'processing');
      // Simulate a brief delay for UX
      await new Promise(r => setTimeout(r, 600));
      timeline = BATTLE_TIMELINES[presetId];
      this.setStatus('Preset timeline loaded', 'success');
    } else {
      // Generate timeline from text
      const useApi = !this.elements.useSimulation.checked;
      const apiKey = this.elements.apiKey.value.trim();
      
      if (useApi && !apiKey) {
        this.setStatus('API key required or enable simulation mode', 'error');
        return;
      }

      this.setStatus(useApi ? 'Calling Claude API...' : 'Generating timeline...', 'processing');
      this.elements.btnAnalyze.disabled = true;

      try {
        const result = await this.generator.generate(text, { useApi, apiKey });
        timeline = result.timeline;
        this.validationReport = result.validation;
        
        if (!result.validation.valid) {
          this.setStatus(`Generated with ${result.validation.warningCount} warnings`, 'success');
          this.showValidationWarnings(result.validation);
        } else {
          this.setStatus('Timeline generated successfully', 'success');
        }
      } catch (err) {
        this.setStatus(`Error: ${err.message}`, 'error');
        this.elements.btnAnalyze.disabled = false;
        return;
      }
    }

    this.elements.btnAnalyze.disabled = false;

    if (!timeline || !timeline.steps) {
      this.setStatus('Failed to generate valid timeline', 'error');
      return;
    }

    this.timeline = timeline;
    this.currentStepIndex = 0;

    // Initialize animator
    this.animator.setTimeline(timeline);
    
    // Update UI
    this.elements.canvasOverlay.classList.add('hidden');
    this.renderer.resize();
    this.renderToCurrentStep();
    this.updateUI();
    this.buildTimelineUI();
  }

  setStatus(msg, type) {
    const el = this.elements.analysisStatus;
    el.textContent = msg;
    el.className = 'status-text ' + type;
    if (type === 'success') {
      setTimeout(() => {
        if (el.textContent === msg) {
          el.className = 'status-text';
        }
      }, 3000);
    }
  }

  showValidationWarnings(report) {
    // Show warnings in status area
    if (report.warnings.length > 0) {
      this.setStatus(`${report.warningCount} warnings (check console)`, 'error');
      console.warn('Timeline validation warnings:', report.warnings);
    }
    if (report.errors.length > 0) {
      this.setStatus(`${report.errorCount} validation errors`, 'error');
      console.error('Timeline validation errors:', report.errors);
    }
  }

  renderToCurrentStep(animState) {
    if (!this.timeline || !this.timeline.steps) return;
    const stepIndex = Math.min(this.currentStepIndex, this.timeline.steps.length - 1);
    this.renderer.render(this.timeline, stepIndex, animState || null);
  }

  togglePlay() {
    if (this.animator.isPlaying) {
      this.animator.pause();
    } else {
      this.animator.play();
    }
  }

  buildTimelineUI() {
    const container = this.elements.timelineSteps;
    container.innerHTML = '';

    this.timeline.steps.forEach((step, i) => {
      const actionMeta = ACTION_META[step.action] || { icon: '\u25CF', label: step.action };
      const div = document.createElement('div');
      div.className = 'timeline-step-item';
      div.innerHTML = `
        <div class="step-number">${step.step}</div>
        <div class="step-info">
          <div class="step-title">${step.title}</div>
          <div class="step-desc">${step.description}</div>
          <div class="step-type">${actionMeta.icon} ${actionMeta.label}</div>
        </div>
      `;
      div.dataset.step = i;
      div.addEventListener('click', () => this.animator.goToStep(i));
      container.appendChild(div);
    });

    // Build slider labels
    this.elements.sliderLabels.innerHTML = '';
    this.timeline.steps.forEach((step, i) => {
      const span = document.createElement('span');
      span.className = 'slider-label';
      span.textContent = step.step;
      this.elements.sliderLabels.appendChild(span);
    });

    this.elements.stepSlider.max = this.timeline.steps.length - 1;
    this.elements.stepSlider.value = 0;
    this.elements.tlCount.textContent = `${this.timeline.steps.length} steps`;
  }

  updateUI() {
    const stepIndex = this.currentStepIndex;
    if (!this.timeline || !this.timeline.steps) {
      this.elements.tlCount.textContent = '0 steps';
      return;
    }

    const step = this.timeline.steps[stepIndex];
    if (!step) return;

    // Update narration
    this.elements.narrationStep.textContent = `Step ${step.step} of ${this.timeline.steps.length}`;
    this.elements.narrationText.textContent = step.narration || step.description || '';

    // Update entity tags
    const entityTags = this.elements.narrationEntities;
    entityTags.innerHTML = '';
    const uniqueTeams = [...new Set(step.entities.map(e => e.team))];
    uniqueTeams.forEach(team => {
      const tag = document.createElement('span');
      tag.className = 'entity-tag';
      tag.textContent = team;
      entityTags.appendChild(tag);
    });

    // Update slider
    this.elements.stepSlider.value = stepIndex;

    // Update timeline step items highlight
    document.querySelectorAll('.timeline-step-item').forEach(item => {
      item.classList.remove('active', 'playing');
      const s = parseInt(item.dataset.step);
      if (s === stepIndex) {
        item.classList.add('active');
        if (this.animator.isPlaying) {
          item.classList.add('playing');
        }
      }
    });

    // Update play button icon
    this.elements.btnPlay.innerHTML = this.animator.isPlaying ? '&#10074;&#10074;' : '&#9654;';

    // Update button states
    this.elements.btnPrev.disabled = stepIndex === 0;
    this.elements.btnFirst.disabled = stepIndex === 0;
    this.elements.btnNext.disabled = stepIndex >= this.timeline.steps.length - 1;
    this.elements.btnLast.disabled = stepIndex >= this.timeline.steps.length - 1;

    // Check if we reached the final victory step
    if (stepIndex === this.timeline.steps.length - 1 && step.action === 'victory') {
      // Auto-show summary after a brief delay when auto-playing finishes
      if (!this.animator.isPlaying && !this._showedSummary) {
        setTimeout(() => this.showSummary(), 2000);
        this._showedSummary = true;
      }
    } else {
      this._showedSummary = false;
    }
  }

  showSummary() {
    if (!this.timeline) return;
    
    const step = this.timeline.steps[this.timeline.steps.length - 1];
    const actors = this.timeline.actors || [];
    const totalSteps = this.timeline.steps.length;
    
    this.elements.summaryBody.innerHTML = `
      <div class="summary-section">
        <h3>${this.timeline.battle_name}</h3>
        <p><em>${this.timeline.year || ''}</em></p>
      </div>
      <div class="summary-section">
        <h3>Participants</h3>
        <ul>
          ${actors.map(a => `<li>${a}</li>`).join('')}
        </ul>
      </div>
      <div class="summary-section">
        <h3>Battle Phases</h3>
        <ul>
          ${this.timeline.steps.map(s => `<li><strong>Step ${s.step}:</strong> ${s.title} (${s.action})</li>`).join('')}
        </ul>
      </div>
      <div class="summary-section">
        <h3>Outcome</h3>
        <p>${step.narration || step.description}</p>
      </div>
      <div class="summary-section">
        <p>Total phases: ${totalSteps}</p>
      </div>
    `;

    this.elements.summaryModal.classList.add('visible');
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
