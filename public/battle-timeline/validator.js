// Scene validation layer (Phase 5)
// Validates timeline JSON before rendering

export class Validator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  validate(timeline) {
    this.errors = [];
    this.warnings = [];

    if (!timeline) {
      this.errors.push('Timeline data is null or undefined');
      return this.report();
    }

    this.checkStructure(timeline);
    this.checkSteps(timeline);
    this.checkEntities(timeline);
    this.checkCoordinates(timeline);
    this.checkAnimations(timeline);
    this.checkTimelineOrder(timeline);

    return this.report();
  }

  checkStructure(timeline) {
    if (!timeline.battle_name) {
      this.errors.push('Missing battle_name');
    }
    if (!Array.isArray(timeline.steps) || timeline.steps.length === 0) {
      this.errors.push('No steps found in timeline');
    }
    if (!Array.isArray(timeline.actors) || timeline.actors.length < 2) {
      this.warnings.push('Less than 2 actors defined');
    }
  }

  checkSteps(timeline) {
    const actions = new Set(['preparation', 'move', 'bombard', 'attack', 'retreat', 'defend', 'capture', 'surround', 'victory']);
    
    timeline.steps.forEach((step, i) => {
      if (!step.step && step.step !== 0) {
        this.errors.push(`Step ${i} missing step number`);
      }
      if (!step.title) {
        this.warnings.push(`Step ${step.step || i} missing title`);
      }
      if (!step.action) {
        this.warnings.push(`Step ${step.step || i} missing action type`);
      } else if (!actions.has(step.action)) {
        this.warnings.push(`Step ${step.step || i} has unknown action: ${step.action}`);
      }
      if (!Array.isArray(step.entities) || step.entities.length === 0) {
        this.errors.push(`Step ${step.step || i} has no entities`);
      }
    });

    if (timeline.steps.length === 0) {
      this.errors.push('Timeline has no steps');
    }
  }

  checkEntities(timeline) {
    const entityIds = new Map();
    const allEntities = [];

    timeline.steps.forEach((step, stepIdx) => {
      step.entities.forEach((ent) => {
        if (!ent.id) {
          this.errors.push(`Step ${step.step}: entity missing ID`);
          return;
        }
        if (!ent.type) {
          this.errors.push(`Step ${step.step}: entity ${ent.id} missing type`);
        }
        if (!ent.team) {
          this.warnings.push(`Step ${step.step}: entity ${ent.id} missing team`);
        }
        if (ent.x === undefined || ent.y === undefined) {
          this.errors.push(`Step ${step.step}: entity ${ent.id} missing coordinates`);
        }
        allEntities.push({ ...ent, step: step.step });
      });

      // Check unique IDs within step
      const stepIds = new Set();
      step.entities.forEach((ent) => {
        if (stepIds.has(ent.id)) {
          this.errors.push(`Step ${step.step}: duplicate entity ID "${ent.id}"`);
        }
        stepIds.add(ent.id);
      });
    });

    // Check entity existence across animation references
    timeline.steps.forEach((step) => {
      if (step.animations) {
        const stepEntityIds = new Set(step.entities.map(e => e.id));
        step.animations.forEach((anim) => {
          if (anim.entity_id && !stepEntityIds.has(anim.entity_id)) {
            this.warnings.push(`Step ${step.step}: animation references non-existent entity "${anim.entity_id}"`);
          }
        });
      }
    });
  }

  checkCoordinates(timeline) {
    timeline.steps.forEach((step) => {
      step.entities.forEach((ent) => {
        if (ent.x !== undefined) {
          if (ent.x < 0 || ent.x > 1) {
            this.warnings.push(`Step ${step.step}: entity ${ent.id} x=${ent.x} out of range [0,1]`);
          }
        }
        if (ent.y !== undefined) {
          if (ent.y < 0 || ent.y > 1) {
            this.warnings.push(`Step ${step.step}: entity ${ent.id} y=${ent.y} out of range [0,1]`);
          }
        }
      });
    });
  }

  checkAnimations(timeline) {
    timeline.steps.forEach((step) => {
      if (!step.animations) return;
      step.animations.forEach((anim, animIdx) => {
        if (!anim.entity_id) {
          this.errors.push(`Step ${step.step}: animation ${animIdx} missing entity_id`);
        }
        if (anim.from && anim.to) {
          if (anim.from.x === undefined || anim.from.y === undefined) {
            this.errors.push(`Step ${step.step}: animation ${animIdx} has invalid 'from' coordinates`);
          }
          if (anim.to.x === undefined || anim.to.y === undefined) {
            this.errors.push(`Step ${step.step}: animation ${animIdx} has invalid 'to' coordinates`);
          }
          // Check impossible movement (teleportation)
          const dx = anim.to.x - anim.from.x;
          const dy = anim.to.y - anim.from.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0.5) {
            this.warnings.push(`Step ${step.step}: entity ${anim.entity_id} moves very far (${dist.toFixed(2)})`);
          }
        }
      });
    });
  }

  checkTimelineOrder(timeline) {
    for (let i = 1; i < timeline.steps.length; i++) {
      if (timeline.steps[i].step < timeline.steps[i - 1].step) {
        this.errors.push(`Steps are not in chronological order at step ${timeline.steps[i].step}`);
      }
    }
  }

  report() {
    return {
      valid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings],
      errorCount: this.errors.length,
      warningCount: this.warnings.length
    };
  }
}

export default Validator;
