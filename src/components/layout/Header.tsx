import type { ReactNode } from 'react'

interface HeaderProps {
  children?: ReactNode
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="bg-brand-dark text-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center font-bold text-sm">
          NP
        </div>
        <h1 className="text-lg font-bold">New Power Cotizador</h1>
        {children && <div className="ml-auto">{children}</div>}
      </div>
    </header>
  )
}
