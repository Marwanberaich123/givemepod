import { Router, Request, Response } from 'express';
import { db, hashAccessCode, maskCode, AccessCode } from '../db';
import { getAuthenticatedUser } from './auth';
import crypto from 'crypto';

const router = Router();

// Middleware: ensure caller is ADMIN
function requireAdmin(req: Request, res: Response, next: () => void): any {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }
  next();
}

router.use(requireAdmin);

// 1. Overview Metrics
router.get('/overview', (req: Request, res: Response): any => {
  const allUsers = Array.from(db.users.values());
  const allCodes = Array.from(db.accessCodes.values());
  const allProjects = Array.from(db.projects.values());

  const activeEntitlements = allUsers.filter(u => u.has_permanent_access).length;
  const availableCodes = allCodes.filter(c => c.status === 'AVAILABLE').length;
  const activeCodes = allCodes.filter(c => c.status === 'ACTIVE').length;
  const revokedCodes = allCodes.filter(c => c.status === 'REVOKED').length;

  return res.json({
    metrics: {
      totalUsers: allUsers.length,
      activeEntitlements,
      totalCodes: allCodes.length,
      availableCodes,
      activeCodes,
      revokedCodes,
      totalProjects: allProjects.length,
      auditLogCount: db.auditLogs.length
    },
    systemConfig: db.systemConfig
  });
});

// 2. Users Management
router.get('/users', (req: Request, res: Response): any => {
  const users = Array.from(db.users.values()).map(u => ({
    id: u.id,
    google_id: u.google_id,
    email: u.email,
    name: u.name,
    avatar: u.avatar,
    role: u.role,
    status: u.status,
    has_permanent_access: u.has_permanent_access,
    active_code_masked: u.active_code_masked,
    created_at: u.created_at,
    last_active: u.last_active,
    projectsCount: Array.from(db.projects.values()).filter(p => p.user_id === u.id).length
  }));

  return res.json({ users });
});

router.post('/users/:id/action', (req: Request, res: Response): any => {
  const admin = getAuthenticatedUser(req)!;
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { action } = req.body; // 'suspend', 'restore', 'revoke_access', 'grant_access'

  if (action === 'suspend') {
    user.status = 'SUSPENDED';
    db.logAudit(admin.id, admin.email, 'ADMIN_USER_SUSPEND', `Suspended user ${user.email}`);
  } else if (action === 'restore') {
    user.status = 'ACTIVE';
    db.logAudit(admin.id, admin.email, 'ADMIN_USER_RESTORE', `Restored user ${user.email}`);
  } else if (action === 'revoke_access') {
    user.has_permanent_access = false;
    user.active_code_masked = undefined;
    db.logAudit(admin.id, admin.email, 'ADMIN_USER_REVOKE_ACCESS', `Revoked access for user ${user.email}`);
  } else if (action === 'grant_access') {
    user.has_permanent_access = true;
    user.active_code_masked = '••••••••••••ADMIN';
    db.logAudit(admin.id, admin.email, 'ADMIN_USER_GRANT_ACCESS', `Manually granted access to user ${user.email}`);
  }

  db.users.set(user.id, user);
  db.save();

  return res.json({ success: true, user });
});

// 3. Access Codes Management
router.get('/access-codes', (req: Request, res: Response): any => {
  const codes = Array.from(db.accessCodes.values()).map(c => {
    const assignedUser = c.assigned_user_id ? db.users.get(c.assigned_user_id) : undefined;
    return {
      id: c.id,
      masked_code: c.masked_code,
      status: c.status,
      assigned_user: assignedUser ? { id: assignedUser.id, email: assignedUser.email, name: assignedUser.name } : null,
      created_at: c.created_at,
      activated_at: c.activated_at,
      last_used_at: c.last_used_at,
      created_by: c.created_by,
      notes: c.notes
    };
  });

  return res.json({ accessCodes: codes });
});

// Generate new cryptographically secure random codes
router.post('/access-codes/generate', (req: Request, res: Response): any => {
  const admin = getAuthenticatedUser(req)!;
  const count = Math.min(50, Math.max(1, Number(req.body.count) || 5));
  const notes = req.body.notes || 'Admin batch generation';

  const generatedPlaintext: string[] = [];

  for (let i = 0; i < count; i++) {
    // Format: GMP-XXXX-XXXX-XXXX
    const p1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const p2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const p3 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const code = `GMP-${p1}-${p2}-${p3}`;

    const codeHash = hashAccessCode(code);
    const id = crypto.randomUUID();

    const record: AccessCode = {
      id,
      code_hash: codeHash,
      masked_code: maskCode(code),
      status: 'AVAILABLE',
      created_at: new Date().toISOString(),
      created_by: admin.email,
      notes
    };

    db.accessCodes.set(record.id, record);
    generatedPlaintext.push(code);
  }

  db.save();
  db.logAudit(admin.id, admin.email, 'ADMIN_CODES_GENERATE', `Generated ${count} new access codes.`);

  // Return plaintext codes ONCE to admin so they can distribute them to customers
  return res.json({
    success: true,
    message: `Generated ${count} codes. Save these plaintext codes now; they are stored only as secure SHA-256 hashes and cannot be retrieved again.`,
    codes: generatedPlaintext
  });
});

// Import private owner-supplied codes (instantly hashed, plaintext discarded)
router.post('/access-codes/import', (req: Request, res: Response): any => {
  const admin = getAuthenticatedUser(req)!;
  const { rawCodes, notes } = req.body;

  if (!rawCodes || typeof rawCodes !== 'string') {
    return res.status(400).json({ error: 'Please provide codes to import (one per line).' });
  }

  const lines = rawCodes
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length >= 4);

  if (lines.length === 0) {
    return res.status(400).json({ error: 'No valid codes found in input.' });
  }

  let importedCount = 0;
  for (const raw of lines) {
    const codeHash = hashAccessCode(raw);

    // Check if hash already exists
    let exists = false;
    for (const ac of db.accessCodes.values()) {
      if (ac.code_hash === codeHash) {
        exists = true;
        break;
      }
    }

    if (!exists) {
      const id = crypto.randomUUID();
      const record: AccessCode = {
        id,
        code_hash: codeHash,
        masked_code: maskCode(raw),
        status: 'AVAILABLE',
        created_at: new Date().toISOString(),
        created_by: admin.email,
        notes: notes || 'Private batch imported by owner'
      };
      db.accessCodes.set(record.id, record);
      importedCount++;
    }
  }

  db.save();
  // DO NOT log the plaintext codes!
  db.logAudit(admin.id, admin.email, 'ADMIN_CODES_IMPORT', `Imported ${importedCount} private access codes. Plaintext discarded.`);

  return res.json({
    success: true,
    importedCount,
    message: `Successfully imported and securely hashed ${importedCount} access codes.`
  });
});

// Revoke an access code
router.post('/access-codes/:id/revoke', (req: Request, res: Response): any => {
  const admin = getAuthenticatedUser(req)!;
  const codeRecord = db.accessCodes.get(req.params.id);
  if (!codeRecord) return res.status(404).json({ error: 'Access code not found.' });

  codeRecord.status = 'REVOKED';
  codeRecord.revoked_at = new Date().toISOString();

  // If assigned to a user, revoke user's entitlement
  if (codeRecord.assigned_user_id) {
    const user = db.users.get(codeRecord.assigned_user_id);
    if (user) {
      user.has_permanent_access = false;
      user.active_code_masked = undefined;
      db.users.set(user.id, user);
    }
  }

  db.accessCodes.set(codeRecord.id, codeRecord);
  db.save();
  db.logAudit(admin.id, admin.email, 'ADMIN_CODE_REVOKE', `Revoked code ${codeRecord.masked_code}`);

  return res.json({ success: true, message: 'Access code revoked successfully.' });
});

// 4. Feature Flags & Provider Management
router.get('/providers', (req: Request, res: Response): any => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

  const providers = [
    {
      name: 'Google Gemini AI (3.8 Flash)',
      type: 'Text, Trend & Strategy Model',
      enabled: hasGeminiKey,
      status: hasGeminiKey ? 'Active & Healthy' : 'Fallback / Demo Mode Active'
    },
    {
      name: 'Etsy Marketplace Signal Provider',
      type: 'Market & Tag Analytics',
      enabled: true,
      status: db.systemConfig.integrations.etsy.connected ? 'OAuth Connected' : 'Configured (Public Signals Active)'
    },
    {
      name: 'Pinterest Content & Velocity Provider',
      type: 'Social Demand Signals',
      enabled: true,
      status: db.systemConfig.integrations.pinterest.connected ? 'OAuth Connected' : 'Ready to Authorize'
    },
    {
      name: 'Google Trends Signal Engine',
      type: 'Search Velocity Provider',
      enabled: true,
      status: 'Active (Aggregated Signals)'
    },
    {
      name: 'Commercial Payment Provider (Stripe)',
      type: 'Billing & Checkout Engine',
      enabled: db.systemConfig.integrations.payment.configured,
      status: db.systemConfig.integrations.payment.configured ? 'Configured' : 'Not Configured (Contact Admin)'
    }
  ];

  return res.json({
    providers,
    featureFlags: db.systemConfig.feature_flags,
    emergencyLock: db.systemConfig.emergency_lock,
    maintenanceMode: db.systemConfig.maintenance_mode
  });
});

router.post('/feature-flags', (req: Request, res: Response): any => {
  const admin = getAuthenticatedUser(req)!;
  const { key, enabled } = req.body;
  if (!key) return res.status(400).json({ error: 'Key is required' });

  db.systemConfig.feature_flags[key] = Boolean(enabled);
  db.save();
  db.logAudit(admin.id, admin.email, 'ADMIN_FEATURE_FLAG_TOGGLE', `Flag ${key} set to ${enabled}`);

  return res.json({ featureFlags: db.systemConfig.feature_flags });
});

router.post('/emergency-lock', (req: Request, res: Response): any => {
  const admin = getAuthenticatedUser(req)!;
  const { lock } = req.body;
  db.systemConfig.emergency_lock = Boolean(lock);
  db.save();
  db.logAudit(admin.id, admin.email, 'ADMIN_EMERGENCY_LOCK_TOGGLE', `Emergency lock: ${db.systemConfig.emergency_lock}`);

  return res.json({ emergency_lock: db.systemConfig.emergency_lock });
});

router.post('/maintenance', (req: Request, res: Response): any => {
  const admin = getAuthenticatedUser(req)!;
  const { maintenance_mode, message } = req.body;

  db.systemConfig.maintenance_mode = Boolean(maintenance_mode);
  if (message) db.systemConfig.maintenance_message = message;
  db.save();

  db.logAudit(admin.id, admin.email, 'ADMIN_MAINTENANCE_TOGGLE', `Maintenance mode: ${db.systemConfig.maintenance_mode}`);
  return res.json({
    maintenance_mode: db.systemConfig.maintenance_mode,
    maintenance_message: db.systemConfig.maintenance_message
  });
});

router.get('/audit-logs', (req: Request, res: Response): any => {
  return res.json({ logs: db.auditLogs.slice(0, 100) });
});

export default router;
