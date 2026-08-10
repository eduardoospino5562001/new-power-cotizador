import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:ml-64 lg:w-[calc(100%-16rem)] lg:max-w-none lg:mr-0 lg:px-10 lg:py-10 xl:px-14">
      {children}
    </main>
  )
}
