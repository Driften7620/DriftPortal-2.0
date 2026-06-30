export interface SupabaseConfiguration {
  url?: string;
  anonKey?: string;
  isConfigured: boolean;
  projectRef?: string;
  issue?: string;
}

function readConfiguration(): SupabaseConfiguration {
  const url = extractEnvironmentValue(import.meta.env.VITE_SUPABASE_URL, [
    'VITE_SUPABASE_URL',
  ]);
  const anonKey = extractEnvironmentValue(
    import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    ['VITE_SUPABASE_ANON_KEY', 'VITE_SUPABASE_PUBLISHABLE_KEY'],
  );

  if (!url || !anonKey) {
    return {
      url,
      anonKey,
      isConfigured: false,
      issue: !url
        ? 'GitHub-builden mangler VITE_SUPABASE_URL.'
        : 'GitHub-builden mangler VITE_SUPABASE_ANON_KEY.',
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

function extractEnvironmentValue(
  rawValue: string | undefined,
  variableNames: string[],
): string | undefined {
  if (!rawValue) return undefined;

  const trimmedValue = rawValue.trim();
  const matchingLine = trimmedValue
    .split(/\r?\n/)
    .find((line) => variableNames.some((name) => line.trim().startsWith(`${name}=`)));
  const value = matchingLine ? matchingLine.slice(matchingLine.indexOf('=') + 1).trim() : trimmedValue;

  return value.replace(/^['"]|['"]$/g, '').trim() || undefined;
}

export const supabaseConfiguration = readConfiguration();
