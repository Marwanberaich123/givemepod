import { Router, Request, Response } from 'express';
import { db, hashAccessCode, maskCode, User } from '../db';
import crypto from 'crypto';

const router = Router();

// Middleware to extract user ID from cookie or Authorization header
export function getAuthenticatedUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  let userId: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    userId = authHeader.substring(7);
  } else if (req.headers['x-user-id']) {
    userId = req.headers['x-user-id'] as string;
  }

  if (!userId) {
    // Default to the seed admin user for seamless first load in development if no token
    const firstUser = Array.from(db.users.values())[0];
    return firstUser || null;
  }

  return db.users.get(userId) || null;
}

// 1. Google Authentication
router.post('/google', (req: Request, res: Response): any => {
  const { email, name, avatar, google_id } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required for Google Sign-In.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const stableGoogleId = google_id || `google-sub-${crypto.createHash('md5').update(normalizedEmail).digest('hex')}`;

  // Find existing user by Google ID or email
  let user: User | undefined;
  for (const u of db.users.values()) {
    if (u.google_id === stableGoogleId || u.email.toLowerCase() === normalizedEmail) {
      user = u;
      break;
    }
  }

  const isOwner = normalizedEmail === 'jeanteriitua@gmail.com';

  if (!user) {
    // Create new Google-authenticated user
    user = {
      id: crypto.randomUUID(),
      google_id: stableGoogleId,
      email: normalizedEmail,
      name: name || (isOwner ? 'Jean Teriitua' : normalizedEmail.split('@')[0]),
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${normalizedEmail}`,
      role: isOwner ? 'ADMIN' : 'USER',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
      has_permanent_access: isOwner // Owner gets automatic permanent entitlement
    };

    if (isOwner) {
      user.active_code_masked = '••••••••••••K2L8';
    }

    db.users.set(user.id, user);
    db.save();
    db.logAudit(user.id, user.email, 'USER_SIGNUP_GOOGLE', 'User registered with Google OAuth', req.ip);
  } else {
    // Update profile
    user.last_active = new Date().toISOString();
    if (isOwner) {
      user.role = 'ADMIN';
      user.has_permanent_access = true;
    }
    db.users.set(user.id, user);
    db.save();
    db.logAudit(user.id, user.email, 'USER_LOGIN_GOOGLE', 'User authenticated via Google', req.ip);
  }

  return res.json({
    user,
    token: user.id
  });
});

// 2. Current Session & Entitlement Status
router.get('/me', (req: Request, res: Response): any => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Check if system has emergency lock or maintenance
  if (db.systemConfig.emergency_lock && user.role !== 'ADMIN') {
    return res.status(423).json({
      locked: true,
      error: 'GiveMePOD is temporarily locked for maintenance.'
    });
  }

  return res.json({
    user,
    systemConfig: {
      maintenance_mode: db.systemConfig.maintenance_mode,
      maintenance_message: db.systemConfig.maintenance_message,
      feature_flags: db.systemConfig.feature_flags,
      integrations: db.systemConfig.integrations
    }
  });
});

// 3. Redeem Permanent Access Code
router.post('/access-code', (req: Request, res: Response): any => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Must be signed in with Google to activate access code.' });
  }

  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Access code is required.' });
  }

  const clientIp = req.ip || 'unknown';
  const rateLimitKey = `${clientIp}_${user.id}`;
  const now = Date.now();

  const attempt = db.failedAttempts.get(rateLimitKey);
  if (attempt && attempt.count >= 5) {
    const elapsedMinutes = (now - attempt.lastAttempt) / (1000 * 60);
    if (elapsedMinutes < 15) {
      return res.status(429).json({
        error: 'Too many failed attempts. For security, please wait 15 minutes before trying again or contact support.'
      });
    } else {
      db.failedAttempts.delete(rateLimitKey);
    }
  }

  const inputHash = hashAccessCode(code);

  // Search access code record
  let matchedCodeRecord: any = null;
  for (const ac of db.accessCodes.values()) {
    if (ac.code_hash === inputHash) {
      matchedCodeRecord = ac;
      break;
    }
  }

  if (!matchedCodeRecord) {
    // Record failed attempt
    const current = db.failedAttempts.get(rateLimitKey) || { count: 0, lastAttempt: now };
    current.count += 1;
    current.lastAttempt = now;
    db.failedAttempts.set(rateLimitKey, current);

    db.logAudit(user.id, user.email, 'ACCESS_CODE_FAILED', `Invalid access code attempt: ${maskCode(code)}`, clientIp);
    return res.status(400).json({ error: 'Invalid or unrecognized access code. Please check and try again.' });
  }

  if (matchedCodeRecord.status === 'REVOKED') {
    db.logAudit(user.id, user.email, 'ACCESS_CODE_REVOKED', `Attempted to use revoked code: ${matchedCodeRecord.masked_code}`, clientIp);
    return res.status(403).json({ error: 'This access code has been revoked by the administrator.' });
  }

  if (matchedCodeRecord.status === 'ACTIVE') {
    if (matchedCodeRecord.assigned_user_id === user.id) {
      // Already assigned to this user
      user.has_permanent_access = true;
      user.active_code_masked = matchedCodeRecord.masked_code;
      db.users.set(user.id, user);
      db.save();
      return res.json({ success: true, message: 'Access already activated for this account.', user });
    } else {
      // Assigned to another Google account!
      db.logAudit(user.id, user.email, 'ACCESS_CODE_CONFLICT', `Code ${matchedCodeRecord.masked_code} already linked to another account`, clientIp);
      return res.status(409).json({ error: 'This access code has already been activated by another Google account.' });
    }
  }

  // Activate code!
  matchedCodeRecord.status = 'ACTIVE';
  matchedCodeRecord.assigned_user_id = user.id;
  matchedCodeRecord.activated_at = new Date().toISOString();
  matchedCodeRecord.last_used_at = new Date().toISOString();
  db.accessCodes.set(matchedCodeRecord.id, matchedCodeRecord);

  // Create entitlement
  const entitlementId = crypto.randomUUID();
  db.entitlements.set(entitlementId, {
    id: entitlementId,
    user_id: user.id,
    access_code_id: matchedCodeRecord.id,
    granted_at: new Date().toISOString(),
    is_active: true
  });

  // Unlock user
  user.has_permanent_access = true;
  user.active_code_masked = matchedCodeRecord.masked_code;
  db.users.set(user.id, user);
  db.failedAttempts.delete(rateLimitKey);
  db.save();

  db.logAudit(user.id, user.email, 'ACCESS_CODE_ACTIVATED', `Activated code: ${matchedCodeRecord.masked_code}`, clientIp);

  return res.json({
    success: true,
    message: 'Permanent access activated successfully!',
    user
  });
});

// 4. Update Onboarding Preferences
router.post('/preferences', (req: Request, res: Response): any => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { platform, experience, favorite_product } = req.body;
  user.preferences = {
    platform: platform || user.preferences?.platform || 'Etsy',
    experience: experience || user.preferences?.experience || 'Beginner',
    favorite_product: favorite_product || user.preferences?.favorite_product || 'T-Shirt'
  };

  db.users.set(user.id, user);
  db.save();

  return res.json({ success: true, preferences: user.preferences });
});

// 5. Sign Out
router.post('/signout', (req: Request, res: Response): any => {
  const user = getAuthenticatedUser(req);
  if (user) {
    db.logAudit(user.id, user.email, 'USER_SIGNOUT', 'User logged out', req.ip);
  }
  return res.json({ success: true });
});

export default router;
