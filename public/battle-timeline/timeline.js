// Timeline generation layer (Phases 1-4)
// Handles battle text analysis (via Claude API or simulation) and timeline JSON generation

import { BATTLE_TIMELINES } from './battle-data.js';
import { Validator } from './validator.js';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

const EXTRACTION_PROMPT = `You are a historical battle analysis engine. Given a battle description text, you must output a COMPLETE timeline JSON following this exact structure.

## Output Schema

Return ONLY valid JSON (no markdown, no explanation) with this structure:

{
  "battle_name": "Name of the battle",
  "year": YYYY,
  "actors": ["Actor1", "Actor2", ...],
  "terrain": {
    "type": "plain|valley|hill|coastal|urban",
    "features": [
      { "type": "mountain|river|forest", "x": 0.0-1.0, "y": 0.0-1.0, "w": 0.0-1.0, "h": 0.0-1.0 }
    ]
  },
  "steps": [
    {
      "step": 1,
      "action": "preparation|move|bombard|attack|retreat|defend|capture|surround|victory",
      "title": "Short title",
      "description": "Brief description",
      "narration": "Detailed historical narration (1-2 sentences)",
      "effects": [
        { "type": "explosion|arrow|smoke|victory_star", "x": 0.0-1.0, "y": 0.0-1.0, "size": 0.01-0.15, "fromX": 0.0-1.0, "fromY": 0.0-1.0, "toX": 0.0-1.0, "toY": 0.0-1.0 }
      ],
      "animations": [
        { "entity_id": "string", "from": { "x": 0.0-1.0, "y": 0.0-1.0 }, "to": { "x": 0.0-1.0, "y": 0.0-1.0 }, "duration": 1000-3000 }
      ],
      "entities": [
        { "id": "unique_id", "type": "soldier|commander|base|tank|artillery|flag|defensive_line", "team": "team_name", "x": 0.0-1.0, "y": 0.0-1.0, "count": number, "label": "Display Label", "health": 0.0-1.0 }
      ]
    }
  ]
}

Rules:
1. Coordinates x,y are normalized 0-1 (fraction of canvas width/height)
2. Each step must have entities array (include ALL units visible in that step, even unchanged ones)
3. Earlier-arriving units go on the left side (x < 0.4). Later units or defenders on right side (x > 0.5)
4. Each step's entity IDs should be meaningful and consistent across steps when referring to the same unit
5. entity type "flag" has optional "color" field (CSS color string)
6. Include 4-7 steps
7. The final step should be the outcome (victory/defeat)
8. Step actions flow naturally: preparation -> move -> bombard -> attack -> (capture/surround) -> victory

Analyze the battle and output ONLY the JSON:`;

export class TimelineGenerator {
  constructor() {
    this.validator = new Validator();
  }

  // Get pre-generated timeline for a known preset
  getPresetTimeline(presetId) {
    return BATTLE_TIMELINES[presetId] || null;
  }

  // Generate timeline from text using simulation
  simulateTimeline(text) {
    // Simple heuristic simulation that creates a basic 4-step timeline
    const words = text.toLowerCase();
    
    const actors = this.extractActors(text);
    const hasBombardment = words.includes('artillery') || words.includes('bombard') || words.includes('shell');
    const hasAssault = words.includes('assault') || words.includes('charge') || words.includes('storm');
    const hasCapture = words.includes('capture') || words.includes('took') || words.includes('fell');
    const hasVictory = words.includes('victory') || words.includes('won') || words.includes('defeated') || words.includes('surrend');
    
    const attacker = actors[0] || 'Attacking Army';
    const defender = actors[1] || 'Defending Army';
    const attackerTeam = attacker.toLowerCase().replace(/\s+/g, '_');
    const defenderTeam = defender.toLowerCase().replace(/\s+/g, '_');

    const steps = [];
    let stepNum = 1;
    
    // Step 1: Preparation
    steps.push({
      step: stepNum++,
      action: 'preparation',
      title: 'Forces Assemble',
      description: `${attacker} forces position themselves while ${defender} troops prepare defenses.`,
      narration: text.substring(0, 200) + '...',
      entities: [
        { id: 'att_inf_1', type: 'soldier', team: attackerTeam, x: 0.15, y: 0.5, count: 300, label: `${attacker} Infantry` },
        { id: 'att_comm', type: 'commander', team: attackerTeam, x: 0.2, y: 0.4, count: 1, label: `${attacker} Commander` },
        { id: 'def_base', type: 'base', team: defenderTeam, x: 0.65, y: 0.45, count: 1, label: `${defender} Base` },
        { id: 'def_inf_1', type: 'soldier', team: defenderTeam, x: 0.65, y: 0.5, count: 250, label: `${defender} Forces` },
        { id: 'def_comm', type: 'commander', team: defenderTeam, x: 0.7, y: 0.4, count: 1, label: `${defender} Commander` }
      ]
    });

    // Step 2: Movement / Bombardment
    if (hasBombardment) {
      steps.push({
        step: stepNum++,
        action: 'bombard',
        title: 'Artillery Bombardment',
        description: `${attacker} artillery opens fire on ${defender} defensive positions.`,
        narration: 'Artillery shells rain down on enemy fortifications, weakening their defenses.',
        effects: [
          { type: 'arrow', fromX: 0.18, fromY: 0.38, toX: 0.62, toY: 0.44 },
          { type: 'explosion', x: 0.62, y: 0.42, size: 0.05 },
          { type: 'explosion', x: 0.65, y: 0.48, size: 0.04 }
        ],
        animations: [
          { entity_id: 'att_inf_1', from: { x: 0.15, y: 0.5 }, to: { x: 0.28, y: 0.5 }, duration: 2000 }
        ],
        entities: [
          { id: 'att_art', type: 'artillery', team: attackerTeam, x: 0.15, y: 0.38, count: 25, label: `${attacker} Artillery` },
          { id: 'att_inf_1', type: 'soldier', team: attackerTeam, x: 0.28, y: 0.5, count: 290, label: `${attacker} Infantry` },
          { id: 'att_comm', type: 'commander', team: attackerTeam, x: 0.22, y: 0.4, count: 1, label: `${attacker} Commander` },
          { id: 'def_base', type: 'base', team: defenderTeam, x: 0.65, y: 0.45, count: 1, label: `${defender} Base`, health: 0.6 },
          { id: 'def_inf_1', type: 'soldier', team: defenderTeam, x: 0.65, y: 0.52, count: 210, label: `${defender} Forces` },
          { id: 'def_comm', type: 'commander', team: defenderTeam, x: 0.7, y: 0.4, count: 1, label: `${defender} Commander` }
        ]
      });
    } else {
      steps.push({
        step: stepNum++,
        action: 'move',
        title: 'Troop Movement',
        description: `${attacker} forces advance toward ${defender} positions.`,
        narration: 'Troops advance across the battlefield, closing in on enemy defensive lines.',
        animations: [
          { entity_id: 'att_inf_1', from: { x: 0.15, y: 0.5 }, to: { x: 0.35, y: 0.5 }, duration: 2000 }
        ],
        entities: [
          { id: 'att_inf_1', type: 'soldier', team: attackerTeam, x: 0.35, y: 0.5, count: 280, label: `${attacker} Infantry` },
          { id: 'att_comm', type: 'commander', team: attackerTeam, x: 0.25, y: 0.4, count: 1, label: `${attacker} Commander` },
          { id: 'def_base', type: 'base', team: defenderTeam, x: 0.65, y: 0.45, count: 1, label: `${defender} Base` },
          { id: 'def_inf_1', type: 'soldier', team: defenderTeam, x: 0.65, y: 0.5, count: 240, label: `${defender} Forces` },
          { id: 'def_comm', type: 'commander', team: defenderTeam, x: 0.7, y: 0.4, count: 1, label: `${defender} Commander` }
        ]
      });
    }

    // Step 3: Assault
    if (hasAssault || hasCapture) {
      steps.push({
        step: stepNum++,
        action: 'attack',
        title: 'Infantry Assault',
        description: `${attacker} infantry launches coordinated assault on ${defender} positions.`,
        narration: 'Infantry units charge the enemy lines. Heavy fighting ensues as defenders struggle to hold their ground.',
        effects: [
          { type: 'arrow', fromX: 0.38, fromY: 0.48, toX: 0.6, toY: 0.46 },
          { type: 'explosion', x: 0.6, y: 0.44, size: 0.05 }
        ],
        animations: [
          { entity_id: 'att_inf_1', from: { x: 0.28, y: 0.5 }, to: { x: 0.45, y: 0.5 }, duration: 1500 }
        ],
        entities: [
          { id: 'att_inf_1', type: 'soldier', team: attackerTeam, x: 0.45, y: 0.5, count: 220, label: `${attacker} Infantry` },
          { id: 'att_comm', type: 'commander', team: attackerTeam, x: 0.3, y: 0.4, count: 1, label: `${attacker} Commander` },
          { id: 'def_base', type: 'base', team: defenderTeam, x: 0.65, y: 0.45, count: 1, label: `${defender} Base`, health: 0.3 },
          { id: 'def_inf_1', type: 'soldier', team: defenderTeam, x: 0.63, y: 0.5, count: 140, label: `${defender} Forces` },
          { id: 'def_comm', type: 'commander', team: defenderTeam, x: 0.68, y: 0.4, count: 1, label: `${defender} Commander` }
        ]
      });
    }

    // Step 4: Capture / Victory
    steps.push({
      step: stepNum++,
      action: hasCapture || hasVictory ? 'victory' : 'capture',
      title: hasVictory ? 'Victory' : 'Battle Concludes',
      description: hasVictory ? `${attacker} claims victory.` : `The battle reaches its conclusion.`,
      narration: hasVictory ? 'The battle is won. Enemy forces retreat or surrender.' : 'The battle has reached its conclusion.',
      effects: [
        { type: 'victory_star', x: 0.5, y: 0.25, size: 0.1 }
      ],
      entities: [
        { id: 'att_inf_1', type: 'soldier', team: attackerTeam, x: 0.55, y: 0.5, count: 180, label: `Victorious ${attacker}` },
        { id: 'att_flag', type: 'flag', team: attackerTeam, x: 0.55, y: 0.28, count: 1, label: 'Victory Banner', color: '#e94560' },
        { id: 'att_comm', type: 'commander', team: attackerTeam, x: 0.5, y: 0.4, count: 1, label: `${attacker} Commander` }
      ]
    });

    return {
      battle_name: text.split('.')[0].trim() || 'Unknown Battle',
      year: 1900,
      actors,
      terrain: {
        type: 'plain',
        features: []
      },
      steps
    };
  }

  extractActors(text) {
    // Simple heuristic to find named entities that look like army names
    const patterns = [
      /([A-Z][a-z]+ (?:Army|forces|troops|military|division|corps))/g,
      /([A-Z][a-z]+ (?:soldiers|infantry|cavalry|artillery))/g,
      /(?:the )([A-Z][a-z]+)/g,
    ];

    const found = new Set();
    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const m of matches) {
        found.add(m[1]);
      }
    }

    const actors = Array.from(found).slice(0, 4);
    if (actors.length < 2) {
      return ['Attacking Army', 'Defending Army'];
    }
    return actors;
  }

  // Call Claude API to analyze battle text
  async analyzeWithClaude(text, apiKey) {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system: EXTRACTION_PROMPT,
        messages: [{ role: 'user', content: text }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Extract JSON from response (handles possible markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      throw new Error('Failed to parse Claude response as JSON');
    }
  }

  // Main generation entry point
  async generate(text, options = {}) {
    const { useApi, apiKey } = options;

    let timeline;
    if (useApi && apiKey) {
      timeline = await this.analyzeWithClaude(text, apiKey);
    } else {
      timeline = this.simulateTimeline(text);
    }

    // Validate
    const report = this.validator.validate(timeline);
    
    return {
      timeline,
      validation: report
    };
  }
}

export default TimelineGenerator;
