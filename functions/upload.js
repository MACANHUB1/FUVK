export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method === "POST") {
    try {
      if (!env.FILES_STORE) {
        return new Response(JSON.stringify({ error: "FILES_STORE_NOT_BOUND" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const formData = await request.formData();
      const file = formData.get("file");

      if (!file) {
        return new Response(JSON.stringify({ error: "NO_FILE_SELECTED" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const fileName = file.name;
      const fileExtension = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : '';
      const fileId = crypto.randomUUID() + fileExtension;
      const arrayBuffer = await file.arrayBuffer();

      await env.FILES_STORE.put(fileId, arrayBuffer, {
        metadata: { name: fileName, type: file.type }
      });

      return new Response(JSON.stringify({ id: fileId }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }

  return new Response("Method not allowed", { status: 405 });
}
