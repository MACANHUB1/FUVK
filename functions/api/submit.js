export async function onRequestPost(context) {
    try {
        const { url, data, count } = await context.request.json();
        
        let submitUrl = url;
        if (submitUrl.includes('viewform')) {
            submitUrl = submitUrl.replace('viewform', 'formResponse');
        } else if (!submitUrl.includes('formResponse')) {
            submitUrl = submitUrl.split('?')[0].replace(/\/$/, '') + '/formResponse';
        }

        const iterations = Math.min(parseInt(count) || 1, 100);
        let successCount = 0;

        for (let i = 0; i < iterations; i++) {
            const bodyParams = new URLSearchParams();
            for (const key in data) {
                bodyParams.append(key, data[key]);
            }

            const response = await fetch(submitUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                },
                body: bodyParams.toString()
            });

            if (response.ok || response.status === 200) {
                successCount++;
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        return new Response(JSON.stringify({ successCount }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
