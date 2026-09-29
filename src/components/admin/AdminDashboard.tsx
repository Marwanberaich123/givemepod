import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  KeyRound,
  Users,
  Cpu,
  Flag,
  FileText,
  Plus,
  Upload,
  Ban,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { token, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'codes' | 'providers' | 'flags' | 'logs'>('overview');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [codesList, setCodesList] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  const [emergencyLock, setEmergencyLock] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  // Generation and import states
  const [generateCount, setGenerateCount] = useState(5);
  const [generateNotes, setGenerateNotes] = useState('Commercial Batch');
  const [newlyGeneratedCodes, setNewlyGeneratedCodes] = useState<string[]>([]);

  const [importText, setImportText] = useState('');
  const [importNotes, setImportNotes] = useState('Private Owner Batch');
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token || user?.id || ''}` };

      const [resOverview, resUsers, resCodes, resProviders, resLogs] = await Promise.all([
        fetch('/api/admin/overview', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/access-codes', { headers }),
        fetch('/api/admin/providers', { headers }),
        fetch('/api/admin/audit-logs', { headers })
      ]);

      if (resOverview.ok) {
        const data = await resOverview.json();
        setMetrics(data.metrics);
        setEmergencyLock(data.systemConfig?.emergency_lock || false);
        setMaintenanceMode(data.systemConfig?.maintenance_mode || false);
        setFeatureFlags(data.systemConfig?.feature_flags || {});
      }
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsersList(data.users || []);
      }
      if (resCodes.ok) {
        const data = await resCodes.json();
        setCodesList(data.accessCodes || []);
      }
      if (resProviders.ok) {
        const data = await resProviders.json();
        setProviders(data.providers || []);
      }
      if (resLogs.ok) {
        const data = await resLogs.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/access-codes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || user?.id || ''}`
        },
        body: JSON.stringify({ count: generateCount, notes: generateNotes })
      });
      const data = await res.json();
      if (res.ok && data.codes) {
        setNewlyGeneratedCodes(data.codes);
        fetchOverview();
      }
    } catch (e) {
      console.error('Failed to generate codes', e);
    }
  };

  const handleImportCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    try {
      const res = await fetch('/api/admin/access-codes/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || user?.id || ''}`
        },
        body: JSON.stringify({ rawCodes: importText, notes: importNotes })
      });
      const data = await res.json();
      if (res.ok) {
        setImportSuccessMessage(data.message);
        setImportText('');
        fetchOverview();
      }
    } catch (e) {
      console.error('Failed to import codes', e);
    }
  };

  const handleRevokeCode = async (codeId: string) => {
    if (!confirm('Are you sure you want to revoke this access code? Any assigned user will lose access.')) return;

    try {
      const res = await fetch(`/api/admin/access-codes/${codeId}/revoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || user?.id || ''}`
        }
      });
      if (res.ok) {
        fetchOverview();
      }
    } catch (e) {
      console.error('Failed to revoke code', e);
    }
  };

  const handleToggleEmergencyLock = async () => {
    const nextState = !emergencyLock;
    try {
      const res = await fetch('/api/admin/emergency-lock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || user?.id || ''}`
        },
        body: JSON.stringify({ lock: nextState })
      });
      if (res.ok) {
        setEmergencyLock(nextState);
      }
    } catch (e) {
      console.error('Failed to toggle emergency lock', e);
    }
  };

  const handleToggleFlag = async (key: string) => {
    const current = featureFlags[key];
    try {
      const res = await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || user?.id || ''}`
        },
        body: JSON.stringify({ key, enabled: !current })
      });
      if (res.ok) {
        setFeatureFlags(prev => ({ ...prev, [key]: !current }));
      }
    } catch (e) {
      console.error('Failed to toggle feature flag', e);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Title & Emergency Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t('admin.title', 'GiveMePOD Admin Console')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('admin.subtitle', 'Cryptographically secure access management, provider routing, and system controls.')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverview}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleToggleEmergencyLock}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              emergencyLock
                ? 'bg-rose-600 text-white hover:bg-rose-500'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {emergencyLock ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{emergencyLock ? 'App Globally Locked' : 'Emergency Lock'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar text-xs font-medium">
        {[
          { id: 'overview', label: 'Overview Metrics', icon: Shield },
          { id: 'codes', label: 'Access Codes & Vault', icon: KeyRound },
          { id: 'users', label: 'Users & Entitlements', icon: Users },
          { id: 'providers', label: 'API & AI Providers', icon: Cpu },
          { id: 'flags', label: 'Feature Flags', icon: Flag },
          { id: 'logs', label: 'Audit Logs', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW METRICS */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#111724] border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Total Users</span>
              <span className="text-2xl font-bold font-mono text-white tabular-nums">{metrics.totalUsers}</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#111724] border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Active Entitlements</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{metrics.activeEntitlements}</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#111724] border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Available Access Codes</span>
              <span className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">{metrics.availableCodes}</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#111724] border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Total Projects Formulated</span>
              <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">{metrics.totalProjects}</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-white">System Security Posture</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Database Architecture</span>
                <span className="text-white font-mono font-semibold">PostgreSQL Schema (Secure Vault)</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Access Code Security</span>
                <span className="text-emerald-400 font-mono font-semibold">SHA-256 Hashes Only</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Rate Limiting Shield</span>
                <span className="text-indigo-400 font-mono font-semibold">5 Attempts / 15m Cooldown</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACCESS CODES MANAGEMENT */}
      {activeTab === 'codes' && (
        <div className="space-y-6">
          {/* Generation & Import Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generate New Codes */}
            <form onSubmit={handleGenerateCodes} className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">{t('admin.generateCodes', 'Generate New Access Codes')}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Batch Count</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={generateCount}
                    onChange={e => setGenerateCount(parseInt(e.target.value) || 1)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Batch Notes</label>
                  <input
                    type="text"
                    value={generateNotes}
                    onChange={e => setGenerateNotes(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow transition-colors"
              >
                Generate Cryptographic Codes
              </button>

              {newlyGeneratedCodes.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Copy Plaintext Codes Now (Shown Once Only):</span>
                  </div>
                  <div className="p-2.5 rounded bg-black/80 font-mono text-[11px] text-white select-all space-y-1">
                    {newlyGeneratedCodes.map((c, i) => (
                      <div key={i}>{c}</div>
                    ))}
                  </div>
                </div>
              )}
            </form>

            {/* Import Private Owner Codes */}
            <form onSubmit={handleImportCodes} className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">{t('admin.importCodes', 'Import Private Secret Codes')}</h3>
              </div>
              <p className="text-xs text-slate-400">
                {t('admin.importPlaceholder', 'Paste codes (one per line). Plaintext is instantly hashed with SHA-256 and discarded.')}
              </p>
              <textarea
                rows={3}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="GMP-CODE-1111&#10;GMP-CODE-2222"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!importText.trim()}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs shadow transition-colors"
              >
                {t('admin.btnImport', 'Import & Hash Codes')}
              </button>
              {importSuccessMessage && (
                <p className="text-xs text-emerald-400 font-medium">{importSuccessMessage}</p>
              )}
            </form>
          </div>

          {/* Access Codes Table */}
          <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-white">Stored Access Code Hashes ({codesList.length})</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Masked Code</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Assigned User</th>
                    <th className="py-2.5 px-3">Activated At</th>
                    <th className="py-2.5 px-3">Notes</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {codesList.map(c => (
                    <tr key={c.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-bold text-white">{c.masked_code}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          c.status === 'AVAILABLE' ? 'bg-indigo-500/10 text-indigo-400' :
                          c.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans">{c.assigned_user?.email || '—'}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">{c.activated_at ? new Date(c.activated_at).toLocaleDateString() : '—'}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-sans truncate max-w-xs">{c.notes}</td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        {c.status !== 'REVOKED' && (
                          <button
                            onClick={() => handleRevokeCode(c.id)}
                            className="px-2 py-1 rounded bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 text-[11px]"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white">Registered Google Accounts ({usersList.length})</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Access Entitlement</th>
                  <th className="py-2.5 px-3">Active Code</th>
                  <th className="py-2.5 px-3">Projects</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-indigo-400">{u.role}</td>
                    <td className="py-2.5 px-3">
                      {u.has_permanent_access ? (
                        <span className="text-emerald-400 font-sans font-semibold">Permanent License Active</span>
                      ) : (
                        <span className="text-amber-400 font-sans">Locked Account</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{u.active_code_masked || '—'}</td>
                    <td className="py-2.5 px-3 text-white">{u.projectsCount}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. PROVIDERS */}
      {activeTab === 'providers' && (
        <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-6">
          <h3 className="text-sm font-semibold text-white">Connected Providers & API Subsystems</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((p, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">{p.name}</h4>
                  <span className="text-[11px] text-slate-400">{p.type}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. FEATURE FLAGS */}
      {activeTab === 'flags' && (
        <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white">System Feature Flags</h3>
          <p className="text-xs text-slate-400">Toggle modular tools instantly without code redeployment.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {Object.entries(featureFlags).map(([key, enabled]) => (
              <div key={key} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="font-mono text-slate-200 capitalize">{key.replace(/_/g, ' ')}</span>
                <button
                  onClick={() => handleToggleFlag(key)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    enabled ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white">Immutable Security Audit Logs (Last 100)</h3>

          <div className="overflow-x-auto max-h-96 custom-scrollbar">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Action</th>
                  <th className="py-2 px-3">User</th>
                  <th className="py-2 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-900/40 text-[11px]">
                    <td className="py-2 px-3 text-slate-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-2 px-3 font-semibold text-indigo-400 whitespace-nowrap">{log.action}</td>
                    <td className="py-2 px-3 text-slate-300 font-sans">{log.user_email}</td>
                    <td className="py-2 px-3 text-slate-400 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
