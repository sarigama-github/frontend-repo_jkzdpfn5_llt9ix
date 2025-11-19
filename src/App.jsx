import { useEffect, useMemo, useRef, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || ''

function Tag({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 backdrop-blur-sm">
      {children}
    </span>
  )
}

function Message({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
      <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 text-sm shadow-lg ${
        isUser
          ? 'bg-fuchsia-500/90 text-white border border-fuchsia-300/30'
          : 'bg-white/10 text-white border border-white/20 backdrop-blur'
      }`}
        style={!isUser ? { backgroundImage: 'url(https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=60)', backgroundSize:'cover', backgroundBlendMode:'overlay', backgroundColor:'rgba(20,20,20,0.6)'} : {}}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>
    </div>
  )
}

function Card({ r, onOpen }) {
  return (
    <button onClick={() => onOpen(r)} className="text-left group w-full">
      <div className="rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-indigo-600/30 to-emerald-600/30 backdrop-blur hover:from-indigo-600/40 hover:to-emerald-600/40 transition shadow-xl">
        <div className="h-44 w-full relative">
          <img src={r.photo_url || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1400&q=60'} alt={r.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/0" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
            <div>
              <h3 className="text-white font-bold text-lg drop-shadow-sm">{r.name}</h3>
              <p className="text-white/80 text-xs">{r.address} • {r.city}</p>
            </div>
            <div className="px-2 py-1 rounded-lg bg-black/60 text-amber-300 text-xs font-semibold">
              ⭐ {r.rating_avg?.toFixed?.(1) ?? r.rating_avg} ({r.rating_count || 0})
            </div>
          </div>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {r.cuisine?.slice(0,3).map((c) => (<Tag key={c}>{c}</Tag>))}
          {r.tags?.slice(0,2).map((t) => (<Tag key={t}>{t}</Tag>))}
          {r.takeaway && <Tag>takeaway</Tag>}
          <Tag>{'💸'.repeat(Math.min(4, Math.max(1, r.price_level || 2)))}</Tag>
        </div>
      </div>
    </button>
  )
}

function Modal({ open, onClose, r }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ user_name: '', rating: 5, comment: '' })

  useEffect(() => {
    if (!open || !r) return
    setLoading(true)
    fetch(`${BACKEND}/api/restaurants/${r.id}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || [])
      })
      .finally(() => setLoading(false))
  }, [open, r?.id])

  const submitReview = async (e) => {
    e.preventDefault()
    const res = await fetch(`${BACKEND}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, restaurant_id: r.id })
    })
    const data = await res.json()
    if (data?.status === 'ok') {
      // refresh
      const info = await (await fetch(`${BACKEND}/api/restaurants/${r.id}`)).json()
      setReviews(info.reviews || [])
      setForm({ user_name: '', rating: 5, comment: '' })
    }
  }

  if (!open || !r) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-2xl bg-slate-900/95 border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
        <div className="h-56 relative">
          <img src={r.photo_url || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1400&q=60'} alt={r.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-black/0" />
          <button className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 text-white text-sm" onClick={onClose}>Close</button>
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-white text-2xl font-bold drop-shadow">{r.name}</h3>
            <p className="text-white/80 text-sm">{r.address} • {r.city}</p>
          </div>
        </div>
        <div className="p-4 grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-semibold mb-2">Reviews</h4>
            {loading && <p className="text-white/70 text-sm">Loading...</p>}
            <div className="space-y-3 max-h-64 overflow-auto pr-2">
              {reviews.map((rv) => (
                <div key={rv.id} className="p-3 rounded-xl border border-white/10 bg-white/5 text-white">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{rv.user_name}</p>
                    <p className="text-amber-300">{'⭐'.repeat(rv.rating)}</p>
                  </div>
                  {rv.comment && <p className="text-white/80 text-sm mt-1">{rv.comment}</p>}
                </div>
              ))}
              {reviews.length === 0 && !loading && (
                <p className="text-white/70 text-sm">No reviews yet. Be the first!</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Add your review</h4>
            <form onSubmit={submitReview} className="space-y-3">
              <input value={form.user_name} onChange={(e)=>setForm(v=>({...v,user_name:e.target.value}))} placeholder="Your name" className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50" />
              <div className="flex items-center gap-2">
                <label className="text-white/80 text-sm">Rating</label>
                <select value={form.rating} onChange={(e)=>setForm(v=>({...v,rating: Number(e.target.value)}))} className="px-2 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <textarea value={form.comment} onChange={(e)=>setForm(v=>({...v,comment:e.target.value}))} placeholder="Share your experience" rows={3} className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50" />
              <button type="submit" className="px-4 py-2 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-semibold border border-white/20">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App(){
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! I'm your street-food savvy guide. Ask me about tacos, ramen, vegan spots, or anything local. Try: 'cheap ramen in London' or 'late-night tacos'."}
  ])
  const [input, setInput] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null)

  useEffect(() => {
    // seed demo data silently on first load (safe to call repeatedly)
    fetch(`${BACKEND}/api/seed`, { method: 'POST' }).catch(()=>{})
  }, [])

  const ask = async () => {
    const q = input.trim()
    if (!q) return
    const next = [...messages, { role: 'user', content: q }]
    setMessages(next)
    setInput('')
    const res = await fetch(`${BACKEND}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q })
    })
    const data = await res.json()
    setMessages(m => [...m, { role: 'assistant', content: data.answer || 'Here are some places you may like.' }])
    setResults(data.results || [])
  }

  const openCard = (r) => { setActive(r); setOpen(true) }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Graffiti background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,#ff00e6,transparent_40%),radial-gradient(circle_at_80%_20%,#00ffe1,transparent_40%),radial-gradient(circle_at_40%_80%,#ffd400,transparent_40%)] opacity-30" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1629380321590-3b3f75d66dec?ixid=M3w3OTkxMTl8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGhhbmRtYWRlfGVufDB8MHx8fDE3NjM1MTI1ODN8MA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(10%) contrast(90%) brightness(70%)'
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/60 to-black/80" />
      </div>

      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow" style={{textShadow:'0 2px 12px rgba(255,0,230,0.3)'}}>Street Bites Guide</h1>
        <div className="hidden md:flex gap-2">
          <Tag>tacos</Tag>
          <Tag>ramen</Tag>
          <Tag>vegan</Tag>
          <Tag>late-night</Tag>
        </div>
      </header>

      {/* Chat area */}
      <main className="px-4 md:px-8 pb-40">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((m, i) => (
            <Message key={i} role={m.role} content={m.content} />
          ))}
        </div>

        {/* Results grid */}
        {results.length > 0 && (
          <div className="max-w-5xl mx-auto mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((r) => (
              <Card key={r.id} r={r} onOpen={openCard} />
            ))}
          </div>
        )}
      </main>

      {/* Chat input dock */}
      <div className="fixed left-0 right-0 bottom-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 bg-white/10 border border-white/20 rounded-2xl p-2 backdrop-blur shadow-lg">
            <input
              className="flex-1 bg-transparent px-3 py-3 text-white placeholder-white/60 focus:outline-none"
              placeholder="Ask about places, dishes, price, city..."
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              onKeyDown={(e)=>{ if(e.key==='Enter') ask() }}
            />
            <button onClick={ask} className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold">
              Ask
            </button>
          </div>
          <p className="text-center text-white/60 text-xs mt-2">Tip: Try "cheap ramen in London" or "spicy tacos"</p>
        </div>
      </div>

      <Modal open={open} onClose={()=>setOpen(false)} r={active} />
    </div>
  )
}
