'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch } from '@/lib/api';
import { useLocations } from '@/hooks/useLocations';
import { AlertCircle, Check } from 'lucide-react';

const LOCATION_COLORS: Record<string, string> = {
  classroom: '#6366f1',
  library:   '#10b981',
  gym:       '#f59e0b',
  club:      '#ec4899',
};

export default function LocationWeightSettings() {
  const { data: locations, isLoading, mutate } = useLocations();
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (locations) {
      const w: Record<string, number> = {};
      locations.forEach(l => { w[l.code] = l.weight; });
      setWeights(w);
    }
  }, [locations]);

  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const isValid = Math.abs(total - 1.0) < 0.001;

  async function handleSave() {
    setError('');
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(weights).map(([code, weight]) =>
          apiFetch(`/api/locations/${code}`, { method: 'PATCH', body: JSON.stringify({ weight }) })
        )
      );
      await mutate();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Weights</CardTitle>
        <CardDescription>Weights determine how each location contributes to the engagement score. They must sum to 1.0.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {Object.entries(weights).map(([code, weight]) => (
          <div key={code}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-medium capitalize" style={{ color: LOCATION_COLORS[code] }}>{code}</span>
              <span className="text-sm font-bold text-slate-700">{(weight * 100).toFixed(0)}%</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weight}
                onChange={e => setWeights(w => ({ ...w, [code]: parseFloat(e.target.value) }))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: LOCATION_COLORS[code] }}
              />
            </div>
          </div>
        ))}

        <div className={`flex items-center justify-between p-3 rounded-md text-sm ${isValid ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          <span>Total weight: <strong>{(total * 100).toFixed(0)}%</strong></span>
          {!isValid && <span className="text-xs">Must equal 100%</span>}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <Button onClick={handleSave} disabled={!isValid || saving} className="w-full gap-2">
          {saved ? <><Check className="w-4 h-4" /> Saved</> : saving ? 'Saving...' : 'Save Weights'}
        </Button>
      </CardContent>
    </Card>
  );
}
