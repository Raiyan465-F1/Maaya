'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

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

  useEffect(() => {
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

    if (params.id) {
      fetchDoctor();
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
        <Link href="/doctors-help/verified">
          <Button variant="outline" size="sm">
            Back to Verified Doctors
          </Button>
        </Link>
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
    </div>
  );
}
