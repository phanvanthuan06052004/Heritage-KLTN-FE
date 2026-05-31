import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Flag, ScrollText } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import CanvasRenderer from './CanvasRenderer'
import BATTLE_TEMPLATES from '~/data/battleTimelineData'
import { cn } from '~/lib/utils'

const SPEEDS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '4x', value: 4 }
]

export default function BattleTimelinePage() {
  const [searchParams] = useSearchParams()
  const presetId = searchParams.get('battle') || 'dien-bien-phu-1954'

  const [template, setTemplate] = useState(null)
  const [timeline, setTimeline] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [animProgress, setAnimProgress] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const playRef = useRef(null)
  const animStartRef = useRef(0)

  // Load template
  useEffect(() => {
    const found = BATTLE_TEMPLATES.find((t) => t.id === presetId) || BATTLE_TEMPLATES[0]
    setTemplate(found)
    setTimeline(found.timeline)
    setCurrentStep(0)
    setAnimProgress(0)
    setIsPlaying(false)
    setShowSummary(false)
  }, [presetId])

  // Play loop
  useEffect(() => {
    if (!isPlaying || !timeline) return

    let animFrame
    const stepDuration = 2500 / speed // ms per step

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

  const togglePlay = useCallback(() => {
    if (!timeline) return
    if (isPlaying) {
      setIsPlaying(false)
      setAnimProgress(0)
    } else {
      if (currentStep >= timeline.steps.length - 1) {
        setCurrentStep(0)
        setAnimProgress(0)
      }
      animStartRef.current = 0
      setIsPlaying(true)
    }
  }, [isPlaying, currentStep, timeline])

  const goToStep = useCallback((step) => {
    setIsPlaying(false)
    setAnimProgress(0)
    setCurrentStep(Math.max(0, Math.min(step, (timeline?.steps?.length || 1) - 1)))
  }, [timeline])

  const selectBattle = useCallback((id) => {
    const url = new URL(window.location)
    url.searchParams.set('battle', id)
    window.history.pushState({}, '', url)
    const found = BATTLE_TEMPLATES.find((t) => t.id === id) || BATTLE_TEMPLATES[0]
    setTemplate(found)
    setTimeline(found.timeline)
    setCurrentStep(0)
    setAnimProgress(0)
    setIsPlaying(false)
    setShowSummary(false)
  }, [])

  if (!template || !timeline) {
    return (
      <div className="min-h-screen bg-museum-black flex items-center justify-center">
        <div className="text-museum-gold font-display text-xl animate-pulse">Loading timeline...</div>
      </div>
    )
  }

  const step = timeline.steps[currentStep]
  const isFinalStep = currentStep >= timeline.steps.length - 1

  const outcomeLabel = timeline.battle?.outcome === 'attacker_victory'
    ? 'Attacker victory'
    : timeline.battle?.outcome === 'defender_victory'
      ? 'Defender victory'
      : null

  const formatActionText = (a, entities) => {
    const actor = entities.find((e) => e.id === a.actor_id)
    const target = a.target_id ? entities.find((e) => e.id === a.target_id) : null
    const pastTense = { move: 'moved toward', attack: 'attacked', bombard: 'bombarded', capture: 'captured', retreat: 'retreated from', surround: 'surrounded', victory: 'declared victory' }
    const verb = pastTense[a.type] || a.type
    const targetName = target ? ` ${target.label || a.target_id}` : ''
    return { actor: actor?.label || a.actor_id, verb, target: targetName }
  }

  return (
    <div className="flex-1 bg-museum-black flex flex-col pt-[76px]">
      {/* Header */}
      <div className="border-b border-museum-gold/10">
        <div className="lcn-container-x py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h1 className="font-display text-3xl md:text-4xl text-museum-ivory tracking-tighter leading-tight">
                {timeline.battle?.name || template.name}
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-sm text-museum-parchment/80 font-serif">
                  {timeline.battle?.date || ''}
                </span>
                {outcomeLabel && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border border-museum-gold/20 text-museum-gold bg-museum-gold/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-museum-gold" />
                    {outcomeLabel}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="relative">
                <select
                  value={presetId}
                  onChange={(e) => selectBattle(e.target.value)}
                  className="appearance-none cursor-pointer rounded-full border border-museum-gold/20 bg-museum-ivory/5 pl-4 pr-8 py-2 text-sm font-medium text-museum-parchment/80 transition-all duration-300 hover:border-museum-gold/40 hover:text-museum-ivory focus:outline-none focus:ring-2 focus:ring-museum-gold/30"
                >
                  {BATTLE_TEMPLATES.map((b) => (
                    <option key={b.id} value={b.id} className="bg-museum-black text-museum-ivory">
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronLeft className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rotate-[-90deg] h-3.5 w-3.5 text-museum-gold/50" />
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-full border border-museum-gold/15 bg-museum-ivory/5 text-museum-gold/70 hover:text-museum-gold hover:bg-museum-gold/10 transition-all"
                aria-label="Toggle narration panel"
              >
                <ScrollText className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Canvas */}
        <div className="flex-1 relative bg-museum-charcoal overflow-hidden">
          <CanvasRenderer
            timeline={timeline}
            currentStep={currentStep}
            animProgress={animProgress}
          />

          {/* Playback Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-museum-black/80 backdrop-blur-md border border-museum-gold/15 rounded-full px-3 py-2 shadow-lg">
            <button
              onClick={() => goToStep(0)}
              disabled={currentStep === 0}
              className="p-1.5 rounded-full text-museum-gold/70 hover:text-museum-gold hover:bg-museum-gold/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={() => goToStep(currentStep - 1)}
              disabled={currentStep === 0}
              className="p-1.5 rounded-full text-museum-gold/70 hover:text-museum-gold hover:bg-museum-gold/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-museum-gold/15 text-museum-gold hover:bg-museum-gold/25 transition-all"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              onClick={() => goToStep(currentStep + 1)}
              disabled={isFinalStep}
              className="p-1.5 rounded-full text-museum-gold/70 hover:text-museum-gold hover:bg-museum-gold/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => goToStep((timeline.steps.length - 1))}
              disabled={isFinalStep}
              className="p-1.5 rounded-full text-museum-gold/70 hover:text-museum-gold hover:bg-museum-gold/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            {/* Separator */}
            <div className="w-px h-5 bg-museum-gold/20 mx-0.5" />

            {/* Speed Controls */}
            {SPEEDS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSpeed(s.value)}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-full font-medium transition-all',
                  speed === s.value
                    ? 'bg-museum-gold/20 text-museum-gold'
                    : 'text-museum-muted hover:text-museum-gold/70'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="border-l border-museum-gold/15 bg-museum-black/60 backdrop-blur-md overflow-hidden flex-shrink-0"
            >
              <div className="w-[360px] h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-5 museum-scrollbar">
                  {step?.time_label && (
                    <div className="flex items-center gap-2 mb-5">
                      <Flag className="h-3.5 w-3.5 text-museum-gold/60" />
                      <span className="text-xs text-museum-gold/70 font-medium">
                        {step.time_label}
                      </span>
                    </div>
                  )}

                  <h3 className="font-display text-xl text-museum-ivory mb-3 leading-snug">
                    {step?.title}
                  </h3>
                  <p className="text-xs text-museum-gold/60 mb-4 font-medium">
                    Step {step?.step} of {timeline.steps.length}
                  </p>

                  <p className="text-sm text-museum-parchment/80 leading-relaxed mb-6 font-serif">
                    {step?.narration}
                  </p>

                  {/* Factions */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-museum-gold/10" />
                      <span className="text-[0.7rem] text-museum-gold/60 font-medium">Factions</span>
                      <div className="h-px flex-1 bg-museum-gold/10" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {timeline.factions?.map((f) => (
                        <span
                          key={f.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border font-medium"
                          style={{
                            borderColor: f.color + '40',
                            color: f.color,
                            backgroundColor: f.color + '12'
                          }}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                          {f.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Current Actions */}
                  {step?.actions?.length > 0 && (
                    <div className="mb-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-px flex-1 bg-museum-gold/10" />
                        <span className="text-[0.7rem] text-museum-gold/60 font-medium">Actions</span>
                        <div className="h-px flex-1 bg-museum-gold/10" />
                      </div>
                      <div className="space-y-1.5">
                        {step.actions.map((a, i) => {
                          const info = formatActionText(a, timeline.entities || [])
                          const entity = timeline.entities?.find((e) => e.id === a.actor_id)
                          const faction = timeline.factions?.find((f) => f.id === entity?.faction_id)
                          return (
                            <div key={i} className="flex items-center gap-2 text-xs py-0.5">
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: faction?.color || '#D8A24A' }}
                              />
                              <span className="text-museum-parchment/70">
                                <span className="text-museum-ivory/80 font-medium">{info.actor}</span>
                                {' '}{info.verb}{info.target}
                              </span>
                              {a.label && (
                                <span className="text-museum-gold/50 italic ml-auto text-[0.65rem]">{a.label}</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Terrain Features */}
                  {timeline.map?.terrain?.length > 0 && (
                    <div className="mb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-px w-4 bg-museum-gold/15" />
                        <span className="text-[0.7rem] text-museum-gold/60 font-medium">Terrain</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {timeline.map.terrain.map((t) => (
                          <span key={t.id} className="px-2 py-0.5 rounded-full text-[0.65rem] bg-museum-ivory/5 border border-museum-gold/10 text-museum-muted">
                            {t.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Legend */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-px w-4 bg-museum-gold/15" />
                      <span className="text-[0.7rem] text-museum-gold/60 font-medium">Legend</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[0.65rem]">
                      {[
                        { color: '#8F1D1D', icon: '\u25C9', desc: 'In combat' },
                        { color: '#D8A24A', icon: '\u25EF', desc: 'Holding position' },
                        { color: '#A99D8A', icon: '\u2190', desc: 'Falling back' },
                        { color: '#8F1D1D', icon: '\u2715', desc: 'Eliminated' },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="text-[0.7rem]" style={{ color: s.color }}>{s.icon}</span>
                          <span className="text-museum-ivory/60">{s.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Timeline Stepper */}
                <div className="border-t border-museum-gold/15 p-3">
                  <div className="flex gap-1.5 overflow-x-auto pb-1 museum-scrollbar">
                    {timeline.steps.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => goToStep(i)}
                        className={cn(
                          'flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-full text-[0.65rem] transition-all border min-w-[64px]',
                          i === currentStep
                            ? 'bg-museum-gold/15 border-museum-gold/30 text-museum-gold'
                            : i < currentStep
                              ? 'bg-museum-ivory/3 border-museum-gold/10 text-museum-muted'
                              : 'bg-transparent border-transparent text-museum-muted/50 hover:bg-museum-ivory/3'
                        )}
                      >
                        <span className="font-bold text-xs">{s.step}</span>
                        <span className="text-center leading-tight">{s.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Victory Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-museum-black/80 backdrop-blur-sm"
            onClick={() => setShowSummary(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="museum-card max-w-lg w-[90%] p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-museum-gold text-5xl mb-4">&#9876;</div>
              <h2 className="font-display text-2xl text-museum-ivory mb-3">Battle Complete</h2>
              <p className="text-museum-parchment/70 text-sm mb-2">
                {timeline.battle?.name} ({timeline.battle?.date})
              </p>
              <p className="text-museum-muted text-sm mb-6 leading-relaxed">
                {timeline.battle?.summary}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {timeline.steps.map((s) => (
                  <span key={s.step} className="px-2.5 py-1 rounded-full text-xs border border-museum-gold/20 text-museum-gold/80 bg-museum-gold/5">
                    {s.step}. {s.title}
                  </span>
                ))}
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setShowSummary(false); goToStep(0) }}
                  className="px-5 py-2 rounded-full border border-museum-gold/30 text-museum-gold hover:bg-museum-gold/10 transition-all text-sm"
                >
                  Replay
                </button>
                <button
                  onClick={() => setShowSummary(false)}
                  className="px-5 py-2 rounded-full bg-museum-gold/15 border border-museum-gold/30 text-museum-ivory hover:bg-museum-gold/25 transition-all text-sm"
                >
                  Review Last Step
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
