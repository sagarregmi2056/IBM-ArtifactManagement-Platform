import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
    Tile,
    InlineNotification,
    Stack,
    Tag,
    StructuredListWrapper,
    StructuredListHead,
    StructuredListBody,
    StructuredListRow,
    StructuredListCell,
    Button
} from '@carbon/react'
import { useNavigate } from 'react-router-dom'

const api = axios.create({
    baseURL: import.meta.env.VITE_SPRING_BOOT_URL
})

function useArtifacts() {
    return useQuery({
        queryKey: ['artifacts'],
        queryFn: async () => {
            const res = await api.get('/api/v1/artifacts')
            return res.data
        }
    })
}

export default function Artifacts() {
    const navigate = useNavigate()
    const { data, isLoading, error } = useArtifacts()

    if (isLoading) return <div style={{ padding: '2rem' }}>Loading artifacts...</div>
    if (error) return <InlineNotification kind="error" title="Failed to load artifacts" subtitle={error.message} />

    return (
        <Stack gap={6} style={{ maxWidth: '1200px' }}>
            <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Artifacts
                </h1>
                <p style={{ color: '#525252', fontSize: '1.125rem' }}>
                    View all artifacts registered from CI/CD pipelines. Click "View History" to see deployment details, commit information, and build status.
                </p>
            </div>

            <Tile style={{ padding: '1.5rem', backgroundColor: '#e8f5e9' }}>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                    <strong>Note:</strong> Artifacts are automatically registered through your CI/CD pipelines. To register a new artifact, add API calls to your GitHub Actions, Tekton, or Jenkins pipeline. See the Home page for integration examples.
                </p>
            </Tile>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>All Artifacts</h3>
                    <Tag type="gray" size="lg">{data?.length || 0} items</Tag>
                </div>

                {data?.length === 0 ? (
                    <Tile style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: '#525252', fontSize: '1.125rem' }}>
                            No artifacts found. Register your first artifact through a CI/CD pipeline.
                        </p>
                    </Tile>
                ) : (
                    <StructuredListWrapper>
                        <StructuredListHead>
                            <StructuredListRow head>
                                <StructuredListCell head>Name</StructuredListCell>
                                <StructuredListCell head>Version</StructuredListCell>
                                <StructuredListCell head>Type</StructuredListCell>
                                <StructuredListCell head>Build Status</StructuredListCell>
                                <StructuredListCell head>Actions</StructuredListCell>
                            </StructuredListRow>
                        </StructuredListHead>
                        <StructuredListBody>
                            {data?.map((a) => (
                                <StructuredListRow key={a.id}>
                                    <StructuredListCell style={{ fontWeight: 600 }}>{a.name}</StructuredListCell>
                                    <StructuredListCell>
                                        <Tag size="md" type="blue">{a.version}</Tag>
                                    </StructuredListCell>
                                    <StructuredListCell>{a.type || 'N/A'}</StructuredListCell>
                                    <StructuredListCell>
                                        {a.buildStatus ? (
                                            <Tag size="sm" type={a.buildStatus === 'SUCCESS' ? 'green' : 'red'}>
                                                {a.buildStatus}
                                            </Tag>
                                        ) : (
                                            <span style={{ color: '#525252' }}>N/A</span>
                                        )}
                                    </StructuredListCell>
                                    <StructuredListCell>
                                        <Button size="sm" onClick={() => navigate(`/artifacts/${a.id}/history`)}>
                                            View History
                                        </Button>
                                    </StructuredListCell>
                                </StructuredListRow>
                            ))}
                        </StructuredListBody>
                    </StructuredListWrapper>
                )}
            </div>
        </Stack>
    )
}


