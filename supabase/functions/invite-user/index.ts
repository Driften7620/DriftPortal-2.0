import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface InviteRequest {
  email: string;
  fullName: string;
  role: string;
  moduleAccess: string[];
  redirectTo?: string;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return json({ error: 'Kun POST er tilladt.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authorization = request.headers.get('Authorization');

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization) {
    return json({ error: 'Serverkonfiguration eller login mangler.' }, 500);
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const {
    data: { user: caller },
  } = await callerClient.auth.getUser();
  if (!caller) return json({ error: 'Du skal være logget ind.' }, 401);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: callerProfile } = await adminClient
    .from('profiles')
    .select('role,is_active')
    .eq('id', caller.id)
    .single();

  if (
    !callerProfile?.is_active ||
    !['system_admin', 'admin'].includes(callerProfile.role as string)
  ) {
    return json({ error: 'Kun administratorer kan invitere brugere.' }, 403);
  }

  let payload: InviteRequest;
  try {
    payload = (await request.json()) as InviteRequest;
  } catch {
    return json({ error: 'Ugyldige data.' }, 400);
  }

  if (!payload.email || !payload.fullName || !payload.role) {
    return json({ error: 'Email, navn og rolle er påkrævet.' }, 400);
  }
  if (payload.role === 'system_admin' && callerProfile.role !== 'system_admin') {
    return json({ error: 'Kun en systemadministrator kan oprette en systemadministrator.' }, 403);
  }

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(payload.email, {
    data: { full_name: payload.fullName },
    redirectTo: payload.redirectTo,
  });
  if (error || !data.user) {
    return json({ error: error?.message ?? 'Brugeren kunne ikke inviteres.' }, 400);
  }

  const { error: profileError } = await adminClient
    .from('profiles')
    .update({
      full_name: payload.fullName,
      role: payload.role,
      module_access: payload.moduleAccess ?? [],
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.user.id);

  if (profileError) return json({ error: profileError.message }, 500);
  return json({ id: data.user.id, email: data.user.email, invited: true }, 200);
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
