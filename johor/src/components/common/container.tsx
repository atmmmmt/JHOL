import { type ReactNode } from 'react'
import { cn } from '../../lib/cn'

type ContainerProps = {
  children: ReactNode
  className?: string
}

function Container({ children, className = '' }: ContainerProps) {
  return <div className={cn('mx-auto w-full max-w-[86rem] px-fluid-4', className)}>{children}</div>
}

export default Container
