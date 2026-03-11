'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';
import { UserPlus, AlertCircle } from 'lucide-react';

interface Props {
  onSuccess?: () => void;
}

export default function AddStudentModal({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', studentId: '', rfidCardId: '', classGroup: '',
    email: '', password: '',
  });

  function update(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/api/students', { method: 'POST', body: JSON.stringify(form) });
      setOpen(false);
      setForm({ firstName: '', lastName: '', studentId: '', rfidCardId: '', classGroup: '', email: '', password: '' });
      onSuccess?.();
    } catch (err: any) {
      setError(err.message ?? 'Failed to create student');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>First Name</Label>
              <Input value={form.firstName} onChange={e => update('firstName', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name</Label>
              <Input value={form.lastName} onChange={e => update('lastName', e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Student ID</Label>
              <Input placeholder="STU001" value={form.studentId} onChange={e => update('studentId', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Class Group</Label>
              <Input placeholder="CS-2B" value={form.classGroup} onChange={e => update('classGroup', e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>RFID Card ID</Label>
            <Input placeholder="A1B2C3D4" value={form.rfidCardId} onChange={e => update('rfidCardId', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Login Email (optional)</Label>
            <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} />
          </div>
          {form.email && (
            <div className="space-y-1.5">
              <Label>Temporary Password</Label>
              <Input type="password" value={form.password} onChange={e => update('password', e.target.value)} />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Student'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
