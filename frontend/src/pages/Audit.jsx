import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { auditApi } from '../lib/api';

export default function Audit() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAction, setFilterAction] = useState('');

  // Fetch audit logs
  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ['audit-logs', filterType, filterAction],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterType) params.append('resource_type', filterType);
      if (filterAction) params.append('action', filterAction);
      params.append('limit', '200');

      const response = await auditApi.getLogs(params.toString());
      return response.data;
    },
    enabled: user?.role === 'admin',
  });

  // Filter by search term
  const filtered = useMemo(() => {
    if (!search) return logs;
    const q = search.toLowerCase();
    return logs.filter(
      (log) =>
        log.username.toLowerCase().includes(q) ||
        log.resource_type.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.details?.toLowerCase().includes(q) || false)
    );
  }, [logs, search]);

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Admin access required</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p>Loading audit logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error loading audit logs</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
          <p className="text-gray-400 mt-1">Security event trail</p>
        </div>
        <div className="text-sm text-gray-400">
          {filtered.length} / {logs.length} entries
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="flex items-center bg-gray-900 border border-gray-700 rounded px-3 py-2">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent ml-2 text-white outline-none flex-1 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Resource type filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
            >
              <option value="">All resource types</option>
              <option value="alert">Alerts</option>
              <option value="incident">Incidents</option>
              <option value="user">Users</option>
              <option value="event">Events</option>
            </select>
          </div>

          {/* Action filter */}
          <div>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm"
            >
              <option value="">All actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">When</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">Who</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">Action</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">Resource</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-300">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">
                        {log.username}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          log.action === 'create'
                            ? 'bg-green-500/20 text-green-300'
                            : log.action === 'update'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : log.action === 'delete'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-gray-500/20 text-gray-300'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                      {log.resource_type}#{log.resource_id}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Events</p>
          <p className="text-2xl font-bold text-white">{logs.length}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Unique Users</p>
          <p className="text-2xl font-bold text-white">
            {new Set(logs.map((l) => l.username)).size}
          </p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Create Actions</p>
          <p className="text-2xl font-bold text-green-400">
            {logs.filter((l) => l.action === 'create').length}
          </p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Delete Actions</p>
          <p className="text-2xl font-bold text-red-400">
            {logs.filter((l) => l.action === 'delete').length}
          </p>
        </div>
      </div>
    </div>
  );
}
