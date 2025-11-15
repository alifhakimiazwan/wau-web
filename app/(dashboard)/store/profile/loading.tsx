import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function StoreProfileLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Form Section */}
        <div className="flex-1 max-w-5xl space-y-6">
          {/* Back Button */}
          <Skeleton className="h-10 w-[100px]" />

          {/* Profile Images Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-4 w-[250px]" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Picture */}
                <div className="space-y-4">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-32 w-32 rounded-full" />
                  <Skeleton className="h-10 w-[140px]" />
                </div>

                {/* Banner Image */}
                <div className="space-y-4">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-10 w-[140px]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[180px]" />
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Store Name */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-24 w-full" />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Social Links Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[120px]" />
              <Skeleton className="h-4 w-[280px]" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-10" />
                </div>
              ))}
              <Skeleton className="h-10 w-[150px]" />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </div>

        {/* Preview Section - Hidden on mobile, visible on xl */}
        <div className="hidden xl:block w-[420px]">
          <div className="sticky top-6">
            <Skeleton className="h-4 w-[100px] mb-4" />
            <Skeleton className="h-[600px] w-full rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
