import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import {
  Activity,
  AlertTriangle,
  BadgeInfo,
  ChevronLeft,
  ChevronRight,
  Compass,
  Coins,
  Eye,
  FileText,
  Flag,
  Layers,
  LocateFixed,
  LoaderCircle,
  Map as MapIcon,
  Pause,
  Play,
  Radar,
  Radio,
  RotateCcw,
  RotateCw,
  ScrollText,
  Shield,
  SkipBack,
  SkipForward,
  Swords,
  Target,
  Upload,
  Users,
  View,
  Volume2,
  WandSparkles,
  X
} from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'motion/react'
import { toast } from 'react-toastify'
import CanvasRenderer from './CanvasRenderer'
import BATTLE_TEMPLATES from '~/data/battleTimelineData'
import { BASE_URL } from '~/constants/fe.constant'
import { cn } from '~/lib/utils'
import { selectCurrentAccessToken, selectCurrentUser } from '~/store/slices/authSlice'

const SPEEDS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '4x', value: 4 }
]

const PANEL_MODES = [
  { id: 'create', label: 'Create', icon: WandSparkles },
  { id: 'narration', label: 'Narration', icon: ScrollText },
  { id: 'forces', label: 'Forces', icon: Users },
  { id: 'actions', label: 'Actions', icon: Activity },
  { id: 'learn', label: 'Learn', icon: Shield }
]

const OVERLAY_OPTIONS = [
  { id: 'units', label: 'Units', icon: Users },
  { id: 'terrain', label: 'Terrain', icon: MapIcon },
  { id: 'actions', label: 'Actions', icon: Swords },
  { id: 'effects', label: 'Effects', icon: Radar },
  { id: 'labels', label: 'Labels', icon: BadgeInfo }
]

const ACTION_TENSE = {
  move: 'moved toward',
  attack: 'attacked',
  bombard: 'bombarded',
  capture: 'captured',
  retreat: 'retreated from',
  surround: 'surrounded',
  victory: 'declared victory'
}

const OUTCOME_LABELS = {
  attacker_victory: 'Attacker victory',
  defender_victory: 'Defender victory',
  stalemate: 'Stalemate'
}

const STATUS_LABELS = {
  idle: 'Ready',
  moving: 'Moving',
  attacking: 'Engaged',
  defending: 'Holding',
  retreating: 'Retreating',
  destroyed: 'Destroyed'
}

const DEFAULT_OVERLAYS = {
  units: true,
  terrain: true,
  actions: true,
  effects: true,
  labels: true
}

const GENERATION_PHASES = [
  'Analyzing battle events...',
  'Building timeline...',
  'Constructing scene...',
  'Rendering canvas...'
]

const SAMPLE_TEXT = `In early March 1954, Viet Minh forces under General Vo Nguyen Giap surrounded the French garrison at Dien Bien Phu. French troops held fortified strongpoints across the valley, while Viet Minh artillery was hidden in the surrounding hills.

On March 13, Viet Minh artillery opened fire on Strongpoint Beatrice and French positions across the valley. Infantry units advanced through trenches and assaulted the defenses after the bombardment weakened the perimeter.

Over the following weeks, Viet Minh forces tightened the siege, captured strongpoints, and cut off French air resupply. On May 7, the French command bunker fell and General de Castries surrendered.`

const FLAG_BY_KEYWORD = [
  [/viet|vpa|vietnam|minh/i, '🇻🇳'],
  [/french|france|fr_/i, '🇫🇷'],
  [/norman|william/i, '⚜️'],
  [/saxon|english|anglo/i, '🏴'],
  [/china|qing/i, '🇨🇳'],
  [/japan/i, '🇯🇵'],
  [/mongol/i, '🏳️'],
  [/cham/i, '🚩'],
  [/nguyen/i, '🟨'],
  [/tay son|tayson/i, '🔴'],
  [/khmer/i, '🇰🇭'],
  [/united states|american|usa/i, '🇺🇸']
]

function getFactionFlag(faction) {
  const haystack = `${faction?.id || ''} ${faction?.name || ''}`
  return FLAG_BY_KEYWORD.find(([pattern]) => pattern.test(haystack))?.[1] || '⚑'
}

function getTargetKey(target) {
  return target ? `${target.type}:${target.id}` : null
}

function formatTargetType(type) {
  if (!type) return 'Selection'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function unwrapApiData(payload) {
  return payload?.data ?? payload
}

function countWords(text = '') {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function estimateCost({ wordCount, includeVoice, mapWidth }) {
  const base = Math.max(20, Math.ceil(Math.max(wordCount, 1) / 150) * 10)
  const voice = includeVoice ? 20 : 0
  const sizeMultiplier = mapWidth > 900 ? 1.2 : 1
  return {
    breakdown: {
      base: Math.round(base * sizeMultiplier),
      voice,
      sizeMultiplier
    },
    total: Math.round(base * sizeMultiplier + voice)
  }
}

function templateToBattleRecord(template) {
  return {
    id: template.id,
    slug: template.id,
    name: template.timeline?.battle?.name || template.name,
    battleDate: template.timeline?.battle?.date,
    outcome: template.timeline?.battle?.outcome,
    summary: template.timeline?.battle?.summary || template.description,
    stepsCount: template.timeline?.steps?.length || 0,
    factions: template.timeline?.factions || [],
    source: 'demo'
  }
}

function normalizeBattleRecord(record) {
  const timeline = record?.timeline
  return {
    id: record?.id || record?.battleId || record?.slug || timeline?.battle?.id,
    slug: record?.slug || timeline?.battle?.id,
    name: record?.name || timeline?.battle?.name || 'Untitled battle',
    battleDate: record?.battleDate || record?.date || timeline?.battle?.date,
    outcome: record?.outcome || timeline?.battle?.outcome,
    summary: record?.summary || timeline?.battle?.summary,
    stepsCount: record?.stepsCount || timeline?.steps?.length || 0,
    factions: record?.factions || timeline?.factions || [],
    voiceStatus: record?.voiceStatus,
    createdAt: record?.createdAt,
    source: record?.source || 'server'
  }
}

export default function BattleTimelinePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentUser = useSelector(selectCurrentUser)
  const accessToken = useSelector(selectCurrentAccessToken)
  const requestedBattleId = searchParams.get('battle')

  const [template, setTemplate] = useState(null)
  const [timeline, setTimeline] = useState(null)
  const [battleList, setBattleList] = useState([])
  const [isBattleListLoading, setIsBattleListLoading] = useState(true)
  const [isBattleLoading, setIsBattleLoading] = useState(false)
  const [battleListError, setBattleListError] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [animProgress, setAnimProgress] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarMode, setSidebarMode] = useState('narration')
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [hoveredTarget, setHoveredTarget] = useState(null)
  const [overlays, setOverlays] = useState(DEFAULT_OVERLAYS)
  const [cameraResetSignal, setCameraResetSignal] = useState(0)
  const [cameraCommand, setCameraCommand] = useState(null)
  const [battleText, setBattleText] = useState('')
  const [includeVoice, setIncludeVoice] = useState(false)
  const [generationLanguage, setGenerationLanguage] = useState('en')
  const [mapSize, setMapSize] = useState(900)
  const [estimatedCost, setEstimatedCost] = useState(() => estimateCost({ wordCount: 0, includeVoice: false, mapWidth: 900 }))
  const [balance, setBalance] = useState(0)
  const [pointSummary, setPointSummary] = useState(null)
  const [formError, setFormError] = useState('')
  const [generationPhase, setGenerationPhase] = useState(null)
  const [generatedBattle, setGeneratedBattle] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [voiceBadge, setVoiceBadge] = useState(null)
  const [voicePlayer, setVoicePlayer] = useState(null)
  const [unlockOpen, setUnlockOpen] = useState(false)
  const [unlockedBattles, setUnlockedBattles] = useState(() => new Set())

  const animStartRef = useRef(0)
  const tourStartedRef = useRef(false)
  const wordCount = useMemo(() => countWords(battleText), [battleText])

  const startGuidedTour = useCallback((forced = false) => {
    if (!timeline || tourStartedRef.current) return
    const userKey = currentUser?._id || currentUser?.id
    const storageKey = userKey ? `battleTimelineTour:${userKey}` : 'battleTimelineTour:guest'
    if (!forced && localStorage.getItem(storageKey)) return

    tourStartedRef.current = true
    const tour = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      stagePadding: 8,
      popoverClass: 'battle-driver-popover',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Start exploring',
      onDestroyed: () => {
        localStorage.setItem(storageKey, String(Date.now()))
        tourStartedRef.current = false
      },
      steps: [
        {
          element: '[data-tour="battle-canvas"]',
          popover: {
            title: 'Battlefield first',
            description: 'Drag to pan, scroll to zoom, double-click to reset. Click a unit, terrain, or arrow to inspect it in the command panel.'
          }
        },
        {
          element: '[data-tour="battle-playback"]',
          popover: {
            title: 'Replay the campaign',
            description: 'Use play, previous, next, and speed controls to move through each phase without losing the tactical context.'
          }
        },
        {
          element: '[data-tour="battle-panel-tabs"]',
          popover: {
            title: 'Command panel',
            description: 'Switch between Create, Narration, Forces, Actions, and Learn. This keeps the map visible while you work.'
          }
        },
        {
          element: '[data-tour="battle-create"]',
          popover: {
            title: 'Generate your own battle',
            description: 'Paste text or upload a PDF/DOCX. Cost updates before you spend points, then the returned JSON renders directly on the map.'
          }
        },
        {
          element: '[data-tour="battle-overlays"]',
          popover: {
            title: 'Control map layers',
            description: 'Toggle units, terrain, actions, effects, and labels when the battlefield gets dense.'
          }
        },
        {
          element: '[data-tour="battle-camera"]',
          popover: {
            title: 'Rotate the battlefield',
            description: 'Use rotate, tilt, top, iso, and cinematic views to understand the battle from multiple angles.'
          }
        },
        {
          element: '[data-tour="battle-learn"]',
          popover: {
            title: 'Points and access',
            description: 'Battle Timeline uses points earned from heritage quizzes. Go to the Heritages page when you need more points.'
          }
        }
      ]
    })

    tour.drive()
  }, [currentUser?._id, currentUser?.id, timeline])

  const resetBattleView = useCallback(() => {
    setTemplate(null)
    setTimeline(null)
    setCurrentStep(0)
    setAnimProgress(0)
    setIsPlaying(false)
    setShowSummary(false)
    setSelectedTarget(null)
    setHoveredTarget(null)
    setSidebarMode('narration')
    setGeneratedBattle(null)
    setVoiceBadge(null)
    setVoicePlayer(null)
  }, [])

  const loadBattleList = useCallback(async () => {
    setIsBattleListLoading(true)
    setBattleListError('')
    try {
      const response = await fetch(`${BASE_URL}/battle-timeline`, {
        credentials: 'include'
      })
      const payload = unwrapApiData(await response.json().catch(() => ({})))
      if (!response.ok) throw new Error(payload?.message || 'Could not load battle library.')
      const records = Array.isArray(payload) ? payload : payload?.items || payload?.battles || []
      setBattleList(records.map(normalizeBattleRecord).filter((battle) => battle.id))
    } catch (error) {
      setBattleList(BATTLE_TEMPLATES.map(templateToBattleRecord))
      setBattleListError(error.message || 'Could not load battle library. Showing local demos instead.')
    } finally {
      setIsBattleListLoading(false)
    }
  }, [])

  const loadPointBalance = useCallback(async () => {
    if (!currentUser || !accessToken) {
      setBalance(0)
      setPointSummary(null)
      return
    }

    try {
      const response = await fetch(`${BASE_URL}/knowledge-tests/my-points`, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      const payload = unwrapApiData(await response.json().catch(() => ({})))
      if (!response.ok) throw new Error(payload?.message || 'Could not load quiz points.')

      setPointSummary(payload)
      setBalance(Math.max(0, Number(payload?.totalPoints || 0)))
    } catch (error) {
      setPointSummary(null)
      setBalance(0)
      console.warn(error.message || 'Could not load quiz points.')
    }
  }, [accessToken, currentUser])

  const loadBattleById = useCallback(async (id, options = {}) => {
    if (!id) return
    const localTemplate = BATTLE_TEMPLATES.find((battle) => battle.id === id)
    const shouldUseLocal = options.source === 'demo' || options.record?.source === 'demo'

    setIsBattleLoading(true)
    setBattleListError('')
    if (options.updateUrl !== false) setSearchParams({ battle: id })

    try {
      if (shouldUseLocal && localTemplate) {
        setTemplate(localTemplate)
        setTimeline(localTemplate.timeline)
        setGeneratedBattle(null)
      } else {
        const response = await fetch(`${BASE_URL}/battle-timeline/${encodeURIComponent(id)}`, {
          credentials: 'include'
        })
        const payload = unwrapApiData(await response.json().catch(() => ({})))
        if (!response.ok || !payload?.timeline) throw new Error(payload?.message || 'Could not load battle timeline.')
        setTemplate({
          id: payload.id || id,
          name: payload.name || payload.timeline?.battle?.name || 'Battle timeline',
          timeline: payload.timeline
        })
        setTimeline(payload.timeline)
        setGeneratedBattle({
          battleId: payload.id || id,
          voiceStatus: payload.voiceStatus
        })
        if (payload.voiceStatus && payload.voiceStatus !== 'NONE') setVoiceBadge(payload.voiceStatus)
      }

      setCurrentStep(0)
      setAnimProgress(0)
      setIsPlaying(false)
      setShowSummary(false)
      setSelectedTarget(null)
      setHoveredTarget(null)
      setSidebarMode('narration')
      setSidebarOpen(true)
      setVoicePlayer(null)
    } catch (error) {
      if (localTemplate) {
        setTemplate(localTemplate)
        setTimeline(localTemplate.timeline)
        setGeneratedBattle(null)
        setBattleListError('Server battle could not be loaded. Showing matching local demo.')
      } else {
        resetBattleView()
        setBattleListError(error.message || 'Could not load battle timeline.')
        toast.error(error.message || 'Could not load battle timeline')
      }
    } finally {
      setIsBattleLoading(false)
    }
  }, [resetBattleView, setSearchParams])

  useEffect(() => {
    loadBattleList()
  }, [loadBattleList])

  useEffect(() => {
    loadPointBalance()
  }, [loadPointBalance])

  useEffect(() => {
    if (requestedBattleId) {
      if (template?.id === requestedBattleId || generatedBattle?.battleId === requestedBattleId) return
      loadBattleById(requestedBattleId, { updateUrl: false })
      return
    }
    resetBattleView()
  }, [generatedBattle?.battleId, loadBattleById, requestedBattleId, resetBattleView, template?.id])

  useEffect(() => {
    if (!isPlaying || !timeline) return undefined

    let animFrame
    const stepDuration = 2500 / speed

    const tick = (now) => {
      if (!animStartRef.current) animStartRef.current = now
      const elapsed = now - animStartRef.current
      const p = Math.min(elapsed / stepDuration, 1)

      setAnimProgress(p)

      if (p >= 1) {
        setAnimProgress(0)
        animStartRef.current = now
        setCurrentStep((prev) => {
          const next = prev + 1
          if (next >= timeline.steps.length) {
            setIsPlaying(false)
            setShowSummary(true)
            return prev
          }
          return next
        })
      }

      animFrame = requestAnimationFrame(tick)
    }

    animStartRef.current = performance.now()
    animFrame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrame)
  }, [isPlaying, timeline, speed])

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      const fallback = estimateCost({ wordCount, includeVoice, mapWidth: mapSize })
      if (!wordCount) {
        setEstimatedCost(fallback)
        return
      }

      try {
        const params = new URLSearchParams({
          wordCount: String(wordCount),
          includeVoice: String(includeVoice),
          mapSize: String(mapSize)
        })
        const response = await fetch(`${BASE_URL}/points/estimate?${params.toString()}`)
        if (!response.ok) throw new Error('estimate unavailable')
        const payload = unwrapApiData(await response.json())
        setEstimatedCost(payload?.total ? payload : fallback)
      } catch {
        setEstimatedCost(fallback)
      }
    }, 800)

    return () => window.clearTimeout(handle)
  }, [wordCount, includeVoice, mapSize])

  useEffect(() => {
    if (generationPhase === null) return undefined
    const phaseTimer = window.setInterval(() => {
      setGenerationPhase((phase) => {
        if (phase === null) return phase
        return Math.min(phase + 1, GENERATION_PHASES.length - 1)
      })
    }, 2000)
    return () => window.clearInterval(phaseTimer)
  }, [generationPhase])

  useEffect(() => {
    if (!currentUser || !timeline) return undefined
    const timer = window.setTimeout(() => startGuidedTour(false), 700)
    return () => window.clearTimeout(timer)
  }, [currentUser, timeline, startGuidedTour])

  const step = timeline?.steps?.[currentStep]
  const isFinalStep = timeline ? currentStep >= timeline.steps.length - 1 : false
  const outcomeLabel = timeline?.battle?.outcome ? OUTCOME_LABELS[timeline.battle.outcome] : null
  const battleIdentifier = generatedBattle?.battleId || template?.id || timeline?.battle?.id || requestedBattleId

  const currentStatesById = useMemo(() => {
    const map = new Map()
    step?.entity_states?.forEach((state) => map.set(state.entity_id, state))
    return map
  }, [step])

  const selectedDetails = useMemo(() => {
    if (!selectedTarget || !timeline || !step) return null

    if (selectedTarget.type === 'entity') {
      const entity = timeline.entities?.find((e) => e.id === selectedTarget.id)
      const faction = timeline.factions?.find((f) => f.id === entity?.faction_id)
      const state = currentStatesById.get(selectedTarget.id)
      if (!entity) return null
      return {
        type: 'Unit',
        title: entity.label || entity.id,
        subtitle: `${getFactionFlag(faction)} ${entity.type || 'unit'}${faction?.name ? ` · ${faction.name}` : ''}`,
        color: faction?.color || '#D8A24A',
        lines: [
          `Status: ${STATUS_LABELS[state?.status] || state?.status || 'Unknown'}`,
          state ? `Position: ${Math.round(state.x)}, ${Math.round(state.y)}` : null,
          faction?.side ? `Side: ${faction.side}` : null
        ].filter(Boolean)
      }
    }

    if (selectedTarget.type === 'terrain') {
      const terrain = timeline.map?.terrain?.find((t) => t.id === selectedTarget.id)
      if (!terrain) return null
      return {
        type: 'Terrain',
        title: terrain.label || terrain.id,
        subtitle: terrain.type || 'terrain',
        color: '#6FAE8D',
        lines: [
          `Area: ${Math.round(terrain.width || 0)} x ${Math.round(terrain.height || 0)}`,
          `Map position: ${Math.round(terrain.x || 0)}, ${Math.round(terrain.y || 0)}`
        ]
      }
    }

    if (selectedTarget.type === 'action') {
      const action = step.actions?.[selectedTarget.index]
      if (!action) return null
      const actor = timeline.entities?.find((e) => e.id === action.actor_id)
      const target = action.target_id
        ? timeline.entities?.find((e) => e.id === action.target_id) || timeline.map?.terrain?.find((t) => t.id === action.target_id)
        : null
      return {
        type: 'Action',
        title: action.label || formatTargetType(action.type),
        subtitle: `${actor?.label || action.actor_id} ${ACTION_TENSE[action.type] || action.type}${target ? ` ${target.label || target.id}` : ''}`,
        color: action.type === 'attack' || action.type === 'bombard' ? '#C76A35' : '#D8A24A',
        lines: [
          `Type: ${action.type}`,
          `From: ${Math.round(action.from?.x || 0)}, ${Math.round(action.from?.y || 0)}`,
          `To: ${Math.round(action.to?.x || 0)}, ${Math.round(action.to?.y || 0)}`
        ]
      }
    }

    return null
  }, [selectedTarget, timeline, step, currentStatesById])

  const formatActionText = useCallback((action) => {
    const actor = timeline?.entities?.find((e) => e.id === action.actor_id)
    const target = action.target_id
      ? timeline?.entities?.find((e) => e.id === action.target_id) || timeline?.map?.terrain?.find((t) => t.id === action.target_id)
      : null
    const verb = ACTION_TENSE[action.type] || action.type
    return {
      actor: actor?.label || action.actor_id,
      verb,
      target: target ? ` ${target.label || target.id}` : ''
    }
  }, [timeline])

  const goToStep = useCallback((nextStep) => {
    setIsPlaying(false)
    setAnimProgress(0)
    setSelectedTarget(null)
    setHoveredTarget(null)
    setCurrentStep(Math.max(0, Math.min(nextStep, (timeline?.steps?.length || 1) - 1)))
  }, [timeline])

  const togglePlay = useCallback(() => {
    if (!timeline) return
    if (isPlaying) {
      setIsPlaying(false)
      setAnimProgress(0)
      return
    }
    if (currentStep >= timeline.steps.length - 1) {
      setCurrentStep(0)
      setAnimProgress(0)
      setShowSummary(false)
    }
    setSelectedTarget(null)
    animStartRef.current = 0
    setIsPlaying(true)
  }, [isPlaying, currentStep, timeline])

  const selectBattle = useCallback((id) => {
    if (requestedBattleId === id) {
      const record = battleList.find((battle) => battle.id === id || battle.slug === id)
      loadBattleById(id, { updateUrl: false, record })
      return
    }
    setSearchParams({ battle: id })
  }, [battleList, loadBattleById, requestedBattleId, setSearchParams])

  const handleSelectTarget = useCallback((target) => {
    setSelectedTarget(target)
    if (target) {
      setSidebarOpen(true)
      setSidebarMode(target.type === 'action' ? 'actions' : target.type === 'entity' ? 'forces' : 'narration')
    }
  }, [])

  const toggleOverlay = useCallback((id) => {
    setOverlays((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const resetCamera = useCallback(() => {
    setCameraResetSignal((value) => value + 1)
  }, [])

  const sendCameraCommand = useCallback((type) => {
    setCameraCommand({ type, nonce: Date.now() })
  }, [])

  const applyGeneratedTimeline = useCallback((nextTimeline, meta = {}) => {
    const nextId = meta.battleId || nextTimeline.battle?.id || 'generated-battle'
    setTimeline(nextTimeline)
    setTemplate({
      id: nextId,
      name: nextTimeline.battle?.name || 'Generated battle',
      timeline: nextTimeline
    })
    setGeneratedBattle(meta)
    setSearchParams({ battle: nextId })
    setBattleList((items) => {
      const record = normalizeBattleRecord({
        id: nextId,
        slug: nextTimeline.battle?.id,
        name: nextTimeline.battle?.name,
        battleDate: nextTimeline.battle?.date,
        outcome: nextTimeline.battle?.outcome,
        summary: nextTimeline.battle?.summary,
        timeline: nextTimeline,
        voiceStatus: meta.voiceStatus
      })
      return [record, ...items.filter((item) => item.id !== nextId)]
    })
    setCurrentStep(0)
    setAnimProgress(0)
    setIsPlaying(false)
    setShowSummary(false)
    setSelectedTarget(null)
    setHoveredTarget(null)
    setSidebarMode('narration')
    setSidebarOpen(true)
  }, [setSearchParams])

  const validateGenerateInput = useCallback(() => {
    if (wordCount < 30) return 'Battle text must be longer than 30 words.'
    if (wordCount > 5000) return 'Battle text is over 5000 words. Trim the source before generating.'
    if (estimatedCost.total > balance) return 'Not enough points.'
    return ''
  }, [wordCount, estimatedCost.total, balance])

  const generateBattle = useCallback(async () => {
    const error = validateGenerateInput()
    if (error) {
      setFormError(error)
      if (error === 'Not enough points.') toast.error('Not enough points')
      return
    }

    setFormError('')
    setGenerationPhase(0)
    try {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          text: battleText,
          mapWidth: mapSize,
          mapHeight: Math.round(mapSize * 2 / 3),
          language: generationLanguage,
          includeVoice
        })
      })

      const payload = await response.json().catch(() => ({}))
      const data = unwrapApiData(payload)

      if (!response.ok) {
        if (response.status === 402) toast.error('Not enough points')
        else if (response.status === 503) toast.error('Generation failed — points refunded')
        else toast.error(data?.message || 'Generation failed')
        setFormError(data?.message || 'Generation failed')
        return
      }

      if (!data?.timeline) throw new Error('Missing timeline in backend response')

      applyGeneratedTimeline(data.timeline, {
        battleId: data.battleId,
        pointsDeducted: data.pointsDeducted ?? estimatedCost.total,
        pointsRemaining: data.pointsRemaining,
        voiceStatus: data.voiceStatus
      })
      const spent = data.pointsDeducted ?? estimatedCost.total
      setBalance((value) => Math.max(0, data.pointsRemaining ?? value - spent))
      if (data.voiceStatus && data.voiceStatus !== 'NONE') setVoiceBadge(data.voiceStatus)
      toast.info(`-${spent} pts`)
    } catch (error) {
      setFormError(error.message || 'Generation failed')
      toast.error('Generation failed — points refunded')
    } finally {
      setGenerationPhase(null)
    }
  }, [applyGeneratedTimeline, battleText, estimatedCost.total, generationLanguage, includeVoice, mapSize, validateGenerateInput])

  const handleFileUpload = useCallback(async (file) => {
    if (!file) return
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'docx'].includes(extension)) {
      setFormError('Only PDF or DOCX files are accepted.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setFormError('File must be smaller than 10MB.')
      return
    }

    setIsExtracting(true)
    setFormError('')
    setFilePreview({ filename: file.name, size: file.size })

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch(`${BASE_URL}/extract`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      const payload = await response.json().catch(() => ({}))
      const data = unwrapApiData(payload)

      if (!response.ok || !data?.text) {
        throw new Error(data?.message || 'Document extraction endpoint is not ready for this file.')
      }

      setBattleText(data.text)
      setFilePreview({
        filename: file.name,
        pageCount: data.pageCount,
        wordCount: data.wordCount,
        estimatedCost: data.estimatedCost,
        extractedTitle: data.extractedTitle
      })
      toast.success('Battle text extracted')
    } catch (error) {
      setFormError(error.message || 'Could not extract battle text from this file.')
      toast.error('Document extraction failed')
    } finally {
      setIsExtracting(false)
    }
  }, [])

  const playVoiceForStep = useCallback(async () => {
    if (!generatedBattle?.battleId) {
      setVoicePlayer({ status: 'demo', message: 'Voice is available after live generation.' })
      return
    }

    setVoicePlayer({ status: 'loading', message: 'Generating voice for this step...' })
    try {
      const response = await fetch(`${BASE_URL}/voice/${generatedBattle.battleId}/${step.step}`, {
        credentials: 'include'
      })
      const data = unwrapApiData(await response.json().catch(() => ({})))
      if (!response.ok || !data?.url) throw new Error('Voice is still generating.')
      setVoicePlayer({ status: 'ready', ...data })
      setVoiceBadge('READY')
    } catch (error) {
      setVoicePlayer({ status: 'pending', message: error.message || 'Generating voice for this step...' })
    }
  }, [generatedBattle?.battleId, step?.step])

  const unlockBattle = useCallback(async () => {
    if (balance < 20) {
      toast.error('Not enough points')
      return
    }
    try {
      const response = await fetch(`${BASE_URL}/battles/${encodeURIComponent(battleIdentifier)}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      })
      const data = unwrapApiData(await response.json().catch(() => ({})))
      if (!response.ok) throw new Error(data?.message || 'Unlock failed')
      const spent = data.pointsDeducted ?? 20
      setBalance((value) => Math.max(0, data.pointsRemaining ?? value - spent))
      setUnlockedBattles((previous) => new Set(previous).add(battleIdentifier))
      setUnlockOpen(false)
      toast.info(`-${spent} pts`)
    } catch (error) {
      toast.error(error.message || 'Unlock failed')
    }
  }, [balance, battleIdentifier])

  if (!timeline || !step) {
    return (
      <div className="flex-1 bg-museum-black flex flex-col pt-[76px] text-museum-ivory">
        <header className="border-b border-museum-gold/10 bg-museum-black/90 backdrop-blur">
          <div className="lcn-container-x py-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-museum-gold/70">
                  <Radar className="h-3.5 w-3.5" />
                  Battle timeline library
                </div>
                <h1 className="mt-1 font-display text-2xl md:text-4xl text-museum-ivory tracking-tighter leading-tight">
                  Choose a battle to inspect
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-museum-parchment/70">
                  The server returns available battle timelines first. Select one to open the tactical canvas, or create a new generated battle.
                </p>
              </div>
              <div
                className="inline-flex items-center gap-2 rounded-full border border-museum-gold/20 bg-museum-gold/10 px-3 py-2 text-sm font-semibold text-museum-gold"
                title={pointSummary ? `From ${pointSummary.completedTests} heritage quizzes` : 'Complete heritage quizzes to earn points'}
              >
                <Coins className="h-4 w-4" />
                {balance} pts
              </div>
            </div>
          </div>
        </header>

        <BattleLibrary
          battles={battleList}
          isLoading={isBattleListLoading || isBattleLoading}
          error={battleListError}
          onSelectBattle={selectBattle}
          battleText={battleText}
          setBattleText={setBattleText}
          wordCount={wordCount}
          includeVoice={includeVoice}
          setIncludeVoice={setIncludeVoice}
          generationLanguage={generationLanguage}
          setGenerationLanguage={setGenerationLanguage}
          mapSize={mapSize}
          setMapSize={setMapSize}
          estimatedCost={estimatedCost}
          balance={balance}
          formError={formError}
          generationPhase={generationPhase}
          onGenerate={generateBattle}
          onUseSample={() => setBattleText(SAMPLE_TEXT)}
          onFileUpload={handleFileUpload}
          filePreview={filePreview}
          isExtracting={isExtracting}
        />
      </div>
    )
  }

  const progressPct = ((currentStep + animProgress) / Math.max(timeline.steps.length - 1, 1)) * 100
  const hoveredKey = getTargetKey(hoveredTarget)

  return (
    <div className="flex-1 bg-museum-black flex flex-col pt-[76px] text-museum-ivory">
      <header className="border-b border-museum-gold/10 bg-museum-black/90 backdrop-blur">
        <div className="lcn-container-x py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-museum-gold/70">
                <Radar className="h-3.5 w-3.5" />
                Tactical battle timeline
              </div>
              <h1 className="mt-1 font-display text-2xl md:text-4xl text-museum-ivory tracking-tighter leading-tight">
                {timeline.battle?.name || template.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-museum-parchment/75">
                <span>{timeline.battle?.date || 'Historical scenario'}</span>
                {outcomeLabel && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-museum-gold/20 bg-museum-gold/10 px-2.5 py-0.5 text-xs text-museum-gold">
                    <Flag className="h-3 w-3" />
                    {outcomeLabel}
                  </span>
                )}
                <span className="hidden sm:inline text-museum-muted">Step {step.step} of {timeline.steps.length}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => {
                  setSidebarOpen(true)
                  setSidebarMode('create')
                }}
                className="inline-flex items-center gap-2 rounded-full border border-museum-gold/25 bg-museum-gold/12 px-3 py-2 text-sm font-semibold text-museum-gold transition hover:bg-museum-gold/20"
                data-tour="battle-create"
              >
                <WandSparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Generate</span>
              </button>
              <button
                onClick={() => {
                  setSidebarOpen(true)
                  setSidebarMode('learn')
                }}
                className="hidden items-center gap-2 rounded-full border border-museum-gold/15 bg-museum-ivory/5 px-3 py-2 text-sm font-medium text-museum-parchment/80 transition hover:bg-museum-gold/10 hover:text-museum-gold md:inline-flex"
                data-tour="battle-learn"
              >
                <Shield className="h-4 w-4" />
                Learn
              </button>
              <button
                onClick={() => startGuidedTour(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-museum-gold/15 bg-museum-ivory/5 text-museum-gold/80 transition hover:bg-museum-gold/10 hover:text-museum-gold"
                aria-label="Start battle timeline guide"
              >
                <BadgeInfo className="h-4 w-4" />
              </button>
              <div className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition',
                estimatedCost.total > balance
                  ? 'border-museum-seal/40 bg-museum-seal/15 text-museum-seal'
                  : 'border-museum-gold/20 bg-museum-gold/10 text-museum-gold'
              )}
                title={pointSummary ? `From ${pointSummary.completedTests} heritage quizzes` : 'Complete heritage quizzes to earn points'}
              >
                <Coins className="h-4 w-4" />
                {balance} pts
              </div>
              <div className="relative">
                <select
                  value={template?.id || requestedBattleId || ''}
                  onChange={(e) => selectBattle(e.target.value)}
                  className="appearance-none cursor-pointer rounded-full border border-museum-gold/20 bg-museum-ivory/5 py-2 pl-4 pr-9 text-sm font-medium text-museum-parchment/85 transition hover:border-museum-gold/45 hover:text-museum-ivory focus:outline-none focus:ring-2 focus:ring-museum-gold/30"
                >
                  {battleList.map((battle) => (
                    <option key={battle.id} value={battle.id} className="bg-museum-black text-museum-ivory">
                      {battle.name}
                    </option>
                  ))}
                </select>
                <ChevronLeft className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-[-90deg] text-museum-gold/60" />
              </div>
              <button
                onClick={() => setSidebarOpen((open) => !open)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-museum-gold/15 bg-museum-ivory/5 text-museum-gold/80 transition hover:bg-museum-gold/10 hover:text-museum-gold"
                aria-label="Toggle tactical panel"
              >
                <Layers className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="grid h-full grid-cols-1 lg:grid-cols-[minmax(0,1fr)_390px]">
          <section className="relative min-h-[58dvh] overflow-hidden bg-[#10140f] lg:min-h-0" data-tour="battle-canvas">
            <CanvasRenderer
              timeline={timeline}
              currentStep={currentStep}
              animProgress={animProgress}
              selectedTarget={selectedTarget}
              hoveredTarget={hoveredTarget}
              onSelectTarget={handleSelectTarget}
              onHoverTarget={setHoveredTarget}
              overlays={overlays}
              cameraResetSignal={cameraResetSignal}
              cameraCommand={cameraCommand}
            />

            {!generatedBattle && (
              <div className="absolute inset-x-4 top-1/2 z-10 flex -translate-y-1/2 justify-center">
                <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-museum-gold/25 bg-museum-black/76 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-museum-gold shadow-museum-card backdrop-blur-md">
                  <span>Demo — Sign up to generate your own</span>
                  <button
                    onClick={() => {
                      setSidebarOpen(true)
                      setSidebarMode('create')
                    }}
                    className="pointer-events-auto rounded-full bg-museum-gold/18 px-3 py-1 tracking-normal text-museum-ivory transition hover:bg-museum-gold/28"
                  >
                    Generate from your own text — 50 pts
                  </button>
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute left-4 top-4 flex max-w-[min(540px,calc(100%-2rem))] flex-col gap-3">
              <Motion.div
                key={currentStep}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="pointer-events-auto rounded-2xl border border-museum-gold/15 bg-museum-black/70 p-4 shadow-museum-card backdrop-blur-md"
              >
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-museum-gold/70">
                  <Target className="h-3.5 w-3.5" />
                  {step.time_label || `Step ${step.step}`}
                </div>
                <h2 className="mt-1 font-display text-xl leading-tight text-museum-ivory">{step.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-museum-parchment/75">{step.narration}</p>
              </Motion.div>

              <AnimatePresence>
                {selectedDetails && (
                  <Motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="pointer-events-auto rounded-2xl border border-museum-gold/15 bg-museum-black/75 p-3 backdrop-blur-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[0.65rem] uppercase tracking-[0.18em] text-museum-muted">{selectedDetails.type}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selectedDetails.color }} />
                          <p className="text-sm font-semibold text-museum-ivory">{selectedDetails.title}</p>
                        </div>
                        <p className="mt-1 text-xs text-museum-parchment/65">{selectedDetails.subtitle}</p>
                      </div>
                      <button
                        onClick={() => setSelectedTarget(null)}
                        className="rounded-full p-1 text-museum-muted transition hover:bg-museum-ivory/10 hover:text-museum-ivory"
                        aria-label="Clear selection"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute right-4 top-4 hidden max-w-[320px] flex-wrap justify-end gap-2 md:flex" data-tour="battle-overlays">
              {OVERLAY_OPTIONS.map((option) => {
                const IconComponent = option.icon
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleOverlay(option.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition',
                      overlays[option.id]
                        ? 'border-museum-gold/30 bg-museum-gold/15 text-museum-gold'
                        : 'border-museum-gold/10 bg-museum-black/50 text-museum-muted hover:text-museum-ivory'
                    )}
                  >
                    <IconComponent className="h-3.5 w-3.5" />
                    {option.label}
                  </button>
                )
              })}
            </div>

            <div className="absolute right-4 top-[4.75rem] hidden w-[312px] rounded-2xl border border-museum-gold/15 bg-museum-black/72 p-3 shadow-museum-card backdrop-blur-md md:block" data-tour="battle-camera">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-museum-gold/60">
                  <Compass className="h-3.5 w-3.5" />
                  Battlefield camera
                </div>
                <button onClick={resetCamera} className="rounded-full p-1 text-museum-muted transition hover:bg-museum-ivory/10 hover:text-museum-gold" aria-label="Reset camera">
                  <LocateFixed className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <button onClick={() => sendCameraCommand('rotateLeft')} className="battle-camera-button" aria-label="Rotate battlefield left">
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button onClick={() => sendCameraCommand('rotateRight')} className="battle-camera-button" aria-label="Rotate battlefield right">
                  <RotateCw className="h-4 w-4" />
                </button>
                <button onClick={() => sendCameraCommand('tiltUp')} className="battle-camera-button" aria-label="Tilt camera up">
                  <ChevronLeft className="h-4 w-4 rotate-90" />
                </button>
                <button onClick={() => sendCameraCommand('tiltDown')} className="battle-camera-button" aria-label="Tilt camera down">
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </button>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                <button onClick={() => sendCameraCommand('topDown')} className="battle-view-button">
                  Top
                </button>
                <button onClick={() => sendCameraCommand('isometric')} className="battle-view-button">
                  Iso
                </button>
                <button onClick={() => sendCameraCommand('cinematic')} className="battle-view-button">
                  Cine
                </button>
              </div>
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-3" data-tour="battle-playback">
              <div className="rounded-2xl border border-museum-gold/15 bg-museum-black/80 px-3 py-3 shadow-museum-card backdrop-blur-md">
                <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-museum-ivory/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-museum-terracotta-light via-museum-gold to-museum-gold-light transition-[width]"
                    style={{ width: `${Math.min(progressPct, 100)}%` }}
                  />
                </div>
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 museum-scrollbar">
                    {timeline.steps.map((timelineStep, index) => (
                      <button
                        key={timelineStep.step}
                        onClick={() => goToStep(index)}
                        className={cn(
                          'min-w-[124px] rounded-xl border px-3 py-2 text-left transition',
                          index === currentStep
                            ? 'border-museum-gold/40 bg-museum-gold/15 text-museum-gold'
                            : index < currentStep
                              ? 'border-museum-gold/15 bg-museum-ivory/[0.04] text-museum-parchment/70 hover:text-museum-ivory'
                              : 'border-museum-gold/10 bg-transparent text-museum-muted hover:bg-museum-ivory/[0.04] hover:text-museum-parchment'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-museum-black/60 text-[0.7rem] font-bold">
                            {timelineStep.step}
                          </span>
                          <span className="truncate text-xs font-semibold">{timelineStep.title}</span>
                        </div>
                        <p className="mt-1 truncate text-[0.65rem] text-current/60">{timelineStep.time_label}</p>
                      </button>
                    ))}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => goToStep(0)}
                      disabled={currentStep === 0}
                      className="battle-control"
                      aria-label="Go to first step"
                    >
                      <SkipBack className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => goToStep(currentStep - 1)}
                      disabled={currentStep === 0}
                      className="battle-control"
                      aria-label="Previous step"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={togglePlay}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-museum-gold/35 bg-museum-gold/20 text-museum-gold transition hover:bg-museum-gold/30"
                      aria-label={isPlaying ? 'Pause timeline' : 'Play timeline'}
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => goToStep(currentStep + 1)}
                      disabled={isFinalStep}
                      className="battle-control"
                      aria-label="Next step"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => goToStep(timeline.steps.length - 1)}
                      disabled={isFinalStep}
                      className="battle-control"
                      aria-label="Go to final step"
                    >
                      <SkipForward className="h-4 w-4" />
                    </button>
                    <button onClick={resetCamera} className="battle-control" aria-label="Reset camera">
                      <LocateFixed className="h-4 w-4" />
                    </button>
                    <div className="flex rounded-full border border-museum-gold/15 bg-museum-ivory/[0.04] p-1">
                      {SPEEDS.map((speedOption) => (
                        <button
                          key={speedOption.value}
                          onClick={() => setSpeed(speedOption.value)}
                          className={cn(
                            'rounded-full px-2.5 py-1 text-xs font-medium transition',
                            speed === speedOption.value ? 'bg-museum-gold/20 text-museum-gold' : 'text-museum-muted hover:text-museum-ivory'
                          )}
                        >
                          {speedOption.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1 museum-scrollbar md:hidden">
                    {OVERLAY_OPTIONS.map((option) => {
                      const IconComponent = option.icon
                      return (
                        <button
                          key={option.id}
                          onClick={() => toggleOverlay(option.id)}
                          className={cn(
                            'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                            overlays[option.id]
                              ? 'border-museum-gold/30 bg-museum-gold/15 text-museum-gold'
                              : 'border-museum-gold/10 bg-museum-ivory/[0.04] text-museum-muted hover:text-museum-ivory'
                          )}
                        >
                          <IconComponent className="h-3.5 w-3.5" />
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1 museum-scrollbar md:hidden">
                    {[
                      { type: 'rotateLeft', label: 'Rotate L', icon: RotateCcw },
                      { type: 'rotateRight', label: 'Rotate R', icon: RotateCw },
                      { type: 'topDown', label: 'Top', icon: View },
                      { type: 'isometric', label: 'Iso', icon: Compass }
                    ].map((control) => {
                      const IconComponent = control.icon
                      return (
                        <button
                          key={control.type}
                          onClick={() => sendCameraCommand(control.type)}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-museum-gold/10 bg-museum-ivory/[0.04] px-3 py-1.5 text-xs font-medium text-museum-muted transition hover:text-museum-gold"
                        >
                          <IconComponent className="h-3.5 w-3.5" />
                          {control.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <AnimatePresence initial={false}>
            {sidebarOpen && (
              <Motion.aside
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 32 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="z-20 flex h-[42dvh] flex-col border-t border-museum-gold/15 bg-museum-black/95 backdrop-blur-md lg:h-full lg:border-l lg:border-t-0"
              >
                <div className="border-b border-museum-gold/10 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[0.65rem] uppercase tracking-[0.2em] text-museum-gold/60">Command panel</div>
                      <p className="mt-1 text-sm text-museum-parchment/70">{hoveredKey ? `Hovering ${formatTargetType(hoveredTarget?.type)}` : 'Inspect the battle state'}</p>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="rounded-full border border-museum-gold/10 p-2 text-museum-muted transition hover:bg-museum-ivory/5 hover:text-museum-ivory"
                      aria-label="Close tactical panel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex gap-1 overflow-x-auto rounded-2xl border border-museum-gold/10 bg-museum-ivory/[0.03] p-1 museum-scrollbar" data-tour="battle-panel-tabs">
                    {PANEL_MODES.map((mode) => {
                      const IconComponent = mode.icon
                      return (
                        <button
                          key={mode.id}
                          onClick={() => setSidebarMode(mode.id)}
                          className={cn(
                            'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition',
                            sidebarMode === mode.id ? 'bg-museum-gold/20 text-museum-gold' : 'text-museum-muted hover:text-museum-ivory'
                          )}
                        >
                          <IconComponent className="h-3.5 w-3.5" />
                          <span>{mode.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 museum-scrollbar">
                  <AnimatePresence mode="wait">
                    <Motion.div
                      key={sidebarMode}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                    >
                      {selectedDetails && (
                        <section className="mb-4 rounded-2xl border border-museum-gold/15 bg-museum-ivory/[0.04] p-4">
                          <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.18em] text-museum-gold/60">
                            <Eye className="h-3.5 w-3.5" />
                            Selected {selectedDetails.type}
                          </div>
                          <h3 className="mt-2 text-base font-semibold text-museum-ivory">{selectedDetails.title}</h3>
                          <p className="mt-1 text-sm text-museum-parchment/65">{selectedDetails.subtitle}</p>
                          <div className="mt-3 space-y-1.5">
                            {selectedDetails.lines.map((line) => (
                              <p key={line} className="text-xs text-museum-muted">{line}</p>
                            ))}
                          </div>
                        </section>
                      )}

                      {sidebarMode === 'create' && (
                        <GeneratorPanel
                          battleText={battleText}
                          setBattleText={setBattleText}
                          wordCount={wordCount}
                          includeVoice={includeVoice}
                          setIncludeVoice={setIncludeVoice}
                          generationLanguage={generationLanguage}
                          setGenerationLanguage={setGenerationLanguage}
                          mapSize={mapSize}
                          setMapSize={setMapSize}
                          estimatedCost={estimatedCost}
                          balance={balance}
                          formError={formError}
                          generationPhase={generationPhase}
                          onGenerate={generateBattle}
                          onUseSample={() => setBattleText(SAMPLE_TEXT)}
                          onFileUpload={handleFileUpload}
                          filePreview={filePreview}
                          isExtracting={isExtracting}
                        />
                      )}
                      {sidebarMode === 'narration' && (
                        <NarrationPanel
                          step={step}
                          timeline={timeline}
                          isDemo={!generatedBattle}
                          voiceBadge={voiceBadge}
                          voicePlayer={voicePlayer}
                          onPlayVoice={playVoiceForStep}
                        />
                      )}
                      {sidebarMode === 'forces' && (
                        <ForcesPanel timeline={timeline} statesById={currentStatesById} onSelectTarget={handleSelectTarget} selectedTarget={selectedTarget} />
                      )}
                      {sidebarMode === 'actions' && (
                        <ActionsPanel step={step} timeline={timeline} formatActionText={formatActionText} onSelectTarget={handleSelectTarget} selectedTarget={selectedTarget} />
                      )}
                      {sidebarMode === 'learn' && (
                        <LearningPanel
                          timeline={timeline}
                          battleIdentifier={battleIdentifier}
                          balance={balance}
                          unlockOpen={unlockOpen}
                          isUnlocked={unlockedBattles.has(battleIdentifier)}
                          onOpenUnlock={() => setUnlockOpen(true)}
                          onCloseUnlock={() => setUnlockOpen(false)}
                          onConfirmUnlock={unlockBattle}
                        />
                      )}
                    </Motion.div>
                  </AnimatePresence>
                </div>
              </Motion.aside>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showSummary && (
          <DebriefModal
            timeline={timeline}
            outcomeLabel={outcomeLabel}
            onClose={() => setShowSummary(false)}
            onReplay={() => {
              setShowSummary(false)
              goToStep(0)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function BattleLibrary({
  battles,
  isLoading,
  error,
  onSelectBattle,
  battleText,
  setBattleText,
  wordCount,
  includeVoice,
  setIncludeVoice,
  generationLanguage,
  setGenerationLanguage,
  mapSize,
  setMapSize,
  estimatedCost,
  balance,
  formError,
  generationPhase,
  onGenerate,
  onUseSample,
  onFileUpload,
  filePreview,
  isExtracting
}) {
  return (
    <main className="flex-1 overflow-y-auto museum-scrollbar">
      <div className="lcn-container-x py-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-museum-ivory">Available battles from server</h2>
                <p className="mt-1 text-sm text-museum-muted">
                  {isLoading ? 'Loading battle library...' : `${battles.length} battle${battles.length === 1 ? '' : 's'} ready`}
                </p>
              </div>
              {isLoading && (
                <span className="inline-flex items-center gap-2 rounded-full border border-museum-gold/15 px-3 py-1.5 text-sm text-museum-gold">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Loading
                </span>
              )}
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-museum-seal/25 bg-museum-seal/10 px-4 py-3 text-sm text-museum-seal">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {!isLoading && !battles.length && (
              <div className="rounded-3xl border border-museum-gold/12 bg-museum-ivory/[0.03] p-8 text-center">
                <Radar className="mx-auto h-9 w-9 text-museum-gold/70" />
                <h3 className="mt-4 font-display text-2xl text-museum-ivory">No server battles yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-museum-parchment/70">
                  The initial page no longer opens a hardcoded demo. Generate a battle, or seed timelines in the backend library.
                </p>
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              {battles.map((battle) => {
                const outcome = battle.outcome ? OUTCOME_LABELS[battle.outcome] || battle.outcome : 'Timeline'
                return (
                  <button
                    key={battle.id}
                    onClick={() => onSelectBattle(battle.id)}
                    className="group rounded-3xl border border-museum-gold/12 bg-museum-ivory/[0.03] p-4 text-left transition hover:-translate-y-0.5 hover:border-museum-gold/35 hover:bg-museum-gold/[0.06]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-[0.16em] text-museum-gold/60">
                          <Flag className="h-3.5 w-3.5" />
                          {battle.battleDate || 'Historical battle'}
                        </div>
                        <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-6 text-museum-ivory group-hover:text-museum-gold">
                          {battle.name}
                        </h3>
                      </div>
                      <span className="shrink-0 rounded-full border border-museum-gold/12 bg-museum-black/35 px-2 py-1 text-xs text-museum-muted">
                        {battle.stepsCount || 0} steps
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-museum-parchment/70">
                      {battle.summary || 'Open this battle to inspect its units, terrain, and timeline actions.'}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap gap-1.5">
                        {battle.factions?.slice(0, 3).map((faction) => (
                          <span key={faction.id || faction.name} className="inline-flex items-center gap-1 rounded-full border border-museum-gold/10 px-2 py-0.5 text-xs text-museum-muted">
                            <span className="text-sm leading-none">{getFactionFlag(faction)}</span>
                            <span className="max-w-[110px] truncate">{faction.name}</span>
                          </span>
                        ))}
                      </div>
                      <span className="rounded-full bg-museum-gold/10 px-2 py-0.5 text-xs text-museum-gold">{outcome}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            <GeneratorPanel
              battleText={battleText}
              setBattleText={setBattleText}
              wordCount={wordCount}
              includeVoice={includeVoice}
              setIncludeVoice={setIncludeVoice}
              generationLanguage={generationLanguage}
              setGenerationLanguage={setGenerationLanguage}
              mapSize={mapSize}
              setMapSize={setMapSize}
              estimatedCost={estimatedCost}
              balance={balance}
              formError={formError}
              generationPhase={generationPhase}
              onGenerate={onGenerate}
              onUseSample={onUseSample}
              onFileUpload={onFileUpload}
              filePreview={filePreview}
              isExtracting={isExtracting}
            />
          </aside>
        </div>
      </div>
    </main>
  )
}

function GeneratorPanel({
  battleText,
  setBattleText,
  wordCount,
  includeVoice,
  setIncludeVoice,
  generationLanguage,
  setGenerationLanguage,
  mapSize,
  setMapSize,
  estimatedCost,
  balance,
  formError,
  generationPhase,
  onGenerate,
  onUseSample,
  onFileUpload,
  filePreview,
  isExtracting
}) {
  const canGenerate = wordCount >= 30 && wordCount <= 5000 && estimatedCost.total <= balance && generationPhase === null
  const afterBalance = Math.max(0, balance - estimatedCost.total)

  return (
    <div className="space-y-4" data-tour="battle-create">
          <div className="rounded-2xl border border-museum-gold/15 bg-museum-black/45 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-museum-gold/65">
                  <WandSparkles className="h-3.5 w-3.5" />
                  Live generation
                </div>
                <p className="mt-1 text-sm text-museum-parchment/70">Paste battle text or upload a source document.</p>
              </div>
              <button
                onClick={onUseSample}
                className="rounded-full border border-museum-gold/20 px-3 py-1.5 text-xs font-medium text-museum-gold transition hover:bg-museum-gold/10"
              >
                Use sample
              </button>
            </div>

            <textarea
              value={battleText}
              onChange={(event) => setBattleText(event.target.value)}
              placeholder="Paste a battle narrative here..."
              className="min-h-[150px] w-full resize-y rounded-2xl border border-museum-gold/10 bg-museum-black/55 p-4 text-sm leading-6 text-museum-ivory placeholder:text-museum-muted/60 focus:outline-none focus:ring-2 focus:ring-museum-gold/30"
            />

            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <label className="flex min-h-[74px] cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-museum-gold/20 bg-museum-ivory/[0.03] px-4 py-3 text-sm text-museum-parchment/70 transition hover:border-museum-gold/40 hover:text-museum-ivory">
                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="sr-only"
                  onChange={(event) => onFileUpload(event.target.files?.[0])}
                />
                {isExtracting ? <LoaderCircle className="h-5 w-5 animate-spin text-museum-gold" /> : <Upload className="h-5 w-5 text-museum-gold" />}
                <span>
                  {isExtracting ? 'Reading document...' : 'Drop or choose PDF/DOCX'}
                  {filePreview && (
                    <span className="mt-1 block text-xs text-museum-muted">
                      {filePreview.filename}
                      {filePreview.wordCount ? ` · ${filePreview.wordCount} words` : ''}
                      {filePreview.pageCount ? ` · ${filePreview.pageCount} pages` : ''}
                    </span>
                  )}
                </span>
              </label>

              {filePreview && (
                <div className="rounded-2xl border border-museum-gold/10 bg-museum-black/35 px-3 py-2 text-xs text-museum-parchment/70 md:col-span-2">
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-museum-gold" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-museum-ivory">{filePreview.extractedTitle || filePreview.filename}</p>
                      <p className="mt-1 text-museum-muted">
                        {filePreview.pageCount ? `${filePreview.pageCount} pages` : 'Source ready'}
                        {filePreview.wordCount ? ` · ${filePreview.wordCount} words` : ''}
                        {filePreview.estimatedCost ? ` · ${filePreview.estimatedCost} pts estimate` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2">
                <select value={generationLanguage} onChange={(event) => setGenerationLanguage(event.target.value)} className="battle-input">
                  <option value="en">English</option>
                  <option value="vi">Tiếng Việt</option>
                </select>
                <select value={mapSize} onChange={(event) => setMapSize(Number(event.target.value))} className="battle-input">
                  <option value={900}>900 map</option>
                  <option value={1200}>1200 map</option>
                </select>
                <label className="battle-input inline-flex items-center gap-2">
                  <input type="checkbox" checked={includeVoice} onChange={(event) => setIncludeVoice(event.target.checked)} />
                  Voice
                </label>
              </div>
            </div>

            {formError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-museum-seal/30 bg-museum-seal/12 px-3 py-2 text-sm text-museum-seal">
                <AlertTriangle className="h-4 w-4" />
                {formError}
              </div>
            )}
          </div>

          <aside className="rounded-2xl border border-museum-gold/15 bg-museum-black/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-museum-gold/65">
                <Coins className="h-3.5 w-3.5" />
                Estimated cost
              </div>
              <span className="text-sm text-museum-muted">{wordCount} words</span>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <CostRow label={`Base generation (${wordCount} words)`} value={`${estimatedCost.breakdown.base} pts`} />
              <CostRow label="Voice narration" value={`+${estimatedCost.breakdown.voice} pts`} muted={!includeVoice} />
              <div className="my-3 border-t border-museum-gold/10" />
              <CostRow label="Total" value={`${estimatedCost.total} pts`} strong />
              <CostRow label="Your balance" value={`${balance} pts`} />
              <CostRow label="After generation" value={`${afterBalance} pts`} strong={estimatedCost.total <= balance} danger={estimatedCost.total > balance} />
            </div>

            <button
              onClick={onGenerate}
              disabled={!canGenerate}
              className={cn(
                'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition',
                canGenerate
                  ? 'border border-museum-gold/30 bg-museum-gold/20 text-museum-gold hover:bg-museum-gold/30'
                  : 'cursor-not-allowed border border-museum-gold/10 bg-museum-ivory/[0.04] text-museum-muted'
              )}
            >
              {generationPhase !== null ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
              {estimatedCost.total > balance ? 'Not enough points' : 'Generate Battle'}
            </button>

            <AnimatePresence>
              {generationPhase !== null && (
                <Motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mt-4 rounded-2xl border border-museum-gold/10 bg-museum-ivory/[0.03] p-3"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-museum-gold">
                    <Radio className="h-3.5 w-3.5" />
                    Phase {generationPhase + 1} of {GENERATION_PHASES.length} — {GENERATION_PHASES[generationPhase]}
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-museum-ivory/10">
                    <div className="h-full animate-pulse rounded-full bg-gradient-to-r from-museum-terracotta-light via-museum-gold to-museum-gold-light" style={{ width: `${((generationPhase + 1) / GENERATION_PHASES.length) * 100}%` }} />
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </aside>
    </div>
  )
}

function CostRow({ label, value, strong = false, muted = false, danger = false }) {
  return (
    <div className={cn('flex items-center justify-between gap-3', muted && 'opacity-45')}>
      <span className="text-museum-parchment/70">{label}</span>
      <span className={cn('font-medium', strong ? 'text-museum-gold' : 'text-museum-ivory', danger && 'text-museum-seal')}>
        {value}
      </span>
    </div>
  )
}

function LearningPanel({
  timeline,
  battleIdentifier,
  balance,
  unlockOpen,
  isUnlocked,
  onOpenUnlock,
  onCloseUnlock,
  onConfirmUnlock
}) {
  const afterUnlock = Math.max(0, balance - 20)

  return (
    <div className="space-y-3" data-tour="battle-learn">
      <section className="rounded-2xl border border-museum-gold/10 bg-museum-ivory/[0.025] p-4">
        <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-museum-gold/65">
          <BadgeInfo className="h-3.5 w-3.5" />
          Points from Heritage quizzes
        </div>
        <h3 className="mt-2 text-base font-semibold text-museum-ivory">Earn points in the Heritages page</h3>
        <p className="mt-1 text-sm leading-6 text-museum-parchment/70">
          Battle Timeline does not award points. Complete the knowledge quizzes from heritage detail pages to increase your balance, then spend those points here.
        </p>
        <a
          href="/heritages"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-museum-gold/25 px-4 py-2 text-sm font-medium text-museum-gold transition hover:bg-museum-gold/10"
        >
          <Shield className="h-4 w-4" />
          Go to Heritages
        </a>
      </section>

      <aside className="rounded-2xl border border-museum-gold/10 bg-museum-ivory/[0.025] p-4">
        <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-museum-gold/65">
          <Flag className="h-3.5 w-3.5" />
          Battle access
        </div>
        <h3 className="mt-2 text-base font-semibold text-museum-ivory">{timeline.battle?.name || battleIdentifier}</h3>
        <p className="mt-1 text-sm text-museum-parchment/65">
          {isUnlocked ? 'Unlocked for this session.' : 'Unlock this battle with points earned from heritage quizzes.'}
        </p>
        <button
          onClick={onOpenUnlock}
          disabled={isUnlocked}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-museum-gold/25 px-4 py-2 text-sm font-medium text-museum-gold transition hover:bg-museum-gold/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Coins className="h-4 w-4" />
          {isUnlocked ? 'Unlocked' : 'Unlock this battle - 20 pts'}
        </button>
      </aside>

      <AnimatePresence>
        {unlockOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-museum-black/82 p-4 backdrop-blur-sm"
            onClick={onCloseUnlock}
          >
            <Motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              className="w-full max-w-md rounded-3xl border border-museum-gold/20 bg-museum-black p-6 shadow-museum-card"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="font-display text-2xl text-museum-ivory">Unlock "{timeline.battle?.name || battleIdentifier}"?</h3>
              <p className="mt-2 text-sm text-museum-parchment/70">This will deduct 20 pts from your balance.</p>
              <div className="mt-5 space-y-2 rounded-2xl border border-museum-gold/10 bg-museum-ivory/[0.03] p-4 text-sm">
                <CostRow label="Your balance" value={`${balance} pts`} />
                <CostRow label="Cost" value="-20 pts" danger />
                <CostRow label="After unlock" value={`${afterUnlock} pts`} strong={balance >= 20} danger={balance < 20} />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={onCloseUnlock} className="rounded-full border border-museum-gold/15 px-4 py-2 text-sm text-museum-parchment/75 transition hover:bg-museum-ivory/5">
                  Cancel
                </button>
                <button
                  onClick={onConfirmUnlock}
                  disabled={balance < 20}
                  className="rounded-full border border-museum-gold/30 bg-museum-gold/15 px-4 py-2 text-sm font-medium text-museum-gold transition hover:bg-museum-gold/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Confirm Unlock
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NarrationPanel({ step, timeline, isDemo, voiceBadge, voicePlayer, onPlayVoice }) {
  const voiceState = isDemo
    ? 'Demo locked'
    : voiceBadge === 'READY'
      ? 'Voice ready'
      : voiceBadge
        ? 'Voice generating'
        : 'Not requested'
  const canPlayVoice = !isDemo && (voiceBadge === 'READY' || voiceBadge || voicePlayer?.status)

  return (
    <div className="space-y-5">
      <section>
        <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-museum-gold/60">
          <Flag className="h-3.5 w-3.5" />
          {step.time_label || `Step ${step.step}`}
        </div>
        <h3 className="mt-2 font-display text-2xl leading-tight text-museum-ivory">{step.title}</h3>
        <p className="mt-1 text-xs font-medium text-museum-gold/60">Step {step.step} of {timeline.steps.length}</p>
        <p className="mt-4 text-sm leading-7 text-museum-parchment/80">{step.narration}</p>

        <div className="mt-4 rounded-2xl border border-museum-gold/10 bg-museum-ivory/[0.03] p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Volume2 className="h-4 w-4 shrink-0 text-museum-gold" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-museum-ivory">Voice narration</p>
                <p className="truncate text-xs text-museum-muted">{voicePlayer?.message || voiceState}</p>
              </div>
            </div>
            <span className={cn(
              'shrink-0 rounded-full border px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.12em]',
              voiceBadge === 'READY'
                ? 'border-museum-jade-light/30 bg-museum-jade/20 text-museum-jade-light'
                : 'border-museum-gold/15 bg-museum-gold/10 text-museum-gold/75'
            )}>
              {voiceState}
            </span>
          </div>

          <button
            onClick={onPlayVoice}
            disabled={!canPlayVoice && !isDemo}
            className={cn(
              'mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition',
              canPlayVoice || isDemo
                ? 'border-museum-gold/25 text-museum-gold hover:bg-museum-gold/10'
                : 'cursor-not-allowed border-museum-gold/10 text-museum-muted'
            )}
          >
            {voicePlayer?.status === 'loading' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
            Play Voice
          </button>

          {voicePlayer?.status === 'ready' && (
            <div className="mt-3 space-y-3">
              <div className="flex h-12 items-end gap-1 rounded-xl border border-museum-gold/10 bg-museum-black/35 px-3 py-2">
                {Array.from({ length: 24 }).map((_, index) => (
                  <span
                    key={index}
                    className="w-full rounded-full bg-museum-gold/70"
                    style={{ height: `${28 + ((index * 17) % 52)}%` }}
                  />
                ))}
              </div>
              <audio controls src={voicePlayer.url} className="w-full">
                <track kind="captions" srcLang={voicePlayer.language || 'en'} label="Narration transcript" />
              </audio>
              <p className="text-xs text-museum-muted">
                {voicePlayer.duration ? `${voicePlayer.duration}s` : 'Voice clip'} · {voicePlayer.language || 'en'}
              </p>
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionTitle label="Terrain" />
        <div className="flex flex-wrap gap-2">
          {timeline.map?.terrain?.map((terrain) => (
            <span key={terrain.id} className="rounded-full border border-museum-gold/10 bg-museum-ivory/[0.04] px-2.5 py-1 text-xs text-museum-muted">
              {terrain.label || terrain.id}
            </span>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle label="National forces" />
        <div className="space-y-2">
          {timeline.factions?.map((faction) => (
            <div key={faction.id} className="flex items-center justify-between gap-3 rounded-xl border border-museum-gold/10 bg-museum-ivory/[0.03] px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-lg leading-none">{getFactionFlag(faction)}</span>
                <span className="truncate text-sm text-museum-ivory">{faction.name}</span>
              </div>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: faction.color }} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle label="Legend" />
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { color: '#8F1D1D', label: 'Engaged' },
            { color: '#D8A24A', label: 'Holding' },
            { color: '#6FAE8D', label: 'Moving' },
            { color: '#A99D8A', label: 'Retreating' }
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-museum-parchment/65">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function ForcesPanel({ timeline, statesById, onSelectTarget, selectedTarget }) {
  return (
    <div className="space-y-4">
      {timeline.factions?.map((faction) => {
        const units = timeline.entities?.filter((entity) => entity.faction_id === faction.id) || []
        return (
          <section key={faction.id} className="rounded-2xl border border-museum-gold/10 bg-museum-ivory/[0.03] p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: faction.color }} />
                <span className="text-base leading-none">{getFactionFlag(faction)}</span>
                <h3 className="text-sm font-semibold text-museum-ivory">{faction.name}</h3>
              </div>
              <span className="rounded-full border border-museum-gold/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.12em] text-museum-muted">
                {faction.side}
              </span>
            </div>
            <div className="space-y-2">
              {units.map((entity) => {
                const state = statesById.get(entity.id)
                const isSelected = selectedTarget?.type === 'entity' && selectedTarget.id === entity.id
                return (
                  <button
                    key={entity.id}
                    onClick={() => onSelectTarget({ type: 'entity', id: entity.id })}
                    className={cn(
                      'w-full rounded-xl border px-3 py-2 text-left transition',
                      isSelected ? 'border-museum-gold/35 bg-museum-gold/12' : 'border-museum-gold/10 bg-museum-black/25 hover:border-museum-gold/25'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium text-museum-ivory">{entity.label || entity.id}</span>
                      <span className="text-xs text-museum-gold/70">{STATUS_LABELS[state?.status] || 'Unknown'}</span>
                    </div>
                    <p className="mt-1 text-xs text-museum-muted">{entity.type || 'unit'}</p>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function ActionsPanel({ step, timeline, formatActionText, onSelectTarget, selectedTarget }) {
  if (!step.actions?.length) {
    return (
      <div className="rounded-2xl border border-museum-gold/10 bg-museum-ivory/[0.03] p-5 text-sm text-museum-muted">
        No active maneuver is recorded in this phase.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {step.actions.map((action, index) => {
        const info = formatActionText(action)
        const actor = timeline.entities?.find((entity) => entity.id === action.actor_id)
        const faction = timeline.factions?.find((f) => f.id === actor?.faction_id)
        const isSelected = selectedTarget?.type === 'action' && selectedTarget.index === index
        return (
          <button
            key={`${action.type}-${index}`}
            onClick={() => onSelectTarget({ type: 'action', id: `${step.step}-${index}`, index })}
            className={cn(
              'w-full rounded-2xl border p-3 text-left transition',
              isSelected ? 'border-museum-gold/35 bg-museum-gold/12' : 'border-museum-gold/10 bg-museum-ivory/[0.03] hover:border-museum-gold/25'
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: faction?.color || '#D8A24A' }} />
                <span className="truncate text-sm font-semibold text-museum-ivory">{action.label || formatTargetType(action.type)}</span>
              </div>
              <span className="rounded-full bg-museum-black/40 px-2 py-0.5 text-[0.65rem] text-museum-gold/70">{action.type}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-museum-parchment/70">
              <span className="font-medium text-museum-ivory/85">{info.actor}</span> {info.verb}{info.target}
            </p>
          </button>
        )
      })}
    </div>
  )
}

function DebriefModal({ timeline, outcomeLabel, onClose, onReplay }) {
  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-museum-black/82 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <Motion.div
        initial={{ scale: 0.94, opacity: 0, y: 18 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 18 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl rounded-3xl border border-museum-gold/20 bg-museum-black p-6 shadow-museum-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-museum-gold/20 bg-museum-gold/10 px-3 py-1 text-xs font-medium text-museum-gold">
              <Shield className="h-3.5 w-3.5" />
              Battle debrief
            </div>
            <h2 className="mt-4 font-display text-3xl leading-tight text-museum-ivory">{timeline.battle?.name}</h2>
            <p className="mt-1 text-sm text-museum-parchment/65">{timeline.battle?.date} · {outcomeLabel}</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-museum-gold/10 p-2 text-museum-muted transition hover:bg-museum-ivory/5 hover:text-museum-ivory">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-5 text-sm leading-7 text-museum-parchment/78">{timeline.battle?.summary}</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {timeline.steps.map((item) => (
            <div key={item.step} className="rounded-2xl border border-museum-gold/10 bg-museum-ivory/[0.03] p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-museum-gold/15 text-xs font-bold text-museum-gold">{item.step}</span>
                <span className="truncate text-sm font-semibold text-museum-ivory">{item.title}</span>
              </div>
              <p className="mt-1 truncate text-xs text-museum-muted">{item.time_label}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button onClick={onReplay} className="inline-flex items-center gap-2 rounded-full border border-museum-gold/25 px-5 py-2 text-sm font-medium text-museum-gold transition hover:bg-museum-gold/10">
            <RotateCcw className="h-4 w-4" />
            Replay
          </button>
          <button onClick={onClose} className="rounded-full border border-museum-gold/30 bg-museum-gold/15 px-5 py-2 text-sm font-medium text-museum-ivory transition hover:bg-museum-gold/25">
            Review last step
          </button>
        </div>
      </Motion.div>
    </Motion.div>
  )
}

function SectionTitle({ label }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="h-px flex-1 bg-museum-gold/10" />
      <span className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-museum-gold/55">{label}</span>
      <div className="h-px flex-1 bg-museum-gold/10" />
    </div>
  )
}
