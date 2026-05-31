// Sample historical battle presets
// Each contains: name, description, and pre-generated timeline JSON

export const BATTLE_PRESETS = [
  {
    id: 'dien-bien-phu',
    name: 'Dien Bien Phu (1954)',
    description: `In early March 1954, the Viet Minh forces under General Vo Nguyen Giap began surrounding the French garrison at Dien Bien Phu valley. The French had established a fortified base with multiple strongpoints named after women: Beatrice, Gabrielle, Anne-Marie, and others.

On March 13, after weeks of artillery emplacement in the surrounding hills, the Viet Minh launched their first assault on Strongpoint Beatrice. Heavy artillery bombardment from the hills pounded French positions. By nightfall, Beatrice fell to Viet Minh infantry.

The battle continued for 56 days. Viet Minh artillery dominated from the high ground. French air supply became increasingly difficult. Trench warfare ensued as Viet Minh forces dug approach trenches closer to French positions.

On May 1, the final Viet Minh offensive began. Wave after wave of infantry assaulted the remaining French strongpoints. By May 7, the French central command bunker was captured. General de Castries surrendered, ending French colonial rule in Indochina.`
  },
  {
    id: 'hastings',
    name: 'Battle of Hastings (1066)',
    description: `On October 14, 1066, the Norman army of William the Conqueror faced King Harold's Anglo-Saxon forces near Hastings, England.

The Normans deployed in three divisions: the left under Alan of Brittany, the center under William himself, and the right under William FitzOsbern. The Anglo-Saxons formed a shield wall on Senlac Hill, a strong defensive position.

The battle began with Norman archers firing uphill at the shield wall, with limited effect. Norman infantry and cavalry then charged the hill but were repulsed. A rumor spread that William had been killed, causing panic on the Norman left flank.

William rallied his troops by lifting his helmet to show his face. He then ordered feigned retreats, which drew Anglo-Saxon troops off the hill. Breaking their shield wall proved fatal. Norman cavalry cut down the pursuing Saxons.

As evening approached, Harold was struck in the eye by an arrow and killed. The leaderless Anglo-Saxon army collapsed. William had won the crown of England.`
  },
  {
    id: 'waterloo',
    name: 'Waterloo (1815)',
    description: `On June 18, 1815, Napoleon Bonaparte faced the Duke of Wellington's Anglo-allied army and Blucher's Prussian army near Waterloo in present-day Belgium.

Napoleon delayed the battle start until the ground dried. At 11:30 AM, French artillery opened fire. The first French infantry attack targeted Hougoumont farm on Wellington's right, beginning an all-day struggle.

At 1 PM, d'Erlon's corps attacked Wellington's center-left, nearly breaking through. Heavy British cavalry counter-charged and drove them back but overextended and were mauled by French lancers.

Napoleon seized La Haye Sainte farm at 6 PM, critically weakening Wellington's center. But Prussian forces under Blucher were now arriving on Napoleon's right flank, drawing French reserves away.

Napoleon's final gamble, the Imperial Guard assault, was launched at 7:30 PM against Wellington's center. The British Guards rose from concealed positions and delivered devastating volleys. The Imperial Guard broke and retreated.

The French army collapsed. Napoleon fled the field. The Napoleonic Wars were effectively over.`
  }
];

// Pre-generated timeline JSON for each preset
// Map entity types: soldier, commander, base, tank, artillery, mountain, river, explosion, flag

export const BATTLE_TIMELINES = {
  'dien-bien-phu': {
    battle_name: 'Battle of Dien Bien Phu',
    year: 1954,
    actors: ['Viet Minh', 'French Army'],
    terrain: {
      type: 'valley',
      features: [
        { type: 'mountain', x: 0.05, y: 0.25, w: 0.35, h: 0.4 },
        { type: 'mountain', x: 0.6, y: 0.2, w: 0.35, h: 0.45 },
        { type: 'river', x: 0.1, y: 0.7, w: 0.8, h: 0.05 }
      ]
    },
    steps: [
      {
        step: 1,
        action: 'preparation',
        title: 'Preparation & Positioning',
        description: 'Viet Minh forces assemble in the western hills overlooking the Dien Bien Phu valley while French troops secure the fortified base.',
        narration: 'In early March 1954, the Viet Minh forces under General Vo Nguyen Giap began surrounding the French garrison. Thousands of troops and artillery pieces were laboriously hauled into the mountains.',
        entities: [
          { id: 'vm_inf_1', type: 'soldier', team: 'vietminh', x: 0.15, y: 0.5, count: 200, label: 'Viet Minh Infantry' },
          { id: 'vm_inf_2', type: 'soldier', team: 'vietminh', x: 0.25, y: 0.45, count: 150, label: 'Viet Minh Infantry' },
          { id: 'vm_art_1', type: 'artillery', team: 'vietminh', x: 0.1, y: 0.35, count: 20, label: 'Artillery' },
          { id: 'vm_comm', type: 'commander', team: 'vietminh', x: 0.2, y: 0.4, count: 1, label: 'Gen. Giap' },
          { id: 'fr_base_1', type: 'base', team: 'french', x: 0.55, y: 0.45, count: 1, label: 'Strongpoint Beatrice' },
          { id: 'fr_inf_1', type: 'soldier', team: 'french', x: 0.6, y: 0.5, count: 120, label: 'French Garrison' },
          { id: 'fr_comm', type: 'commander', team: 'french', x: 0.65, y: 0.4, count: 1, label: 'Gen. de Castries' }
        ]
      },
      {
        step: 2,
        action: 'move',
        title: 'Troop Movement',
        description: 'Viet Minh troops advance through the valley, moving toward French defensive positions.',
        narration: 'Having assembled their forces in the surrounding hills, Viet Minh divisions began advancing across the valley floor toward the French strongpoints.',
        animations: [
          { entity_id: 'vm_inf_1', from: { x: 0.15, y: 0.5 }, to: { x: 0.3, y: 0.5 }, duration: 2000 },
          { entity_id: 'vm_inf_2', from: { x: 0.25, y: 0.45 }, to: { x: 0.4, y: 0.45 }, duration: 2000 },
          { entity_id: 'vm_art_1', from: { x: 0.1, y: 0.35 }, to: { x: 0.25, y: 0.35 }, duration: 2500 }
        ],
        entities: [
          { id: 'vm_inf_1', type: 'soldier', team: 'vietminh', x: 0.3, y: 0.5, count: 190, label: 'Viet Minh Infantry' },
          { id: 'vm_inf_2', type: 'soldier', team: 'vietminh', x: 0.4, y: 0.45, count: 140, label: 'Viet Minh Infantry' },
          { id: 'vm_art_1', type: 'artillery', team: 'vietminh', x: 0.25, y: 0.35, count: 18, label: 'Artillery' },
          { id: 'vm_comm', type: 'commander', team: 'vietminh', x: 0.3, y: 0.4, count: 1, label: 'Gen. Giap' },
          { id: 'fr_base_1', type: 'base', team: 'french', x: 0.55, y: 0.45, count: 1, label: 'Strongpoint Beatrice' },
          { id: 'fr_inf_1', type: 'soldier', team: 'french', x: 0.6, y: 0.5, count: 110, label: 'French Garrison' },
          { id: 'fr_comm', type: 'commander', team: 'french', x: 0.65, y: 0.4, count: 1, label: 'Gen. de Castries' }
        ]
      },
      {
        step: 3,
        action: 'bombard',
        title: 'Artillery Bombardment',
        description: 'Viet Minh artillery opens fire on French positions. Shells rain down on the fortifications.',
        narration: 'On March 13, after weeks of artillery emplacement in the surrounding hills, the Viet Minh launched their bombardment. Heavy shells pounded the French positions mercilessly.',
        effects: [
          { type: 'explosion', x: 0.55, y: 0.42, size: 0.06 },
          { type: 'explosion', x: 0.6, y: 0.48, size: 0.05 },
          { type: 'explosion', x: 0.52, y: 0.5, size: 0.04 },
          { type: 'arrow', fromX: 0.12, fromY: 0.35, toX: 0.55, toY: 0.45 }
        ],
        animations: [],
        entities: [
          { id: 'vm_inf_1', type: 'soldier', team: 'vietminh', x: 0.3, y: 0.5, count: 190, label: 'Viet Minh Infantry' },
          { id: 'vm_inf_2', type: 'soldier', team: 'vietminh', x: 0.4, y: 0.45, count: 140, label: 'Viet Minh Infantry' },
          { id: 'vm_art_1', type: 'artillery', team: 'vietminh', x: 0.25, y: 0.35, count: 18, label: 'Artillery' },
          { id: 'vm_comm', type: 'commander', team: 'vietminh', x: 0.3, y: 0.4, count: 1, label: 'Gen. Giap' },
          { id: 'fr_base_1', type: 'base', team: 'french', x: 0.55, y: 0.45, count: 1, label: 'Strongpoint Beatrice', health: 0.5 },
          { id: 'fr_inf_1', type: 'soldier', team: 'french', x: 0.6, y: 0.52, count: 85, label: 'French Garrison' },
          { id: 'fr_comm', type: 'commander', team: 'french', x: 0.65, y: 0.4, count: 1, label: 'Gen. de Castries' }
        ]
      },
      {
        step: 4,
        action: 'attack',
        title: 'Infantry Assault',
        description: 'Viet Minh infantry launch a coordinated assault against the weakened French strongpoint.',
        narration: 'Infantry units launched a coordinated assault against the weakened defensive position. Viet Minh soldiers stormed the French stronghold from multiple directions.',
        effects: [
          { type: 'arrow', fromX: 0.35, fromY: 0.48, toX: 0.52, toY: 0.46 },
          { type: 'arrow', fromX: 0.42, fromY: 0.42, toX: 0.54, toY: 0.44 },
          { type: 'explosion', x: 0.56, y: 0.44, size: 0.04 }
        ],
        animations: [
          { entity_id: 'vm_inf_1', from: { x: 0.3, y: 0.5 }, to: { x: 0.45, y: 0.5 }, duration: 1500 },
          { entity_id: 'vm_inf_2', from: { x: 0.4, y: 0.45 }, to: { x: 0.5, y: 0.47 }, duration: 1500 }
        ],
        entities: [
          { id: 'vm_inf_1', type: 'soldier', team: 'vietminh', x: 0.45, y: 0.5, count: 160, label: 'Viet Minh Infantry' },
          { id: 'vm_inf_2', type: 'soldier', team: 'vietminh', x: 0.5, y: 0.47, count: 120, label: 'Viet Minh Infantry' },
          { id: 'vm_art_1', type: 'artillery', team: 'vietminh', x: 0.25, y: 0.35, count: 16, label: 'Artillery' },
          { id: 'vm_comm', type: 'commander', team: 'vietminh', x: 0.35, y: 0.4, count: 1, label: 'Gen. Giap' },
          { id: 'fr_base_1', type: 'base', team: 'french', x: 0.55, y: 0.45, count: 1, label: 'Beatrice', health: 0.2 },
          { id: 'fr_inf_1', type: 'soldier', team: 'french', x: 0.6, y: 0.52, count: 50, label: 'French Defense' },
          { id: 'fr_comm', type: 'commander', team: 'french', x: 0.65, y: 0.4, count: 1, label: 'Gen. de Castries' }
        ]
      },
      {
        step: 5,
        action: 'capture',
        title: 'Stronghold Captured',
        description: 'The French strongpoint falls. Viet Minh flag is raised over Beatrice.',
        narration: 'By nightfall, Beatrice fell to Viet Minh infantry. The French flag was lowered and replaced with the Viet Minh banner of victory.',
        effects: [
          { type: 'explosion', x: 0.55, y: 0.4, size: 0.05 },
          { type: 'smoke', x: 0.52, y: 0.38, size: 0.06 }
        ],
        entities: [
          { id: 'vm_inf_1', type: 'soldier', team: 'vietminh', x: 0.5, y: 0.48, count: 150, label: 'Viet Minh Infantry' },
          { id: 'vm_inf_2', type: 'soldier', team: 'vietminh', x: 0.55, y: 0.5, count: 110, label: 'Viet Minh Infantry' },
          { id: 'vm_flag', type: 'flag', team: 'vietminh', x: 0.55, y: 0.35, count: 1, label: 'Viet Minh Flag', color: '#e94560' },
          { id: 'vm_comm', type: 'commander', team: 'vietminh', x: 0.4, y: 0.42, count: 1, label: 'Gen. Giap' },
          { id: 'fr_base_1', type: 'base', team: 'french', x: 0.55, y: 0.45, count: 1, label: 'Beatrice', health: 0 },
          { id: 'fr_inf_1', type: 'soldier', team: 'french', x: 0.65, y: 0.55, count: 20, label: 'Retreating French' },
          { id: 'fr_comm', type: 'commander', team: 'french', x: 0.7, y: 0.45, count: 1, label: 'Gen. de Castries' }
        ]
      },
      {
        step: 6,
        action: 'victory',
        title: 'Victory',
        description: 'The battle is won. Viet Minh forces celebrate their decisive victory.',
        narration: 'After 56 days of siege, the French garrison surrendered. The Battle of Dien Bien Phu was a decisive Viet Minh victory that ended French colonial rule in Indochina.',
        effects: [
          { type: 'victory_star', x: 0.45, y: 0.3, size: 0.08 },
          { type: 'victory_star', x: 0.55, y: 0.25, size: 0.1 },
          { type: 'victory_star', x: 0.5, y: 0.35, size: 0.06 }
        ],
        entities: [
          { id: 'vm_inf_1', type: 'soldier', team: 'vietminh', x: 0.48, y: 0.48, count: 140, label: 'Victorious Viet Minh' },
          { id: 'vm_inf_2', type: 'soldier', team: 'vietminh', x: 0.55, y: 0.52, count: 100, label: 'Victorious Viet Minh' },
          { id: 'vm_flag', type: 'flag', team: 'vietminh', x: 0.55, y: 0.32, count: 1, label: 'Viet Minh Flag', color: '#e94560' },
          { id: 'vm_comm', type: 'commander', team: 'vietminh', x: 0.45, y: 0.4, count: 1, label: 'Gen. Giap' }
        ]
      }
    ]
  },
  'hastings': {
    battle_name: 'Battle of Hastings',
    year: 1066,
    actors: ['Norman Army', 'Anglo-Saxon Army'],
    terrain: {
      type: 'hill',
      features: [
        { type: 'mountain', x: 0.35, y: 0.3, w: 0.3, h: 0.4 }
      ]
    },
    steps: [
      {
        step: 1,
        action: 'preparation',
        title: 'Armies Deploy',
        description: 'The Normans deploy at the base of Senlac Hill while Anglo-Saxons form a shield wall at the top.',
        narration: 'On October 14, 1066, the Norman army of William the Conqueror faced the Anglo-Saxon forces of King Harold near Hastings.',
        entities: [
          { id: 'norm_arc', type: 'soldier', team: 'norman', x: 0.3, y: 0.6, count: 200, label: 'Norman Archers' },
          { id: 'norm_inf', type: 'soldier', team: 'norman', x: 0.4, y: 0.6, count: 300, label: 'Norman Infantry' },
          { id: 'norm_cav', type: 'tank', team: 'norman', x: 0.5, y: 0.6, count: 150, label: 'Norman Cavalry' },
          { id: 'norm_comm', type: 'commander', team: 'norman', x: 0.45, y: 0.55, count: 1, label: 'William' },
          { id: 'sax_wall', type: 'defensive_line', team: 'saxon', x: 0.3, y: 0.35, w: 0.4, h: 0, count: 1, label: 'Shield Wall' },
          { id: 'sax_inf', type: 'soldier', team: 'saxon', x: 0.45, y: 0.38, count: 400, label: 'Saxon Huscarls' },
          { id: 'sax_comm', type: 'commander', team: 'saxon', x: 0.48, y: 0.32, count: 1, label: 'King Harold' }
        ]
      },
      {
        step: 2,
        action: 'bombard',
        title: 'Norman Archer Barrage',
        description: 'Norman archers fire volleys uphill at the Saxon shield wall.',
        narration: 'The battle began with Norman archers firing uphill at the Anglo-Saxon shield wall with limited effect.',
        effects: [
          { type: 'arrow', fromX: 0.32, fromY: 0.58, toX: 0.42, toY: 0.4 },
          { type: 'arrow', fromX: 0.35, fromY: 0.58, toX: 0.48, toY: 0.38 },
          { type: 'arrow', fromX: 0.33, fromY: 0.57, toX: 0.38, toY: 0.42 }
        ],
        entities: [
          { id: 'norm_arc', type: 'soldier', team: 'norman', x: 0.3, y: 0.6, count: 190, label: 'Norman Archers' },
          { id: 'norm_inf', type: 'soldier', team: 'norman', x: 0.4, y: 0.6, count: 300, label: 'Norman Infantry' },
          { id: 'norm_cav', type: 'tank', team: 'norman', x: 0.5, y: 0.6, count: 150, label: 'Norman Cavalry' },
          { id: 'norm_comm', type: 'commander', team: 'norman', x: 0.45, y: 0.55, count: 1, label: 'William' },
          { id: 'sax_wall', type: 'defensive_line', team: 'saxon', x: 0.3, y: 0.35, w: 0.4, h: 0, count: 1, label: 'Shield Wall' },
          { id: 'sax_inf', type: 'soldier', team: 'saxon', x: 0.45, y: 0.38, count: 380, label: 'Saxon Huscarls' },
          { id: 'sax_comm', type: 'commander', team: 'saxon', x: 0.48, y: 0.32, count: 1, label: 'King Harold' }
        ]
      },
      {
        step: 3,
        action: 'attack',
        title: 'Norman Infantry Charge',
        description: 'Norman infantry and cavalry charge uphill but are repulsed by the shield wall.',
        narration: 'Norman infantry and cavalry charged the hill but were repulsed by the formidable Saxon shield wall.',
        effects: [
          { type: 'arrow', fromX: 0.38, fromY: 0.58, toX: 0.43, toY: 0.42 },
          { type: 'arrow', fromX: 0.48, fromY: 0.58, toX: 0.47, toY: 0.42 },
          { type: 'explosion', x: 0.43, y: 0.4, size: 0.04 }
        ],
        animations: [
          { entity_id: 'norm_inf', from: { x: 0.4, y: 0.6 }, to: { x: 0.4, y: 0.5 }, duration: 2000 },
          { entity_id: 'norm_cav', from: { x: 0.5, y: 0.6 }, to: { x: 0.5, y: 0.5 }, duration: 2000 }
        ],
        entities: [
          { id: 'norm_arc', type: 'soldier', team: 'norman', x: 0.3, y: 0.6, count: 180, label: 'Norman Archers' },
          { id: 'norm_inf', type: 'soldier', team: 'norman', x: 0.4, y: 0.5, count: 250, label: 'Norman Infantry' },
          { id: 'norm_cav', type: 'tank', team: 'norman', x: 0.5, y: 0.5, count: 120, label: 'Norman Cavalry' },
          { id: 'norm_comm', type: 'commander', team: 'norman', x: 0.45, y: 0.55, count: 1, label: 'William' },
          { id: 'sax_wall', type: 'defensive_line', team: 'saxon', x: 0.3, y: 0.35, w: 0.4, h: 0, count: 1, label: 'Shield Wall' },
          { id: 'sax_inf', type: 'soldier', team: 'saxon', x: 0.45, y: 0.38, count: 340, label: 'Saxon Huscarls' },
          { id: 'sax_comm', type: 'commander', team: 'saxon', x: 0.48, y: 0.32, count: 1, label: 'King Harold' }
        ]
      },
      {
        step: 4,
        action: 'retreat',
        title: 'Feigned Retreat',
        description: 'Normans execute a feigned retreat, drawing Saxons off the hill.',
        narration: 'William ordered feigned retreats which drew Anglo-Saxon troops off the hill, breaking their defensive shield wall.',
        effects: [
          { type: 'arrow', fromX: 0.48, fromY: 0.4, toX: 0.35, toY: 0.55 }
        ],
        animations: [
          { entity_id: 'norm_inf', from: { x: 0.4, y: 0.5 }, to: { x: 0.3, y: 0.58 }, duration: 2000 },
          { entity_id: 'norm_cav', from: { x: 0.5, y: 0.5 }, to: { x: 0.45, y: 0.6 }, duration: 2000 },
          { entity_id: 'sax_inf', from: { x: 0.45, y: 0.38 }, to: { x: 0.35, y: 0.5 }, duration: 2500 }
        ],
        entities: [
          { id: 'norm_arc', type: 'soldier', team: 'norman', x: 0.3, y: 0.6, count: 170, label: 'Norman Archers' },
          { id: 'norm_inf', type: 'soldier', team: 'norman', x: 0.3, y: 0.58, count: 220, label: 'Norman Infantry' },
          { id: 'norm_cav', type: 'tank', team: 'norman', x: 0.45, y: 0.6, count: 100, label: 'Norman Cavalry' },
          { id: 'norm_comm', type: 'commander', team: 'norman', x: 0.4, y: 0.6, count: 1, label: 'William' },
          { id: 'sax_wall', type: 'defensive_line', team: 'saxon', x: 0.3, y: 0.35, w: 0.3, h: 0, count: 1, label: 'Shield Wall' },
          { id: 'sax_inf', type: 'soldier', team: 'saxon', x: 0.35, y: 0.5, count: 250, label: 'Saxon Huscarls' },
          { id: 'sax_comm', type: 'commander', team: 'saxon', x: 0.4, y: 0.38, count: 1, label: 'King Harold' }
        ]
      },
      {
        step: 5,
        action: 'attack',
        title: 'Norman Cavalry Cuts Down Saxons',
        description: 'Norman cavalry wheels around and slaughters the pursuing Saxons.',
        narration: 'Norman cavalry turned and cut down the pursuing Anglo-Saxon troops who had broken formation.',
        effects: [
          { type: 'explosion', x: 0.38, y: 0.52, size: 0.05 },
          { type: 'explosion', x: 0.42, y: 0.48, size: 0.04 }
        ],
        entities: [
          { id: 'norm_arc', type: 'soldier', team: 'norman', x: 0.3, y: 0.6, count: 160, label: 'Norman Archers' },
          { id: 'norm_inf', type: 'soldier', team: 'norman', x: 0.35, y: 0.58, count: 200, label: 'Norman Infantry' },
          { id: 'norm_cav', type: 'tank', team: 'norman', x: 0.42, y: 0.48, count: 90, label: 'Norman Cavalry' },
          { id: 'norm_comm', type: 'commander', team: 'norman', x: 0.4, y: 0.55, count: 1, label: 'William' },
          { id: 'sax_wall', type: 'defensive_line', team: 'saxon', x: 0.3, y: 0.35, w: 0.2, h: 0, count: 1, label: 'Shield Wall' },
          { id: 'sax_inf', type: 'soldier', team: 'saxon', x: 0.38, y: 0.5, count: 100, label: 'Saxon Huscarls' },
          { id: 'sax_comm', type: 'commander', team: 'saxon', x: 0.44, y: 0.36, count: 1, label: 'King Harold', health: 0.3 }
        ]
      },
      {
        step: 6,
        action: 'victory',
        title: 'King Harold Falls & Norman Victory',
        description: 'Harold is killed by an arrow. The Saxon army collapses. William claims victory.',
        narration: 'As evening approached, Harold was struck in the eye by an arrow and killed. The leaderless Anglo-Saxon army collapsed. William had won the crown of England.',
        effects: [
          { type: 'victory_star', x: 0.4, y: 0.25, size: 0.1 },
          { type: 'explosion', x: 0.45, y: 0.4, size: 0.05 }
        ],
        entities: [
          { id: 'norm_arc', type: 'soldier', team: 'norman', x: 0.3, y: 0.6, count: 150, label: 'Norman Archers' },
          { id: 'norm_inf', type: 'soldier', team: 'norman', x: 0.42, y: 0.55, count: 180, label: 'Norman Infantry' },
          { id: 'norm_cav', type: 'tank', team: 'norman', x: 0.48, y: 0.5, count: 80, label: 'Norman Cavalry' },
          { id: 'norm_flag', type: 'flag', team: 'norman', x: 0.45, y: 0.25, count: 1, label: 'Norman Banner', color: '#d4a574' },
          { id: 'norm_comm', type: 'commander', team: 'norman', x: 0.45, y: 0.45, count: 1, label: 'King William' }
        ]
      }
    ]
  },
  'waterloo': {
    battle_name: 'Battle of Waterloo',
    year: 1815,
    actors: ['French Army', 'Anglo-Allied Army', 'Prussian Army'],
    terrain: {
      type: 'plain',
      features: [
        { type: 'river', x: 0.7, y: 0.55, w: 0.25, h: 0.08 }
      ]
    },
    steps: [
      {
        step: 1,
        action: 'preparation',
        title: 'Armies Deploy',
        description: 'Napoleon positions his forces opposite Wellington\'s ridge. Prussian forces march from the east.',
        narration: 'On June 18, 1815, Napoleon\'s French army faced Wellington\'s Anglo-allied forces near Waterloo. Blucher\'s Prussians were approaching.',
        entities: [
          { id: 'fr_art', type: 'artillery', team: 'french', x: 0.25, y: 0.55, count: 60, label: 'Grand Battery' },
          { id: 'fr_inf', type: 'soldier', team: 'french', x: 0.3, y: 0.5, count: 400, label: 'French Infantry' },
          { id: 'fr_cav', type: 'tank', team: 'french', x: 0.35, y: 0.45, count: 200, label: 'French Cavalry' },
          { id: 'fr_comm', type: 'commander', team: 'french', x: 0.28, y: 0.4, count: 1, label: 'Napoleon' },
          { id: 'uk_base', type: 'base', team: 'british', x: 0.55, y: 0.4, count: 1, label: 'Wellington HQ' },
          { id: 'uk_inf', type: 'soldier', team: 'british', x: 0.55, y: 0.5, count: 300, label: 'British Infantry' },
          { id: 'uk_comm', type: 'commander', team: 'british', x: 0.6, y: 0.38, count: 1, label: 'Wellington' },
          { id: 'pr_inf', type: 'soldier', team: 'prussian', x: 0.85, y: 0.55, count: 250, label: 'Prussian Army' }
        ]
      },
      {
        step: 2,
        action: 'bombard',
        title: 'French Artillery Opens Fire',
        description: 'The Grand Battery begins bombardment of the Allied ridge.',
        narration: 'At 11:30 AM, Napoleon\'s Grand Battery opened fire. The French concentrated their artillery on Wellington\'s center.',
        effects: [
          { type: 'arrow', fromX: 0.28, fromY: 0.53, toX: 0.52, toY: 0.45 },
          { type: 'explosion', x: 0.52, y: 0.42, size: 0.05 },
          { type: 'explosion', x: 0.55, y: 0.48, size: 0.04 },
          { type: 'smoke', x: 0.25, y: 0.5, size: 0.04 }
        ],
        entities: [
          { id: 'fr_art', type: 'artillery', team: 'french', x: 0.25, y: 0.55, count: 58, label: 'Grand Battery' },
          { id: 'fr_inf', type: 'soldier', team: 'french', x: 0.3, y: 0.5, count: 400, label: 'French Infantry' },
          { id: 'fr_cav', type: 'tank', team: 'french', x: 0.35, y: 0.45, count: 200, label: 'French Cavalry' },
          { id: 'fr_comm', type: 'commander', team: 'french', x: 0.28, y: 0.4, count: 1, label: 'Napoleon' },
          { id: 'uk_base', type: 'base', team: 'british', x: 0.55, y: 0.4, count: 1, label: 'Wellington HQ', health: 0.8 },
          { id: 'uk_inf', type: 'soldier', team: 'british', x: 0.55, y: 0.5, count: 280, label: 'British Infantry' },
          { id: 'uk_comm', type: 'commander', team: 'british', x: 0.6, y: 0.38, count: 1, label: 'Wellington' },
          { id: 'pr_inf', type: 'soldier', team: 'prussian', x: 0.8, y: 0.55, count: 250, label: 'Prussian Army' }
        ]
      },
      {
        step: 3,
        action: 'attack',
        title: 'D\'Erlon\'s Attack',
        description: 'D\'Erlon\'s corps attacks Wellington\'s center-left. Heavy cavalry counter-charge.',
        narration: 'D\'Erlon\'s corps attacked Wellington\'s center. The British heavy cavalry counter-charged but were mauled by French lancers.',
        effects: [
          { type: 'arrow', fromX: 0.35, fromY: 0.5, toX: 0.5, toY: 0.48 },
          { type: 'arrow', fromX: 0.52, fromY: 0.48, toX: 0.38, toY: 0.52 }
        ],
        animations: [
          { entity_id: 'fr_inf', from: { x: 0.3, y: 0.5 }, to: { x: 0.42, y: 0.5 }, duration: 2000 },
          { entity_id: 'uk_inf', from: { x: 0.55, y: 0.5 }, to: { x: 0.48, y: 0.5 }, duration: 1500 }
        ],
        entities: [
          { id: 'fr_art', type: 'artillery', team: 'french', x: 0.25, y: 0.55, count: 55, label: 'Grand Battery' },
          { id: 'fr_inf', type: 'soldier', team: 'french', x: 0.42, y: 0.5, count: 320, label: 'D\'Erlon\'s Corps' },
          { id: 'fr_cav', type: 'tank', team: 'french', x: 0.35, y: 0.45, count: 180, label: 'French Cavalry' },
          { id: 'fr_comm', type: 'commander', team: 'french', x: 0.28, y: 0.4, count: 1, label: 'Napoleon' },
          { id: 'uk_base', type: 'base', team: 'british', x: 0.55, y: 0.4, count: 1, label: 'Wellington HQ', health: 0.7 },
          { id: 'uk_inf', type: 'soldier', team: 'british', x: 0.48, y: 0.5, count: 240, label: 'British Infantry' },
          { id: 'uk_comm', type: 'commander', team: 'british', x: 0.6, y: 0.38, count: 1, label: 'Wellington' },
          { id: 'pr_inf', type: 'soldier', team: 'prussian', x: 0.75, y: 0.55, count: 245, label: 'Prussian Army' }
        ]
      },
      {
        step: 4,
        action: 'move',
        title: 'Prussians Arrive',
        description: 'Blucher\'s Prussian forces arrive on the French right flank.',
        narration: 'Prussian forces under Blucher began arriving on Napoleon\'s right flank, forcing him to divert precious reserves.',
        effects: [
          { type: 'arrow', fromX: 0.75, fromY: 0.55, toX: 0.6, toY: 0.5 }
        ],
        animations: [
          { entity_id: 'pr_inf', from: { x: 0.75, y: 0.55 }, to: { x: 0.5, y: 0.58 }, duration: 2500 }
        ],
        entities: [
          { id: 'fr_art', type: 'artillery', team: 'french', x: 0.25, y: 0.55, count: 50, label: 'Grand Battery' },
          { id: 'fr_inf', type: 'soldier', team: 'french', x: 0.42, y: 0.5, count: 280, label: 'D\'Erlon\'s Corps' },
          { id: 'fr_cav', type: 'tank', team: 'french', x: 0.35, y: 0.45, count: 160, label: 'French Cavalry' },
          { id: 'fr_comm', type: 'commander', team: 'french', x: 0.28, y: 0.4, count: 1, label: 'Napoleon' },
          { id: 'uk_base', type: 'base', team: 'british', x: 0.55, y: 0.4, count: 1, label: 'Wellington HQ', health: 0.6 },
          { id: 'uk_inf', type: 'soldier', team: 'british', x: 0.5, y: 0.48, count: 210, label: 'British Infantry' },
          { id: 'uk_comm', type: 'commander', team: 'british', x: 0.6, y: 0.38, count: 1, label: 'Wellington' },
          { id: 'pr_inf', type: 'soldier', team: 'prussian', x: 0.5, y: 0.58, count: 230, label: 'Prussian Army' },
          { id: 'pr_comm', type: 'commander', team: 'prussian', x: 0.48, y: 0.6, count: 1, label: 'Blucher' }
        ]
      },
      {
        step: 5,
        action: 'attack',
        title: 'Imperial Guard Assault',
        description: 'Napoleon sends the Imperial Guard in a final desperate assault on Wellington\'s center.',
        narration: 'Napoleon\'s final gamble, the Imperial Guard assault, was launched against Wellington\'s center. The British Guards rose from concealment.',
        effects: [
          { type: 'arrow', fromX: 0.4, fromY: 0.48, toX: 0.52, toY: 0.43 },
          { type: 'explosion', x: 0.53, y: 0.42, size: 0.06 },
          { type: 'explosion', x: 0.5, y: 0.44, size: 0.05 }
        ],
        animations: [
          { entity_id: 'fr_inf', from: { x: 0.42, y: 0.5 }, to: { x: 0.5, y: 0.47 }, duration: 2000 }
        ],
        entities: [
          { id: 'fr_art', type: 'artillery', team: 'french', x: 0.25, y: 0.55, count: 45, label: 'Grand Battery' },
          { id: 'fr_inf', type: 'soldier', team: 'french', x: 0.5, y: 0.47, count: 200, label: 'Imperial Guard' },
          { id: 'fr_cav', type: 'tank', team: 'french', x: 0.35, y: 0.45, count: 120, label: 'French Cavalry' },
          { id: 'fr_comm', type: 'commander', team: 'french', x: 0.3, y: 0.4, count: 1, label: 'Napoleon' },
          { id: 'uk_base', type: 'base', team: 'british', x: 0.55, y: 0.4, count: 1, label: 'Wellington HQ', health: 0.4 },
          { id: 'uk_inf', type: 'soldier', team: 'british', x: 0.53, y: 0.44, count: 180, label: 'British Guards' },
          { id: 'uk_comm', type: 'commander', team: 'british', x: 0.6, y: 0.38, count: 1, label: 'Wellington' },
          { id: 'pr_inf', type: 'soldier', team: 'prussian', x: 0.45, y: 0.58, count: 210, label: 'Prussian Army' },
          { id: 'pr_comm', type: 'commander', team: 'prussian', x: 0.43, y: 0.6, count: 1, label: 'Blucher' }
        ]
      },
      {
        step: 6,
        action: 'victory',
        title: 'The Guard Retreats & Allied Victory',
        description: 'The Imperial Guard breaks and retreats. The French army collapses.',
        narration: 'The British Guards delivered devastating volleys. The Imperial Guard broke and retreated. The French army collapsed. Napoleon fled the field.',
        effects: [
          { type: 'victory_star', x: 0.5, y: 0.25, size: 0.1 },
          { type: 'victory_star', x: 0.6, y: 0.3, size: 0.08 }
        ],
        entities: [
          { id: 'fr_art', type: 'artillery', team: 'french', x: 0.15, y: 0.6, count: 30, label: 'Retreating Artillery' },
          { id: 'fr_inf', type: 'soldier', team: 'french', x: 0.2, y: 0.55, count: 80, label: 'Routing French' },
          { id: 'fr_comm', type: 'commander', team: 'french', x: 0.12, y: 0.5, count: 1, label: 'Napoleon' },
          { id: 'uk_base', type: 'base', team: 'british', x: 0.55, y: 0.4, count: 1, label: 'Wellington HQ' },
          { id: 'uk_flag', type: 'flag', team: 'british', x: 0.55, y: 0.28, count: 1, label: 'Victory', color: '#4a90d9' },
          { id: 'uk_inf', type: 'soldier', team: 'british', x: 0.52, y: 0.45, count: 160, label: 'Victorious British' },
          { id: 'uk_comm', type: 'commander', team: 'british', x: 0.58, y: 0.38, count: 1, label: 'Wellington' },
          { id: 'pr_inf', type: 'soldier', team: 'prussian', x: 0.4, y: 0.55, count: 180, label: 'Prussian Army' },
          { id: 'pr_comm', type: 'commander', team: 'prussian', x: 0.42, y: 0.6, count: 1, label: 'Blucher' }
        ]
      }
    ]
  }
};

// Team color mappings
export const TEAM_COLORS = {
  vietminh: '#e94560',
  french: '#4a90d9',
  norman: '#d4a574',
  saxon: '#e94560',
  british: '#4a90d9',
  prussian: '#2a4a2a'
};

// Action type metadata
export const ACTION_META = {
  preparation: { icon: '\u2699', label: 'Preparation' },
  move: { icon: '\u2192', label: 'Movement' },
  bombard: { icon: '\u2743', label: 'Bombardment' },
  attack: { icon: '\u2694', label: 'Assault' },
  retreat: { icon: '\u2190', label: 'Retreat' },
  defend: { icon: '\u26E8', label: 'Defense' },
  capture: { icon: '\u2691', label: 'Capture' },
  surround: { icon: '\u27B3', label: 'Surround' },
  victory: { icon: '\u2605', label: 'Victory' }
};
