import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'

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
    const qc = useQueryClient()
    const { data, isLoading, error } = useArtifacts()
    const [form, setForm] = useState({ name: '', version: '', description: '' })

    const createMutation = useMutation({
        mutationFn: async (payload) => {
            const res = await api.post('/api/v1/artifacts', payload)
            return res.data
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['artifacts'] })
    })

    if (isLoading) return <p>Loading...</p>
    if (error) return <p>Error loading artifacts</p>

    return (
        <div>
            <h2>Artifacts</h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    createMutation.mutate(form)
                }}
                style={{ display: 'grid', gap: 8, maxWidth: 420 }}
            >
                <input
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                    placeholder="Version"
                    value={form.version}
                    onChange={(e) => setForm({ ...form, version: e.target.value })}
                />
                <textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <button type="submit" disabled={createMutation.isPending}>Create</button>
            </form>

            <ul>
                {data?.map((a) => (
                    <li key={a.id}>
                        {a.name} v{a.version}
                    </li>
                ))}
            </ul>
        </div>
    )
}


