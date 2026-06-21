export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const fileId = url.pathname.split('/_raw/')[1];

  if (!fileId) {
    return new Response("ID не указан", { status: 400 });
  }

  const { value, metadata } = await env.FILES_STORE.getWithMetadata(fileId, { type: "arrayBuffer" });

  if (!value) {
    return new Response("Файл не найден", { status: 404 });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const headers = { ...corsHeaders };
  const originalName = metadata?.name || fileId;
  const lowerId = fileId.toLowerCase();

  if (lowerId.endsWith('.lua') || lowerId.endsWith('.luau') || lowerId.endsWith('.txt')) {
    headers["Content-Type"] = "text/plain; charset=utf-8";
  } else {
    headers["Content-Type"] = "application/octet-stream";
    headers["Content-Disposition"] = `attachment; filename="${encodeURIComponent(originalName)}"`;
  }

  return new Response(value, { headers });
}
