import React, { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function LoadingBar() {
  return <div className="loadingbar"><div></div></div>
}

function useApi(key) {
  const headers = useMemo(() => (key ? { 'X-API-Key': key } : {}), [key])
  const get = async (path) => {
    const r = await fetch(`${API_URL}${path}`, { headers })
    if (!r.ok) throw new Error(await r.text())
    return r.json()
  }
  const post = async (path, body) => {
    const r = await fetch(`${API_URL}${path}`, { method:'POST', headers: { ...headers, 'Content-Type':'application/json' }, body: JSON.stringify(body || {}) })
    if (!r.ok) throw new Error(await r.text())
    return r.json()
  }
  return { get, post }
}

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('xfund_api_key') || '')
  const [balances, setBalances] = useState(null)
  const [trades, setTrades] = useState(null)
  const [deadman, setDeadman] = useState(null)
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')

  const api = useApi(apiKey)

  const saveKey = () => {
    localStorage.setItem('xfund_api_key', apiKey)
    refresh()
  }

  const refresh = async () => {
    try {
      setLoading(true)
      setNote('')
      const [b, t, d] = await Promise.all([
        api.get('/api/spot-balances'),
        api.get('/api/trades'),
        api.get('/api/deadman')
      ])
      setBalances(b); setTrades(t); setDeadman(d)
    } catch (e) {
      setNote(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const resp = await fetch(`${API_URL}/api/config`)
        if (!resp.ok) return
        const data = await resp.json()
        if (!cancelled && data?.apiKey) {
          setApiKey(data.apiKey)
          localStorage.setItem('xfund_api_key', data.apiKey)
        }
      } catch (err) {
        console.warn('Failed to load config', err)
      }
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!apiKey) return
    refresh()
  }, [apiKey])

  const fmtSecs = (s) => {
    const h = Math.floor(s/3600)
    const m = Math.floor((s%3600)/60)
    const sec = s%60
    return `${h}h ${m}m ${sec}s`
  }

  const doReset = async () => {
    await api.post('/api/deadman/reset', {})
    const d = await api.get('/api/deadman')
    setDeadman(d)
  }

  const doRebalance = async (asset, execute=false) => {
    setLoading(true)
    setNote(`Rebalance ${asset} ${execute ? '(EXECUTE)' : '(DRY RUN)'} started...`)
    try {
      const resp = await api.post('/api/rebalance', { asset, execute })
      setNote(`Rebalance ${asset}: done. ${execute ? 'Executed withdrawals (see backend logs/responses).' : 'Dry-run only.'}`)
      console.log(resp)
    } catch (e) {
      setNote(String(e))
    } finally {
      setLoading(false)
      refresh()
    }
  }

  const doAutohedge = async (execute=false) => {
    setLoading(true)
    setNote(`Auto-hedge ${execute ? '(EXECUTE)' : '(DRY RUN)'} started...`)
    try {
      const resp = await api.post('/api/autohedge', { execute })
      setNote(`Auto-hedge complete. ${execute ? 'Orders placed (see backend logs/responses).' : 'Dry-run only.'}`)
      console.log(resp)
    } catch (e) {
      setNote(String(e))
    } finally {
      setLoading(false)
      refresh()
    }
  }

  return (
    <div className="container">
      <h1>xFund Dashboard v0.01 alpha</h1>
      <div className="card">
        <div className="row" style={{alignItems:'center', gap:12}}>
          <div className="col" style={{maxWidth:340}}>
            <label>API Key</label><br/>
            <input value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="X-API-Key" style={{width:'100%', marginTop:6}}/>
          </div>
          <div><button onClick={saveKey}>Save</button></div>
          <div><button onClick={refresh}>Refresh</button></div>
          {loading && <div style={{flex:1}}><LoadingBar/></div>}
        </div>
        {!!note && <div style={{marginTop:8}} className="pill">{note}</div>}
      </div>

      <div className="grid2">
        <div className="card">
          <h2>Spot Balances</h2>
          {!balances ? <LoadingBar/> : (
            <table>
              <thead><tr><th>Exchange</th><th>Coin</th><th>Amount</th></tr></thead>
              <tbody>
                {Object.entries(balances).map(([ex, obj]) => (
                  obj.balances ? Object.entries(obj.balances).map(([coin, amt]) => (
                    <tr key={`${ex}-${coin}`}><td>{ex}</td><td>{coin}</td><td>{amt}</td></tr>
                  )) : <tr key={ex}><td>{ex}</td><td colSpan="2">Error: {obj.error}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2>Open Perp Trades</h2>
          {!trades ? <LoadingBar/> : (
            <div>
              <h3>USDT Margin</h3>
              <table>
                <thead><tr><th>Ex</th><th>Symbol</th><th>Side</th><th>Contracts</th><th>Notional</th><th>uPNL</th></tr></thead>
                <tbody>
                  {trades.USDT?.map((t,i)=> (
                    <tr key={`u-${i}`}>
                      <td>{t.exchange}</td><td>{t.symbol}</td><td>{t.side}</td><td>{t.contracts}</td><td>{t.notional}</td><td>{t.unrealizedPnl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3>USDC Margin</h3>
              <table>
                <thead><tr><th>Ex</th><th>Symbol</th><th>Side</th><th>Contracts</th><th>Notional</th><th>uPNL</th></tr></thead>
                <tbody>
                  {trades.USDC?.map((t,i)=> (
                    <tr key={`c-${i}`}>
                      <td>{t.exchange}</td><td>{t.symbol}</td><td>{t.side}</td><td>{t.contracts}</td><td>{t.notional}</td><td>{t.unrealizedPnl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {trades.errors && Object.keys(trades.errors).length>0 && (
                <div className="pill" style={{marginTop:8}}>Errors: {JSON.stringify(trades.errors)}</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Rebalance</h2>
        <div className="row">
          <button onClick={()=>doRebalance('USDT', false)}>Plan USDT</button>
          <button onClick={()=>doRebalance('USDT', true)}>Execute USDT</button>
          <button onClick={()=>doRebalance('USDC', false)}>Plan USDC</button>
          <button onClick={()=>doRebalance('USDC', true)}>Execute USDC</button>
        </div>
      </div>

      <div className="card">
        <h2>Dead Man Switch</h2>
        {!deadman ? <LoadingBar/> : (
          <div className="row" style={{alignItems:'center'}}>
            <div className="col"><strong>Time Remaining (UTC)</strong><div className="pill" style={{marginTop:6}}>{fmtSecs(deadman.seconds_remaining)}</div></div>
            <div><button onClick={doReset}>I am alive — Reset 24h</button></div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Auto‑Hedge</h2>
        <div className="row">
          <button onClick={()=>doAutohedge(false)}>Plan</button>
          <button onClick={()=>doAutohedge(true)}>Execute</button>
        </div>
        <div className="footer">Auto‑hedge reduces excess side per symbol across USDT/USDC buckets using market orders on the exchanges holding that excess.</div>
      </div>

      <div className="footer">xFund Dashboard — minimal MVP</div>
    </div>
  )
}
