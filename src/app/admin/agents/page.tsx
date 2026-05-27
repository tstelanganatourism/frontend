'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import Link from 'next/link';
import { 
  Search, Plus, Users, Edit, Trash2, Eye, ShieldCheck, ShieldOff,
  Phone, Mail, Building2, ChevronDown, MoreHorizontal, Percent
} from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Pagination from '@/components/ui/Pagination';
import PremiumSelect from '@/components/ui/PremiumSelect';
function StatusPill({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    ACTIVE:   { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Active' },
    BLOCKED:  { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500',     label: 'Blocked' },
    DISABLED: { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400',   label: 'Disabled' },
  };
  const s = cfg[status] || cfg.DISABLED;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function AvatarInitials({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#5ac4d7] to-[#0f3d56] flex items-center justify-center text-white text-xs font-black shadow-sm">
      {initials}
    </div>
  );
}

export default function AdminAgentsPage() {
  const { 
    agents, 
    agentsTotal,
    agentsPage,
    agentsLimit,
    isLoading, 
    fetchAgents, 
    deleteAgent, 
    toggleAgentStatus 
  } = useAdminStore();
  const [searchVal, setSearchVal] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchAgents('', statusFilter, 1, agentsLimit);
  }, [fetchAgents, statusFilter, agentsLimit]);

  const handleDeleteConfirm = async () => {
    if (selectedAgentId) {
      await deleteAgent(selectedAgentId);
      toast.success('Agent removed successfully');
      setIsDeleteModalOpen(false);
      setSelectedAgentId(null);
      fetchAgents('', statusFilter, agentsPage, agentsLimit);
    }
  };

  const handleToggleStatus = async (agent: any) => {
    try {
      const updated = await toggleAgentStatus(agent.id);
      toast.success(`${agent.full_name} is now ${updated.account_status === 'ACTIVE' ? 'active' : 'blocked'}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Agent Network</h1>
          <p className="text-slate-500 mt-1">Manage travel agents, commissions, and access control.</p>
        </div>
        <Link href="/admin/agents/create" prefetch={false}
          className="flex items-center gap-2 self-start rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-slate-800">
          <Plus className="h-4 w-4" />
          Onboard New Agent
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search agents by name, email, phone or company..."
            value={searchVal} onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all" />
        </div>
        <div className="flex gap-4">
          <div className="w-[180px]">
            <PremiumSelect 
              value={statusFilter} 
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'BLOCKED', label: 'Blocked' },
                { value: 'DISABLED', label: 'Disabled' },
              ]} 
              onChange={setStatusFilter} 
              placeholder="All Statuses" 
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Agent</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Company</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Commission</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && agents.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-5"><div className="h-4 w-full max-w-[120px] animate-pulse rounded-lg bg-slate-100" /></td>
                    ))}
                  </tr>
                ))
              ) : (() => {
                const filteredAgents = Array.isArray(agents)
                  ? agents.filter(agent => 
                      searchVal === '' || 
                      (agent.full_name && agent.full_name.toLowerCase().includes(searchVal.toLowerCase())) || 
                      (agent.email && agent.email.toLowerCase().includes(searchVal.toLowerCase())) || 
                      (agent.company_name && agent.company_name.toLowerCase().includes(searchVal.toLowerCase())) || 
                      (agent.phone_number && agent.phone_number.includes(searchVal))
                    )
                  : [];
                  
                if (filteredAgents.length === 0) {
                  return (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="rounded-2xl bg-slate-50 p-6"><Users className="h-12 w-12 text-slate-300" /></div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">No agents found</h3>
                            <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search query.</p>
                          </div>
                          <Link href="/admin/agents/create" prefetch={false}
                            className="mt-2 flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-800 transition-all">
                            <Plus className="h-4 w-4" /> Onboard Agent
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return filteredAgents.map((agent) => (
                  <tr key={agent.id} className="border-b border-slate-50 hover:bg-slate-25 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <AvatarInitials name={agent.full_name} />
                      <div>
                        <Link href={`/admin/agents/${agent.id}`} prefetch={false} className="font-bold text-slate-900 hover:text-[#5ac4d7] transition-colors">
                          {agent.full_name}
                        </Link>
                        <p className="text-xs text-slate-400 mt-0.5 md:hidden">{agent.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600"><Mail className="h-3 w-3 text-slate-400" />{agent.email}</div>
                      {agent.phone_number && (
                        <div className="flex items-center gap-1.5 text-slate-600"><Phone className="h-3 w-3 text-slate-400" />{agent.phone_number}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate max-w-[150px]">{agent.company_name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700">
                      {agent.commission_type === 'FIXED_AMOUNT' ? (
                        <>
                          <span>₹</span>
                          {parseFloat(agent.commission_fixed_amount || 0).toLocaleString('en-IN')}
                        </>
                      ) : (
                        <>
                          <Percent className="h-3 w-3" />
                          {parseFloat(agent.commission_percentage || 0).toFixed(1)}%
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleToggleStatus(agent)} className="cursor-pointer">
                      <StatusPill status={agent.account_status} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/admin/agents/${agent.id}`} prefetch={false}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-[#5ac4d7] transition-all" title="View Detail">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link href={`/admin/agents/edit/${agent.id}`} prefetch={false}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-all" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button onClick={() => { setSelectedAgentId(agent.id); setIsDeleteModalOpen(true); }}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ));
              })()}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={agentsPage}
          totalItems={agentsTotal}
          pageSize={agentsLimit}
          onPageChange={(page) => fetchAgents('', statusFilter, page, agentsLimit)}
          onPageSizeChange={(size) => fetchAgents('', statusFilter, 1, size)}
        />
      </div>

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm}
        title="Remove Agent" message="This will deactivate the agent's account. They will no longer be able to log in or generate bookings. This action can be reversed by support."
        confirmText="Remove Agent" cancelText="Keep Agent" type="danger" />
    </div>
  );
}
