/**
 * Load .env and optionally auth-config.json into process.env.
 * Call once at startup before any code reads env vars.
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..', '..');

function loadFromEnvFile(envPath: string): boolean {
  if (!fs.existsSync(envPath)) return false;
  let raw = fs.readFileSync(envPath, 'utf8');
  raw = raw.replace(/\uFEFF/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] == null) process.env[key] = val;
  }
  return true;
}

function loadEnvFile(): void {
  const cwdEnv = path.join(process.cwd(), '.env');
  const rootEnv = path.join(backendRoot, '.env');
  loadFromEnvFile(cwdEnv) || loadFromEnvFile(rootEnv);
}

function loadAuthConfig(): void {
  const cwdConfig = path.join(process.cwd(), 'auth-config.json');
  const rootConfig = path.join(backendRoot, 'auth-config.json');
  const configPath = fs.existsSync(cwdConfig) ? cwdConfig : fs.existsSync(rootConfig) ? rootConfig : null;
  if (!configPath) return;
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as Record<string, string>;
    const keys = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI', 'FRONTEND_URL', 'JWT_SECRET'];
    for (const k of keys) {
      const val = config[k];
      if (val != null && String(val).trim() && process.env[k] == null) process.env[k] = String(val).trim();
    }
  } catch {
    // ignore
  }
}

function loadConfig(): void {
  loadEnvFile();
  loadAuthConfig();
}

loadConfig();
