import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { Tile, Button, Tag, Stack, CodeSnippet } from '@carbon/react'
import { ArrowLeft, Application, Code, UserAvatar } from '@carbon/icons-react'

const api = axios.create({
    baseURL: import.meta.env.VITE_SPRING_BOOT_URL
})

export default function History() {
    const { id } = useParams()
    const navigate = useNavigate()

    const { data: artifact, isLoading: loadingArtifact } = useQuery({
        queryKey: ['artifact', id],
        queryFn: async () => {
            const res = await api.get(`/api/v1/artifacts/${id}`)
            return res.data
        }
    })

    const { data: history, isLoading: loadingHistory } = useQuery({
        queryKey: ['artifact-history', id],
        queryFn: async () => {
            const res = await api.get(`/api/v1/artifacts/${id}/history`)
            return res.data
        },
        enabled: !!id
    })

    if (loadingArtifact || loadingHistory) {
        return <div style={{ padding: '2rem' }}>Loading history...</div>
    }

    if (!artifact) {
        return <div style={{ padding: '2rem' }}>Artifact not found</div>
    }

    return (
        <Stack gap={6}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Button kind="ghost" onClick={() => navigate('/artifacts')}>
                    <ArrowLeft />
                </Button>
                <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Artifact History</h1>
            </div>

            <Tile style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                            {artifact.name}
                        </h2>
                        <Tag size="md" type="blue">{artifact.version}</Tag>
                        <Tag size="md" type="gray" style={{ marginLeft: '0.5rem' }}>{artifact.type}</Tag>
                    </div>
                    <Tag size="md" type={artifact.buildStatus === 'SUCCESS' ? 'green' : 'red'}>
                        {artifact.buildStatus}
                    </Tag>
                </div>

                {artifact.repositoryUrl && (
                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f4f4f4', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Application size={16} />
                            <strong>Repository:</strong>
                            <a href={artifact.repositoryUrl} target="_blank" rel="noopener noreferrer">
                                {artifact.repositoryUrl}
                            </a>
                        </div>
                        {artifact.branch && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Application size={16} />
                                <strong>Branch:</strong> {artifact.branch}
                            </div>
                        )}
                        {artifact.commitHash && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Code size={16} />
                                <strong>Commit:</strong>
                                <CodeSnippet type="inline" style={{ fontSize: '0.875rem' }}>
                                    {artifact.commitHash.substring(0, 7)}
                                </CodeSnippet>
                            </div>
                        )}
                        {artifact.commitAuthor && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <UserAvatar size={16} />
                                <strong>Author:</strong> {artifact.commitAuthor}
                            </div>
                        )}
                        {artifact.pipelineId && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#525252' }}>
                                <strong>Pipeline:</strong> {artifact.pipelineId} | Build #{artifact.buildNumber}
                            </div>
                        )}
                    </div>
                )}
            </Tile>

            <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                    Version History ({history?.length || 0})
                </h3>
                {history && history.length > 0 ? (
                    <Stack gap={2}>
                        {history.map((item, idx) => (
                            <Tile key={item.id} style={{ padding: '1.5rem', borderLeft: '4px solid #0f62fe' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <strong style={{ fontSize: '1.125rem' }}>v{item.version}</strong>
                                            <Tag size="sm" type={item.buildStatus === 'SUCCESS' ? 'green' : 'red'}>
                                                {item.buildStatus}
                                            </Tag>
                                        </div>
                                        {item.createdAt && (
                                            <div style={{ fontSize: '0.875rem', color: '#525252' }}>
                                                Created: {new Date(item.createdAt).toLocaleString()}
                                            </div>
                                        )}
                                        {item.commitHash && (
                                            <div style={{ fontSize: '0.875rem', color: '#525252', marginTop: '0.25rem' }}>
                                                Commit: {item.commitHash.substring(0, 7)}
                                            </div>
                                        )}
                                    </div>
                                    <Button size="sm" onClick={() => navigate(`/artifacts/${item.id}`)}>
                                        View
                                    </Button>
                                </div>
                            </Tile>
                        ))}
                    </Stack>
                ) : (
                    <Tile style={{ padding: '2rem', textAlign: 'center' }}>
                        <p style={{ color: '#525252' }}>No version history available</p>
                    </Tile>
                )}
            </div>
        </Stack>
    )
}

