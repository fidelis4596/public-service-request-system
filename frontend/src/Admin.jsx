
import { useEffect, useState } from 'react';

const API_URL = 'https://public-service-request-system-0q6p.onrender.com/api/requests';

function Admin() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function loadRequests() {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error('Could not load requests.');
            }

            setRequests(await response.json());
        } catch {
            setError('Unable to connect to the backend. Check that it is running.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadRequests();
    }, []);

    async function changeStatus(id, status) {
        setError('');

        try {
            const response = await fetch(
                `${API_URL}/${id}/status?status=${status}`,
                { method: 'PATCH' }
            );

            if (!response.ok) {
                throw new Error('Could not update request status.');
            }

            const updated = await response.json();

            setRequests((previous) =>
                previous.map((request) => request.id === id ? updated : request)
            );
        } catch (err) {
            setError(err.message || 'Status update failed.');
        }
    }

    const pending = requests.filter((r) => r.status === 'PENDING').length;
    const inProgress = requests.filter((r) => r.status === 'IN_PROGRESS').length;
    const resolved = requests.filter((r) => r.status === 'RESOLVED').length;

    return (
        <main style={{
            maxWidth: 1100,
            margin: '40px auto',
            padding: 24,
            fontFamily: 'Arial, sans-serif',
            color: '#173f35'
        }}>
            <h1>Admin Dashboard</h1>
            <p>Monitor community service requests and update their progress.</p>

            <button onClick={loadRequests} style={{ padding: '10px 16px', cursor: 'pointer' }}>
                Refresh requests
            </button>

            {error && <p role="alert" style={{ color: '#b42318' }}>{error}</p>}

            <section style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 16,
                margin: '24px 0'
            }}>
                {[
                    ['Total requests', requests.length],
                    ['Pending', pending],
                    ['In progress', inProgress],
                    ['Resolved', resolved]
                ].map(([label, count]) => (
                    <article key={label} style={{
                        padding: 20,
                        border: '1px solid #dce7df',
                        borderRadius: 12,
                        background: '#f7faf7'
                    }}>
                        <p>{label}</p>
                        <strong style={{ fontSize: 30 }}>{count}</strong>
                    </article>
                ))}
            </section>

            <h2>All service requests</h2>

            {loading ? (
                <p>Loading requests...</p>
            ) : requests.length === 0 ? (
                <p>No service requests have been submitted yet.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        textAlign: 'left'
                    }}>
                        <thead>
                        <tr>
                            {['ID', 'Title', 'Category', 'Location', 'Status', 'Update status'].map((heading) => (
                                <th key={heading} style={{
                                    padding: 12,
                                    borderBottom: '2px solid #dce7df'
                                }}>
                                    {heading}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {requests.map((request) => (
                            <tr key={request.id}>
                                <td style={{ padding: 12, borderBottom: '1px solid #e5ebe6' }}>
                                    {request.id}
                                </td>
                                <td style={{ padding: 12, borderBottom: '1px solid #e5ebe6' }}>
                                    {request.title}
                                </td>
                                <td style={{ padding: 12, borderBottom: '1px solid #e5ebe6' }}>
                                    {request.category}
                                </td>
                                <td style={{ padding: 12, borderBottom: '1px solid #e5ebe6' }}>
                                    {request.location}
                                </td>
                                <td style={{ padding: 12, borderBottom: '1px solid #e5ebe6' }}>
                                    {request.status.replace('_', ' ')}
                                </td>
                                <td style={{ padding: 12, borderBottom: '1px solid #e5ebe6' }}>
                                    <select
                                        value={request.status}
                                        onChange={(event) => changeStatus(request.id, event.target.value)}
                                        aria-label={`Update request ${request.id} status`}
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="RESOLVED">Resolved</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}

export default Admin;
