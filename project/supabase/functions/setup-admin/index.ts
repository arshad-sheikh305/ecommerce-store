import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");

    if (!adminEmail || !adminPassword) {
      return new Response(
        JSON.stringify({
          error: "ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if a user with this email already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((u) => u.email === adminEmail);

    let userId: string;

    if (existing) {
      // User exists — update their password and ensure admin role
      const { data: updated, error: updateErr } = await supabase.auth.admin.updateUserById(
        existing.id,
        { password: adminPassword, email_confirm: true }
      );
      if (updateErr) {
        return new Response(
          JSON.stringify({ error: "Failed to update admin password: " + updateErr.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      userId = updated.user.id;
    } else {
      // Create the admin user
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: "Administrator" },
      });
      if (createErr) {
        return new Response(
          JSON.stringify({ error: "Failed to create admin user: " + createErr.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      userId = created.user.id;
    }

    // Ensure the profile has admin role (handle_new_user trigger may have already
    // created it, but we call ensure_admin_from_env to be certain)
    const { error: rpcErr } = await supabase.rpc("ensure_admin_from_env", {
      admin_email: adminEmail,
      admin_name: "Administrator",
    });

    let message: string;
    if (rpcErr) {
      // Fallback: update profile directly with service role (bypasses RLS)
      const { error: directErr } = await supabase
        .from("profiles")
        .upsert({ id: userId, full_name: "Administrator", role: "admin" });
      if (directErr) {
        return new Response(
          JSON.stringify({ error: "Failed to set admin role: " + directErr.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      message = existing ? "Admin password updated and role set (direct)." : "Admin user created and role set (direct).";
    } else {
      message = existing ? "Admin password updated and role confirmed." : "Admin user created with admin role.";
    }

    return new Response(
      JSON.stringify({ success: true, message, admin_email: adminEmail }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
