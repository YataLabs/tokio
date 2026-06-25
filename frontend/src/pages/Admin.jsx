import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AlertTriangle, Building2, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";

const emptyBusinessForm = { name: "", owner_name: "", owner_email: "", owner_password: "", expires_at: "" };
const emptyUserForm = { name: "", email: "", password: "", role: "cashier", business_id: "", expires_at: "" };

function toInputDate(value) {
  if (!value) return "";
  return value.slice(0, 10);
}

function toIsoOrNull(value) {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toISOString();
}

export default function Admin() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [businesses, setBusinesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [businessForm, setBusinessForm] = useState(emptyBusinessForm);
  const [businessError, setBusinessError] = useState("");
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [deleteBusinessTarget, setDeleteBusinessTarget] = useState(null);

  const [userForm, setUserForm] = useState(emptyUserForm);
  const [userError, setUserError] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);

  async function loadAll() {
    setLoading(true);
    const [b, u] = await Promise.all([client.get("/admin/businesses"), client.get("/admin/users")]);
    setBusinesses(b.data);
    setUsers(u.data);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function businessName(businessId) {
    return businesses.find((b) => b.id === businessId)?.name || "-";
  }

  // ---------- Business form ----------
  function openAddBusiness() {
    setBusinessForm(emptyBusinessForm);
    setBusinessError("");
    setShowBusinessModal(true);
  }

  function closeBusinessModal() {
    setShowBusinessModal(false);
    setBusinessForm(emptyBusinessForm);
    setBusinessError("");
  }

  async function handleBusinessSubmit(e) {
    e.preventDefault();
    setBusinessError("");
    try {
      await client.post("/admin/businesses", {
        name: businessForm.name,
        owner_name: businessForm.owner_name,
        owner_email: businessForm.owner_email,
        owner_password: businessForm.owner_password,
        expires_at: toIsoOrNull(businessForm.expires_at),
      });
      showToast("Business created", "success");
      closeBusinessModal();
      loadAll();
    } catch (err) {
      setBusinessError(err.response?.data?.detail || "Failed to create business");
    }
  }

  function requestDeleteBusiness(business) {
    setDeleteBusinessTarget(business);
  }

  async function confirmDeleteBusiness() {
    const business = deleteBusinessTarget;
    setDeleteBusinessTarget(null);
    try {
      await client.delete(`/admin/businesses/${business.id}`);
      showToast(`"${business.name}" deleted`, "success");
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to delete business", "error");
    }
  }

  // ---------- User form ----------
  function openAddUser() {
    setEditingUserId(null);
    setUserForm({ ...emptyUserForm, business_id: businesses[0]?.id ?? "" });
    setUserError("");
    setShowUserModal(true);
  }

  function startEditUser(user) {
    setEditingUserId(user.id);
    setUserForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      business_id: user.business_id ?? "",
      expires_at: toInputDate(user.expires_at),
    });
    setUserError("");
    setShowUserModal(true);
  }

  function closeUserModal() {
    setShowUserModal(false);
    setEditingUserId(null);
    setUserForm(emptyUserForm);
    setUserError("");
  }

  async function handleUserSubmit(e) {
    e.preventDefault();
    setUserError("");
    try {
      if (editingUserId) {
        const payload = {
          name: userForm.name,
          role: userForm.role,
          business_id: userForm.role === "admin" ? null : userForm.business_id ? Number(userForm.business_id) : null,
          expires_at: toIsoOrNull(userForm.expires_at),
        };
        if (userForm.password) payload.password = userForm.password;
        await client.put(`/admin/users/${editingUserId}`, payload);
        showToast("User updated", "success");
      } else {
        await client.post("/admin/users", {
          name: userForm.name,
          email: userForm.email,
          password: userForm.password,
          role: userForm.role,
          business_id: Number(userForm.business_id),
          expires_at: toIsoOrNull(userForm.expires_at),
        });
        showToast("User created", "success");
      }
      closeUserModal();
      loadAll();
    } catch (err) {
      setUserError(err.response?.data?.detail || "Failed to save user");
    }
  }

  function requestDeleteUser(user) {
    setDeleteUserTarget(user);
  }

  async function confirmDeleteUser() {
    const user = deleteUserTarget;
    setDeleteUserTarget(null);
    try {
      await client.delete(`/admin/users/${user.id}`);
      showToast(`"${user.name}" deleted`, "success");
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to delete user", "error");
    }
  }

  function isExpired(u) {
    return u.expires_at && new Date(u.expires_at) < new Date();
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Admin</h1>
      </div>

      {/* Businesses */}
      <section>
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Building2 size={18} />
            Businesses
          </h2>
          <button
            onClick={openAddBusiness}
            className="flex items-center gap-2 rounded-lg bg-tokio-blue text-white hover:bg-tokio-blue-dark px-4 py-2 text-sm font-semibold transition"
          >
            <Plus size={16} />
            New Business
          </button>
        </div>

        <div className="rounded-xl border border-tokio-border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-tokio-panel text-tokio-muted">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && businesses.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-tokio-muted">
                    No businesses yet.
                  </td>
                </tr>
              )}
              {businesses.map((b) => (
                <tr key={b.id} className="border-t border-tokio-border">
                  <td className="px-4 py-3 font-medium">{b.name}</td>
                  <td className="px-4 py-3 text-tokio-muted">{new Date(b.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => requestDeleteBusiness(b)}
                      className="rounded border border-tokio-border p-1.5 hover:bg-tokio-danger-bg text-tokio-danger"
                      title="Delete business"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Users */}
      <section>
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Users size={18} />
            Users
          </h2>
          <button
            onClick={openAddUser}
            disabled={businesses.length === 0}
            className="flex items-center gap-2 rounded-lg bg-tokio-blue text-white hover:bg-tokio-blue-dark px-4 py-2 text-sm font-semibold transition disabled:opacity-50"
          >
            <Plus size={16} />
            New User
          </button>
        </div>

        <div className="rounded-xl border border-tokio-border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-tokio-panel text-tokio-muted">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Business</th>
                <th className="text-left px-4 py-3">Expires</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-tokio-muted">
                    No users yet.
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="border-t border-tokio-border">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-tokio-muted">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3 text-tokio-muted">{u.business_id ? businessName(u.business_id) : "-"}</td>
                  <td className="px-4 py-3">
                    {u.expires_at ? (
                      <span className={`inline-flex items-center gap-1 ${isExpired(u) ? "text-tokio-danger font-semibold" : "text-tokio-muted"}`}>
                        {isExpired(u) && <AlertTriangle size={14} />}
                        {new Date(u.expires_at).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-tokio-muted">Never</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => startEditUser(u)}
                        className="rounded border border-tokio-border p-1.5 hover:bg-tokio-panel"
                        title="Edit user"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => requestDeleteUser(u)}
                        className="rounded border border-tokio-border p-1.5 hover:bg-tokio-danger-bg text-tokio-danger"
                        title="Delete user"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Business modal */}
      {showBusinessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-tokio-panel border border-tokio-border shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">New Business</h2>
              <button onClick={closeBusinessModal} className="rounded-lg border border-tokio-border p-1.5 hover:bg-tokio-bg transition">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleBusinessSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-tokio-muted mb-1">Business name</label>
                <input
                  required
                  value={businessForm.name}
                  onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                  className="w-full rounded-lg bg-tokio-bg border border-tokio-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tokio-blue-light"
                />
              </div>
              <div>
                <label className="block text-xs text-tokio-muted mb-1">Owner name</label>
                <input
                  required
                  value={businessForm.owner_name}
                  onChange={(e) => setBusinessForm({ ...businessForm, owner_name: e.target.value })}
                  className="w-full rounded-lg bg-tokio-bg border border-tokio-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tokio-blue-light"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-tokio-muted mb-1">Owner email</label>
                  <input
                    type="email"
                    required
                    value={businessForm.owner_email}
                    onChange={(e) => setBusinessForm({ ...businessForm, owner_email: e.target.value })}
                    className="w-full rounded-lg bg-tokio-bg border border-tokio-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tokio-blue-light"
                  />
                </div>
                <div>
                  <label className="block text-xs text-tokio-muted mb-1">Owner password</label>
                  <input
                    type="password"
                    required
                    value={businessForm.owner_password}
                    onChange={(e) => setBusinessForm({ ...businessForm, owner_password: e.target.value })}
                    className="w-full rounded-lg bg-tokio-bg border border-tokio-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tokio-blue-light"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-tokio-muted mb-1">Account expiration (optional)</label>
                <input
                  type="date"
                  value={businessForm.expires_at}
                  onChange={(e) => setBusinessForm({ ...businessForm, expires_at: e.target.value })}
                  className="w-full rounded-lg bg-tokio-bg border border-tokio-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tokio-blue-light"
                />
              </div>

              {businessError && (
                <p className="flex items-center gap-2 text-tokio-danger text-sm">
                  <AlertTriangle size={16} className="shrink-0" />
                  {businessError}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeBusinessModal}
                  className="flex-1 rounded-lg border border-tokio-border px-4 py-2 text-sm font-medium hover:bg-tokio-bg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-tokio-blue text-white hover:bg-tokio-blue-dark px-4 py-2 text-sm font-semibold transition"
                >
                  <Plus size={16} />
                  Create Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-tokio-panel border border-tokio-border shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingUserId ? "Update User" : "New User"}</h2>
              <button onClick={closeUserModal} className="rounded-lg border border-tokio-border p-1.5 hover:bg-tokio-bg transition">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUserSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-tokio-muted mb-1">Name</label>
                <input
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full rounded-lg bg-tokio-bg border border-tokio-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tokio-blue-light"
                />
              </div>
              <div>
                <label className="block text-xs text-tokio-muted mb-1">Email</label>
                <input
                  type="email"
                  required
                  disabled={!!editingUserId}
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full rounded-lg bg-tokio-bg border border-tokio-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tokio-blue-light disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs text-tokio-muted mb-1">
                  Password {editingUserId && "(leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  required={!editingUserId}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full rounded-lg bg-tokio-bg border border-tokio-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tokio-blue-light"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-tokio-muted mb-1">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full rounded-lg bg-tokio-bg border border-tokio-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tokio-blue-light"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="owner">Owner</option>
                    {editingUserId && <option value="admin">Admin</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-tokio-muted mb-1">Business</label>
                  <select
                    value={userForm.business_id}
                    disabled={userForm.role === "admin"}
                    onChange={(e) => setUserForm({ ...userForm, business_id: e.target.value })}
                    className="w-full rounded-lg bg-tokio-bg border border-tokio-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tokio-blue-light disabled:opacity-60"
                  >
                    <option value="">-</option>
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-tokio-muted mb-1">Account expiration (optional)</label>
                <input
                  type="date"
                  value={userForm.expires_at}
                  onChange={(e) => setUserForm({ ...userForm, expires_at: e.target.value })}
                  className="w-full rounded-lg bg-tokio-bg border border-tokio-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tokio-blue-light"
                />
              </div>

              {userError && (
                <p className="flex items-center gap-2 text-tokio-danger text-sm">
                  <AlertTriangle size={16} className="shrink-0" />
                  {userError}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeUserModal}
                  className="flex-1 rounded-lg border border-tokio-border px-4 py-2 text-sm font-medium hover:bg-tokio-bg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-tokio-blue text-white hover:bg-tokio-blue-dark px-4 py-2 text-sm font-semibold transition"
                >
                  <Plus size={16} />
                  {editingUserId ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteBusinessTarget}
        title="Delete business"
        message={deleteBusinessTarget ? `Are you sure you want to delete "${deleteBusinessTarget.name}"? This removes all its users and data.` : ""}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDeleteBusiness}
        onCancel={() => setDeleteBusinessTarget(null)}
      />

      <ConfirmModal
        open={!!deleteUserTarget}
        title="Delete user"
        message={deleteUserTarget ? `Are you sure you want to delete "${deleteUserTarget.name}"?` : ""}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDeleteUser}
        onCancel={() => setDeleteUserTarget(null)}
      />
    </div>
  );
}
