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
    return null;
  }

  return db.users.get(userId) || null;
}

// 1. Sign In Directly with Secret Access Key (Only Key Login)
router.post('/login-with-key', (req: Request, res: Response): any => {
  const { key, name } = req.body;

  if (!key || typeof key !== 'string') {
    return res.status(400).json({ error: 'Access Key is required.' });
  }

  const cleanKey = key.trim().toUpperCase().replace(/[\s-]/g, '');
  const clientIp = req.ip || 'unknown';
  const rateLimitKey = `rate_${clientIp}`;
  const now = Date.now();

  const attempt = db.failedAttempts.get(rateLimitKey);
  if (attempt && attempt.count >= 6) {
    const elapsedMinutes = (now - attempt.lastAttempt) / (1000 * 60);
    if (elapsedMinutes < 15) {
      return res.status(429).json({
        error: 'Too many failed attempts. Please wait 15 minutes before trying again or contact support.'
      });
    } else {
      db.failedAttempts.delete(rateLimitKey);
    }
  }

  const inputHash = hashAccessCode(cleanKey);

  // Search access codes
  let matchedCode: any = null;
  for (const ac of db.accessCodes.values()) {
    if (ac.code_hash === inputHash) {
      matchedCode = ac;
      break;
    }
  }

  if (!matchedCode) {
    const current = db.failedAttempts.get(rateLimitKey) || { count: 0, lastAttempt: now };
    current.count += 1;
    current.lastAttempt = now;
    db.failedAttempts.set(rateLimitKey, current);

    db.logAudit('anonymous', 'unknown', 'KEY_LOGIN_FAILED', `Invalid key attempt: ${maskCode(cleanKey)}`, clientIp);
    return res.status(401).json({
      error: 'Invalid or unrecognized Secret Access Key. Please verify and try again.'
    });
  }

  if (matchedCode.status === 'REVOKED') {
    db.logAudit('anonymous', 'unknown', 'KEY_LOGIN_REVOKED', `Attempted revoked key: ${matchedCode.masked_code}`, clientIp);
    return res.status(403).json({
      error: 'This Access Key has been revoked. Contact support.'
    });
  }

  // If already activated by a user, log in that user!
  if (matchedCode.assigned_user_id) {
    const existingUser = db.users.get(matchedCode.assigned_user_id);
    if (existingUser) {
      existingUser.last_active = new Date().toISOString();
      db.users.set(existingUser.id, existingUser);
      db.failedAttempts.delete(rateLimitKey);
      db.save();
      db.logAudit(existingUser.id, existingUser.email, 'KEY_LOGIN_SUCCESS', `Logged in with existing key ${matchedCode.masked_code}`, clientIp);
      return res.json({
        success: true,
        user: existingUser,
        token: existingUser.id
      });
    }
  }

  // If code is AVAILABLE, activate it and create the user account!
  const isOwner = cleanKey === 'A3F9K2L8Z1';
  const newUserId = crypto.randomUUID();
  const shortSuffix = cleanKey.slice(-4);

  const newUser: User = {
    id: newUserId,
    google_id: `key-${shortSuffix}`,
    email: isOwner ? 'owner@givemepod.com' : `member-${shortSuffix.toLowerCase()}@givemepod.com`,
    name: name?.trim() || (isOwner ? 'GiveMePOD Administrator' : `Member ${shortSuffix}`),
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanKey}`,
    role: isOwner ? 'ADMIN' : 'USER',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
    has_permanent_access: true,
    active_code_masked: maskCode(cleanKey),
    preferences: {
      platform: 'Etsy',
      experience: 'Intermediate',
      favorite_product: 'All Products'
    }
  };

  db.users.set(newUser.id, newUser);

  // Mark code ACTIVE
  matchedCode.status = 'ACTIVE';
  matchedCode.assigned_user_id = newUser.id;
  matchedCode.activated_at = new Date().toISOString();
  matchedCode.last_used_at = new Date().toISOString();
  db.accessCodes.set(matchedCode.id, matchedCode);

  // Create entitlement
  const entId = crypto.randomUUID();
  db.entitlements.set(entId, {
    id: entId,
    user_id: newUser.id,
    access_code_id: matchedCode.id,
    granted_at: new Date().toISOString(),
    is_active: true
  });

  db.failedAttempts.delete(rateLimitKey);
  db.save();

  db.logAudit(newUser.id, newUser.email, 'KEY_ACTIVATE_AND_LOGIN', `Created and activated user via key ${matchedCode.masked_code}`, clientIp);

  return res.json({
    success: true,
    user: newUser,
    token: newUser.id
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

// 3. Redeem or Update Access Key for Already Logged-In User
router.post('/access-code', (req: Request, res: Response): any => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Must be authenticated to activate access code.' });
  }

  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Access Key is required.' });
  }

  const clean = code.trim().toUpperCase().replace(/[\s-]/g, '');
  const inputHash = hashAccessCode(clean);

  let matchedCodeRecord: any = null;
  for (const ac of db.accessCodes.values()) {
    if (ac.code_hash === inputHash) {
      matchedCodeRecord = ac;
      break;
    }
  }

  if (!matchedCodeRecord) {
    return res.status(400).json({ error: 'Invalid or unrecognized access key. Please check and try again.' });
  }

  if (matchedCodeRecord.status === 'REVOKED') {
    return res.status(403).json({ error: 'This access key has been revoked by the administrator.' });
  }

  matchedCodeRecord.status = 'ACTIVE';
  matchedCodeRecord.assigned_user_id = user.id;
  matchedCodeRecord.activated_at = new Date().toISOString();
  matchedCodeRecord.last_used_at = new Date().toISOString();
  db.accessCodes.set(matchedCodeRecord.id, matchedCodeRecord);

  user.has_permanent_access = true;
  user.active_code_masked = matchedCodeRecord.masked_code;
  db.users.set(user.id, user);
  db.save();

  db.logAudit(user.id, user.email, 'ACCESS_CODE_ACTIVATED', `Activated code: ${matchedCodeRecord.masked_code}`);

  return res.json({
    success: true,
    message: 'Access Key activated successfully!',
    user
  });
});

// 4. Update Preferences
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
