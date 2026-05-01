import { useState } from 'react';
import api from '../../api';

export default function SimpleAddCompany({ onSuccess }) {
    const [company, setCompany] = useState('');
    const [sector, setSector] = useState('Finance');
    const [esgScore, setEsgScore] = useState('75');
    const [envScore, setEnvScore] = useState('80');
    const [socScore, setSocScore] = useState('70');
    const [govScore, setGovScore] = useState('85');
    const [category, setCategory] = useState('Adequate');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/api/admin/add-company', {
                company: company,
                sector: sector,
                esg_score: Number(esgScore),
                environment_score: Number(envScore),
                social_score: Number(socScore),
                governance_score: Number(govScore),
                category: category
            });

            console.log('Success!', response.data);
            alert('Company added successfully!');
            onSuccess();

            // Reset
            setCompany('');
            setEsgScore('75');
            setEnvScore('80');
            setSocScore('70');
            setGovScore('85');
        } catch (err) {
            console.error('Error:', err);
            const msg = err.response?.data?.detail || 'Failed to add company';
            setError(JSON.stringify(msg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', background: '#1e293b', borderRadius: '8px', color: 'white' }}>
            <h3>Add Company (Simple Test)</h3>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Company Name:</label><br />
                    <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        style={{ width: '100%', padding: '5px', color: 'black' }}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Sector:</label><br />
                    <input
                        type="text"
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        style={{ width: '100%', padding: '5px', color: 'black' }}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>ESG Score:</label><br />
                    <input
                        type="number"
                        value={esgScore}
                        onChange={(e) => setEsgScore(e.target.value)}
                        style={{ width: '100%', padding: '5px', color: 'black' }}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Environment Score:</label><br />
                    <input
                        type="number"
                        value={envScore}
                        onChange={(e) => setEnvScore(e.target.value)}
                        style={{ width: '100%', padding: '5px', color: 'black' }}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Social Score:</label><br />
                    <input
                        type="number"
                        value={socScore}
                        onChange={(e) => setSocScore(e.target.value)}
                        style={{ width: '100%', padding: '5px', color: 'black' }}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Governance Score:</label><br />
                    <input
                        type="number"
                        value={govScore}
                        onChange={(e) => setGovScore(e.target.value)}
                        style={{ width: '100%', padding: '5px', color: 'black' }}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Category:</label><br />
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{ width: '100%', padding: '5px', color: 'black' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        background: loading ? '#666' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Adding...' : 'Add Company'}
                </button>
            </form>
        </div>
    );
}
