'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CalendarDays,
  MessageSquare,
  MessagesSquare,
  Star,
  Quote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DoctorRatingDialog } from '@/components/doctor-rating-dialog';

type QuestionStatus = 'pending' | 'answered' | 'closed';

interface AnsweredQuestion {
  questionId: number;
  title: string;
  status: QuestionStatus;
  isAnonymous: boolean;
  answeredAt: string;
}

interface DoctorReview {
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface DoctorDetails {
  userId: string;
  displayName: string;
  email: string;
  specialty: string | null;
  location: string | null;
  availabilityInfo: string | null;
  bio: string | null;
  qualifications: string | null;
  institution: string | null;
  memberSince: string | null;
  replyCount: number;
  questionsAnsweredCount: number;
  avgRating: number;
  ratingCount: number;
  ratingBreakdown: Record<'1' | '2' | '3' | '4' | '5', number>;
  answeredQuestions: AnsweredQuestion[];
  reviews: DoctorReview[];
}

const STATUS_LABEL: Record<QuestionStatus, string> = {
  pending: 'Pending',
  answered: 'Answered',
  closed: 'Closed',
};

const STATUS_BADGE_CLASSES: Record<QuestionStatus, string> = {
  pending:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  answered:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  closed: 'bg-muted text-muted-foreground',
};

const DetailRow = ({ label, value }: { label: string; value: string | null }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground/90">
      {value || 'Not added yet'}
    </p>
  </div>
);

const StatCard = ({
  label,
  value,
  sublabel,
  icon: Icon,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4" />
      <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
    </div>
    <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
  </div>
);

const formatDate = (value: string | null | undefined) => {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return null;
  }
};

export default function VerifiedDoctorDetailsPage() {
  const params = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [myRating, setMyRating] = useState<number | null>(null);

  const fetchDoctor = async () => {
    try {
      const response = await fetch(`/api/doctors/${params.id}`);

      if (!response.ok) {
        setError(response.status === 404 ? 'Doctor not found.' : 'Failed to load doctor details.');
        return;
      }

      const data = await response.json();
      setDoctor(data);
    } catch (fetchError) {
      console.error('Error loading doctor details:', fetchError);
      setError('Failed to load doctor details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRating = async () => {
    try {
      const response = await fetch(`/api/doctors/${params.id}/rate`);
      if (response.ok) {
        const data = await response.json();
        setMyRating(data?.rating?.rating ?? null);
      }
    } catch (fetchError) {
      console.error('Error loading my rating:', fetchError);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchDoctor();
      fetchMyRating();
    }
  }, [params.id]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading doctor details...</div>;
  }

  if (error || !doctor) {
    return (
      <div className="space-y-4">
        <Link href="/doctors-help/verified">
          <Button variant="outline" size="sm">
            Back to Verified Doctors
          </Button>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          {error ?? 'Doctor not found.'}
        </div>
      </div>
    );
  }

  const memberSinceFormatted = formatDate(doctor.memberSince);
  const maxBreakdown = Math.max(
    doctor.ratingBreakdown[5] ?? 0,
    doctor.ratingBreakdown[4] ?? 0,
    doctor.ratingBreakdown[3] ?? 0,
    doctor.ratingBreakdown[2] ?? 0,
    doctor.ratingBreakdown[1] ?? 0,
    1,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-secondary">
            Verified Doctor
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">
            {doctor.displayName}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{doctor.specialty ?? 'Specialty not added yet'}</span>
            <span>{doctor.location ?? 'Location not added yet'}</span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" />
              {doctor.avgRating.toFixed(1)} ({doctor.ratingCount} rating{doctor.ratingCount === 1 ? '' : 's'})
            </span>
            <span>{doctor.replyCount} answers</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setRatingOpen(true)}
          >
            <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-500" />
            {myRating ? `Update rating (${myRating}/5)` : 'Rate this doctor'}
          </Button>
          <Link href="/doctors-help/verified">
            <Button variant="outline" size="sm">
              Back to Verified Doctors
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Questions helped"
          value={doctor.questionsAnsweredCount.toString()}
          sublabel="Distinct patient questions answered"
          icon={MessagesSquare}
        />
        <StatCard
          label="Total answers"
          value={doctor.replyCount.toString()}
          sublabel="Across all questions"
          icon={MessageSquare}
        />
        <StatCard
          label="Average rating"
          value={`${doctor.avgRating.toFixed(1)} / 5`}
          sublabel={`${doctor.ratingCount} rating${doctor.ratingCount === 1 ? '' : 's'}`}
          icon={Star}
        />
        <StatCard
          label="Member since"
          value={memberSinceFormatted ?? '—'}
          sublabel="Joined the platform"
          icon={CalendarDays}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Email</p>
        <p className="mt-1 text-base font-medium text-foreground">{doctor.email}</p>
      </div>

      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Qualifications
        </p>
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-foreground/90">
          {doctor.qualifications || 'Not added yet'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DetailRow label="Availability" value={doctor.availabilityInfo} />
        <DetailRow label="Institution" value={doctor.institution} />
        <DetailRow label="Bio" value={doctor.bio} />
        <DetailRow label="Location" value={doctor.location} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Patient ratings
          </h2>
          <p className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
            {doctor.avgRating.toFixed(1)} / 5
          </p>
        </div>
        {doctor.ratingCount === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No ratings yet. Be the first to rate this doctor after your question is answered.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {([5, 4, 3, 2, 1] as const).map((stars) => {
              const count = doctor.ratingBreakdown[stars.toString() as '1' | '2' | '3' | '4' | '5'] ?? 0;
              const widthPct = Math.round((count / maxBreakdown) * 100);
              return (
                <div key={stars} className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex w-10 items-center gap-1 font-medium text-foreground">
                    {stars}
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-500" />
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Questions answered
          </h2>
          <span className="text-xs text-muted-foreground">
            {doctor.questionsAnsweredCount} total
          </span>
        </div>
        {doctor.answeredQuestions.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            This doctor has not answered any questions yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {doctor.answeredQuestions.slice(0, 10).map((question) => {
              const answeredFormatted = formatDate(question.answeredAt);
              return (
                <li
                  key={question.questionId}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      {question.title || 'Untitled question'}
                    </p>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[question.status]}`}
                    >
                      {STATUS_LABEL[question.status]}
                    </span>
                  </div>
                  {answeredFormatted && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Answered {answeredFormatted}
                    </p>
                  )}
                </li>
              );
            })}
            {doctor.answeredQuestions.length > 10 && (
              <li className="text-xs text-muted-foreground">
                + {doctor.answeredQuestions.length - 10} more
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Patient reviews
        </h2>
        {doctor.reviews.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No written reviews yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {doctor.reviews.slice(0, 10).map((review, idx) => {
              const reviewDate = formatDate(review.createdAt);
              return (
                <li
                  key={`${review.createdAt}-${idx}`}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className={`h-3.5 w-3.5 ${
                            starIndex < review.rating
                              ? 'fill-yellow-400 text-yellow-500'
                              : 'text-muted-foreground/40'
                          }`}
                        />
                      ))}
                    </div>
                    {reviewDate && (
                      <span className="text-xs text-muted-foreground">{reviewDate}</span>
                    )}
                  </div>
                  {review.comment && (
                    <p className="mt-2 flex gap-2 text-sm leading-6 text-foreground/90">
                      <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="whitespace-pre-line">{review.comment}</span>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <DoctorRatingDialog
        open={ratingOpen}
        doctors={[
          {
            userId: doctor.userId,
            displayName: doctor.displayName,
            specialty: doctor.specialty,
          },
        ]}
        title="Rate this doctor"
        description="Share your experience to help others find the right care."
        submitLabel="Submit rating"
        skipLabel="Cancel"
        onSubmitted={() => {
          fetchDoctor();
          fetchMyRating();
        }}
        onClose={() => setRatingOpen(false)}
      />
    </div>
  );
}
