import { useState } from 'react'
import axios from 'axios'

const ai = axios.create({
    baseURL: import.meta.env.VITE_AI_SERVICE_URL
})

export default function AISearch() {
    const [text, setText] = useState('')
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function search() {
        setLoading(true)
        setError('')
        try {
            const res = await ai.post('/sync/search', { text, limit: 5 })
            setResults(res.data?.results || [])
        } catch (e) {
            setError(e?.message || 'Search failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2>AI Semantic Search</h2>
            <textarea
                rows={4}
                placeholder="Describe what you are looking for..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ width: '100%', maxWidth: 640 }}
            />
            <div style={{ marginTop: 8 }}>
                <button onClick={search} disabled={loading || !text.trim()}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
            <ul style={{ marginTop: 12 }}>
                {results?.map((r, idx) => (
                    <li key={idx}>{JSON.stringify(r)}</li>
                ))}
            </ul>
        </div>
    )
}


