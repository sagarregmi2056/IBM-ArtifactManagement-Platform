import { useState } from 'react'
import axios from 'axios'
import { Tile, Button, TextArea, Stack, Tag, InlineNotification } from '@carbon/react'
import { Chat as ChatIcon, Information } from '@carbon/icons-react'

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
        setResponse(null)
        try {
            const res = await ai.post('/api/chat/query', { query })
            setResponse(res.data)
        } catch (e) {
            setError(e?.response?.data?.error || e.message || 'Query failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Stack gap={6} style={{ maxWidth: '1200px' }}>
            <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ChatIcon size={24} style={{ color: '#0f62fe' }} />
                    AI Chat Assistant
                </h1>
                <p style={{ color: '#525252', fontSize: '1.125rem' }}>
                    Ask questions about your artifacts using natural language.
                </p>
            </div>

            {error && <InlineNotification kind="error" title="Chat failed" subtitle={error} />}

            <Tile style={{ padding: '2rem' }}>
                <TextArea
                    id="chat-query"
                    labelText="Ask a question about your artifacts"
                    rows={5}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Example: What are the latest versions of the user-service? Show me deployments for the payment gateway. Who committed to the authentication module recently?"
                />
                <div style={{ marginTop: '1rem' }}>
                    <Button onClick={sendQuery} disabled={loading || !query.trim()} size="lg" style={{ minWidth: '140px' }}>
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Processing...
                            </span>
                        ) : (
                            'Ask AI'
                        )}
                    </Button>
                </div>
            </Tile>

            {response && (
                <Tile style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Information size={20} />
                        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
                            AI Response {response.intent && `(${response.intent.replace('_', ' ')})`}
                        </h3>
                    </div>

                    <div style={{ marginBottom: '1rem', fontSize: '1.125rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {response.response || response.answer}
                    </div>

                    {response.context?.data && response.context.data.length > 0 && (
                        <Stack gap={3}>
                            <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1rem' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                                    Relevant Artifacts ({response.context.totalResults || response.context.data.length})
                                </h4>
                                <Stack gap={3}>
                                    {response.context.data.map((item, idx) => (
                                        <Tile key={idx} style={{ padding: '1rem', backgroundColor: '#f4f4f4' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                                        {item.name}
                                                    </div>
                                                    {item.description && (
                                                        <div style={{ fontSize: '0.875rem', color: '#525252', marginBottom: '0.25rem' }}>
                                                            {item.description}
                                                        </div>
                                                    )}
                                                </div>
                                                {item.relevance && (
                                                    <Tag type="blue">{item.relevance} match</Tag>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#525252' }}>
                                                <span><strong>Version:</strong> {item.version || 'N/A'}</span>
                                                <span><strong>Type:</strong> {item.type || 'N/A'}</span>
                                            </div>
                                        </Tile>
                                    ))}
                                </Stack>
                            </div>
                        </Stack>
                    )}
                </Tile>
            )}
        </Stack>
    )
}

