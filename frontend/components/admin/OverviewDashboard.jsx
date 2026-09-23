import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, FileText, Component, ShieldAlert, Trophy, Loader2 } from 'lucide-react';
import { api } from '../../services/api'; // Adjust path if necessary

export default function OverviewDashboard() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await api.admin.getStats();
      return res.data || res;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white/50">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500">
        Failed to load dashboard statistics.
      </div>
    );
  }

  const {
    total_users = 0,
    total_posts = 0,
    total_groups = 0,
    pending_reports = 0,
    by_institution = []
  } = stats || {};

  const metrics = [
    { label: 'Total Users', value: total_users, icon: Users, color: 'text-primary' },
    { label: 'Total Posts', value: total_posts, icon: FileText, color: 'text-[var(--rc-teaky)]' },
    { label: 'Total Groups', value: total_groups, icon: Component, color: 'text-[var(--rc-go)]' },
    { label: 'Pending Reports', value: pending_reports, icon: ShieldAlert, color: 'text-red-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-black text-white mb-2">Overview</h1>
        <p className="text-white/50">Platform-wide performance and metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div
              key={i}
              className="bg-[#111114] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between z-10 relative">
                <span className="rc-label text-white/50">{metric.label}</span>
                <Icon className={`w-5 h-5 ${metric.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
              </div>
              <div className="text-4xl font-black text-white z-10 relative">
                {metric.value.toLocaleString()}
              </div>
              <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full ${metric.color} opacity-5 blur-2xl z-0`} />
            </div>
          );
        })}
      </div>

      <div className="bg-[#111114] border border-white/10 rounded-3xl p-6 lg:p-8 mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-serif font-black text-white">Platform Leaderboard</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="py-4 px-4 rc-label text-white/40">Rank</th>
                <th className="py-4 px-4 rc-label text-white/40">Institution</th>
                <th className="py-4 px-4 rc-label text-white/40 text-right">Users</th>
              </tr>
            </thead>
            <tbody>
              {by_institution.map((inst, index) => (
                <tr
                  key={index}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className="text-white/70 font-medium">#{index + 1}</span>
                  </td>
                  <td className="py-4 px-4 text-white font-medium">
                    {inst.name || inst.institution}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="bg-white/10 text-white py-1 px-3 rounded-full text-sm font-medium">
                      {Number(inst.user_count || inst.users || 0).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              {by_institution.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-white/40">
                    No institution data available.
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
