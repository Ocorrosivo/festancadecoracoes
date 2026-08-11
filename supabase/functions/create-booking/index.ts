import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const cors = corsHeaders(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const {
      client_name,
      client_phone,
      client_email,
      client_city,
      booking_time,
      booking_notes,
      product,
      date,
      price
    } = body;

    if (!client_name || !product || !date) {
      return json({ error: "Nome, produto e data são obrigatórios" }, 400);
    }

    if (typeof client_name !== "string" || client_name.length > 200) {
      return json({ error: "Nome inválido" }, 400);
    }

    // Upsert client based on phone or name
    let clientId: string | null = null;

    if (client_phone) {
      // Try to find existing client by phone
      const { data: existingClient } = await supabase
        .from("clients")
        .select("id, total_locacoes")
        .eq("telefone", client_phone)
        .maybeSingle();

      if (existingClient) {
        clientId = existingClient.id;
        const { error: updateError } = await supabase.from("clients").update({
          nome: client_name.trim(),
          email: client_email || null,
          cidade: client_city || null,
          observacoes: booking_notes || null,
          total_locacoes: (existingClient.total_locacoes || 0) + 1,
          ultima_locacao: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }).eq("id", clientId);
        if (updateError) throw updateError;
      } else {
        const { data: newClient, error: clientError } = await supabase.from("clients").insert({
          nome: client_name.trim(),
          telefone: client_phone,
          email: client_email || null,
          cidade: client_city || null,
          observacoes: booking_notes || null,
          origem: "Site",
          status: "Ativo",
          total_locacoes: 1,
          ultima_locacao: new Date().toISOString()
        }).select().single();
        if (clientError) throw clientError;
        clientId = newClient.id;
      }
    } else {
      // Without phone, just create a new client
      const { data: newClient, error: clientError } = await supabase.from("clients").insert({
        nome: client_name.trim(),
        email: client_email || null,
        cidade: client_city || null,
        observacoes: booking_notes || null,
        origem: "Site",
        status: "Ativo",
        total_locacoes: 1,
        ultima_locacao: new Date().toISOString()
      }).select().single();
      if (clientError) throw clientError;
      clientId = newClient.id;
    }

    const { data, error } = await supabase.from("bookings").insert({
      client_id: clientId,
      client_name: client_name.trim(),
      product: product.trim(),
      date: date,
      horario: booking_time || null,
      observacoes: booking_notes || null,
      price: price || null,
      status: "Agendado",
    }).select().single();

    if (error) throw error;

    return json({ success: true, booking: data });
  } catch (err) {
    console.error("create-booking error:", err);
    return json({ error: "Erro interno do servidor" }, 500);
  }
});