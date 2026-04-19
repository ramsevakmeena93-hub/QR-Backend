import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FiActivity, FiUser, FiFilter, FiRefreshCw, FiLogIn, FiLogOut, FiCamera, FiCheckCircle, FiMapPin } from 'react-icons/fi';

const ACTION_ICONS = {
  LOGIN: <FiLogIn className="text-green-500" />,
  LOGOUT: <FiLogOut className="text-gray-500" />,
  LOGIN_FAILED: <FiLogIn className="text-red-500" />,
  QR_GENERATED: <FiCamera className="text-blue-500" />,
  QR_SCAN: <FiCamera className="text-purple-500" />,
  ATTENDANCE_MARKED: <FiCheckCircle className="text-green-600" />,
  PAGE_VISIT: <FiActivity className="text-gray-400" />,
  FEEDBACK_SUBMITTED: <FiActivity className="text-yellow-500" />,
};

const ACTION_COLORS = {
  LOGIN: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  LOGOUT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  LOGIN_FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  QR_GENERATED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  QR_SCAN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  ATTENDANCE_MARKED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  PAGE_VISIT: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  FEEDBACK_SUBMITTED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  teacher: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  student: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  unknown: 'bg-gray-100 text-gray-600',
};

const ActivityLogDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: 200 });
      if (filterRole) params.append('role', filterRole);
      if (filterAction) params.append('action', filterAction);

      const [logsRes, statsRes] = await Promise.all([
        axios.get(`/api/logs?${params}`),
        axios.get('/api/logs/stats')
      ]);
      setLogs(logsRes.data.logs);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  }, [filterRole, filterAction]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const timeAgo = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiActivity className="text-blue-600" /> Activity Log
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time tracking of every user action</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded" />
            Auto-refresh
          </label>
          <button onClick={fetchLogs}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.today}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.byAction?.LOGIN || 0}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Logins</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{stats.byAction?.ATTENDANCE_MARKED || 0}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Attendances</p>
          </div>
        </div>
      )}

      {/* Action Breakdown */}
      {stats?.byAction && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Action Breakdown</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.byAction).map(([action, count]) => (
              <div key={action} className={`px-3 py-2 rounded-lg text-sm font-semibold ${ACTION_COLORS[action] || 'bg-gray-100 text-gray-700'}`}>
                {action.replace(/_/g, ' ')}: <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <FiFilter className="text-gray-500" />
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
          <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
            <option value="">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="LOGIN_FAILED">Failed Login</option>
            <option value="QR_GENERATED">QR Generated</option>
            <option value="ATTENDANCE_MARKED">Attendance Marked</option>
            <option value="FEEDBACK_SUBMITTED">Feedback</option>
          </select>
          {(filterRole || filterAction) && (
            <button onClick={() => { setFilterRole(''); setFilterAction(''); }}
              className="text-sm text-red-600 hover:text-red-700">
              Clear filters
            </button>
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
            Showing {logs.length} events
          </span>
        </div>
      </div>

      {/* Live Log Feed */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Live Activity Feed
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Loading activity logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <FiActivity className="text-5xl mx-auto mb-3 opacity-30" />
            <p>No activity logs yet. Actions will appear here in real-time.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log._id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-start gap-4">
                {/* Icon */}
                <div className="text-xl mt-0.5 flex-shrink-0">
                  {ACTION_ICONS[log.action] || <FiActivity className="text-gray-400" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ROLE_COLORS[log.user?.role] || ''}`}>
                      {log.user?.role?.toUpperCase()}
                    </span>
                    {log.metadata?.geoFenced && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-teal-100 text-teal-700 flex items-center gap-1">
                        <FiMapPin className="w-3 h-3" /> Geo-fenced
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{log.details}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FiUser className="w-3 h-3" />
                      {log.user?.name} ({log.user?.email})
                    </span>
                    <span>•</span>
                    <span title={formatTime(log.timestamp)}>{timeAgo(log.timestamp)}</span>
                    <span>•</span>
                    <span>{formatTime(log.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogDashboard;
