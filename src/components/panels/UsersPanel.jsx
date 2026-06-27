// UsersPanel.jsx — superadmin-only: create, edit, delete admin/staff accounts.
import { useState, useEffect } from "react";
import { getUsers, addUser, updateUser, deleteUser } from "../../services/restaurantStore";
import { useAdminAction } from "../../Service/useAdminAction";
import { getCurrentAdmin } from "../../admin/auth/authService";

const emptyForm = { username: "", email: "", password: "", full_name: "", role: "staff" };

const ROLE_BADGE = {
  superadmin: "bg-purple-100 text-purple-700",
  admin:      "bg-blue-100 text-blue-700",
  staff:      "bg-gray-100 text-gray-600",
};

export default function UsersPanel({ showToast }) {
  const currentAdmin = getCurrentAdmin();
  const isSuperadmin = currentAdmin?.role === "superadmin";

  const [users, setUsers]           = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadError, setLoadError]   = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = create mode
  const [form, setForm]             = useState(emptyForm);
  const { run, loading }            = useAdminAction(showToast);

  async function loadUsers() {
    try {
      setLoadError("");
      setUsers(await getUsers());
    } catch (err) {
      setLoadError(err.message || "Failed to load users");
    } finally {
      setPageLoading(false);
    }
  }

  useEffect(() => {
    if (isSuperadmin) loadUsers();
    else setPageLoading(false);
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function openAdd() {
    setEditingUser(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(user) {
    setEditingUser(user);
    setForm({
      username:   user.username,
      email:      user.email,
      password:   "",               // leave blank = keep existing
      full_name:  user.full_name || "",
      role:       user.role,
      is_active:  user.is_active,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingUser(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingUser) {
      // Edit mode — only send password if filled in
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      const updated = await run(() => updateUser(editingUser.id, payload), `"${form.username}" updated`);
      if (updated) { closeForm(); loadUsers(); }
    } else {
      // Create mode
      if (!form.username.trim() || !form.email.trim() || !form.password) {
        showToast?.("Username, email, and password are required", "error");
        return;
      }
      const created = await run(() => addUser(form), `"${form.username}" added`);
      if (created) { closeForm(); loadUsers(); }
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`Delete "${user.username}"? This cannot be undone.`)) return;
    const ok = await run(() => deleteUser(user.id), `"${user.username}" deleted`);
    if (ok !== undefined) loadUsers();
  }

  if (!isSuperadmin) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">🔒</p>
        <p>Only a superadmin can manage user accounts.</p>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Users</h2>
          <p className="text-sm text-gray-500 mt-1">Create and view admin/staff accounts</p>
        </div>
        <button onClick={openAdd}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + New User
        </button>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {loadError}
        </div>
      )}

      {/* Table */}
      {users.length === 0 && !loadError ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">👤</p>
          <p>No users yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b text-xs text-gray-500 font-medium">
            {users.length} accounts
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="px-5 py-3 font-medium">Username</th>
                <th className="px-5 py-3 font-medium">Full Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.username === currentAdmin?.username;
                return (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {u.username}
                      {isSelf && <span className="ml-2 text-xs text-amber-600">(you)</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{u.full_name || "—"}</td>
                    <td className="px-5 py-3 text-gray-600">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_BADGE[u.role] || "bg-gray-100 text-gray-600"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {u.is_active ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(u)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors font-medium">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(u)}
                          disabled={isSelf}
                          title={isSelf ? "You cannot delete your own account" : ""}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            isSelf
                              ? "border border-gray-200 text-gray-300 cursor-not-allowed"
                              : "border border-red-200 text-red-600 hover:bg-red-50"
                          }`}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingUser ? `Edit — ${editingUser.username}` : "Create New User"}
              </h3>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Username — read-only in edit mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input name="username" value={form.username} onChange={handleChange}
                  required={!editingUser} disabled={!!editingUser}
                  className="w-full text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder="e.g. priya_admin" />
                {editingUser && <p className="text-xs text-gray-400 mt-1">Username cannot be changed.</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  className="w-full text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="priya@kaarasaaram.com" />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser ? "(leave blank to keep current)" : "*"}
                </label>
                <input name="password" type="password" value={form.password} onChange={handleChange}
                  required={!editingUser} minLength={editingUser ? undefined : 8}
                  className="w-full text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder={editingUser ? "Leave blank to keep current password" : "At least 8 characters, with a letter and a number"} />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input name="full_name" value={form.full_name} onChange={handleChange}
                  className="w-full text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Priya Sundaram" />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select name="role" value={form.role} onChange={handleChange}
                  className="w-full text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              {/* Active toggle — only in edit mode */}
              {editingUser && (
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="is_active" name="is_active"
                    checked={form.is_active ?? true} onChange={handleChange}
                    className="w-4 h-4 accent-amber-600" />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Account is Active
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium">
                  {loading ? (editingUser ? "Saving…" : "Creating…") : (editingUser ? "Save Changes" : "Create User")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
