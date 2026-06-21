export async function onRequestPost(context) {
    try {
        const { url } = await context.request.json();
        if (!url) {
            return new Response(JSON.stringify({ error: 'URL не указан' }), { status: 400 });
        }

        let targetUrl = url;
        if (!targetUrl.includes('viewform')) {
            targetUrl = targetUrl.split('?')[0].replace(/\/$/, '') + '/viewform';
        }

        const response = await fetch(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });

        if (!response.ok) {
            return new Response(JSON.stringify({ error: 'Не удалось загрузить форму' }), { status: 500 });
        }

        const html = await response.text();
        const regex = /name="entry\.(\d+)"([^>]*aria-label="([^"]+)")?/g;
        const fields = [];
        const seen = new Set();
        let match;

        while ((match = regex.exec(html)) !== null) {
            const id = `entry.${match[1]}`;
            if (!seen.has(id)) {
                seen.add(id);
                fields.push({
                    id: id,
                    label: match[3] || id
                });
            }
        }

        return new Response(JSON.stringify({ fields }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
