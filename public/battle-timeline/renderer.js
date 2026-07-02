// Canvas renderer (Phases 6-7)
// Handles all battlefield rendering including entities, effects, terrain, and labels

import ICONS, { drawTerrain, drawLabel, drawCountBadge } from './icons.js';
import { TEAM_COLORS } from './battle-data.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.animFrameId = null;
    this.flashingEffects = [];
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Map normalized 0-1 coordinates to canvas pixel coordinates
  mapX(normX) { return normX * this.width; }
  mapY(normY) { return normY * this.height; }
  mapS(normS) { return normS * Math.min(this.width, this.height); }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  render(timeline, stepIndex, animState) {
    if (!timeline || !timeline.steps) return;
    
    const step = timeline.steps[stepIndex];
    if (!step) return;

    this.clear();
    drawTerrain(this.ctx, this.width, this.height);

    // Draw terrain features
    if (timeline.terrain && timeline.terrain.features) {
      timeline.terrain.features.forEach(f => this.drawTerrainFeature(f));
    }

    // Render entities (blend between current step and animation target)
    this.renderEntities(step, animState);

    // Render effects (explosions, arrows, etc.)
    if (step.effects) {
      step.effects.forEach(e => this.renderEffect(e));
    }

    // Step overlay
    this.renderStepIndicator(step);
  }

  drawTerrainFeature(feature) {
    const x = this.mapX(feature.x);
    const y = this.mapY(feature.y);
    const s = this.mapS(feature.w || 0.3);
    
    if (ICONS[feature.type]) {
      ICONS[feature.type](this.ctx, x, y, s);
    }
  }

  renderEntities(step, animState = null) {
    step.entities.forEach((ent) => {
      let x = this.mapX(ent.x);
      let y = this.mapY(ent.y);
      let s = this.mapS(0.06); // Default entity size

      // Apply animation interpolation if animState provided
      if (animState && animState.movements) {
        const movement = animState.movements.find(m => m.entity_id === ent.id);
        if (movement) {
          x = this.mapX(movement.current.x);
          y = this.mapY(movement.current.y);
        }
      }

      const color = TEAM_COLORS[ent.team] || '#888';
      const baseHealth = ent.health !== undefined ? ent.health : 1;

      // Draw health indicator (damage overlay)
      if (baseHealth < 1 && baseHealth > 0) {
        this.drawDamageOverlay(x, y, s, baseHealth);
      } else if (baseHealth === 0) {
        this.drawDestroyedOverlay(x, y, s);
      }

      // Draw the entity icon
      if (ent.type === 'defensive_line') {
        ICONS.defensive_line(this.ctx, x, this.mapY(ent.y), this.mapS(ent.w || 0.4), color);
      } else if (ICONS[ent.type]) {
        ICONS[ent.type](this.ctx, x - s/2, y - s/2, s, ent.color || color);
      } else {
        // Generic fallback: colored circle
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, s * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      // Label
      if (ent.label && ent.type !== 'defensive_line') {
        drawLabel(this.ctx, ent.label, x, y + s * 0.7, 10);
      }

      // Count badge
      if (ent.count && ent.count > 1 && ent.type !== 'defensive_line') {
        drawCountBadge(this.ctx, ent.count, x + s * 0.35, y - s * 0.3);
      }
    });
  }

  drawDamageOverlay(x, y, s, health) {
    this.ctx.save();
    this.ctx.globalAlpha = 0.3 * (1 - health);
    this.ctx.fillStyle = '#ff4444';
    this.ctx.beginPath();
    this.ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawDestroyedOverlay(x, y, s) {
    this.ctx.save();
    this.ctx.strokeStyle = '#ff4444';
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 0.6;
    this.ctx.beginPath();
    this.ctx.moveTo(x - s * 0.4, y - s * 0.4);
    this.ctx.lineTo(x + s * 0.4, y + s * 0.4);
    this.ctx.moveTo(x + s * 0.4, y - s * 0.4);
    this.ctx.lineTo(x - s * 0.4, y + s * 0.4);
    this.ctx.stroke();
    this.ctx.restore();
  }

  renderEffect(effect) {
    if (effect.type === 'arrow') {
      const fromX = this.mapX(effect.fromX);
      const fromY = this.mapY(effect.fromY);
      const toX = this.mapX(effect.toX);
      const toY = this.mapY(effect.toY);
      ICONS.arrow(this.ctx, fromX, fromY, toX, toY, effect.color);
    } else if (effect.type === 'explosion') {
      const x = this.mapX(effect.x);
      const y = this.mapY(effect.y);
      const s = this.mapS(effect.size || 0.06);
      ICONS.explosion(this.ctx, x - s/2, y - s/2, s, effect.color, effect.alpha || 0.9);
    } else if (effect.type === 'smoke') {
      const x = this.mapX(effect.x);
      const y = this.mapY(effect.y);
      const s = this.mapS(effect.size || 0.08);
      ICONS.smoke(this.ctx, x, y, s, effect.alpha || 0.5);
    } else if (effect.type === 'victory_star') {
      const x = this.mapX(effect.x);
      const y = this.mapY(effect.y);
      const s = this.mapS(effect.size || 0.1);
      ICONS.victory_star(this.ctx, x - s/2, y - s/2, s, effect.color);
    }
  }

  renderStepIndicator(step) {
    const action = step.action || '';
    const title = step.title || '';
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
    this.ctx.fillRect(8, 8, 250, 50);
    this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(8, 8, 250, 50);
    
    // Step number
    this.ctx.fillStyle = '#f0d4a8';
    this.ctx.font = 'bold 14px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Step ${step.step}`, 18, 30);
    
    // Title
    this.ctx.fillStyle = '#e8e8f0';
    this.ctx.font = '12px sans-serif';
    this.ctx.fillText(title, 18, 48);

    this.ctx.restore();
  }
}

export default Renderer;
