import { useState, useEffect } from "react";

export default function AdminPanel({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || "") : "";
        const res = await fetch(`${API_URL}/api/stats/users`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
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
  }, [user]);

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
