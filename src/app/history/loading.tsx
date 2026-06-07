export default function HistoryLoading() {
  return (
    <div className="min-h-dvh bg-coral-50 animate-pulse">
      <div className="sticky top-0 z-10 bg-coral-50/95 backdrop-blur-sm border-b border-coral-100">
        <div className="max-w-mobile mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-4 h-4 bg-coral-200 rounded" />
          <div className="h-4 w-24 bg-coral-200 rounded" />
        </div>
      </div>
      <div className="max-w-mobile mx-auto px-4 pt-6 pb-10 space-y-6">
        {[1, 2].map((group) => (
          <div key={group}>
            <div className="h-3 w-28 bg-coral-200 rounded mb-3" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-coral-100 h-16" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
