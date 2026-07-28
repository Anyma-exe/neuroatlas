import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { useState } from 'react';

type Language = 'fr' | 'en';
type Mode = 'regions' | 'functions' | 'diseases';

interface RegionInfo {
  label: string;
  function: string;
  structures: string;
  study: string;
}

const REGION_INFO: Record<Language, Record<string, RegionInfo>> = {
  fr: {
    frontal: { label: 'Lobe frontal', function: 'Fonctions exécutives, planification, prise de décision, contrôle moteur volontaire, langage expressif (aire de Broca).', structures: 'Cortex préfrontal, cortex moteur primaire, aire de Broca.', study: "Les lésions frontales sont associées à des troubles du contrôle des impulsions et de la planification (étude de cas historique de Phineas Gage)." },
    parietal: { label: 'Lobe pariétal', function: 'Intégration sensorielle (toucher, température, douleur), perception spatiale, coordination visuo-motrice.', structures: 'Cortex somatosensoriel primaire, cortex pariétal postérieur.', study: "Impliqué dans le traitement de l'espace péripersonnel et les troubles de négligence spatiale unilatérale." },
    occipital: { label: 'Lobe occipital', function: 'Traitement visuel primaire et intégration des informations visuelles complexes.', structures: 'Cortex visuel primaire (V1), aires visuelles associatives.', study: 'Des lésions bilatérales peuvent causer une cécité corticale malgré des yeux fonctionnels.' },
    temporal: { label: 'Lobe temporal', function: 'Traitement auditif, compréhension du langage (aire de Wernicke), mémoire déclarative.', structures: "Cortex auditif primaire, aire de Wernicke, hippocampe (structure profonde associée).", study: "Les lésions de l'aire de Wernicke provoquent une aphasie fluente avec troubles de compréhension." },
    cerebellum: { label: 'Cervelet', function: 'Coordination motrice fine, équilibre, apprentissage moteur, et contribution à certaines fonctions cognitives.', structures: 'Cortex cérébelleux, noyaux cérébelleux profonds.', study: 'Des atteintes cérébelleuses provoquent une ataxie (troubles de la coordination des mouvements).' },
    brainstem: { label: 'Tronc cérébral', function: 'Régulation des fonctions vitales (respiration, rythme cardiaque), relais entre cerveau et moelle épinière, vigilance.', structures: 'Mésencéphale, pont (pons), bulbe rachidien.', study: 'Le tronc cérébral est le siège de la formation réticulée, impliquée dans la régulation de l\'état de conscience.' },
  },
  en: {
    frontal: { label: 'Frontal lobe', function: "Executive functions, planning, decision-making, voluntary motor control, expressive language (Broca's area).", structures: "Prefrontal cortex, primary motor cortex, Broca's area.", study: "Frontal lesions are linked to impaired impulse control and planning (historical case study of Phineas Gage)." },
    parietal: { label: 'Parietal lobe', function: 'Sensory integration (touch, temperature, pain), spatial perception, visuomotor coordination.', structures: 'Primary somatosensory cortex, posterior parietal cortex.', study: 'Involved in peripersonal space processing and unilateral spatial neglect.' },
    occipital: { label: 'Occipital lobe', function: 'Primary visual processing and integration of complex visual information.', structures: 'Primary visual cortex (V1), associative visual areas.', study: 'Bilateral lesions can cause cortical blindness despite intact eyes.' },
    temporal: { label: 'Temporal lobe', function: "Auditory processing, language comprehension (Wernicke's area), declarative memory.", structures: "Primary auditory cortex, Wernicke's area, hippocampus (associated deep structure).", study: "Lesions to Wernicke's area cause fluent aphasia with comprehension deficits." },
    cerebellum: { label: 'Cerebellum', function: 'Fine motor coordination, balance, motor learning, and contributions to certain cognitive functions.', structures: 'Cerebellar cortex, deep cerebellar nuclei.', study: 'Cerebellar damage causes ataxia (impaired movement coordination).' },
    brainstem: { label: 'Brainstem', function: 'Regulation of vital functions (breathing, heart rate), relay between brain and spinal cord, alertness.', structures: 'Midbrain, pons, medulla oblongata.', study: 'The brainstem houses the reticular formation, involved in regulating consciousness.' },
  },
};

interface Connection {
  from: string;
  to: string;
  type: string;
  strength: number;
  direction: 'bidirectional' | 'unidirectional';
  role: Record<Language, string>;
}

const CONNECTIONS: Connection[] = [
  { from: 'frontal', to: 'parietal', type: 'structural', strength: 0.78, direction: 'bidirectional', role: { fr: 'Attention et contrôle moteur', en: 'Attention and motor control' } },
  { from: 'frontal', to: 'temporal', type: 'structural', strength: 0.65, direction: 'bidirectional', role: { fr: 'Langage et mémoire de travail', en: 'Language and working memory' } },
  { from: 'temporal', to: 'occipital', type: 'functional', strength: 0.6, direction: 'bidirectional', role: { fr: 'Reconnaissance visuelle et sémantique', en: 'Visual and semantic recognition' } },
  { from: 'parietal', to: 'occipital', type: 'structural', strength: 0.7, direction: 'bidirectional', role: { fr: 'Guidage visuo-spatial du mouvement', en: 'Visuospatial guidance of movement' } },
  { from: 'cerebellum', to: 'brainstem', type: 'structural', strength: 0.85, direction: 'bidirectional', role: { fr: 'Coordination motrice et équilibre', en: 'Motor coordination and balance' } },
  { from: 'frontal', to: 'brainstem', type: 'functional', strength: 0.5, direction: 'unidirectional', role: { fr: 'Contrôle descendant de la vigilance', en: 'Top-down control of alertness' } },
];

interface GroupDef {
  id: string;
  label: Record<Language, string>;
  description: Record<Language, string>;
  color: string;
  regions: string[];
}

const NETWORKS: GroupDef[] = [
  { id: 'dmn', label: { fr: 'Réseau du mode par défaut (DMN)', en: 'Default Mode Network (DMN)' }, description: { fr: '', en: '' }, color: '#6C63FF', regions: ['frontal', 'parietal', 'temporal'] },
{ id: 'salience', label: { fr: 'Réseau de saillance', en: 'Salience Network' }, description: { fr: '', en: '' }, color: '#00B8A9', regions: ['frontal', 'temporal', 'brainstem'] }, ];

const FUNCTIONS: GroupDef[] = [
  { id: 'memory', label: { fr: 'Mémoire', en: 'Memory' }, description: { fr: 'Encodage, consolidation et récupération des souvenirs déclaratifs, fortement associés au lobe temporal.', en: 'Encoding, consolidation and retrieval of declarative memories, strongly associated with the temporal lobe.' }, color: '#E07A5F', regions: ['temporal', 'frontal'] },
  { id: 'attention', label: { fr: 'Attention', en: 'Attention' }, description: { fr: 'Sélection et maintien du focus cognitif sur une information pertinente, impliquant un réseau fronto-pariétal.', en: 'Selecting and sustaining cognitive focus on relevant information, involving a fronto-parietal network.' }, color: '#E07A5F', regions: ['frontal', 'parietal'] },
  { id: 'language', label: { fr: 'Langage', en: 'Language' }, description: { fr: "Production et compréhension du langage, réparties entre l'aire de Broca (frontale) et l'aire de Wernicke (temporale).", en: "Language production and comprehension, distributed between Broca's area (frontal) and Wernicke's area (temporal)." }, color: '#E07A5F', regions: ['frontal', 'temporal'] },
  { id: 'vision', label: { fr: 'Vision', en: 'Vision' }, description: { fr: 'Traitement des informations visuelles, principalement dans le cortex occipital.', en: 'Processing of visual information, mainly in the occipital cortex.' }, color: '#E07A5F', regions: ['occipital'] },
  { id: 'motor', label: { fr: 'Coordination motrice', en: 'Motor coordination' }, description: { fr: 'Ajustement fin des mouvements volontaires, impliquant le cervelet et le cortex moteur frontal.', en: 'Fine-tuning of voluntary movements, involving the cerebellum and frontal motor cortex.' }, color: '#E07A5F', regions: ['cerebellum', 'frontal'] },
];

const DISEASES: GroupDef[] = [
  { id: 'alzheimer', label: { fr: 'Alzheimer', en: "Alzheimer's disease" }, description: { fr: "Maladie neurodégénérative provoquant un déclin progressif de la mémoire et des fonctions cognitives, touchant notamment l'hippocampe et le cortex temporo-pariétal.", en: 'A neurodegenerative disease causing progressive decline in memory and cognitive functions, notably affecting the hippocampus and temporo-parietal cortex.' }, color: '#f7c319', regions: ['temporal', 'parietal'] },
  { id: 'parkinson', label: { fr: 'Parkinson', en: "Parkinson's disease" }, description: { fr: 'Trouble moteur progressif lié à la dégénérescence de neurones dopaminergiques, affectant la coordination et l\'équilibre.', en: 'A progressive motor disorder linked to the degeneration of dopaminergic neurons, affecting coordination and balance.' }, color: '#facf43', regions: ['cerebellum', 'brainstem'] },
  { id: 'adhd', label: { fr: 'TDAH', en: 'ADHD' }, description: { fr: "Trouble neurodéveloppemental affectant l'attention, le contrôle des impulsions, lié à des différences dans le cortex préfrontal.", en: 'A neurodevelopmental disorder affecting attention and impulse control, linked to differences in the prefrontal cortex.' }, color: '#fcdb6d', regions: ['frontal'] },
];

const NEUTRAL_GRAY = '#c7cdd1';
const OVERLAP_COLOR = '#B565A7';

function computeOverlayColor(
  lobeId: string,
  baseColor: string,
  activeIds: string[],
  defs: GroupDef[]
): string {
  if (activeIds.length === 0) return baseColor;
  const memberOf = defs.filter((d) => activeIds.includes(d.id) && d.regions.includes(lobeId));
  if (memberOf.length === 0) return NEUTRAL_GRAY;
  if (memberOf.length > 1) return OVERLAP_COLOR;
  return memberOf[0].color;
}

interface LobeMeta {
  id: string;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
}

const LOBES: LobeMeta[] = [
  { id: 'frontal', position: [0.7, 0.25, 0.4], scale: [1.15, 0.95, 1.05], color: '#7ec8e3' },
  { id: 'parietal', position: [-0.35, 0.4, 0], scale: [0.95, 0.85, 1.05], color: '#a3d9d3' },
  { id: 'occipital', position: [-1.0, 0.15, -0.2], scale: [0.75, 0.75, 0.75], color: '#5aa9c9' },
  { id: 'temporal', position: [0.5, -0.3, 0.5], scale: [0.95, 0.55, 0.65], color: '#8fb8d9' },
  { id: 'cerebellum', position: [-0.8, -0.5, -0.3], scale: [0.65, 0.55, 0.65], color: '#4a90a4' },
  { id: 'brainstem', position: [-0.2, -0.9, -0.15], scale: [0.32, 0.6, 0.32], color: '#c9a17e' },
];

const LOBE_POSITIONS: Record<string, [number, number, number]> = Object.fromEntries(
  LOBES.map((l) => [l.id, l.position])
);

interface LobeProps extends LobeMeta {
  onSelect: (id: string) => void;
  isSelected: boolean;
  displayColor: string;
}

function Lobe({ id, position, scale, displayColor, onSelect, isSelected }: LobeProps) {
  return (
    <mesh position={position} scale={scale} onClick={(e) => { e.stopPropagation(); onSelect(id); }}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={displayColor}
        roughness={0.5}
        metalness={0.1}
        emissive={isSelected ? displayColor : '#000000'}
        emissiveIntensity={isSelected ? 0.3 : 0}
      />
    </mesh>
  );
}

function getArcPoints(from: [number, number, number], to: [number, number, number], arcHeight = 1.4): [number, number, number][] {
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  const len = Math.sqrt(mid[0] ** 2 + mid[1] ** 2 + mid[2] ** 2) || 1;
  const control: [number, number, number] = [
    (mid[0] / len) * arcHeight + mid[0] * 0.3,
    (mid[1] / len) * arcHeight + mid[1] * 0.3 + 0.5,
    (mid[2] / len) * arcHeight + mid[2] * 0.3,
  ];
  const points: [number, number, number][] = [];
  const segments = 24;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    points.push([
      (1 - t) ** 2 * from[0] + 2 * (1 - t) * t * control[0] + t ** 2 * to[0],
      (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * control[1] + t ** 2 * to[1],
      (1 - t) ** 2 * from[2] + 2 * (1 - t) * t * control[2] + t ** 2 * to[2],
    ]);
  }
  return points;
}

function getAtrophyFactor(age: number): number {
  // 0 = pas d'atrophie (jeune adulte), monte progressivement après 40 ans
  if (age <= 25) return 0;
  return Math.min((age - 25) / 65, 1); // atteint son max (1) vers 90 ans
}

function ConnectionLines({ regionId }: { regionId: string }) {
  const related = CONNECTIONS.filter((c) => c.from === regionId || c.to === regionId);
  return (
    <>
      {related.map((c, i) => {
        const points = getArcPoints(LOBE_POSITIONS[c.from], LOBE_POSITIONS[c.to]);
        return (
          <group key={i}>
            <Line points={points} color="#4de3ff" lineWidth={8} transparent opacity={0.25} depthTest={false} renderOrder={999} />
            <Line points={points} color="#c9f6ff" lineWidth={2} transparent opacity={0.95} depthTest={false} renderOrder={999} />
          </group>
        );
      })}
    </>
  );
}

export default function App() {
  const [mode, setMode] = useState<Mode>('regions');
  const [selected, setSelected] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('fr');
  const [showConnections, setShowConnections] = useState(false);
  const [activeNetworks, setActiveNetworks] = useState<string[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [activeDiseases, setActiveDiseases] = useState<string[]>([]);

  const info = selected ? REGION_INFO[language][selected] : null;
  const relatedConnections = selected ? CONNECTIONS.filter((c) => c.from === selected || c.to === selected) : [];

  const toggleNetwork = (id: string) => setActiveNetworks((prev) => prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]);
  const toggleDisease = (id: string) => setActiveDiseases((prev) => prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]);

  const [age, setAge] = useState(30);
  const atrophy = getAtrophyFactor(age);

  const displayColorFor = (lobeId: string, baseColor: string) => {
    if (mode === 'functions') {
      return computeOverlayColor(lobeId, baseColor, selectedFunction ? [selectedFunction] : [], FUNCTIONS);
    }
    if (mode === 'diseases') {
      return computeOverlayColor(lobeId, baseColor, activeDiseases, DISEASES);
    }
    return computeOverlayColor(lobeId, baseColor, activeNetworks, NETWORKS);
  };

  const t = {
    function: language === 'fr' ? 'Fonction' : 'Function',
    structures: language === 'fr' ? 'Structures associées' : 'Related structures',
    study: language === 'fr' ? 'Étude clé' : 'Key study',
    showConnections: language === 'fr' ? 'Afficher les connexions' : 'Show connections',
    connections: language === 'fr' ? 'Connexions' : 'Connections',
    type: language === 'fr' ? 'Type' : 'Type',
    strength: language === 'fr' ? 'Force' : 'Strength',
    direction: language === 'fr' ? 'Direction' : 'Direction',
    role: language === 'fr' ? 'Rôle' : 'Role',
    bidirectional: language === 'fr' ? 'Bidirectionnel' : 'Bidirectional',
    unidirectional: language === 'fr' ? 'Unidirectionnel' : 'Unidirectional',
    networks: language === 'fr' ? 'Réseaux' : 'Networks',
    overlap: language === 'fr' ? 'Chevauchement' : 'Overlap',
    modeRegions: language === 'fr' ? 'Régions' : 'Regions',
    modeFunctions: language === 'fr' ? 'Fonctions' : 'Functions',
    modeDiseases: language === 'fr' ? 'Maladies' : 'Diseases',
    pickFunction: language === 'fr' ? 'Choisissez une fonction' : 'Choose a function',
    pickDiseases: language === 'fr' ? 'Sélectionnez une ou plusieurs maladies' : 'Select one or more diseases',
    affectedRegions: language === 'fr' ? 'Régions impliquées' : 'Involved regions',
  };

  const modeButtonStyle = (m: Mode) => ({
    padding: '6px 14px', borderRadius: '6px', border: '1px solid #7ec8e3', cursor: 'pointer',
    fontFamily: 'sans-serif', background: mode === m ? '#7ec8e3' : '#ffffff', color: mode === m ? '#ffffff' : '#1a3c4a',
  });

  return (
    <div style={{ width: '100%', height: '100vh', background: '#f5f9fc', display: 'flex' }}>
      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, display: 'flex', gap: '8px' }}>
          <button style={modeButtonStyle('regions')} onClick={() => setMode('regions')}>{t.modeRegions}</button>
          <button style={modeButtonStyle('functions')} onClick={() => setMode('functions')}>{t.modeFunctions}</button>
          <button style={modeButtonStyle('diseases')} onClick={() => setMode('diseases')}>{t.modeDiseases}</button>
          <button onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #7ec8e3', background: '#ffffff', color: '#1a3c4a', cursor: 'pointer', fontFamily: 'sans-serif' }}>
            {language === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>

        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <hemisphereLight args={['#ffffff', '#c9d9e3', 0.9]} />
          <directionalLight position={[3, 4, 5]} intensity={0.5} />
          {LOBES.map((lobe) => {
  const shrink = 1 - atrophy * 0.15; // jusqu'à 15% plus petit à 90 ans
  const scaledDown: [number, number, number] = [
    lobe.scale[0] * shrink,
    lobe.scale[1] * shrink,
    lobe.scale[2] * shrink,
  ];
  return (
    <Lobe
      key={lobe.id}
      {...lobe}
      scale={scaledDown}
      displayColor={displayColorFor(lobe.id, lobe.color)}
      onSelect={setSelected}
      isSelected={mode === 'regions' && selected === lobe.id}
    />
  );
})}
          {mode === 'regions' && showConnections && selected && <ConnectionLines regionId={selected} />}
          <OrbitControls enablePan={false} />
        </Canvas>

        <div style={{
  position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
  background: '#ffffff', padding: '12px 20px', borderRadius: '10px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontFamily: 'sans-serif', color: '#1a3c4a',
  display: 'flex', alignItems: 'center', gap: '12px', width: '320px',
}}>
  <span style={{ fontSize: '0.9em', minWidth: '40px' }}>{age} {language === 'fr' ? 'ans' : 'yo'}</span>
  <input
    type="range"
    min={20}
    max={90}
    value={age}
    onChange={(e) => setAge(Number(e.target.value))}
    style={{ flex: 1 }}
  />
</div>

      </div>

      {mode === 'regions' && info && (
        <div style={{ width: '340px', padding: '24px', background: '#ffffff', borderLeft: '1px solid #d8e6ee', fontFamily: 'sans-serif', color: '#1a3c4a', overflowY: 'auto' }}>
          <h2 style={{ marginTop: 0, marginBottom: '16px', color: '#0D1546' }}>{info.label}</h2>
          <h4 style={{ color: '#5a7d8c', marginBottom: '4px' }}>{t.function}</h4>
          <p style={{ marginTop: 0 }}>{info.function}</p>
          <h4 style={{ color: '#5a7d8c', marginBottom: '4px' }}>{t.structures}</h4>
          <p style={{ marginTop: 0 }}>{info.structures}</p>
          <h4 style={{ color: '#5a7d8c', marginBottom: '4px' }}>{t.study}</h4>
          <p style={{ marginTop: 0, fontSize: '0.9em', fontStyle: 'italic' }}>{info.study}</p>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px', cursor: 'pointer' }}>
            <input type="checkbox" checked={showConnections} onChange={(e) => setShowConnections(e.target.checked)} />
            {t.showConnections}
          </label>

          {showConnections && relatedConnections.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ color: '#5a7d8c', marginBottom: '8px' }}>{t.connections}</h4>
              {relatedConnections.map((c, i) => {
                const other = c.from === selected ? c.to : c.from;
                return (
                  <div key={i} style={{ marginBottom: '12px', padding: '10px', background: '#f5f9fc', borderRadius: '6px', fontSize: '0.9em' }}>
                    <strong>{REGION_INFO[language][other]?.label}</strong>
                    <div>{t.type}: {c.type}</div>
                    <div>{t.strength}: {c.strength}</div>
                    <div>{t.direction}: {c.direction === 'bidirectional' ? t.bidirectional : t.unidirectional}</div>
                    <div>{t.role}: {c.role[language]}</div>
                  </div>
                );
              })}
            </div>
          )}

          <h4 style={{ color: '#5a7d8c', marginTop: '20px', marginBottom: '8px' }}>{t.networks}</h4>
          {NETWORKS.map((net) => (
            <label key={net.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer' }}>
              <input type="checkbox" checked={activeNetworks.includes(net.id)} onChange={() => toggleNetwork(net.id)} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: net.color, display: 'inline-block' }} />
              {net.label[language]}
            </label>
          ))}
          {activeNetworks.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '0.85em', color: '#5a7d8c' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: OVERLAP_COLOR, display: 'inline-block' }} />
              {t.overlap}
            </div>
          )}
        </div>
      )}

      {mode === 'functions' && (
        <div style={{ width: '340px', padding: '24px', background: '#ffffff', borderLeft: '1px solid #d8e6ee', fontFamily: 'sans-serif', color: '#1a3c4a', overflowY: 'auto' }}>
          <h3 style={{ marginTop: 0, color: '#0D1546' }}>{t.pickFunction}</h3>
          {FUNCTIONS.map((f) => (
            <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
              <input type="radio" name="function" checked={selectedFunction === f.id} onChange={() => setSelectedFunction(f.id)} />
              {f.label[language]}
            </label>
          ))}
          {selectedFunction && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#f5f9fc', borderRadius: '6px' }}>
              <p style={{ marginTop: 0 }}>{FUNCTIONS.find((f) => f.id === selectedFunction)?.description[language]}</p>
              <h4 style={{ color: '#5a7d8c', marginBottom: '4px' }}>{t.affectedRegions}</h4>
              <p style={{ margin: 0 }}>{FUNCTIONS.find((f) => f.id === selectedFunction)?.regions.map((r) => REGION_INFO[language][r]?.label).join(', ')}</p>
            </div>
          )}
        </div>
      )}

      {mode === 'diseases' && (
        <div style={{ width: '340px', padding: '24px', background: '#ffffff', borderLeft: '1px solid #d8e6ee', fontFamily: 'sans-serif', color: '#1a3c4a', overflowY: 'auto' }}>
          <h3 style={{ marginTop: 0, color: '#0D1546' }}>{t.pickDiseases}</h3>
          {DISEASES.map((d) => (
            <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={activeDiseases.includes(d.id)} onChange={() => toggleDisease(d.id)} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color, display: 'inline-block' }} />
              {d.label[language]}
            </label>
          ))}
          {activeDiseases.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.85em', color: '#5a7d8c' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: OVERLAP_COLOR, display: 'inline-block' }} />
              {t.overlap}
            </div>
          )}
          {activeDiseases.map((id) => {
            const d = DISEASES.find((dd) => dd.id === id)!;
            return (
              <div key={id} style={{ marginTop: '12px', padding: '12px', background: '#f5f9fc', borderRadius: '6px' }}>
                <strong>{d.label[language]}</strong>
                <p style={{ marginTop: '6px', marginBottom: '6px' }}>{d.description[language]}</p>
                <div style={{ fontSize: '0.85em', color: '#5a7d8c' }}>{t.affectedRegions}: {d.regions.map((r) => REGION_INFO[language][r]?.label).join(', ')}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}