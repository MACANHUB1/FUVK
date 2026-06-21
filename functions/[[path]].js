export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (!url.pathname.startsWith('/_raw/')) {
    return context.next();
  }

  const fileId = url.pathname.split('/_raw/')[1];

  if (!fileId) {
    return new Response("ID не указан", { status: 400 });
  }

  if (!env.FILES_STORE) {
    return new Response("БАЗА ДАННЫХ KV НЕ ПОДКЛЮЧЕНА", { status: 500 });
  }

  const { value, metadata } = await env.FILES_STORE.getWithMetadata(fileId, { type: "arrayBuffer" });

  if (!value) {
    return new Response("Файл не найден", { status: 404 });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const headers = { ...corsHeaders };
  const originalName = metadata?.name || fileId;
  const lowerId = fileId.toLowerCase();

  if (lowerId.endsWith('.lua') || lowerId.endsWith('.luau') || lowerId.endsWith('.txt')) {
    
    let text = new TextDecoder("utf-8").decode(value);
    
    text = text.replace(/^\uFEFF/, ''); 
    
    const rawBytes = new TextEncoder().encode(text);

    headers["Content-Type"] = "text/plain; charset=UTF-8";
    headers["Content-Length"] = rawBytes.length.toString();
    headers["X-Content-Type-Options"] = "nosniff";

    return new Response(rawBytes, { headers });
  } else {
    headers["Content-Type"] = "application/octet-stream";
    headers["Content-Disposition"] = `attachment; filename="${encodeURIComponent(originalName)}"`;
    return new Response(value, { headers });
  }
}
