// Enhanced battle timeline data following battle_timeline.md schema
// Uses Heritage museum color tokens where applicable

export const BATTLE_TEMPLATES = [
  {
    id: 'dien-bien-phu-1954',
    name: 'Battle of Dien Bien Phu (1954)',
    description: `In early March 1954, the Viet Minh forces under General Vo Nguyen Giap began surrounding the French garrison at Dien Bien Phu valley. The French had established a fortified base with multiple strongpoints named after women: Beatrice, Gabrielle, Anne-Marie, and others.

On March 13, after weeks of artillery emplacement in the surrounding hills, the Viet Minh launched their first assault on Strongpoint Beatrice. Heavy artillery bombardment from the hills pounded French positions. By nightfall, Beatrice fell to Viet Minh infantry.

The battle continued for 56 days. Viet Minh artillery dominated from the high ground. French air supply became increasingly difficult. Trench warfare ensued as Viet Minh forces dug approach trenches closer to French positions.

On May 1, the final Viet Minh offensive began. Wave after wave of infantry assaulted the remaining French strongpoints. By May 7, the French central command bunker was captured. General de Castries surrendered, ending French colonial rule in Indochina.`,
    timeline: {
      battle: {
        id: 'dien-bien-phu-1954',
        name: 'Battle of Dien Bien Phu',
        date: '13 March - 7 May 1954',
        outcome: 'attacker_victory',
        summary: 'VPA forces under Giap besieged and overran the French garrison. Terrain positions inferred from general historical record.'
      },
      map: {
        width: 900,
        height: 600,
        terrain: [
          { id: 'western_hills', type: 'hill', label: 'Western Hills', x: 40, y: 60, width: 180, height: 160 },
          { id: 'eastern_hills', type: 'hill', label: 'Eastern Ridges', x: 660, y: 80, width: 200, height: 140 },
          { id: 'nam_yum', type: 'river', label: 'Nam Yum River', x: 320, y: 480, width: 260, height: 40 },
          { id: 'beatrice', type: 'fortification', label: 'Beatrice', x: 580, y: 200, width: 100, height: 80 },
          { id: 'gabrielle', type: 'fortification', label: 'Gabrielle', x: 690, y: 280, width: 90, height: 70 },
          { id: 'central_hq', type: 'fortification', label: 'De Castries HQ', x: 520, y: 340, width: 100, height: 80 }
        ]
      },
      factions: [
        { id: 'vpa', name: 'Viet Minh', side: 'attacker', color: '#C76A35' },
        { id: 'french', name: 'French Union Forces', side: 'defender', color: '#2B4FA8' }
      ],
      entities: [
        { id: 'vpa_inf_312', faction_id: 'vpa', type: 'infantry', label: '312th Division', initial_x: 80, initial_y: 280 },
        { id: 'vpa_inf_316', faction_id: 'vpa', type: 'infantry', label: '316th Division', initial_x: 100, initial_y: 400 },
        { id: 'vpa_art', faction_id: 'vpa', type: 'artillery', label: 'Artillery Regiment', initial_x: 60, initial_y: 200 },
        { id: 'vpa_comm', faction_id: 'vpa', type: 'commander', label: 'Gen. Giap', initial_x: 120, initial_y: 320 },
        { id: 'fr_base_beatrice', faction_id: 'french', type: 'base', label: 'Strongpoint Beatrice', initial_x: 620, initial_y: 230 },
        { id: 'fr_inf_legion', faction_id: 'french', type: 'infantry', label: 'Foreign Legion', initial_x: 640, initial_y: 380 },
        { id: 'fr_art', faction_id: 'french', type: 'artillery', label: 'French Battery', initial_x: 560, initial_y: 420 },
        { id: 'fr_comm', faction_id: 'french', type: 'commander', label: 'Gen. de Castries', initial_x: 550, initial_y: 360 }
      ],
      steps: [
        {
          step: 1,
          title: 'Deployment',
          time_label: 'Dawn, 13 March 1954',
          narration: 'Viet Minh divisions massed unseen in the surrounding highland jungle. French commanders believed the terrain made a major assault impossible. General Giap had secretly moved 50,000 troops and heavy artillery into position over several months.',
          entity_states: [
            { entity_id: 'vpa_inf_312', x: 80, y: 280, visible: true, status: 'idle' },
            { entity_id: 'vpa_inf_316', x: 100, y: 400, visible: true, status: 'idle' },
            { entity_id: 'vpa_art', x: 60, y: 200, visible: true, status: 'idle' },
            { entity_id: 'vpa_comm', x: 120, y: 320, visible: true, status: 'idle' },
            { entity_id: 'fr_base_beatrice', x: 620, y: 230, visible: true, status: 'defending' },
            { entity_id: 'fr_inf_legion', x: 640, y: 380, visible: true, status: 'idle' },
            { entity_id: 'fr_art', x: 560, y: 420, visible: true, status: 'idle' },
            { entity_id: 'fr_comm', x: 550, y: 360, visible: true, status: 'idle' }
          ],
          actions: [],
          effects: []
        },
        {
          step: 2,
          title: 'Troop Movement',
          time_label: 'Morning, 13 March 1954',
          narration: 'Having assembled their forces in the surrounding hills, Viet Minh divisions began advancing across the valley floor toward the French strongpoints. Porters carried dismantled artillery pieces through jungle trails.',
          entity_states: [
            { entity_id: 'vpa_inf_312', x: 180, y: 280, visible: true, status: 'moving' },
            { entity_id: 'vpa_inf_316', x: 160, y: 380, visible: true, status: 'moving' },
            { entity_id: 'vpa_art', x: 140, y: 220, visible: true, status: 'moving' },
            { entity_id: 'vpa_comm', x: 180, y: 310, visible: true, status: 'moving' },
            { entity_id: 'fr_base_beatrice', x: 620, y: 230, visible: true, status: 'defending' },
            { entity_id: 'fr_inf_legion', x: 640, y: 380, visible: true, status: 'defending' },
            { entity_id: 'fr_art', x: 560, y: 420, visible: true, status: 'idle' },
            { entity_id: 'fr_comm', x: 550, y: 360, visible: true, status: 'idle' }
          ],
          actions: [
            { type: 'move', actor_id: 'vpa_inf_312', from: { x: 80, y: 280 }, to: { x: 180, y: 280 }, label: '312th advances' },
            { type: 'move', actor_id: 'vpa_inf_316', from: { x: 100, y: 400 }, to: { x: 160, y: 380 }, label: '316th advances' },
            { type: 'move', actor_id: 'vpa_art', from: { x: 60, y: 200 }, to: { x: 140, y: 220 }, label: 'Artillery repositioned' }
          ],
          effects: []
        },
        {
          step: 3,
          title: 'Artillery Bombardment',
          time_label: 'Afternoon, 13 March 1954',
          narration: 'VPA artillery opened sustained fire on the French positions, destroying the airstrip and cutting off air resupply. The French artillery commander, stunned by the accuracy of the bombardment, took his own life.',
          entity_states: [
            { entity_id: 'vpa_inf_312', x: 220, y: 280, visible: true, status: 'idle' },
            { entity_id: 'vpa_inf_316', x: 200, y: 370, visible: true, status: 'idle' },
            { entity_id: 'vpa_art', x: 140, y: 220, visible: true, status: 'attacking' },
            { entity_id: 'vpa_comm', x: 200, y: 300, visible: true, status: 'idle' },
            { entity_id: 'fr_base_beatrice', x: 620, y: 230, visible: true, status: 'defending' },
            { entity_id: 'fr_inf_legion', x: 640, y: 380, visible: true, status: 'defending' },
            { entity_id: 'fr_art', x: 560, y: 420, visible: true, status: 'idle' },
            { entity_id: 'fr_comm', x: 550, y: 360, visible: true, status: 'idle' }
          ],
          actions: [
            { type: 'bombard', actor_id: 'vpa_art', target_id: 'fr_base_beatrice', from: { x: 140, y: 220 }, to: { x: 620, y: 230 }, label: 'Heavy artillery barrage' }
          ],
          effects: [
            { type: 'explosion', x: 620, y: 210, target_id: 'beatrice' },
            { type: 'explosion', x: 640, y: 250, target_id: 'beatrice' },
            { type: 'smoke', x: 590, y: 240, target_id: 'beatrice' },
            { type: 'smoke', x: 650, y: 200, target_id: 'beatrice' }
          ]
        },
        {
          step: 4,
          title: 'Infantry Assault',
          time_label: 'Evening, 13 March 1954',
          narration: 'Infantry units launched a coordinated assault against the weakened defensive position. Viet Minh soldiers stormed Beatrice from multiple directions while French legionnaires fought desperately to hold the perimeter.',
          entity_states: [
            { entity_id: 'vpa_inf_312', x: 380, y: 260, visible: true, status: 'attacking' },
            { entity_id: 'vpa_inf_316', x: 350, y: 350, visible: true, status: 'attacking' },
            { entity_id: 'vpa_art', x: 140, y: 220, visible: true, status: 'idle' },
            { entity_id: 'vpa_comm', x: 250, y: 300, visible: true, status: 'idle' },
            { entity_id: 'fr_base_beatrice', x: 620, y: 230, visible: true, status: 'defending' },
            { entity_id: 'fr_inf_legion', x: 580, y: 340, visible: true, status: 'defending' },
            { entity_id: 'fr_art', x: 560, y: 420, visible: true, status: 'attacking' },
            { entity_id: 'fr_comm', x: 550, y: 360, visible: true, status: 'idle' }
          ],
          actions: [
            { type: 'attack', actor_id: 'vpa_inf_312', target_id: 'fr_base_beatrice', from: { x: 380, y: 260 }, to: { x: 580, y: 240 }, label: '312th assaults' },
            { type: 'attack', actor_id: 'vpa_inf_316', target_id: 'fr_inf_legion', from: { x: 350, y: 350 }, to: { x: 560, y: 360 }, label: '316th engages' }
          ],
          effects: [
            { type: 'explosion', x: 600, y: 230, target_id: 'beatrice' },
            { type: 'explosion', x: 570, y: 350, target_id: null }
          ]
        },
        {
          step: 5,
          title: 'Strongpoint Falls',
          time_label: 'Nightfall, 13 March 1954',
          narration: 'By nightfall, Beatrice fell to Viet Minh infantry. The red flag with gold star was raised over the captured bunker. French survivors retreated toward the central stronghold as the siege of Dien Bien Phu entered its decisive phase.',
          entity_states: [
            { entity_id: 'vpa_inf_312', x: 560, y: 240, visible: true, status: 'idle' },
            { entity_id: 'vpa_inf_316', x: 520, y: 340, visible: true, status: 'idle' },
            { entity_id: 'vpa_art', x: 200, y: 240, visible: true, status: 'idle' },
            { entity_id: 'vpa_comm', x: 300, y: 290, visible: true, status: 'idle' },
            { entity_id: 'fr_base_beatrice', x: 620, y: 230, visible: true, status: 'destroyed' },
            { entity_id: 'fr_inf_legion', x: 480, y: 380, visible: true, status: 'retreating' },
            { entity_id: 'fr_art', x: 560, y: 420, visible: true, status: 'idle' },
            { entity_id: 'fr_comm', x: 550, y: 360, visible: true, status: 'idle' }
          ],
          actions: [
            { type: 'capture', actor_id: 'vpa_inf_312', target_id: 'beatrice', from: { x: 560, y: 240 }, to: { x: 620, y: 230 }, label: 'Beatrice captured' }
          ],
          effects: [
            { type: 'flag_change', x: 620, y: 200, target_id: 'beatrice' },
            { type: 'smoke', x: 610, y: 240, target_id: 'beatrice' }
          ]
        },
        {
          step: 6,
          title: 'Final Offensive',
          time_label: '1 May 1954',
          narration: 'After weeks of trench warfare, the final Viet Minh offensive began. Wave after wave of infantry assaulted the remaining French strongpoints. The airstrip had long been unusable and ammunition was running critically low.',
          entity_states: [
            { entity_id: 'vpa_inf_312', x: 480, y: 300, visible: true, status: 'attacking' },
            { entity_id: 'vpa_inf_316', x: 440, y: 360, visible: true, status: 'attacking' },
            { entity_id: 'vpa_art', x: 260, y: 260, visible: true, status: 'attacking' },
            { entity_id: 'vpa_comm', x: 320, y: 310, visible: true, status: 'idle' },
            { entity_id: 'fr_base_beatrice', x: 620, y: 230, visible: true, status: 'destroyed' },
            { entity_id: 'fr_inf_legion', x: 500, y: 390, visible: true, status: 'defending' },
            { entity_id: 'fr_art', x: 540, y: 430, visible: true, status: 'idle' },
            { entity_id: 'fr_comm', x: 540, y: 360, visible: true, status: 'defending' }
          ],
          actions: [
            { type: 'bombard', actor_id: 'vpa_art', target_id: 'central_hq', from: { x: 260, y: 260 }, to: { x: 520, y: 340 }, label: 'Final bombardment' },
            { type: 'attack', actor_id: 'vpa_inf_312', target_id: 'central_hq', from: { x: 480, y: 300 }, to: { x: 520, y: 340 }, label: '312th storms HQ' },
            { type: 'surround', actor_id: 'vpa_inf_316', target_id: 'central_hq', from: { x: 440, y: 360 }, to: { x: 520, y: 400 }, label: 'HQ encircled' }
          ],
          effects: [
            { type: 'explosion', x: 520, y: 320, target_id: 'central_hq' },
            { type: 'explosion', x: 540, y: 350, target_id: 'central_hq' }
          ]
        },
        {
          step: 7,
          title: 'Surrender & Victory',
          time_label: '7 May 1954',
          narration: 'After 56 days of siege, General de Castries surrendered. The French garrison was marched into captivity. The Battle of Dien Bien Phu ended French colonial rule in Indochina and reshaped the geopolitical landscape of Southeast Asia.',
          entity_states: [
            { entity_id: 'vpa_inf_312', x: 500, y: 340, visible: true, status: 'idle' },
            { entity_id: 'vpa_inf_316', x: 520, y: 400, visible: true, status: 'idle' },
            { entity_id: 'vpa_art', x: 280, y: 280, visible: true, status: 'idle' },
            { entity_id: 'vpa_comm', x: 360, y: 320, visible: true, status: 'idle' },
            { entity_id: 'fr_base_beatrice', x: 620, y: 230, visible: true, status: 'destroyed' },
            { entity_id: 'fr_inf_legion', x: 480, y: 420, visible: true, status: 'retreating' },
            { entity_id: 'fr_art', x: 500, y: 450, visible: false, status: 'destroyed' },
            { entity_id: 'fr_comm', x: 520, y: 350, visible: true, status: 'retreating' }
          ],
          actions: [
            { type: 'victory', actor_id: 'vpa_comm', target_id: null, from: { x: 360, y: 320 }, to: { x: 500, y: 300 }, label: 'Viet Minh Victory' }
          ],
          effects: [
            { type: 'victory_burst', x: 500, y: 280, target_id: null },
            { type: 'flag_change', x: 520, y: 310, target_id: 'central_hq' }
          ]
        }
      ]
    }
  },
  {
    id: 'hastings-1066',
    name: 'Battle of Hastings (1066)',
    description: `On October 14, 1066, the Norman army of William the Conqueror faced King Harold's Anglo-Saxon forces near Hastings, England.

The Normans deployed in three divisions: the left under Alan of Brittany, the center under William himself, and the right under William FitzOsbern. The Anglo-Saxons formed a shield wall on Senlac Hill, a strong defensive position.

The battle began with Norman archers firing uphill at the shield wall, with limited effect. Norman infantry and cavalry then charged the hill but were repulsed. A rumor spread that William had been killed, causing panic on the Norman left flank.

William rallied his troops by lifting his helmet to show his face. He then ordered feigned retreats, which drew Anglo-Saxon troops off the hill. Breaking their shield wall proved fatal. Norman cavalry cut down the pursuing Saxons.

As evening approached, Harold was struck in the eye by an arrow and killed. The leaderless Anglo-Saxon army collapsed. William had won the crown of England.`,
    timeline: {
      battle: {
        id: 'hastings-1066',
        name: 'Battle of Hastings',
        date: '14 October 1066',
        outcome: 'attacker_victory',
        summary: 'William the Conqueror defeated King Harold II at Senlac Hill. The battle introduced Norman rule to England.'
      },
      map: {
        width: 900,
        height: 600,
        terrain: [
          { id: 'senlac_hill', type: 'hill', label: 'Senlac Hill', x: 380, y: 180, width: 180, height: 140 },
          { id: 'english_lines', type: 'fortification', label: 'Shield Wall', x: 360, y: 280, width: 220, height: 50 },
          { id: 'norman_deployment', type: 'plain', label: 'Norman Field', x: 80, y: 380, width: 300, height: 180 }
        ]
      },
      factions: [
        { id: 'norman', name: 'Norman Army', side: 'attacker', color: '#D8A24A' },
        { id: 'saxon', name: 'Anglo-Saxon Army', side: 'defender', color: '#8F1D1D' }
      ],
      entities: [
        { id: 'norman_archers', faction_id: 'norman', type: 'infantry', label: 'Norman Archers', initial_x: 120, y: 420 },
        { id: 'norman_inf', faction_id: 'norman', type: 'infantry', label: 'Norman Infantry', initial_x: 200, y: 440 },
        { id: 'norman_cav', faction_id: 'norman', type: 'cavalry', label: 'Norman Cavalry', initial_x: 160, y: 480 },
        { id: 'william', faction_id: 'norman', type: 'commander', label: 'William', initial_x: 200, y: 400 },
        { id: 'saxon_wall', faction_id: 'saxon', type: 'base', label: 'Shield Wall', initial_x: 460, y: 330 },
        { id: 'saxon_huscarls', faction_id: 'saxon', type: 'infantry', label: 'Huscarls', initial_x: 480, y: 360 },
        { id: 'harold', faction_id: 'saxon', type: 'commander', label: 'King Harold', initial_x: 500, y: 310 }
      ],
      steps: [
        {
          step: 1,
          title: 'Deployment',
          time_label: 'Morning, 14 October 1066',
          narration: 'The Norman army deployed at the base of Senlac Hill while Anglo-Saxon forces formed a formidable shield wall along the ridge. King Harold positioned his housecarls at the center with the fyrd militia on the flanks.',
          entity_states: [
            { entity_id: 'norman_archers', x: 120, y: 420, visible: true, status: 'idle' },
            { entity_id: 'norman_inf', x: 200, y: 440, visible: true, status: 'idle' },
            { entity_id: 'norman_cav', x: 160, y: 480, visible: true, status: 'idle' },
            { entity_id: 'william', x: 200, y: 400, visible: true, status: 'idle' },
            { entity_id: 'saxon_wall', x: 460, y: 330, visible: true, status: 'defending' },
            { entity_id: 'saxon_huscarls', x: 480, y: 360, visible: true, status: 'idle' },
            { entity_id: 'harold', x: 500, y: 310, visible: true, status: 'idle' }
          ],
          actions: [],
          effects: []
        },
        {
          step: 2,
          title: 'Archer Barrage',
          time_label: 'Late Morning',
          narration: 'The battle began with Norman archers firing volleys uphill at the Anglo-Saxon shield wall. The elevation and shields rendered most arrows ineffective, but the barrage signaled the start of the Norman assault.',
          entity_states: [
            { entity_id: 'norman_archers', x: 120, y: 420, visible: true, status: 'attacking' },
            { entity_id: 'norman_inf', x: 200, y: 440, visible: true, status: 'idle' },
            { entity_id: 'norman_cav', x: 160, y: 480, visible: true, status: 'idle' },
            { entity_id: 'william', x: 200, y: 400, visible: true, status: 'idle' },
            { entity_id: 'saxon_wall', x: 460, y: 330, visible: true, status: 'defending' },
            { entity_id: 'saxon_huscarls', x: 480, y: 360, visible: true, status: 'defending' },
            { entity_id: 'harold', x: 500, y: 310, visible: true, status: 'defending' }
          ],
          actions: [
            { type: 'bombard', actor_id: 'norman_archers', target_id: 'saxon_wall', from: { x: 120, y: 420 }, to: { x: 460, y: 330 }, label: 'Archer volleys' }
          ],
          effects: []
        },
        {
          step: 3,
          title: 'Infantry Charge',
          time_label: 'Midday',
          narration: 'Norman infantry and cavalry charged uphill but were repulsed by the formidable Anglo-Saxon shield wall. The Saxons\' two-handed axes proved devastating against the Norman foot soldiers.',
          entity_states: [
            { entity_id: 'norman_archers', x: 120, y: 420, visible: true, status: 'idle' },
            { entity_id: 'norman_inf', x: 320, y: 400, visible: true, status: 'attacking' },
            { entity_id: 'norman_cav', x: 340, y: 460, visible: true, status: 'attacking' },
            { entity_id: 'william', x: 280, y: 390, visible: true, status: 'idle' },
            { entity_id: 'saxon_wall', x: 460, y: 330, visible: true, status: 'defending' },
            { entity_id: 'saxon_huscarls', x: 480, y: 360, visible: true, status: 'idle' },
            { entity_id: 'harold', x: 500, y: 310, visible: true, status: 'idle' }
          ],
          actions: [
            { type: 'attack', actor_id: 'norman_inf', target_id: 'saxon_wall', from: { x: 320, y: 400 }, to: { x: 450, y: 340 }, label: 'Infantry charge' },
            { type: 'attack', actor_id: 'norman_cav', target_id: 'saxon_wall', from: { x: 340, y: 460 }, to: { x: 440, y: 350 }, label: 'Cavalry charge' }
          ],
          effects: [
            { type: 'explosion', x: 440, y: 340, target_id: 'senlac_hill' }
          ]
        },
        {
          step: 4,
          title: 'Feigned Retreat',
          time_label: 'Afternoon',
          narration: 'William ordered his left flank to execute a feigned retreat. Anglo-Saxon troops, believing victory was near, broke formation and pursued downhill, fatally abandoning their shield wall advantage.',
          entity_states: [
            { entity_id: 'norman_archers', x: 80, y: 440, visible: true, status: 'retreating' },
            { entity_id: 'norman_inf', x: 240, y: 440, visible: true, status: 'retreating' },
            { entity_id: 'norman_cav', x: 200, y: 480, visible: true, status: 'moving' },
            { entity_id: 'william', x: 260, y: 400, visible: true, status: 'idle' },
            { entity_id: 'saxon_wall', x: 460, y: 330, visible: true, status: 'idle' },
            { entity_id: 'saxon_huscarls', x: 380, y: 400, visible: true, status: 'attacking' },
            { entity_id: 'harold', x: 460, y: 340, visible: true, status: 'idle' }
          ],
          actions: [
            { type: 'retreat', actor_id: 'norman_inf', target_id: null, from: { x: 320, y: 400 }, to: { x: 240, y: 440 }, label: 'Feigned flight' },
            { type: 'move', actor_id: 'saxon_huscarls', target_id: null, from: { x: 480, y: 360 }, to: { x: 380, y: 400 }, label: 'Saxons pursue' }
          ],
          effects: []
        },
        {
          step: 5,
          title: 'Cavalry Cuts Down Pursuers',
          time_label: 'Late Afternoon',
          narration: 'Norman cavalry wheeled around and slaughtered the disorganized Anglo-Saxon pursuers. The shield wall, now thinned, could no longer withstand the renewed Norman assault.',
          entity_states: [
            { entity_id: 'norman_archers', x: 180, y: 420, visible: true, status: 'attacking' },
            { entity_id: 'norman_inf', x: 340, y: 400, visible: true, status: 'attacking' },
            { entity_id: 'norman_cav', x: 360, y: 420, visible: true, status: 'attacking' },
            { entity_id: 'william', x: 300, y: 370, visible: true, status: 'idle' },
            { entity_id: 'saxon_wall', x: 460, y: 330, visible: true, status: 'defending' },
            { entity_id: 'saxon_huscarls', x: 380, y: 410, visible: true, status: 'defending' },
            { entity_id: 'harold', x: 470, y: 340, visible: true, status: 'defending' }
          ],
          actions: [
            { type: 'attack', actor_id: 'norman_cav', target_id: 'saxon_huscarls', from: { x: 360, y: 420 }, to: { x: 380, y: 410 }, label: 'Cavalry strikes' },
            { type: 'surround', actor_id: 'norman_inf', target_id: 'saxon_wall', from: { x: 340, y: 400 }, to: { x: 460, y: 330 }, label: 'Wall encircled' }
          ],
          effects: [
            { type: 'explosion', x: 390, y: 400, target_id: null },
            { type: 'smoke', x: 420, y: 380, target_id: null }
          ]
        },
        {
          step: 6,
          title: 'Harold Falls',
          time_label: 'Evening',
          narration: 'As evening approached, King Harold was struck in the eye by an arrow and killed. The leaderless Anglo-Saxon army collapsed. William had won the crown of England and would be known forever as William the Conqueror.',
          entity_states: [
            { entity_id: 'norman_archers', x: 300, y: 380, visible: true, status: 'idle' },
            { entity_id: 'norman_inf', x: 420, y: 340, visible: true, status: 'idle' },
            { entity_id: 'norman_cav', x: 440, y: 380, visible: true, status: 'idle' },
            { entity_id: 'william', x: 400, y: 280, visible: true, status: 'idle' },
            { entity_id: 'saxon_wall', x: 460, y: 330, visible: true, status: 'destroyed' },
            { entity_id: 'saxon_huscarls', x: 500, y: 420, visible: true, status: 'retreating' },
            { entity_id: 'harold', x: 480, y: 350, visible: true, status: 'destroyed' }
          ],
          actions: [
            { type: 'victory', actor_id: 'william', target_id: null, from: { x: 400, y: 280 }, to: { x: 400, y: 280 }, label: 'Norman Victory' }
          ],
          effects: [
            { type: 'victory_burst', x: 400, y: 240, target_id: null },
            { type: 'flag_change', x: 460, y: 290, target_id: 'senlac_hill' }
          ]
        }
      ]
    }
  }
];

// Entity type to icon mapping for the renderer
export const ENTITY_ICONS = {
  infantry: 'soldier',
  cavalry: 'tank',
  artillery: 'artillery',
  commander: 'commander',
  base: 'base',
  tank: 'tank',
  naval: 'tank',
  air: 'tank'
};

// Status to color/variant mapping
export const STATUS_STYLES = {
  idle: { opacity: 1, dash: false },
  moving: { opacity: 1, dash: true },
  attacking: { opacity: 1, dash: false, pulse: true },
  defending: { opacity: 1, dash: false, glow: true },
  retreating: { opacity: 0.5, dash: true },
  destroyed: { opacity: 0.3, dash: false }
};

// Terrain type color mapping using museum tokens
export const TERRAIN_COLORS = {
  hill: '#2F6B55',
  river: 'rgba(47,107,85,0.4)',
  forest: '#1B4A2E',
  plain: 'transparent',
  fortification: '#6B5A4A',
  town: '#8A6E5A',
  coast: 'rgba(47,107,85,0.3)'
};

export default BATTLE_TEMPLATES;
