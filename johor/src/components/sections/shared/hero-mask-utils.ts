export function syncHeroMaskPosition(
  target: HTMLElement,
  clientX: number,
  clientY: number,
) {
  const rect = target.getBoundingClientRect()
  target.style.setProperty('--mask-x', `${clientX - rect.left}px`)
  target.style.setProperty('--mask-y', `${clientY - rect.top}px`)
}

export function clearHeroMaskPosition(target: HTMLElement) {
  target.style.removeProperty('--mask-x')
  target.style.removeProperty('--mask-y')
}
