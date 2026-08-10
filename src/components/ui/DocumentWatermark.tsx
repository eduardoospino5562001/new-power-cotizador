import logoUrl from '@/assets/logo.jpeg'

export function DocumentWatermark() {
  return <img src={logoUrl} alt="" aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-2/5 max-w-48 -translate-x-1/2 -translate-y-1/2 opacity-[0.055]" />
}
