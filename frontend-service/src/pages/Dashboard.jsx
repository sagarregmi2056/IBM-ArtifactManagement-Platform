import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Tile, Stack, Tag } from '@carbon/react'
import { SimpleBarChart } from '@carbon/charts-react'
import { Analytics } from '@carbon/icons-react'

const api = axios.create({
    baseURL: import.meta.env.VITE_SPRING_BOOT_URL
})

export default function Dashboard() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['artifact-statistics'],
        queryFn: async () => {
            const res = await api.get('/api/v1/artifacts/statistics')
            return res.data
        }
    })

    if (isLoading) {
        return <div style={{ padding: '2rem' }}>Loading dashboard...</div>
    }

    const totalArtifacts = stats?.totalArtifacts || 0
    const successfulBuilds = stats?.successfulBuilds || 0
    const failedBuilds = stats?.failedBuilds || 0
    const successRate = totalArtifacts > 0 ? ((successfulBuilds / (successfulBuilds + failedBuilds)) * 100).toFixed(1) : 0

    const barChartOptions = {
        axes: { bottom: { title: 'Status', scaleType: 'labels' }, left: { title: 'Count' } },
        height: '300px'
    }

    return (
        <div style={{ maxWidth: '1400px' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Analytics size={32} />
                <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Deployment Dashboard</h1>
            </div>

            <p style={{ color: '#525252', marginBottom: '2rem', maxWidth: '800px' }}>
                Monitor deployment statistics, success rates, and trends across your CI/CD pipelines.
                Track performance metrics and identify bottlenecks in real-time.
            </p>

            <Stack gap={6}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <Tile style={{ padding: '2rem', borderLeft: '4px solid #0f62fe' }}>
                        <div style={{ marginBottom: '0.75rem', color: '#525252', fontSize: '0.875rem' }}>Total Artifacts</div>
                        <div style={{ fontSize: '3rem', fontWeight: 600, marginBottom: '0.5rem' }}>{totalArtifacts}</div>
                        <Tag size="sm" type="gray">In system</Tag>
                    </Tile>
                    <Tile style={{ padding: '2rem', borderLeft: '4px solid #24a148' }}>
                        <div style={{ marginBottom: '0.75rem', color: '#525252', fontSize: '0.875rem' }}>Successful Builds</div>
                        <div style={{ fontSize: '3rem', fontWeight: 600, color: '#24a148', marginBottom: '0.5rem' }}>
                            {successfulBuilds}
                        </div>
                        <Tag size="sm" type="green">Success Rate: {successRate}%</Tag>
                    </Tile>
                    <Tile style={{ padding: '2rem', borderLeft: '4px solid #da1e28' }}>
                        <div style={{ marginBottom: '0.75rem', color: '#525252', fontSize: '0.875rem' }}>Failed Builds</div>
                        <div style={{ fontSize: '3rem', fontWeight: 600, color: '#da1e28', marginBottom: '0.5rem' }}>
                            {failedBuilds}
                        </div>
                        <Tag size="sm" type="red">Failure Rate: {(100 - successRate).toFixed(1)}%</Tag>
                    </Tile>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                    <Tile>
                        <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 600 }}>
                            Build Status
                        </h4>
                        <SimpleBarChart
                            data={[
                                { group: 'Status', key: 'Successful', value: successfulBuilds },
                                { group: 'Status', key: 'Failed', value: failedBuilds }
                            ]}
                            options={barChartOptions}
                        />
                    </Tile>
                </div>

            </Stack>
        </div>
    )
}
