import { Request, Response } from 'express';
import { prisma } from '../db.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';

export interface JwtPayload {
  userId: string;
}

/** GET /api/auth/session - return current user if valid (Authorization: Bearer <token>). */
export async function getSession(req: Request, res: Response): Promise<void> {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true },
    });
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    res.json({ user: { id: user.id, email: user.email } });
  } catch {
    res.status(401).json({ error: 'Invalid session' });
  }
}

/** GET /api/auth/signin/google - redirect to Google OAuth. */
export async function signinGoogle(_req: Request, res: Response): Promise<void> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();

  if (!clientId || !redirectUri) {
    res.status(500).json({ error: 'Google OAuth not configured' });
    return;
  }
  
  const scope = 'openid email profile';
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scope);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  res.redirect(url.toString());
}

/** GET /api/auth/callback/google - exchange code, create/find user, set session, redirect to frontend. */
export async function callbackGoogle(req: Request, res: Response): Promise<void> {
  const code = req.query.code as string | undefined;
  const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/$/, '');
  if (!code) {
    res.redirect(`${frontendUrl}?error=missing_code`);
    return;
  }
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (!clientId || !clientSecret || !redirectUri) {
    res.redirect(`${frontendUrl}?error=server_config`);
    return;
  }
  try {
    const client = new OAuth2Client(clientId, clientSecret, redirectUri);
    const { tokens } = await client.getToken(code);
    client.setCredentials({ access_token: tokens.access_token ?? undefined });

    let googleId: string;
    let email: string;

    if (tokens.id_token) {
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email) {
        res.redirect(`${frontendUrl}?error=no_email`);
        return;
      }
      googleId = payload.sub;
      email = payload.email;
    } else {
      const resUser = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (!resUser.ok) {
        res.redirect(`${frontendUrl}?error=userinfo_failed`);
        return;
      }
      const userinfo = (await resUser.json()) as { id?: string; sub?: string; email?: string };
      googleId = (userinfo.sub ?? userinfo.id) || '';
      email = userinfo.email || '';
      if (!googleId || !email) {
        res.redirect(`${frontendUrl}?error=no_email`);
        return;
      }
    }

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });
    if (!user) {
      user = await prisma.user.create({
        data: { email, googleId },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, email: email || user.email },
      });
    }

    const token = jwt.sign({ userId: user.id } as JwtPayload, JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${frontendUrl}#token=${encodeURIComponent(token)}`);
  } catch (e) {
    console.error('[auth.callbackGoogle]', e);
    res.redirect(`${frontendUrl}?error=callback_failed`);
  }
}

/** POST /api/auth/signout - no server state; client drops token. */
export async function signOut(_req: Request, res: Response): Promise<void> {
  res.json({ ok: true });
}

/** GET /api/auth/config-check - debug: are Google OAuth env vars set? */
export async function configCheck(_req: Request, res: Response): Promise<void> {
  const hasClientId = Boolean(process.env.GOOGLE_CLIENT_ID?.trim());
  const hasSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim());
  const hasRedirect = Boolean(process.env.GOOGLE_REDIRECT_URI?.trim());
  res.json({ googleOAuthReady: hasClientId && hasRedirect && hasSecret, hasClientId, hasSecret, hasRedirectUri: hasRedirect });
}

function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}
