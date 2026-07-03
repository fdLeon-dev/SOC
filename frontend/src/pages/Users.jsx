/**
 * DefenseOS - Users Management (Admin only)
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Plus, Edit2, Search } from 'lucide-react'
import { usersApi } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import toast from 'react-hot-toast'

const ROLES = ['analyst', 'admin']

export default function Users() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // State
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'analyst',
    is_active: true,
  })

  // Queries
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((r) => r.data),
    enabled: user?.role === 'admin',
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created')
      resetForm()
      setShowModal(false)
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || 'Failed to create user'
      toast.error(msg)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data) => usersApi.update(editingUser.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated')
      resetForm()
      setShowModal(false)
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || 'Failed to update user'
      toast.error(msg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deactivated')
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || 'Failed to delete user'
      toast.error(msg)
    },
  })

  // Handlers
  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'analyst',
      is_active: true,
    })
    setEditingUser(null)
  }

  const handleOpenCreate = () => {
    resetForm()
    setShowModal(true)
  }

  const handleOpenEdit = (u) => {
    setEditingUser(u)
    setFormData({
      username: u.username,
      email: u.email,
      password: '',
      role: u.role,
      is_active: u.is_active,
    })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.username || !formData.email) {
      toast.error('Username and email required')
      return
    }

    const payload = editingUser
      ? {
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active,
          ...(formData.password && { password: formData.password }),
        }
      : {
          username: formData.username,
          email: formData.email,
          password: formData.password || 'TempPass123!',
          role: formData.role,
        }

    if (editingUser) {
      updateMutation.mutate(payload)
    } else {
      if (!formData.password) {
        toast.error('Password required for new users')
        return
      }
      createMutation.mutate(payload)
    }
  }

  const handleDelete = (u) => {
    if (!window.confirm(`Deactivate user "${u.username}"?`)) return
    deleteMutation.mutate(u.id)
  }

  // Filter
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <p className="text-soc-muted">Admin access required</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-soc-text">Users</h1>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-soc-accent text-soc-bg px-3 py-2 rounded-lg hover:bg-soc-accent/90 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New User
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soc-muted" />
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-soc-bg border border-soc-border rounded-lg text-sm text-soc-text placeholder-soc-muted focus:outline-none focus:border-soc-accent"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8 text-soc-muted">Loading users...</div>
      ) : (
        <div className="border border-soc-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-soc-border/30">
              <tr>
                <th className="px-4 py-3 text-left text-soc-muted font-semibold">Username</th>
                <th className="px-4 py-3 text-left text-soc-muted font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-soc-muted font-semibold">Role</th>
                <th className="px-4 py-3 text-left text-soc-muted font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-soc-muted font-semibold">Created</th>
                <th className="px-4 py-3 text-center text-soc-muted font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border/50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-soc-muted">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-soc-border/10 transition-colors"
                  >
                    <td className="px-4 py-3 text-soc-text font-medium">{u.username}</td>
                    <td className="px-4 py-3 text-soc-text text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          u.role === 'admin'
                            ? 'bg-soc-accent/20 text-soc-accent'
                            : 'bg-soc-border/30 text-soc-text'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          u.is_active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-soc-muted text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1 hover:bg-soc-border/30 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-soc-accent" />
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={deleteMutation.isPending}
                        className="p-1 hover:bg-soc-border/30 rounded transition-colors disabled:opacity-50"
                        title="Deactivate"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-soc-bg border border-soc-border rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-soc-text mb-4">
              {editingUser ? 'Edit User' : 'Create User'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingUser && (
                <div>
                  <label className="block text-xs text-soc-muted mb-1 uppercase tracking-wider">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-soc-bg border border-soc-border rounded px-3 py-2 text-sm text-soc-text focus:outline-none focus:border-soc-accent"
                    disabled={editingUser}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-soc-muted mb-1 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-soc-bg border border-soc-border rounded px-3 py-2 text-sm text-soc-text focus:outline-none focus:border-soc-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-soc-muted mb-1 uppercase tracking-wider">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-soc-bg border border-soc-border rounded px-3 py-2 text-sm text-soc-text focus:outline-none focus:border-soc-accent"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs text-soc-muted mb-1 uppercase tracking-wider">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-soc-bg border border-soc-border rounded px-3 py-2 text-sm text-soc-text focus:outline-none focus:border-soc-accent"
                    required
                  />
                </div>
              )}

              {editingUser && (
                <>
                  <div>
                    <label className="block text-xs text-soc-muted mb-1 uppercase tracking-wider">
                      New Password (optional)
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Leave empty to keep current"
                      className="w-full bg-soc-bg border border-soc-border rounded px-3 py-2 text-sm text-soc-text focus:outline-none focus:border-soc-accent"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-soc-text">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      />
                      Active
                    </label>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-soc-accent text-soc-bg font-semibold py-2 rounded hover:bg-soc-accent/90 transition-colors disabled:opacity-50"
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 bg-soc-border/30 text-soc-text font-semibold py-2 rounded hover:bg-soc-border/50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
