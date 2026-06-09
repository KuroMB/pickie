import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('household_id')
      .eq('id', user.id)
      .single()
    redirect(profile?.household_id ? '/home' : '/onboard')
  }

  return (
    <div className="min-h-dvh bg-[#FFF8F5] text-[#1A0A00]">

      {/* nav */}
      <header className="sticky top-0 z-20 bg-[#FFF8F5]/90 backdrop-blur-sm border-b border-[#FAECE7]">
        <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between">
          <span className="text-2xl font-bold text-[#D85A30] tracking-tight">pickie</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-[#1A0A00]/60 hover:text-[#1A0A00] transition-colors"
            >
              sign in
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-white bg-[#D85A30] px-4 py-2 rounded-full hover:bg-[#C44A20] transition-colors"
            >
              get started
            </Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="max-w-4xl mx-auto px-5 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-[#FAECE7] text-[#D85A30] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
          family meal planning
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-4">
          Dinner without<br className="hidden sm:block" /> the daily drama
        </h1>
        <p className="text-lg text-[#1A0A00]/55 max-w-md mx-auto leading-relaxed mb-8">
          Plan the week&apos;s meals, let the kids vote and suggest, and actually know what&apos;s for dinner before 5pm.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#D85A30] text-white font-semibold rounded-2xl text-base hover:bg-[#C44A20] transition-colors shadow-sm"
          >
            Create your family&apos;s menu →
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 border border-[#F5C4B3] text-[#D85A30] font-semibold rounded-2xl text-base hover:bg-[#FAECE7] transition-colors"
          >
            Sign in
          </Link>
        </div>
        <p className="text-xs text-[#1A0A00]/30 mt-4">Free · No credit card · Works on any phone</p>
      </section>

      {/* app preview */}
      <section className="max-w-4xl mx-auto px-5 pb-16">
        <div className="grid sm:grid-cols-2 gap-4">

          {/* coming up preview */}
          <div className="bg-white rounded-3xl border border-[#FAECE7] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#D85A30] uppercase tracking-widest mb-3">coming up</p>

            <div className="flex items-center gap-2 py-1.5 mb-2">
              <div className="h-px flex-1 bg-[#FAECE7]" />
              <span className="text-xs font-semibold text-[#E89080] uppercase tracking-wider whitespace-nowrap">tuesday · jun 10</span>
              <div className="h-px flex-1 bg-[#FAECE7]" />
            </div>
            <div className="bg-white rounded-2xl border border-[#FAECE7] px-4 py-3 mb-3 flex items-center gap-3">
              <span className="text-2xl">🌮</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Taco Tuesday</p>
                <p className="text-xs text-[#1A0A00]/40">with guac and chips</p>
              </div>
              <div className="flex gap-1 text-xs text-[#1A0A00]/40">
                <span>❤️ 2</span>
              </div>
            </div>

            <div className="flex items-center gap-2 py-1.5 mb-2">
              <div className="h-px flex-1 bg-[#FAECE7]" />
              <span className="text-xs font-semibold text-[#E89080] uppercase tracking-wider whitespace-nowrap">wednesday · jun 11</span>
              <div className="h-px flex-1 bg-[#FAECE7]" />
            </div>
            <div className="bg-white rounded-2xl border-2 border-dashed border-[#E89080] px-4 py-3 flex items-center gap-3">
              <span className="text-2xl">🍣</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Sushi night</p>
                <p className="text-xs text-[#D85A30] font-medium">suggested by Emma</p>
              </div>
              <div className="flex gap-1.5">
                <span className="w-8 h-8 rounded-xl bg-[#FAECE7] flex items-center justify-center text-[#D85A30] text-sm font-bold">✓</span>
                <span className="w-8 h-8 rounded-xl bg-[#1A0A00]/5 flex items-center justify-center text-[#1A0A00]/30 text-sm">✕</span>
              </div>
            </div>
          </div>

          {/* right column */}
          <div className="flex flex-col gap-4">

            {/* tonight hero preview */}
            <div className="bg-white rounded-3xl border border-[#FAECE7] p-5 shadow-sm">
              <p className="text-xs font-semibold text-[#D85A30] uppercase tracking-widest mb-3">tonight</p>
              <div className="bg-[#FAECE7] rounded-2xl p-4 flex items-center gap-4">
                <span className="text-5xl">🍕</span>
                <div>
                  <p className="text-lg font-bold leading-tight">Homemade Pizza</p>
                  <p className="text-sm text-[#1A0A00]/50 mt-0.5">make your own toppings</p>
                  <div className="flex gap-2 mt-2.5 flex-wrap">
                    <span className="text-xs bg-white px-2.5 py-1 rounded-full font-medium text-[#D85A30] border border-[#F5C4B3]">❤️ love it</span>
                    <span className="text-xs bg-white px-2.5 py-1 rounded-full font-medium text-[#1A0A00]/40 border border-[#FAECE7]">😐 meh</span>
                    <span className="text-xs bg-white px-2.5 py-1 rounded-full font-medium text-[#1A0A00]/40 border border-[#FAECE7]">👎 nope</span>
                  </div>
                </div>
              </div>
            </div>

            {/* poll preview */}
            <div className="bg-white rounded-3xl border border-[#FAECE7] p-5 shadow-sm">
              <p className="text-xs font-semibold text-[#1A0A00]/40 uppercase tracking-widest mb-3">📨 poll from Dad</p>
              <p className="text-base font-semibold mb-3">Friday night: burgers or chinese?</p>
              <div className="space-y-2">
                <div className="relative bg-[#FAECE7] rounded-xl h-9 overflow-hidden flex items-center px-3">
                  <div className="absolute inset-y-0 left-0 bg-[#F5C4B3] rounded-xl" style={{ width: '67%' }} />
                  <span className="relative z-10 text-sm font-medium text-[#D85A30]">🍔 Burgers</span>
                  <span className="relative z-10 ml-auto text-xs font-bold text-[#D85A30]">67%</span>
                </div>
                <div className="relative bg-[#FAECE7] rounded-xl h-9 overflow-hidden flex items-center px-3">
                  <div className="absolute inset-y-0 left-0 bg-[#FAECE7] rounded-xl" style={{ width: '33%' }} />
                  <span className="relative z-10 text-sm font-medium text-[#1A0A00]/50">🥡 Chinese</span>
                  <span className="relative z-10 ml-auto text-xs font-bold text-[#1A0A00]/40">33%</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* features */}
      <section className="bg-white border-y border-[#FAECE7]">
        <div className="max-w-4xl mx-auto px-5 py-14">
          <h2 className="text-2xl font-bold text-center mb-2">How it works</h2>
          <p className="text-center text-[#1A0A00]/50 text-sm mb-10">One planner runs the menu. Everyone else gets a voice.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { emoji: '📅', title: 'Plan the week', desc: 'Add meals to a 7-day agenda. Pick a date, an emoji, describe the dish. Done.' },
              { emoji: '🗳️', title: 'Kids vote', desc: 'Family members love, meh, or nope each upcoming meal. No more surprises at dinner.' },
              { emoji: '💡', title: 'Suggest & approve', desc: 'Kids request meals for specific nights. Planners approve or decline with one tap.' },
              { emoji: '🔔', title: 'Push notifications', desc: 'Everyone gets notified when meals are added, polls sent, or suggestions answered.' },
              { emoji: '📊', title: 'Family insights', desc: 'See what everyone rates highest and which meals get the most love votes.' },
              { emoji: '⏳', title: 'Meal history', desc: 'Browse past meals with per-person ratings. Reschedule a favorite in one tap.' },
            ].map((f) => (
              <div key={f.title} className="flex gap-4">
                <span className="text-3xl leading-none flex-shrink-0 mt-0.5">{f.emoji}</span>
                <div>
                  <p className="font-semibold text-base mb-1">{f.title}</p>
                  <p className="text-sm text-[#1A0A00]/50 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* roles */}
      <section className="max-w-4xl mx-auto px-5 py-14">
        <h2 className="text-2xl font-bold text-center mb-2">Built for the whole family</h2>
        <p className="text-center text-[#1A0A00]/50 text-sm mb-10">Different roles, one shared dinner calendar.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-[#FAECE7] rounded-3xl p-6">
            <p className="text-2xl mb-3">👨‍🍳</p>
            <p className="font-bold text-lg mb-2">The Planner</p>
            <p className="text-sm text-[#1A0A00]/60 leading-relaxed mb-4">You&apos;re in charge. Add meals, run polls, approve suggestions, and see the full week at a glance.</p>
            <ul className="space-y-1.5 text-sm text-[#1A0A00]/70">
              {['Add & edit meals', 'Send family polls', 'Approve meal suggestions', 'Invite family members'].map(i => (
                <li key={i} className="flex items-center gap-2"><span className="text-[#D85A30] font-bold">✓</span>{i}</li>
              ))}
            </ul>
          </div>
          <div className="bg-[#FAECE7] rounded-3xl p-6">
            <p className="text-2xl mb-3">👧</p>
            <p className="font-bold text-lg mb-2">The Family</p>
            <p className="text-sm text-[#1A0A00]/60 leading-relaxed mb-4">See what&apos;s coming, vote on meals, and suggest your favorites for specific nights.</p>
            <ul className="space-y-1.5 text-sm text-[#1A0A00]/70">
              {['Vote on upcoming meals', 'Suggest meals for specific days', 'Get notified when plans change', 'Rate dinner after eating'].map(i => (
                <li key={i} className="flex items-center gap-2"><span className="text-[#D85A30] font-bold">✓</span>{i}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* final cta */}
      <section className="bg-[#D85A30]">
        <div className="max-w-4xl mx-auto px-5 py-16 text-center">
          <p className="text-4xl mb-4">🍽️</p>
          <h2 className="text-3xl font-bold text-white mb-3">Ready to simplify dinner?</h2>
          <p className="text-white/70 text-base mb-8">Set up your family&apos;s menu in under 2 minutes.</p>
          <Link
            href="/login"
            className="inline-block px-10 py-4 bg-white text-[#D85A30] font-bold rounded-2xl text-base hover:bg-[#FFF8F5] transition-colors shadow-sm"
          >
            Create your free account
          </Link>
          <p className="text-white/40 text-xs mt-4">
            Already have an account?{' '}
            <Link href="/login" className="underline hover:text-white/70 transition-colors">Sign in</Link>
          </p>
        </div>
      </section>

    </div>
  )
}
