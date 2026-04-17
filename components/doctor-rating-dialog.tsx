'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export interface RateableDoctor {
  userId: string;
  displayName: string;
  specialty?: string | null;
}

interface DoctorRatingDialogProps {
  open: boolean;
  doctors: RateableDoctor[];
  title?: string;
  description?: string;
  submitLabel?: string;
  skipLabel?: string;
  onSubmitted?: () => void;
  onClose: () => void;
}

interface DoctorRatingDraft {
  rating: number;
  comment: string;
}

const EMPTY_DRAFT: DoctorRatingDraft = { rating: 0, comment: '' };

export function DoctorRatingDialog({
  open,
  doctors,
  title = 'Rate your doctors',
  description = 'Share your experience. Your feedback helps others find the right help.',
  submitLabel = 'Submit ratings',
  skipLabel = 'Skip for now',
  onSubmitted,
  onClose,
}: DoctorRatingDialogProps) {
  const [drafts, setDrafts] = useState<Record<string, DoctorRatingDraft>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const next: Record<string, DoctorRatingDraft> = {};
    doctors.forEach((doctor) => {
      next[doctor.userId] = { ...EMPTY_DRAFT };
    });
    setDrafts(next);
    setError(null);

    const fetchExisting = async () => {
      try {
        const results = await Promise.all(
          doctors.map(async (doctor) => {
            const res = await fetch(`/api/doctors/${doctor.userId}/rate`);
            if (!res.ok) return { userId: doctor.userId, draft: EMPTY_DRAFT };
            const data = await res.json().catch(() => null);
            const existing = data?.rating;
            return {
              userId: doctor.userId,
              draft: existing
                ? {
                    rating: Number(existing.rating) || 0,
                    comment: typeof existing.comment === 'string' ? existing.comment : '',
                  }
                : EMPTY_DRAFT,
            };
          })
        );

        setDrafts((prev) => {
          const merged = { ...prev };
          results.forEach(({ userId, draft }) => {
            merged[userId] = { ...draft };
          });
          return merged;
        });
      } catch (err) {
        console.error('Error loading existing ratings:', err);
      }
    };

    fetchExisting();
  }, [open, doctors]);

  const updateDraft = (userId: string, patch: Partial<DoctorRatingDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [userId]: { ...(prev[userId] ?? EMPTY_DRAFT), ...patch },
    }));
  };

  const handleSubmit = async () => {
    setError(null);

    const entries = doctors
      .map((doctor) => ({ doctor, draft: drafts[doctor.userId] ?? EMPTY_DRAFT }))
      .filter(({ draft }) => draft.rating > 0);

    if (entries.length === 0) {
      setError('Select at least one star for a doctor, or skip for now.');
      return;
    }

    setSubmitting(true);
    try {
      const responses = await Promise.all(
        entries.map(({ doctor, draft }) =>
          fetch(`/api/doctors/${doctor.userId}/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rating: draft.rating,
              comment: draft.comment.trim(),
            }),
          })
        )
      );

      const failed = responses.find((res) => !res.ok);
      if (failed) {
        const data = await failed.json().catch(() => null);
        setError(data?.error ?? 'Failed to save one or more ratings.');
        return;
      }

      onSubmitted?.();
      onClose();
    } catch (err) {
      console.error('Error submitting ratings:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="text-left">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="overflow-y-auto px-4 pb-6 pt-4 space-y-4">
          {doctors.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
              No doctors available to rate.
            </div>
          ) : (
            doctors.map((doctor) => {
              const draft = drafts[doctor.userId] ?? EMPTY_DRAFT;
              return (
                <div
                  key={doctor.userId}
                  className="rounded-2xl border border-border bg-card p-5 space-y-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {doctor.displayName}
                    </p>
                    {doctor.specialty && (
                      <p className="text-xs text-muted-foreground">
                        {doctor.specialty}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const active = value <= draft.rating;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateDraft(doctor.userId, { rating: value })}
                          className="rounded-md p-1 transition-colors hover:bg-muted"
                          aria-label={`${value} star${value === 1 ? '' : 's'}`}
                        >
                          <Star
                            className={`h-6 w-6 ${
                              active
                                ? 'fill-yellow-400 text-yellow-500'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      );
                    })}
                    {draft.rating > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {draft.rating}/5
                      </span>
                    )}
                  </div>

                  <textarea
                    value={draft.comment}
                    onChange={(e) =>
                      updateDraft(doctor.userId, { comment: e.target.value.slice(0, 1000) })
                    }
                    placeholder="Share a quick comment (optional)"
                    className="w-full min-h-[70px] rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              );
            })
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || doctors.length === 0}
            >
              {submitting ? 'Saving...' : submitLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              {skipLabel}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
