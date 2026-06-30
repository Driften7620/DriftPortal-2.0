export interface SupabaseConfiguration {
  url?: string;
  anonKey?: string;
  isConfigured: boolean;
  projectRef?: string;
  issue?: string;
}

function readConfiguration(): SupabaseConfiguration {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !anonKey) {
    return {
      url,
      anonKey,
      isConfigured: false,
      issue: 'Supabase URL og public anon key mangler.',
    };
  }

  if (url.includes('your-project') || anonKey.includes('your-public')) {
    return {
      url,
      anonKey,
      isConfigured: false,
      issue: 'Eksempelværdierne skal udskiftes med nøglerne fra dit Supabase-projekt.',
    };
  }

  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.endsWith('.supabase.co')) {
      return { url, anonKey, isConfigured: false, issue: 'Supabase URL har et ukendt format.' };
    }
    if (anonKey.length < 20) {
      return { url, anonKey, isConfigured: false, issue: 'Den offentlige Supabase-nøgle er for kort.' };
    }
    return {
      url,
      anonKey,
      isConfigured: true,
      projectRef: parsedUrl.hostname.split('.')[0],
    };
  } catch {
    return { url, anonKey, isConfigured: false, issue: 'Supabase URL er ikke gyldig.' };
  }
}

export const supabaseConfiguration = readConfiguration();
