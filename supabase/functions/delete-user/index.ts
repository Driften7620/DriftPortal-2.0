import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface DeleteUserRequest {
  userId: string;
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

  let payload: DeleteUserRequest;
  try {
    payload = (await request.json()) as DeleteUserRequest;
  } catch {
    return json({ error: 'Ugyldige data.' }, 400);
  }

  if (!payload.userId) return json({ error: 'Bruger-id mangler.' }, 400);
  if (payload.userId === caller.id) {
    return json({ error: 'Du kan ikke slette din egen bruger.' }, 400);
  }

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
    return json({ error: 'Kun administratorer kan slette brugere.' }, 403);
  }

  const { data: targetProfile } = await adminClient
    .from('profiles')
    .select('email,full_name,role')
    .eq('id', payload.userId)
    .single();

  if (!targetProfile) return json({ error: 'Brugeren blev ikke fundet.' }, 404);
  if (targetProfile.role === 'system_admin' && callerProfile.role !== 'system_admin') {
    return json({ error: 'Kun en systemadministrator kan slette en systemadministrator.' }, 403);
  }

  await adminClient.from('activity_log').insert({
    user_id: caller.id,
    module_id: 'administration',
    action: 'delete_user',
    entity_type: 'profile',
    entity_id: payload.userId,
    details: {
      email: targetProfile.email,
      full_name: targetProfile.full_name,
      role: targetProfile.role,
    },
  });

  const { error } = await adminClient.auth.admin.deleteUser(payload.userId, false);
  if (error) return json({ error: error.message }, 400);

  return json({ id: payload.userId, deleted: true }, 200);
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
