import { useState } from 'react'
import axios from 'axios'
import { Tile, Button, TextArea, Stack, Tag, InlineNotification } from '@carbon/react'
import { Search } from '@carbon/icons-react'

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
        setResults(null)
        try {
            const res = await ai.post('/api/sync/search', { text, limit: 5 })
            setResults(res.data)
        } catch (e) {
            setError(e?.response?.data?.error || e.message || 'Search failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Stack gap={6} style={{ maxWidth: '1200px' }}>
            <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={24} style={{ color: '#0f62fe' }} />
                    AI Semantic Search
                </h1>
                <p style={{ color: '#525252', fontSize: '1.125rem' }}>
                    Search your artifacts using natural language queries.
                </p>
            </div>

            {error && <InlineNotification kind="error" title="Search failed" subtitle={error} />}

            <Tile style={{ padding: '2rem' }}>
                <TextArea
                    id="search-query"
                    labelText="Search query"
                    rows={5}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Example: spring boot artifacts, find all jar files, search microservices..."
                />
                <div style={{ marginTop: '1rem' }}>
                    <Button onClick={search} disabled={loading || !text.trim()} size="lg" style={{ minWidth: '140px' }}>
                        {loading ? 'Searching...' : 'Search'}
                    </Button>
                </div>
            </Tile>

            {results && results.length > 0 && (
                <Tile style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
                        Search Results ({results.length})
                    </h3>
                    <Stack gap={4}>
                        {results.map((item, idx) => (
                            <Tile key={idx} style={{ padding: '1.5rem', backgroundColor: '#f4f4f4' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                    <div>
                                        <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                            {item.payload?.name || 'Unknown'}
                                        </div>
                                        {item.payload?.description && (
                                            <div style={{ color: '#525252', fontSize: '0.875rem' }}>
                                                {item.payload.description}
                                            </div>
                                        )}
                                    </div>
                                    <Tag type="blue">{(item.score * 100).toFixed(0)}% match</Tag>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
                                    <div>
                                        <strong>Version:</strong> {item.payload?.version || 'N/A'}
                                    </div>
                                    <div>
                                        <strong>Type:</strong> {item.payload?.type || 'N/A'}
                                    </div>
                                    <div>
                                        <strong>ID:</strong> {item.id || 'N/A'}
                                    </div>
                                    {item.payload?.filePath && (
                                        <div>
                                            <strong>Path:</strong> {item.payload.filePath}
                                        </div>
                                    )}
                                </div>
                            </Tile>
                        ))}
                    </Stack>
                </Tile>
            )}

            {results && results.length === 0 && (
                <Tile style={{ padding: '2rem', textAlign: 'center' }}>
                    <p style={{ color: '#525252' }}>No results found for your search.</p>
                </Tile>
            )}
        </Stack>
    )
}


