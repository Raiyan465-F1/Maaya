'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DoctorRatingDialog } from '@/components/doctor-rating-dialog';

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
  replyCount: number;
  avgRating: number;
}

const DetailRow = ({ label, value }: { label: string; value: string | null }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-2 text-sm leading-6 text-foreground/90">{value || 'Not added yet'}</p>
  </div>
);

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
            <span>{doctor.avgRating.toFixed(1)} star</span>
            <span>{doctor.replyCount} replies</span>
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
