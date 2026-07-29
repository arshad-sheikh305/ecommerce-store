import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

/**
 * Admin Authorization Edge Function
 *
 * This function acts as a backend authorization middleware for all admin
 * API operations. It:
 *   1. Extracts the JWT from the Authorization header.
 *   2. Validates the session with Supabase Auth.
 *   3. Loads the user's profile and checks the role.
 *   4. Rejects the request with 403 if the user is not an admin.
 *
 * The frontend never sends the admin role — the server fetches it from the
 * database. This prevents any client-side role spoofing.
 *
 * Route format:
 *   POST /functions/v1/admin-auth
 *   Body: { action: "verify" }  — returns 200 { authorized: true } if admin
 *
 * The frontend calls this before entering admin routes as a double-check
 * that the session is still valid and the user is still an admin on the server.
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ authorized: false, error: "Missing or invalid Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") as string;

    if (!supabaseUrl || !anonKey) {
      return new Response(
        JSON.stringify({ authorized: false, error: "Server not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a client with the user's JWT — this validates the session
    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // Validate the JWT and get the user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ authorized: false, error: "Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Load the profile and check the role — this is the server-side
    // authorization check that cannot be bypassed by the client.
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ authorized: false, error: "Profile not found" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (profile.role !== "admin") {
      return new Response(
        JSON.stringify({ authorized: false, error: "Access denied. Admin role required." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        authorized: true,
        user: { id: userData.user.id, email: userData.user.email, full_name: profile.full_name },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ authorized: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
