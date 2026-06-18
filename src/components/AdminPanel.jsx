import { useState, useEffect, useCallback } from "react";

const API_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || "") : "";

function formatBytes(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function AdminPanel({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Notes management
  const [notes, setNotes] = useState([]);
  const [grants, setGrants] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [notesMsg, setNotesMsg] = useState("");

  // Grant management
  const [grantEmail, setGrantEmail] = useState("");
  const [granting, setGranting] = useState(false);
  const [grantMsg, setGrantMsg] = useState("");

  const authHeaders = { Authorization: `Bearer ${user.token}` };

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/notes`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setNotes(data.data);
    } catch (err) {
      console.error("Failed to load notes:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.token]);

  const fetchGrants = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/notes/admin/grants`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setGrants(data.data);
    } catch (err) {
      console.error("Failed to load grants:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.token]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/stats/users`, { headers: authHeaders });
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.message || "Failed to fetch stats");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    fetchNotes();
    fetchGrants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const showNotesMsg = (msg) => {
    setNotesMsg(msg);
    setTimeout(() => setNotesMsg(""), 4000);
  };
  const showGrantMsg = (msg) => {
    setGrantMsg(msg);
    setTimeout(() => setGrantMsg(""), 4000);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim() || !file) {
      showNotesMsg("Title and a PDF file are required.");
      return;
    }
    if (file.type !== "application/pdf") {
      showNotesMsg("Only PDF files are allowed.");
      return;
    }

    setUploading(true);
    try {
      // 1. Get a signed upload payload from our backend.
      const sigRes = await fetch(`${API_URL}/api/notes/admin/upload-signature`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ filename: file.name }),
      });
      const sig = await sigRes.json();
      if (!sig.success) throw new Error(sig.message || "Could not authorize upload.");

      // 2. Upload the file directly to Cloudinary (bypasses serverless size limits).
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sig.apiKey);
      form.append("timestamp", sig.timestamp);
      form.append("signature", sig.signature);
      form.append("folder", sig.folder);
      form.append("type", sig.type);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: "POST", body: form }
      );
      const cloud = await cloudRes.json();
      if (!cloudRes.ok || cloud.error) {
        throw new Error(cloud.error?.message || "Cloudinary upload failed.");
      }

      // 3. Persist the note metadata.
      const saveRes = await fetch(`${API_URL}/api/notes/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          publicId: cloud.public_id,
          format: cloud.format || "pdf",
          bytes: cloud.bytes || 0,
          resourceType: cloud.resource_type || "image",
        }),
      });
      const saved = await saveRes.json();
      if (!saved.success) throw new Error(saved.message || "Failed to save note.");

      setTitle("");
      setDescription("");
      setFile(null);
      e.target.reset?.();
      showNotesMsg("Note uploaded successfully.");
      fetchNotes();
    } catch (err) {
      showNotesMsg(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Delete this note? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_URL}/api/notes/admin/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        showNotesMsg("Note deleted.");
        fetchNotes();
      } else {
        showNotesMsg(data.message || "Failed to delete.");
      }
    } catch (err) {
      showNotesMsg(err.message);
    }
  };

  const handleGrant = async (e) => {
    e.preventDefault();
    if (!grantEmail.includes("@")) {
      showGrantMsg("Enter a valid email.");
      return;
    }
    setGranting(true);
    try {
      const res = await fetch(`${API_URL}/api/notes/admin/grant`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ email: grantEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setGrantEmail("");
        showGrantMsg("Access granted.");
        fetchGrants();
      } else {
        showGrantMsg(data.message || "Failed to grant access.");
      }
    } catch (err) {
      showGrantMsg(err.message);
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = async (email) => {
    if (!window.confirm(`Revoke access for ${email}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/notes/admin/grant/${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        showGrantMsg("Access revoked.");
        fetchGrants();
      } else {
        showGrantMsg(data.message || "Failed to revoke.");
      }
    } catch (err) {
      showGrantMsg(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      <h2 className="text-2xl font-semibold text-zinc-900 mb-6">Admin Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-sm">
          <p className="text-[12px] font-medium text-zinc-500 mb-1">Total Unique Users</p>
          <p className="text-3xl font-semibold text-zinc-900">{stats.totalUsers}</p>
        </div>
        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-sm">
          <p className="text-[12px] font-medium text-zinc-500 mb-1">Total Logins</p>
          <p className="text-3xl font-semibold text-emerald-600">{stats.totalLogins}</p>
        </div>
      </div>

      {/* ───────────── Notes Management ───────────── */}
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-semibold text-zinc-800 text-[14px]">Premium Notes</h3>
          {notesMsg && <span className="text-[11px] font-medium text-emerald-600">{notesMsg}</span>}
        </div>

        {/* Upload form */}
        <form onSubmit={handleUpload} className="p-5 space-y-3 border-b border-zinc-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title *"
              className="w-full px-3 py-2 rounded-lg text-[13px] bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/8 focus:border-zinc-300"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              className="w-full px-3 py-2 rounded-lg text-[13px] bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/8 focus:border-zinc-300"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="text-[12px] text-zinc-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-medium file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 file:cursor-pointer"
            />
            <button
              type="submit"
              disabled={uploading}
              className="sm:ml-auto inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-all active:scale-[0.98]"
            >
              {uploading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Uploading…
                </>
              ) : (
                "Upload PDF"
              )}
            </button>
          </div>
        </form>

        {/* Notes list */}
        <div className="divide-y divide-zinc-100">
          {notes.length === 0 ? (
            <p className="px-5 py-4 text-center text-[13px] text-zinc-400">No notes uploaded yet.</p>
          ) : (
            notes.map((note) => (
              <div key={note._id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-zinc-900 truncate">{note.title}</p>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {note.description || "—"}
                    {note.bytes ? ` · ${formatBytes(note.bytes)}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteNote(note._id)}
                  className="flex-shrink-0 text-[12px] font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ───────────── Notes Access Grants ───────────── */}
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-zinc-800 text-[14px]">Notes Access</h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">Manually grant access by email (works even before they sign in).</p>
          </div>
          {grantMsg && <span className="text-[11px] font-medium text-emerald-600">{grantMsg}</span>}
        </div>

        <form onSubmit={handleGrant} className="p-5 flex flex-col sm:flex-row gap-3 border-b border-zinc-100">
          <input
            type="email"
            value={grantEmail}
            onChange={(e) => setGrantEmail(e.target.value)}
            placeholder="student@cmrit.ac.in"
            className="flex-1 px-3 py-2 rounded-lg text-[13px] bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/8 focus:border-zinc-300"
          />
          <button
            type="submit"
            disabled={granting}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-all active:scale-[0.98]"
          >
            {granting ? "Granting…" : "Grant Access"}
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-zinc-50/50 text-zinc-500 border-b border-zinc-100">
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Via</th>
                <th className="px-5 py-3 font-medium">Access Token</th>
                <th className="px-5 py-3 font-medium">Granted</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {grants.map((g) => (
                <tr key={g._id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-5 py-3 text-zinc-900 font-medium">{g.email}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      g.grantedVia === "payment"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-zinc-100 text-zinc-600"
                    }`}>
                      {g.grantedVia}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <code className="text-[11px] text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded font-mono">
                      {g.token || "—"}
                    </code>
                  </td>
                  <td className="px-5 py-3 text-zinc-500">
                    {g.createdAt ? new Date(g.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleRevoke(g.email)}
                      className="text-[12px] font-medium text-red-500 hover:text-red-700"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
              {grants.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-4 text-center text-zinc-500">
                    No one has access yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───────────── Recent Logins ───────────── */}
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-800 text-[14px]">Recent Logins</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-zinc-50/50 text-zinc-500 border-b border-zinc-100">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Logins</th>
                <th className="px-5 py-3 font-medium">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {stats.recentUsers.map((u) => (
                <tr key={u._id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-5 py-3 text-zinc-900 font-medium">{u.name}</td>
                  <td className="px-5 py-3 text-zinc-500">{u.email}</td>
                  <td className="px-5 py-3 text-zinc-900">{u.loginCount}</td>
                  <td className="px-5 py-3 text-zinc-500">
                    {new Date(u.lastLogin).toLocaleString()}
                  </td>
                </tr>
              ))}
              {stats.recentUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-5 py-4 text-center text-zinc-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
