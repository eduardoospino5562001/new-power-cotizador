import type { ReactNode } from 'react'
import { FolderKanban, History, Moon, Sun } from 'lucide-react'

interface HeaderProps {
  children?: ReactNode
  onHistory?: () => void
  onHome?: () => void
  darkMode?: boolean
  onToggleTheme?: () => void
}

export function Header({ children, onHistory, onHome, darkMode, onToggleTheme }: HeaderProps) {
  const navigation = (
    <nav className="space-y-1">
      {onHome && <button type="button" onClick={onHome} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-brand-orange-light transition-colors hover:bg-white/10 hover:text-white"><FolderKanban size={18} /> Centro de documentos</button>}
      {onHistory && <button type="button" onClick={onHistory} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-brand-orange-light transition-colors hover:bg-white/10 hover:text-white"><History size={18} /> Historial</button>}
    </nav>
  )

  return (
    <>
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-white/10 bg-brand-dark p-5 text-white lg:flex">
      <div className="mb-12 flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-lg bg-brand-orange font-bold text-sm">NP</div><h1 className="font-bold">New Power</h1></div>
      {navigation}
      <button type="button" onClick={onToggleTheme} className="mt-auto flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-brand-orange-light hover:bg-white/10">{darkMode ? <Sun size={18} /> : <Moon size={18} />}{darkMode ? 'Modo claro' : 'Modo oscuro'}</button>
    </aside>
    <header className="bg-brand-dark px-4 py-3 text-white lg:hidden sm:px-6 sm:py-4">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center font-bold text-sm">
          NP
        </div>
        <h1 className="min-w-0 text-base font-bold sm:text-lg">New Power Cotizador</h1>
        <div className="ml-auto flex items-center gap-1">
          {onToggleTheme && <button type="button" onClick={onToggleTheme} className="flex size-10 items-center justify-center rounded-lg text-brand-orange-light hover:bg-white/10" aria-label="Cambiar tema">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>}{children}
        </div>
      </div>
      {(onHome || onHistory) && <div className="mt-3 flex gap-1 border-t border-white/10 pt-2 text-sm"><button type="button" onClick={onHome} className="min-h-10 flex-1 rounded-md text-brand-orange-light hover:bg-white/10">Centro</button><button type="button" onClick={onHistory} className="min-h-10 flex-1 rounded-md text-brand-orange-light hover:bg-white/10">Historial</button></div>}
    </header>
    </>
  )
}
