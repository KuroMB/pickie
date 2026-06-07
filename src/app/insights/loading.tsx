export default function InsightsLoading() {
  return (
    <div className="min-h-dvh bg-coral-50">
      <div className="sticky top-0 z-10 bg-coral-50/95 backdrop-blur-sm border-b border-coral-100">
        <div className="max-w-mobile mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-4 h-4 bg-coral-100 rounded animate-pulse" />
          <div className="w-28 h-4 bg-coral-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="max-w-mobile mx-auto px-4 pt-4 pb-10 space-y-6">
        {[0, 1, 2].map((s) => (
          <div key={s}>
            <div className="w-24 h-3 bg-coral-100 rounded animate-pulse mb-3" />
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-coral-100 px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-4 bg-coral-50 rounded animate-pulse" />
                  <div className="w-8 h-8 bg-coral-50 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 bg-coral-50 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-coral-50 rounded animate-pulse w-1/3" />
                  </div>
                  <div className="w-10 h-5 bg-coral-50 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
