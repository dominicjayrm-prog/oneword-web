'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { checkRateLimit } from '@/lib/rateLimit';
import { Button } from '@/components/ui/Button';

interface ReportDialogProps {
  descriptionId: string;
  wordId: string;
  reporterId: string;
  onClose: () => void;
  onReported: () => void;
}

export function ReportDialog({ descriptionId, wordId, reporterId, onClose, onReported }: ReportDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const t = useTranslations('report');
  const supabase = createClient();

  async function handleReport() {
    if (!checkRateLimit('report')) {
      alert(t('rate_limited'));
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.rpc('submit_report', {
      p_reporter_id: reporterId,
      p_description_id: descriptionId,
      p_word_id: wordId,
    });
    if (error) {
      console.error('submit_report error:', error.code, error.message);
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    onReported();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-sm rounded-2xl bg-bg p-6 text-center">
        <h3 className="font-serif text-xl font-bold text-text">{t('title')}</h3>
        <p className="mt-2 text-sm text-text-muted">{t('confirm')}</p>
        <div className="mt-4 flex gap-2">
          <Button variant="primary" className="flex-1" onClick={handleReport} disabled={submitting}>
            {submitting ? t('reporting') : t('report')}
          </Button>
          <Button variant="ghost" onClick={onClose}>{t('cancel')}</Button>
        </div>
      </div>
    </div>
  );
}
