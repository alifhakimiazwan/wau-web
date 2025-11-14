import { BarChart3 } from 'lucide-react'

interface EmptyStateProps {
  message: string
  description?: string
}

export function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{message}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
    </div>
  )
}
