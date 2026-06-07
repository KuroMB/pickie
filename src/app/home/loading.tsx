export default function HomeLoading() {
  return (
    <div className="min-h-dvh bg-coral-50 animate-pulse">
      {/* header */}
      <div className="sticky top-0 z-10 bg-coral-50/95 backdrop-blur-sm border-b border-coral-100">
        <div className="max-w-mobile mx-auto px-4 py-3 flex items-center justify-between">
          <div className="h-7 w-16 bg-coral-200 rounded-lg" />
          <div className="w-8 h-8 rounded-full bg-coral-200" />
        </div>
      </div>

      <div className="max-w-mobile mx-auto pt-4 pb-28 space-y-4">
        {/* tonight hero */}
        <div className="mx-4">
          <div className="bg-coral-200 rounded-3xl h-44" />
        </div>

        {/* coming up section */}
        <div className="mx-4">
          <div className="flex items-center justify-between mb-3">
            <div className="h-3 w-20 bg-coral-200 rounded" />
            <div className="h-7 w-20 bg-coral-100 rounded-full" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-coral-100 h-14" />
            ))}
          </div>
        </div>

        {/* suggestions */}
        <div className="mx-4">
          <div className="h-3 w-24 bg-coral-200 rounded mb-3" />
          <div className="bg-white rounded-2xl border border-coral-100 h-16" />
        </div>
      </div>
    </div>
  )
}
