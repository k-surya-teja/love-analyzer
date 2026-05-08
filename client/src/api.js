const API_BASE = (process.env.REACT_APP_API_BASE || 'http://localhost:8000').replace(/\/$/, '');

async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
    });
    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : null;
    if (!res.ok) {
        const message = data?.error || `Request failed (${res.status})`;
        throw new Error(message);
    }
    return data;
}

export const api = {
    listEntries: ({ q = '', relation = '', limit = 60, skip = 0 } = {}) => {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (relation) params.set('relation', relation);
        params.set('limit', String(limit));
        params.set('skip', String(skip));
        return request(`/userdata?${params.toString()}`);
    },
    getEntry: (id) => request(`/userdata/${encodeURIComponent(id)}`),
    getStats: () => request('/userdata/stats'),
    createEntry: (payload) =>
        request('/userdata', { method: 'POST', body: JSON.stringify(payload) }),
};

export const API_BASE_URL = API_BASE;
