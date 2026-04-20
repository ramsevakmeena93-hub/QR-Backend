import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  FiRefreshCw, FiDownload, FiSearch, FiFilter,
  FiAlertCircle, FiInfo, FiCheckCircle, FiAlertTriangle,
  FiChevronDown, FiChevronRight, FiClock, FiUser, FiGlobe
} from 'react-icons/fi';

const SEVERITY = {
  LOGIN:             { level: 'INFO',    color: 'text-blue-400',   bg: 'bg-blue-900/30',   border: 'border-blue-700',   icon: <FiInfo className="w-3.5 h-3.5 text-blue-400" /> },
  LOGOUT:            { level: 'INFO',    color: 'text-gray-400',   bg: 'bg-gray-800/30',   border: 'border-gray-700',   icon: <FiInfo className="w-3.5 h-3.5 text-gray-400" /> },
  LOGIN_FAILED:      { level: 'ERROR',   color: 'text-red-400',    bg: 'bg-red-900/30',    border: 'border-red-700',    icon: <FiAlertCircle className="w-3.5 h-3.5 text-red-400" /> },
  QR_GENERATED:      { level: 'INFO',    color: 'text-cyan-400',   bg: 'bg-cyan-900/30',   border: 'border-cyan-700',   icon: <FiInfo className="w-3.5 h-3.5 text-cyan-400" /> },
  QR_SCAN:           { level: 'DEBUG',   color: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-700', icon: <FiInfo className="w-3.5 h-3.5 text-purple-400" /> },
  ATTENDANCE_MARKED: { level: 'SUCCESS', color: 'text-green-400',  bg: 'bg-green-900/30',  border: 'border-green-700',  icon: <FiCheckCircle className="w-3.5 h-3.5 text-green-400" /> },
  FEEDBACK_SUBMITTED:{ level: 'INFO',    color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-700', icon: <FiInfo className="w-3.5 h-3.5 text-yellow-400" /> },
  PAGE_VISIT:        { level: 'DEBUG',   color: 'text-gray-500',   bg: 'bg-gray-900/20',   border: 'border-gray-800',   icon: <FiInfo className="w-3.5 h-3.5 text-gray-500" /> },
};

const LEVEL_BADGE = {
  ERROR:   'bg-red-500/20 text-red-400 border border-red-600',
  WARNING: 'bg-yellow-500/20 text-yellow-400 border border-yellow-600',
  SUCCESS: 'bg-green-500/20 text-green-400 border border-green-600',
  INFO:    'bg-blue-500/20 text-blue-400 border border-blue-600',
  DEBUG:   'bg-gray-500/20 text-gray-400 border border-gray-600',
};

const ActivityLogDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [expandedLog, setExpandedLog] = useState(null);
  const [stats, setStats] = useState(null);
  const logEndRef = useRef(null);

  const fetchLogs = useCallback(async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        axios.get('/api/logs?limit=500'),
        axios.get('/api/logs/stats')
      ]);
      setLogs(logsRes.data.logs || []);
      setStats(statsRes.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(fetchLogs, 3000);
    return () => clearInterval(t);
  }, [autoRefresh, fetchLogs]);

  const getSeverity = (action) => SEVERITY[action] || SEVERITY.LOGIN;

  const filtered = logs.filter(log => {
    const s = getSeverity(log.action);
    const matchLevel = levelFilter === 'ALL' || s.level === levelFilter;
    const matchSearch = !search || [
      log.details, log.action, log.user?.name, log.user?.email, log.user?.role
    ].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    return matchLevel && matchSearch;
  });

  const formatTs = (ts) => {
    const d = new Date(ts);
    return d.toISOString().replace('T', ' ').replace('Z', ' UTC');
  };

  const downloadLogs = () => {
    const lines = filtered.map(log => {
      const s = getSeverity(log.action);
      return `${formatTs(log.timestamp)} [${s.level.padEnd(7)}] ${log.action.padEnd(20)} user="${log.user?.email}" role="${log.user?.role}" msg="${log.details}" ip="${log.ip || 'N/A'}" meta=${JSON.stringify(log.metadata || {})}`;
    }).join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `mits-audit-log-${new Date().toISOString().split('T')[0]}.log`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col bg-gray-950 text-gray-100 font-mono text-sm" style={{ minHeight: 'calc(100vh - 0px)' }}>
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-bold text-lg tracking-wide">
              📋 Audit & Activity Logs
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
              MITS Attendance System — Real-time event monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${autoRefresh ? 'border-green-600 text-green-400 bg-green-900/20' : 'border-gray-600 text-gray-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              {autoRefresh ? 'LIVE' : 'PAUSED'}
            </div>
            <button onClick={() => setAutoRefresh(p => !p)}
              className="text-xs px-3 py-1.5 rounded border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white transition-colors">
              {autoRefresh ? '⏸ Pause' : '▶ Resume'}
            </button>
            <button onClick={fetchLogs}
              className="text-xs px-3 py-1.5 rounded border border-gray-600 text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors">
              <FiRefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={downloadLogs}
              className="text-xs px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors">
              <FiDownload className="w-3 h-3" /> Export .log
            </button>
          </div>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-6 gap-3 mb-4">
            {[
              { label: 'Total Events', value: stats.total, color: 'text-white' },
              { label: 'Today', value: stats.today, color: 'text-blue-400' },
              { label: 'Logins', value: stats.byAction?.LOGIN || 0, color: 'text-green-400' },
              { label: 'Attendance', value: stats.byAction?.ATTENDANCE_MARKED || 0, color: 'text-emerald-400' },
              { label: 'QR Generated', value: stats.byAction?.QR_GENERATED || 0, color: 'text-cyan-400' },
              { label: 'Errors', value: stats.byAction?.LOGIN_FAILED || 0, color: 'text-red-400' },
            ].map((s, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-2.5 text-gray-500 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search logs... (user, action, message, email)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-xs placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-500 w-3.5 h-3.5" />
            {['ALL', 'SUCCESS', 'INFO', 'DEBUG', 'ERROR'].map(level => (
              <button key={level} onClick={() => setLevelFilter(level)}
                className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                  levelFilter === level
                    ? LEVEL_BADGE[level] || 'bg-white/10 text-white border-white/30'
                    : 'border-gray-700 text-gray-500 hover:text-gray-300'
                }`}>
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log Table Header */}
      <div className="grid grid-cols-12 gap-2 px-6 py-2 bg-gray-900/50 border-b border-gray-800 text-gray-600 text-xs uppercase tracking-wider sticky top-0">
        <div className="col-span-1">Level</div>
        <div className="col-span-2">Timestamp</div>
        <div className="col-span-2">Event</div>
        <div className="col-span-2">User</div>
        <div className="col-span-1">Role</div>
        <div className="col-span-3">Message</div>
        <div className="col-span-1">IP</div>
      </div>

      {/* Log Rows */}
      <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-600">
            <FiRefreshCw className="animate-spin w-5 h-5 mr-2" /> Loading logs...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-600">
            <FiAlertTriangle className="w-8 h-8 mb-3 opacity-30" />
            <p>No log entries found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {filtered.map((log, i) => {
          const s = getSeverity(log.action);
          const isExpanded = expandedLog === i;
          return (
            <div key={i}>
              <div
                onClick={() => setExpandedLog(isExpanded ? null : i)}
                className={`grid grid-cols-12 gap-2 px-6 py-2.5 border-b border-gray-800/50 cursor-pointer hover:bg-gray-800/40 transition-colors ${isExpanded ? 'bg-gray-800/60' : ''}`}
              >
                {/* Level */}
                <div className="col-span-1 flex items-center gap-1.5">
                  {s.icon}
                  <span className={`text-xs font-bold ${s.color}`}>{s.level}</span>
                </div>

                {/* Timestamp */}
                <div className="col-span-2 flex items-center gap-1 text-gray-500 text-xs">
                  <FiClock className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{formatTs(log.timestamp)}</span>
                </div>

                {/* Event */}
                <div className="col-span-2 flex items-center">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${s.bg} ${s.color} border ${s.border} truncate`}>
                    {log.action}
                  </span>
                </div>

                {/* User */}
                <div className="col-span-2 flex items-center gap-1 text-xs text-cyan-400 truncate">
                  <FiUser className="w-3 h-3 flex-shrink-0 text-gray-600" />
                  <span className="truncate">{log.user?.email || 'unknown'}</span>
                </div>

                {/* Role */}
                <div className="col-span-1 flex items-center">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-bold uppercase ${
                    log.user?.role === 'admin' ? 'bg-red-900/40 text-red-400' :
                    log.user?.role === 'teacher' ? 'bg-blue-900/40 text-blue-400' :
                    'bg-green-900/40 text-green-400'
                  }`}>
                    {log.user?.role || '?'}
                  </span>
                </div>

                {/* Message */}
                <div className="col-span-3 flex items-center text-xs text-gray-300 truncate">
                  {isExpanded ? <FiChevronDown className="w-3 h-3 mr-1 flex-shrink-0 text-gray-500" /> : <FiChevronRight className="w-3 h-3 mr-1 flex-shrink-0 text-gray-600" />}
                  <span className="truncate">{log.details}</span>
                </div>

                {/* IP */}
                <div className="col-span-1 flex items-center gap-1 text-xs text-gray-600 truncate">
                  <FiGlobe className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{log.ip || 'N/A'}</span>
                </div>
              </div>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Event Details</p>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex gap-3">
                          <span className="text-gray-600 w-24">Event ID</span>
                          <span className="text-gray-300 font-mono">{log._id || `evt_${i}`}</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-gray-600 w-24">Action</span>
                          <span className={`font-bold ${s.color}`}>{log.action}</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-gray-600 w-24">Severity</span>
                          <span className={`font-bold ${s.color}`}>{s.level}</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-gray-600 w-24">Timestamp</span>
                          <span className="text-gray-300">{formatTs(log.timestamp)}</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-gray-600 w-24">Message</span>
                          <span className="text-gray-300">{log.details}</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-gray-600 w-24">IP Address</span>
                          <span className="text-gray-300 font-mono">{log.ip || 'N/A'}</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-gray-600 w-24">User Agent</span>
                          <span className="text-gray-500 truncate max-w-xs">{log.userAgent || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">User Context</p>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex gap-3">
                          <span className="text-gray-600 w-24">Name</span>
                          <span className="text-gray-300">{log.user?.name || 'N/A'}</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-gray-600 w-24">Email</span>
                          <span className="text-cyan-400">{log.user?.email || 'N/A'}</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-gray-600 w-24">Role</span>
                          <span className={`font-bold uppercase ${
                            log.user?.role === 'admin' ? 'text-red-400' :
                            log.user?.role === 'teacher' ? 'text-blue-400' : 'text-green-400'
                          }`}>{log.user?.role || 'N/A'}</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-gray-600 w-24">User ID</span>
                          <span className="text-gray-300 font-mono">{log.user?.id || 'N/A'}</span>
                        </div>
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-3">
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Metadata</p>
                          <pre className="text-xs text-gray-400 bg-gray-800 rounded p-2 overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-6 py-2 flex items-center justify-between text-xs text-gray-600">
        <span>Showing <span className="text-gray-400">{filtered.length}</span> of <span className="text-gray-400">{logs.length}</span> events</span>
        <span>MITS Attendance System — Audit Log v1.0</span>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default ActivityLogDashboard;
