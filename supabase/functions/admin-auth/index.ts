import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function validateAdminToken(supabase: any, token: string) {
  const { data } = await supabase
    .from("admin_users")
    .select("id, email, name, role, status")
    .eq("session_token", token)
    .eq("status", "ativo")
    .single();
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { action, email, password, name, admin_token, id, old_email, new_email, status: newStatus } = body;

    // ── LOGIN ──
    if (action === "login") {
      if (!email || !password) return json({ error: "Email e senha obrigatórios" }, 400);

      const { data: verified } = await supabase.rpc("verify_admin_password", {
        _email: email.trim().toLowerCase(),
        _password: password,
      });

      if (!verified) return json({ error: "Credenciais inválidas" }, 401);

      const { data } = await supabase
        .from("admin_users")
        .select("id, email, name, status, role")
        .eq("email", email.trim().toLowerCase())
        .single();

      if (!data) return json({ error: "Credenciais inválidas" }, 401);
      if (data.status !== "ativo") return json({ error: "Conta pendente ou desativada. Contacte o administrador." }, 403);

      // Generate and persist session token
      const token = crypto.randomUUID();
      await supabase.from("admin_users").update({ 
        last_access: new Date().toISOString(),
        session_token: token 
      }).eq("id", data.id);

      return json({ success: true, admin: { id: data.id, email: data.email, name: data.name, role: data.role, status: data.status }, token });
    }

    // All other actions require a VALID admin_token
    if (!admin_token) return json({ error: "Não autorizado" }, 401);

    const adminUser = await validateAdminToken(supabase, admin_token);
    if (!adminUser) return json({ error: "Sessão inválida ou expirada. Faça login novamente." }, 401);

    // ── LIST ──
    if (action === "list") {
      const { data, error } = await supabase
        .from("admin_users")
        .select("id, email, name, created_at, status, role, last_access")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return json({ admins: data });
    }

    // ── CREATE ──
    if (action === "create") {
      if (!email || !password) return json({ error: "Email e senha obrigatórios" }, 400);

      const { error } = await supabase.rpc("create_admin_user", {
        _email: email.trim().toLowerCase(),
        _password: password,
        _name: name || null,
      });

      if (error) {
        if (error.message.includes("duplicate") || error.message.includes("unique")) {
          return json({ error: "Este email já está cadastrado" }, 409);
        }
        throw error;
      }
      return json({ success: true });
    }

    // ── APPROVE ──
    if (action === "approve") {
      if (!id) return json({ error: "ID obrigatório" }, 400);
      const { error } = await supabase
        .from("admin_users")
        .update({ status: "ativo", role: "master" })
        .eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    // ── TOGGLE STATUS ──
    if (action === "toggle_status") {
      if (!id || !newStatus) return json({ error: "ID e status obrigatórios" }, 400);
      if (!["ativo", "desativado"].includes(newStatus)) return json({ error: "Status inválido" }, 400);
      
      // Proteção para o usuário Master principal
      const { data: targetUser } = await supabase.from("admin_users").select("email").eq("id", id).single();
      if (targetUser?.email === "festanca.decoracoes@outlook.com" && newStatus === "desativado") {
        return json({ error: "A conta Master principal não pode ser desativada." }, 403);
      }

      const updates: Record<string, string | null> = { status: newStatus };
      // Clear session token when deactivating
      if (newStatus === "desativado") updates.session_token = null;
      
      const { error } = await supabase.from("admin_users").update(updates).eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    // ── UPDATE ──
    if (action === "update") {
      if (!id) return json({ error: "ID obrigatório" }, 400);
      const updates: Record<string, string> = {};
      if (body.new_name !== undefined) updates.name = body.new_name;
      if (body.new_email) updates.email = body.new_email.trim().toLowerCase();

      const { error } = await supabase.from("admin_users").update(updates).eq("id", id);
      if (error) {
        if (error.message.includes("duplicate") || error.message.includes("unique")) {
          return json({ error: "Este email já está em uso" }, 409);
        }
        throw error;
      }
      return json({ success: true });
    }

    // ── DELETE ──
    if (action === "delete") {
      if (!id) return json({ error: "ID obrigatório" }, 400);
      
      // Proteção para o usuário Master principal
      const { data: targetUser } = await supabase.from("admin_users").select("email").eq("id", id).single();
      if (targetUser?.email === "festanca.decoracoes@outlook.com") {
        return json({ error: "A conta Master principal não pode ser excluída." }, 403);
      }

      const { count } = await supabase.from("admin_users").select("id", { count: "exact", head: true });
      if ((count || 0) <= 1) return json({ error: "Não é possível remover o último administrador" }, 400);

      const { error } = await supabase.from("admin_users").delete().eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    // ── CHANGE PASSWORD ──
    if (action === "change_password") {
      if (!email || !password) return json({ error: "Dados incompletos" }, 400);
      const { error } = await supabase.rpc("update_admin_password", {
        _email: email.trim().toLowerCase(),
        _password: password,
      });
      if (error) throw error;
      return json({ success: true });
    }

    // ── CHANGE EMAIL ──
    if (action === "change_email") {
      if (!old_email || !new_email) return json({ error: "Emails obrigatórios" }, 400);
      const { error } = await supabase
        .from("admin_users")
        .update({ email: new_email.trim().toLowerCase() })
        .eq("email", old_email.trim().toLowerCase());
      if (error) {
        if (error.message.includes("duplicate") || error.message.includes("unique")) {
          return json({ error: "Este email já está em uso" }, 409);
        }
        throw error;
      }
      return json({ success: true });
    }

    return json({ error: "Ação inválida" }, 400);
  } catch (err) {
    return json({ error: "Erro interno do servidor" }, 500);
  }
});
