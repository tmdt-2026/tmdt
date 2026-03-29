const API_BASE_URL = 'http://localhost:3000';

export async function getSiteData() {
    const response = await fetch(`${API_BASE_URL}/siteData`);

    if (!response.ok) {
        throw new Error(`Cannot load site data from API: ${response.status}`);
    }

    return response.json();
}
