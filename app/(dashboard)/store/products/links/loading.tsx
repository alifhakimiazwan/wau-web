import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export default function LinksLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-6 px-6">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-10 mb-4" />
          <Skeleton className="h-9 w-[180px]" />
          <Skeleton className="h-4 w-[320px] mt-2" />
        </div>

        {/* Two-column layout */}
        <div className="flex gap-8">
          {/* Form */}
          <div className="flex-1">
            {/* Basic Information Section */}
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <div className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[150px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
              <div className="sm:max-w-3xl md:col-span-2 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Thumbnail Section */}
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <div className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[120px]" />
                  <Skeleton className="h-4 w-[250px]" />
                </div>
              </div>
              <div className="sm:max-w-3xl md:col-span-2">
                <Skeleton className="h-48 w-full rounded-lg" />
              </div>
            </div>

            <Separator className="my-8" />

            {/* Link Type Section */}
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <div className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[140px]" />
                  <Skeleton className="h-4 w-[260px]" />
                </div>
              </div>
              <div className="sm:max-w-3xl md:col-span-2 space-y-4">
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-[100px]" />
                  <Skeleton className="h-10 w-[100px]" />
                </div>
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            </div>

            <Separator className="my-8" />

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-[120px]" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-[100px]" />
                <Skeleton className="h-10 w-[100px]" />
              </div>
            </div>
          </div>

          {/* Preview - Hidden on mobile */}
          <div className="hidden lg:block w-[400px]">
            <div className="sticky top-6">
              <Skeleton className="h-4 w-[80px] mb-4" />
              <Card className="p-6">
                <Skeleton className="h-[600px] w-full rounded-lg" />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
