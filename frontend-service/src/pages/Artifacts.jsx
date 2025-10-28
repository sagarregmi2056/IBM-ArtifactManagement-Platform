import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'
import {
    DataTable,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    TextInput,
    Tile,
    TextArea,
    Button,
    InlineNotification,
    Stack,
    Tag,
    StructuredListWrapper,
    StructuredListHead,
    StructuredListBody,
    StructuredListRow,
    StructuredListCell
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
    const qc = useQueryClient()
    const { data, isLoading, error } = useArtifacts()
    const [form, setForm] = useState({ name: '', version: '', description: '' })
    const [toast, setToast] = useState(null)

    const createMutation = useMutation({
        mutationFn: async (payload) => {
            const res = await api.post('/api/v1/artifacts', payload)
            return res.data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['artifacts'] })
            setToast({ kind: 'success', title: 'Artifact created' })
            setForm({ name: '', version: '', description: '' })
        },
        onError: (e) => {
            setToast({ kind: 'error', title: 'Create failed', subtitle: e?.response?.data?.message || e.message })
        }
    })

    if (isLoading) return <div style={{ padding: '2rem' }}>Loading artifacts...</div>
    if (error) return <InlineNotification kind="error" title="Failed to load artifacts" subtitle={error.message} />

    return (
        <Stack gap={6} style={{ maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 600 }}>Artifacts</h1>
                <Tag type="gray" size="lg">{data?.length || 0} items</Tag>
            </div>

            {toast && (
                <InlineNotification
                    lowContrast
                    kind={toast.kind}
                    title={toast.title}
                    subtitle={toast.subtitle}
                    onCloseButtonClick={() => setToast(null)}
                />
            )}

            <Tile style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>Create New Artifact</h3>
                <Stack gap={4} style={{ maxWidth: 600 }}>
                    <TextInput
                        id="name"
                        labelText="Artifact Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g., user-service"
                    />
                    <TextInput
                        id="version"
                        labelText="Version"
                        value={form.version}
                        onChange={(e) => setForm({ ...form, version: e.target.value })}
                        placeholder="e.g., 1.2.3"
                    />
                    <TextArea
                        id="description"
                        labelText="Description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={4}
                        placeholder="Describe your artifact..."
                    />
                    <Button
                        onClick={() => createMutation.mutate(form)}
                        disabled={createMutation.isPending || !form.name || !form.version}
                        size="lg"
                    >
                        {createMutation.isPending ? 'Creating...' : 'Create Artifact'}
                    </Button>
                </Stack>
            </Tile>

            <div>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 600 }}>
                    All Artifacts ({data?.length || 0})
                </h3>
                {data?.length === 0 ? (
                    <Tile style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: '#525252', fontSize: '1.125rem' }}>No artifacts yet. Create your first artifact above.</p>
                    </Tile>
                ) : (
                    <StructuredListWrapper>
                        <StructuredListHead>
                            <StructuredListRow head>
                                <StructuredListCell head>Name</StructuredListCell>
                                <StructuredListCell head>Version</StructuredListCell>
                                <StructuredListCell head>Type</StructuredListCell>
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


