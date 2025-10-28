import { useState } from 'react'
import axios from 'axios'
import { Tile, Button, TextArea, Stack, Tag } from '@carbon/react'
import { Chat } from '@carbon/icons-react'

const ai = axios.create({
    baseURL: import.meta.env.VITE_AI_SERVICE_URL
})

export default function ChatBot() {
    const [query, setQuery] = useState('')
    const [response, setResponse] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function sendQuery() {
        setLoading(true)
        setError('')
        try {
            const res = await ai.post('/api/chat/query', { query })
            setResponse(res.data)
        } catch (e) {
            setError(e?.message || 'Query failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Stack gap={6} style={{ maxWidth: '1200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Chat size={32} />
                <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>AI Chat Assistant</h1>
            </div>

            <p style={{ color: '#525252', marginBottom: '1rem' }}>
                Ask questions about your artifacts using natural language. The AI will analyze your query and provide intelligent responses.
            </p>

            <Tile style={{ padding: '2rem' }}>
                <TextArea
                    id="chat-query"
                    labelText="Ask a question about your artifacts"
                    rows={5}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Example: What are the latest deployment versions? Or: Show me artifacts related to user authentication..."
                />
                <div style={{ marginTop: '1rem' }}>
                    <Button onClick={sendQuery} disabled={loading || !query.trim()} size="lg">
                        {loading ? 'Processing...' : 'Send'}
                    </Button>
                </div>
            </Tile>

            {error && (
                <Tile style={{ padding: '1.5rem', backgroundColor: '#fff1f1' }}>
                    <p style={{ color: '#da1e28' }}>{error}</p>
                </Tile>
            )}

            {response && (
                <Tile style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Tag type="blue">{response.type?.toUpperCase() || 'RESPONSE'}</Tag>
                        {response.totalResults !== undefined && (
                            <Tag type="gray">{response.totalResults} results found</Tag>
                        )}
                    </div>

                    {response.answer && (
                        <div style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>
                            {response.answer}
                        </div>
                    )}

                    {response.data && response.data.length > 0 && (
                        <div>
                            <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 600 }}>
                                Related Artifacts:
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {response.data.map((item, idx) => (
                                    <li key={idx} style={{
                                        padding: '0.75rem',
                                        marginBottom: '0.5rem',
                                        backgroundColor: '#f4f4f4',
                                        borderRadius: '4px'
                                    }}>
                                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                                        <div style={{ fontSize: '0.875rem', color: '#525252' }}>
                                            Version: {item.version || 'N/A'} | Type: {item.type || 'N/A'}
                                        </div>
                                        {item.description && (
                                            <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: '#525252' }}>
                                                {item.description}
                                            </div>
                                        )}
                                        {item.relevance && (
                                            <Tag size="sm" type="green" style={{ marginTop: '0.25rem' }}>
                                                Relevance: {item.relevance}
                                            </Tag>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Tile>
            )}
        </Stack>
    )
}

