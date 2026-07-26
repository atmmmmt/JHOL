import { motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'
import {
  useCallback,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,

} from 'react'
import type { HomeServicesRevealContent } from '../../../../lib/api'
import Container from '../../common/container'
import { fadeUp } from '../../../lib/motion'
import type { StaticImageData } from 'next/image'
import { useCursorMask } from '../../common/cursor-mask-context'
import CtaLinkButton from '../../common/cta-link-button'
import { useLiveSection } from '../../../lib/use-live-image'

type GifPillProps = {
  src: string | StaticImageData;
  alt: string;
  widthClass?: string;
  delay?: number;
  isActive?: boolean;
}



function GifPill({
  src,
  alt,
  widthClass = 'w-[clamp(120px,14vw,190px)]',
  delay = 0,
  isActive = false,
}: GifPillProps) {
  const resolvedSrc = typeof src === 'string' ? src : src.src

  return (
    <motion.span
      className={`inline-flex h-[clamp(54px,6.2vw,92px)] ${widthClass} shrink-0 overflow-hidden rounded-full border align-middle transition-colors ${isActive ? 'border-(--primary-shades-03)/50' : 'border-(--primary-shades-03)/20'}`}
      {...fadeUp(delay, 24, 0.6)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <img src={resolvedSrc} alt={alt} className="h-full w-full object-cover" />
    </motion.span>
  )
}

type ServiceLine = {
  id: string;
  prefix: string;
  suffix: string;
  gif: string | StaticImageData;
  gifAlt: string;
  gifWidthClass?: string;
  enterDelay: number;
  tickerItems: string[];
}

type RevealBandProps = {
  items: string[]
}

function RevealBand({ items }: RevealBandProps) {
  const repeated = useMemo(() => [...items, ...items], [items])

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "clamp(74px,8vw,120px)", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full overflow-hidden"
    >
      <div className="absolute inset-0">
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ originY: 1 }}
          className="absolute inset-x-0 top-0 h-full bg-(--primary-shades-02)"
        />
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ originY: 0 }}
          className="absolute inset-x-0 bottom-0 h-full bg-(--primary-shades-02)"
        />
      </div>

      <div className="relative z-10 flex h-full items-center overflow-hidden border-y border-white/10">
        <motion.div
          className="flex min-w-max items-center whitespace-nowrap text-[clamp(0.95rem,2vw,2.1rem)] font-normal leading-none tracking-tight text-(--white-shades-01)"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          {repeated.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="mx-[clamp(0.8rem,3.2vw,2.7rem)]"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

function clampMagnet(n: number, max: number) {
  return Math.min(max, Math.max(-max, n))
}

function SecondAboutSection({ content }: { content: HomeServicesRevealContent }) {
  const liveContent = useLiveSection("home_services_reveal", content)
  const [activeLine, setActiveLine] = useState<string | null>(null)
  const [ctaMagnet, setCtaMagnet] = useState({ x: 0, y: 0 })
  const { setMaskMode, ctaTargetRef } = useCursorMask()
  const resolvedServiceLines = useMemo<ServiceLine[]>(
    () =>
      liveContent.serviceLines.map((line, index) => ({
        id: line.id || `service-line-${index + 1}`,
        prefix: line.prefix,
        suffix: line.suffix,
        gif: line.image,
        gifAlt: line.alt || line.prefix || line.id,
        enterDelay: line.enterDelay ?? 0.12 + index * 0.08,
        tickerItems: Array.isArray(line.tickerItems) ? line.tickerItems : [],
      })),
    [liveContent.serviceLines],
  )
  const onCtaPointerMove = useCallback(
    (e: ReactMouseEvent<HTMLSpanElement>) => {
      const r = e.currentTarget.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const strength = 0.42
      const max = 22
      setCtaMagnet({
        x: clampMagnet((e.clientX - cx) * strength, max),
        y: clampMagnet((e.clientY - cy) * strength, max),
      })
    },
    [],
  )
  return (
    <motion.section
      className="bg-(--white-shades-01) py-[clamp(5rem,8vw,8rem)]"
      {...fadeUp(0, 40, 0.7)}
    >
      <Container className="text-(--primary-shades-03)">
        <motion.p
          className="text-center font-poppins text-fluid-lg font-bold leading-tight"
          {...fadeUp(0.06, 32, 0.65)}
        >
          {liveContent.headline}
        </motion.p>

        <div className="mt-[clamp(2.25rem,4.6vw,3.8rem)] space-y-[clamp(1.3rem,2.8vw,2.4rem)] text-center font-poppins text-[clamp(2rem,5.1vw,3.9rem)] font-normal leading-[1.1] tracking-[-0.02em]">
          {resolvedServiceLines.map((line) => (
            <div
              key={line.id}
              onMouseEnter={() => setActiveLine(line.id)}
              onMouseLeave={() => setActiveLine(null)}
              onFocus={() => setActiveLine(line.id)}
              onBlur={() => setActiveLine(null)}
              className="relative"
            >
              <AnimatePresence>
                {activeLine === line.id ? (
                  <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 w-screen -translate-x-1/2 -translate-y-1/2">
                    <RevealBand items={line.tickerItems} />
                  </div>
                ) : null}
              </AnimatePresence>

              <motion.div
                className="flex flex-wrap items-center justify-center gap-x-fluid-2 gap-y-fluid-2"
                {...fadeUp(line.enterDelay, 34, 0.7)}
              >
                <motion.span {...fadeUp(line.enterDelay + 0.03, 24, 0.6)}>
                  {line.prefix}
                </motion.span>
                <GifPill
                  src={line.gif}
                  alt={line.gifAlt}
                  widthClass={line.gifWidthClass}
                  delay={line.enterDelay + 0.06}
                  isActive={activeLine === line.id}
                />
                <motion.span {...fadeUp(line.enterDelay + 0.09, 24, 0.6)}>
                  {line.suffix}
                </motion.span>
              </motion.div>
            </div>
          ))}
        </div>
        <motion.div
          className="mt-[clamp(2.75rem,5.2vw,4.5rem)] flex justify-center"
          {...fadeUp(0.42, 34, 0.7)}
        >
          <span
            ref={ctaTargetRef}
            className="inline-flex max-lg:cursor-pointer cursor-none"
            onMouseEnter={() => setMaskMode('cta')}
            onMouseMove={onCtaPointerMove}
            onMouseLeave={() => {
              setCtaMagnet({ x: 0, y: 0 })
              setMaskMode('none')
            }}
          >
            <motion.div
              animate={{ x: ctaMagnet.x, y: ctaMagnet.y }}
              transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.55 }}
              className="inline-flex will-change-transform"
            >
              <CtaLinkButton
                href={liveContent.ctaHref || "/works"}
                label={liveContent.ctaLabel}
                scroll={false}
                surface="light"
              />
            </motion.div>
          </span>
        </motion.div>
      </Container>
    </motion.section>
  )
}

export default SecondAboutSection
