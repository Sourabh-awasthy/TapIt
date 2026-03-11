'use client';

import { useState } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { apiFetch } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import AddStudentModal from '@/components/AddStudentModal';
import LocationWeightSettings from '@/components/LocationWeightSettings';
import { Search, Pencil, Ban, Check, X, Flame } from 'lucide-react';

export default function AdminPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingRfid, setEditingRfid] = useState<string | null>(null);
  const [rfidValue, setRfidValue] = useState('');
  const { data, isLoading, mutate } = useStudents({ search, page, limit: 20 });
  const students = data?.students ?? [];

  async function startEditRfid(studentId: string, current?: string) {
    setEditingRfid(studentId);
    setRfidValue(current ?? '');
  }

  async function saveRfid(studentId: string) {
    await apiFetch(`/students/${studentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ rfidCardId: rfidValue }),
    });
    setEditingRfid(null);
    mutate();
  }

  async function toggleActive(studentId: string, isActive: boolean) {
    await apiFetch(`/students/${studentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !isActive }),
    });
    mutate();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
        <p className="text-slate-500 mt-1">Manage students and system settings</p>
      </div>
      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Student Registry</TabsTrigger>
          <TabsTrigger value="settings">Location Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="students" className="space-y-4 mt-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search students..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <AddStudentModal onSuccess={mutate} />
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ID</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Group</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">RFID Card</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Engagement</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Streak</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
                      ))
                    ) : students.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-8 text-slate-500">No students found</td></tr>
                    ) : (
                      students.map(s => (
                        <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-indigo-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {s.firstName[0]}{s.lastName[0]}
                              </div>
                              <span className="font-medium text-slate-800">{s.firstName} {s.lastName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-xs">{s.studentId}</td>
                          <td className="px-4 py-3"><Badge variant="secondary">{s.classGroup}</Badge></td>
                          <td className="px-4 py-3">
                            {editingRfid === s._id ? (
                              <div className="flex items-center gap-2">
                                <Input className="h-7 text-xs w-36" value={rfidValue} onChange={e => setRfidValue(e.target.value)} placeholder="RFID card ID" autoFocus />
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" onClick={() => saveRfid(s._id)}><Check className="w-3.5 h-3.5" /></Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400" onClick={() => setEditingRfid(null)}><X className="w-3.5 h-3.5" /></Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-slate-500">{s.rfidCardId ?? <span className="text-slate-300 italic">not assigned</span>}</span>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-slate-700" onClick={() => startEditRfid(s._id, s.rfidCardId)}><Pencil className="w-3 h-3" /></Button>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-700">{s.score?.engagementScore ?? '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="flex items-center justify-end gap-1 text-orange-500">
                              <Flame className="w-3.5 h-3.5" />{s.score?.attendanceStreak ?? 0}d
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Badge variant={s.isActive ? 'default' : 'secondary'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button size="sm" variant="ghost"
                              className={s.isActive ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'}
                              onClick={() => toggleActive(s._id, s.isActive)}>
                              <Ban className="w-3.5 h-3.5 mr-1" />{s.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {data && data.total > 20 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} of {data.total} students</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                    <Button size="sm" variant="outline" disabled={page * 20 >= data.total} onClick={() => setPage(p => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <LocationWeightSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
