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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Client for admin actions (Service Role)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    // Client for normal auth actions (Anon)
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const body = await req.json();
    const { action, email, password, name, role, permissions, admin_token, id, old_email, new_email, status: newStatus } = body;

    // ── LOGIN ──
    if (action === "login") {
      if (!email || !password) {
        return json({ error: "Email e senha obrigatórios" }, 400);
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (authError || !authData.user) {
        return json({ error: "Credenciais inválidas" }, 401);
      }

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id, name, status, role, email, permissions")
        .eq("id", authData.user.id)
        .single();

      if (!profile) {
        return json({ error: "Perfil não encontrado" }, 401);
      }

      if (profile.status !== "Ativo") {
        return json({ error: "Conta pendente ou desativada. Contacte o administrador." }, 403);
      }

      if (profile.role === "User") {
        return json({ error: "Acesso administrativo negado." }, 403);
      }

      // Usar o access_token oficial do Supabase Auth como admin_token
      return json({
        success: true,
        admin: { id: profile.id, email: profile.email || authData.user.email, name: profile.name, role: profile.role, status: profile.status, permissions: profile.permissions },
        token: authData.session.access_token,
        refresh_token: authData.session.refresh_token
      });
    }

    // Para todas as outras rotas, o admin_token recebido é na verdade o Access Token (JWT) do Supabase Auth.
    if (!admin_token) return json({ error: "Não autorizado" }, 401);
    
    const { data: userVerification, error: verifyError } = await supabaseAdmin.auth.getUser(admin_token);
    if (verifyError || !userVerification.user) {
      return json({ error: "Sessão inválida ou expirada. Faça login novamente." }, 401);
    }
    const requestingUser = userVerification.user;

    // Verificar se quem está requisitando tem privilégios para ações restritas (Master)
    const { data: requestingProfile } = await supabaseAdmin.from("profiles").select("role").eq("id", requestingUser.id).single();
    if (!requestingProfile || requestingProfile.role !== "Master") {
        return json({ error: "Sem privilégios para esta ação" }, 403);
    }

    // ── LIST ──
    if (action === "list") {
      const { data: profiles, error } = await supabaseAdmin
        .from("profiles")
        .select("id, name, role, status, email, created_at, updated_at, permissions")
        .order("created_at", { ascending: true });
        
      if (error) throw error;
      return json({ admins: profiles });
    }

    // ── CREATE ──
    if (action === "create") {
      if (!email || !password) return json({ error: "Email e senha obrigatórios" }, 400);

      const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password: password,
        email_confirm: true,
        user_metadata: { name: name || "Usuário", role: role || "Viewer", permissions: permissions || {} }
      });

      if (error) {
        if (error.message.includes("already exists") || error.message.includes("unique")) {
          return json({ error: "Este email já está cadastrado" }, 409);
        }
        throw error;
      }
      return json({ success: true });
    }

    // ── APPROVE ──
    if (action === "approve") {
      if (!id) return json({ error: "ID obrigatório" }, 400);
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ status: "Ativo", role: "Admin" }) 
        .eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    // ── TOGGLE STATUS ──
    if (action === "toggle_status") {
      if (!id || !newStatus) return json({ error: "ID e status obrigatórios" }, 400);
      if (!["Ativo", "Inativo", "desativado"].includes(newStatus)) return json({ error: "Status inválido" }, 400);
      
      const parsedStatus = newStatus === "desativado" ? "Inativo" : newStatus;

      const { data: targetProfile } = await supabaseAdmin.from("profiles").select("email").eq("id", id).single();
      if (targetProfile?.email === "festanca.decoracoes@outlook.com" && parsedStatus === "Inativo") {
        return json({ error: "A conta Master principal não pode ser desativada." }, 403);
      }

      const { error } = await supabaseAdmin.from("profiles").update({ status: parsedStatus }).eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    // ── UPDATE ──
    if (action === "update") {
      if (!id) return json({ error: "ID obrigatório" }, 400);
      
      const { data: targetProfile } = await supabaseAdmin.from("profiles").select("email").eq("id", id).single();
      if (targetProfile?.email === "festanca.decoracoes@outlook.com" && body.role && body.role !== "Master") {
          return json({ error: "Não é possível alterar a role do Master principal." }, 403);
      }

      const updates: any = {};
      if (body.new_name) updates.name = body.new_name;
      if (body.role) updates.role = body.role;
      if (body.permissions) updates.permissions = body.permissions;
      
      if (Object.keys(updates).length > 0) {
          const { error: profileError } = await supabaseAdmin.from("profiles").update(updates).eq("id", id);
          if (profileError) throw profileError;
      }
      
      if (body.new_email) {
          const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { email: body.new_email.trim().toLowerCase() });
          if (error) {
            if (error.message.includes("already")) return json({ error: "Este email já está em uso" }, 409);
            throw error;
          }
      }

      return json({ success: true });
    }

    // ── DELETE ──
    if (action === "delete") {
      if (!id) return json({ error: "ID obrigatório" }, 400);
      
      const { data: targetProfile } = await supabaseAdmin.from("profiles").select("email").eq("id", id).single();
      if (targetProfile?.email === "festanca.decoracoes@outlook.com") {
        return json({ error: "A conta Master principal não pode ser excluída." }, 403);
      }

      const { data: admins } = await supabaseAdmin.from("profiles").select("id").in("role", ["Master", "Admin"]);
      if (admins && admins.length <= 1) return json({ error: "Não é possível remover o último administrador" }, 400);

      const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (error) throw error;
      return json({ success: true });
    }

    // ── CHANGE PASSWORD ──
    if (action === "change_password") {
      if (!email || !password) return json({ error: "Dados incompletos" }, 400);
      
      const { data: targetProfile } = await supabaseAdmin.from("profiles").select("id").eq("email", email.trim().toLowerCase()).single();
      if (!targetProfile) return json({ error: "Usuário não encontrado" }, 404);
      
      const { error } = await supabaseAdmin.auth.admin.updateUserById(targetProfile.id, { password: password });
      if (error) throw error;
      return json({ success: true });
    }

    // ── CHANGE EMAIL ──
    if (action === "change_email") {
      if (!old_email || !new_email) return json({ error: "Emails obrigatórios" }, 400);
      
      const { data: targetProfile } = await supabaseAdmin.from("profiles").select("id").eq("email", old_email.trim().toLowerCase()).single();
      if (!targetProfile) return json({ error: "Usuário original não encontrado" }, 404);

      const { error } = await supabaseAdmin.auth.admin.updateUserById(targetProfile.id, { email: new_email.trim().toLowerCase() });
      if (error) {
        if (error.message.includes("already")) return json({ error: "Este email já está em uso" }, 409);
        throw error;
      }
      return json({ success: true });
    }

    return json({ error: "Ação inválida" }, 400);
  } catch (err) {
    console.error("admin-auth internal error:", err);
    return json({ error: "Erro interno do servidor" }, 500);
  }
});
