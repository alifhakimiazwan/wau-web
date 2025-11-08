import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Store Not Found
          </h2>
          <p className="text-muted-foreground">
            The store you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
        </div>

        <Button asChild>
          <Link href="/" className="gap-2">
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
