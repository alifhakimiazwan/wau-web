import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function StoreLoading() {
  return (
    <div className="container mx-auto p-6">
      {/* Tabs Navigation */}
      <div className="mb-6">
        <div className="flex gap-4 border-b">
          <Skeleton className="h-10 w-[100px] mb-[-1px]" />
          <Skeleton className="h-10 w-[120px] mb-[-1px]" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 max-w-2xl space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Avatar */}
                <Skeleton className="h-24 w-24 rounded-full" />

                {/* Name and Bio */}
                <div className="space-y-2 w-full">
                  <Skeleton className="h-7 w-[200px] mx-auto" />
                  <Skeleton className="h-4 w-full max-w-md mx-auto" />
                  <Skeleton className="h-4 w-[80%] max-w-md mx-auto" />
                </div>

                {/* Location and Contact */}
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>

                {/* Social Links */}
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-10 rounded-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>

          {/* Products Section */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-[150px]" />

            {/* Product List */}
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-6 w-6" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Section - Hidden on mobile, visible on lg */}
        <div className="hidden lg:block w-[400px]">
          <div className="sticky top-6">
            <Skeleton className="h-4 w-[100px] mb-4" />
            <Skeleton className="h-[600px] w-full rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
