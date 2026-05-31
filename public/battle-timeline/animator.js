// Animation engine (Phase 7)
// Handles interpolation between timeline steps

export class Animator {
  constructor() {
    this.isPlaying = false;
    this.currentStep = 0;
    this.totalSteps = 0;
    this.speed = 1;
    this.loop = false;
    this.animFrameId = null;
    
    // Internal animation state
    this.isAnimating = false;
    this.animationProgress = 0;
    this.animDuration = 2000; // ms between steps
    this.animStartTime = 0;
    this.movements = [];
    this.effects = [];
    
    // Callbacks
    this.onStepChange = null;
    this.onPlayStateChange = null;
  }

  init(totalSteps) {
    this.currentStep = 0;
    this.totalSteps = totalSteps;
    this.stop();
  }

  setTimeline(timeline) {
    this.timeline = timeline;
    this.init(timeline.steps.length);
  }

  // Compute the animation state between two steps
  computeMovement(fromStep, toStep) {
    const movements = [];
    if (!fromStep || !toStep) return movements;

    // Track entities that exist in both steps with position changes
    fromStep.entities.forEach((fromEnt) => {
      const toEnt = toStep.entities.find(e => e.id === fromEnt.id);
      if (toEnt) {
        const dx = toEnt.x - fromEnt.x;
        const dy = toEnt.y - fromEnt.y;
        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
          movements.push({
            entity_id: fromEnt.id,
            from: { x: fromEnt.x, y: fromEnt.y },
            to: { x: toEnt.x, y: toEnt.y },
            current: { x: fromEnt.x, y: fromEnt.y }
          });
        }
      }
    });

    // Also compute from explicit animations array if present
    if (toStep.animations) {
      toStep.animations.forEach((anim) => {
        const existing = movements.find(m => m.entity_id === anim.entity_id);
        if (!existing) {
          movements.push({
            entity_id: anim.entity_id,
            from: { x: anim.from.x, y: anim.from.y },
            to: { x: anim.to.x, y: anim.to.y },
            current: { x: anim.from.x, y: anim.from.y }
          });
        }
      });
    }

    return movements;
  }

  // Easing function (ease-in-out)
  ease(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  // Start playback
  play() {
    if (this.isPlaying) return;
    if (this.currentStep >= this.totalSteps - 1) {
      this.currentStep = 0;
    }
    this.isPlaying = true;
    this.startStepAnimation();
    if (this.onPlayStateChange) this.onPlayStateChange(true);
  }

  pause() {
    this.isPlaying = false;
    this.isAnimating = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.onPlayStateChange) this.onPlayStateChange(false);
  }

  stop() {
    this.pause();
    this.currentStep = 0;
    this.movements = [];
    this.effects = [];
    if (this.onStepChange) this.onStepChange(0);
  }

  // Go to specific step
  goToStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.totalSteps) return;
    this.pause();
    this.currentStep = stepIndex;
    this.movements = [];
    if (this.onStepChange) this.onStepChange(stepIndex);
  }

  nextStep() {
    if (this.currentStep < this.totalSteps - 1) {
      this.goToStep(this.currentStep + 1);
    } else if (this.loop) {
      this.goToStep(0);
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.goToStep(this.currentStep - 1);
    }
  }

  firstStep() { this.goToStep(0); }
  lastStep() { this.goToStep(this.totalSteps - 1); }

  setSpeed(speed) {
    this.speed = speed;
  }

  setLoop(loop) {
    this.loop = loop;
  }

  // Start animating from current step to next
  startStepAnimation() {
    if (this.currentStep >= this.totalSteps - 1) {
      if (this.loop) {
        this.currentStep = 0;
      } else {
        this.pause();
        return;
      }
    }

    const fromStep = this.timeline.steps[this.currentStep];
    const toStep = this.timeline.steps[this.currentStep + 1];
    
    if (!fromStep || !toStep) {
      this.pause();
      return;
    }

    this.movements = this.computeMovement(fromStep, toStep);
    this.effects = toStep.effects || [];
    this.isAnimating = true;
    this.animationProgress = 0;
    this.animStartTime = performance.now();
    
    this.animate();
  }

  animate() {
    if (!this.isAnimating) return;

    const now = performance.now();
    const elapsed = now - this.animStartTime;
    const duration = this.animDuration / this.speed;
    this.animationProgress = Math.min(elapsed / duration, 1);
    
    // Interpolate movements
    const progress = this.ease(this.animationProgress);
    this.movements.forEach((movement) => {
      movement.current.x = movement.from.x + (movement.to.x - movement.from.x) * progress;
      movement.current.y = movement.from.y + (movement.to.y - movement.from.y) * progress;
    });

    // Notify state change
    if (this.onStepChange) {
      this.onStepChange(this.currentStep, {
        progress: this.animationProgress,
        movements: this.movements
      });
    }

    if (this.animationProgress >= 1) {
      // Animation complete for this step
      this.isAnimating = false;
      this.movements = [];
      this.currentStep++;
      
      if (this.onStepChange) {
        this.onStepChange(this.currentStep);
      }

      if (this.isPlaying) {
        // Small delay between steps
        setTimeout(() => this.startStepAnimation(), 500 / this.speed);
      }
    } else {
      this.animFrameId = requestAnimationFrame(() => this.animate());
    }
  }

  // Get current animation state to pass to renderer
  getState() {
    return {
      isPlaying: this.isPlaying,
      currentStep: this.currentStep,
      totalSteps: this.totalSteps,
      speed: this.speed,
      loop: this.loop,
      isAnimating: this.isAnimating,
      animationProgress: this.animationProgress,
      movements: this.movements
    };
  }
}

export default Animator;
