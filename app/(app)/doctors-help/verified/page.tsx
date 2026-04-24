'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DoctorRatingDialog, type RateableDoctor } from '@/components/doctor-rating-dialog';
import { isSuspendedAndActive } from '@/lib/account-restriction-helpers';

interface Doctor {
  userId: string;
  displayName: string;
  email: string;
  specialty: string | null;
  location: string | null;
  replyCount: number;
  avgRating: number;
}

interface DoctorApiResponse {
  userId?: string;
  displayName?: string | null;
  email?: string | null;
  specialty?: string | null;
  location?: string | null;
  replyCount?: number | null;
  avgRating?: number | null;
}

type DoctorFilterType = 'all' | 'top-rated' | 'most-replies' | 'with-location';

const buildDisplayName = (email?: string | null) => {
  const emailPrefix = email?.split('@')[0] ?? 'Doctor';
  const formatted = emailPrefix
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return formatted || 'Doctor';
};

export default function VerifiedDoctorsPage() {
  const { data: session } = useSession();
  const ratingLocked = isSuspendedAndActive(
    session?.user?.accountStatus,
    session?.user?.restrictionEndsAt
  );
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorFilter, setDoctorFilter] = useState<DoctorFilterType>('all');
  const [showDoctorFilters, setShowDoctorFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ratingDoctor, setRatingDoctor] = useState<RateableDoctor | null>(null);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors');
      if (res.ok) {
        const data: DoctorApiResponse[] = await res.json();
        const normalizedDoctors = data.map((doctor, index) => {
          const email = doctor.email ?? 'doctor@example.com';
          return {
            userId: doctor.userId ?? `doctor-${index}`,
            displayName: doctor.displayName ?? buildDisplayName(email),
            email,
            specialty: doctor.specialty ?? null,
            location: doctor.location ?? null,
            replyCount: doctor.replyCount ?? 0,
            avgRating: doctor.avgRating ?? 0,
          };
        });
        setDoctors(normalizedDoctors);
      }
    } catch (error) {
      console.error('Failed to load doctors', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchingDoctors = doctors.filter((doc) => {
      if (!normalizedSearch) return true;

      return (
        doc.displayName.toLowerCase().includes(normalizedSearch) ||
        doc.email.toLowerCase().includes(normalizedSearch) ||
        (doc.specialty ?? '').toLowerCase().includes(normalizedSearch) ||
        (doc.location ?? '').toLowerCase().includes(normalizedSearch)
      );
    });

    const scopedDoctors =
      doctorFilter === 'with-location'
        ? matchingDoctors.filter((doc) => Boolean(doc.location?.trim()))
        : matchingDoctors;

    const sortedDoctors = [...scopedDoctors];

    if (doctorFilter === 'top-rated') {
      sortedDoctors.sort((left, right) => {
        if (right.avgRating !== left.avgRating) {
          return right.avgRating - left.avgRating;
        }

        if (right.replyCount !== left.replyCount) {
          return right.replyCount - left.replyCount;
        }

        return left.displayName.localeCompare(right.displayName);
      });
      return sortedDoctors;
    }

    if (doctorFilter === 'most-replies') {
      sortedDoctors.sort((left, right) => {
        if (right.replyCount !== left.replyCount) {
          return right.replyCount - left.replyCount;
        }

        if (right.avgRating !== left.avgRating) {
          return right.avgRating - left.avgRating;
        }

        return left.displayName.localeCompare(right.displayName);
      });
      return sortedDoctors;
    }

    return sortedDoctors.sort((left, right) => left.displayName.localeCompare(right.displayName));
  }, [doctorFilter, doctors, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-secondary">
            Verified Doctors
          </p>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Meet our medical professionals
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Browse the list of verified doctors available in the app.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/doctors-help" className="w-full sm:w-auto">
            <Button variant="outline" size="sm">
              Back to Q&amp;A
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <input
              className="w-full rounded-lg border border-border bg-background py-2 pr-10 pl-10 text-sm focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Search doctors by name, specialty, email, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDoctorFilters(!showDoctorFilters)}
              className="w-full sm:w-auto"
            >
              Filter: {doctorFilter === 'all' ? 'All Doctors' : doctorFilter === 'top-rated' ? 'Top Rated' : doctorFilter === 'most-replies' ? 'Most Replies' : 'With Location'}
            </Button>
            {showDoctorFilters && (
              <div className="absolute right-0 top-full z-10 mt-2 w-44 rounded-lg border border-border bg-card shadow-lg">
                <div className="p-2">
                  {(['all', 'top-rated', 'most-replies', 'with-location'] as DoctorFilterType[]).map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => {
                        setDoctorFilter(filterType);
                        setShowDoctorFilters(false);
                      }}
                      className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                    >
                      {filterType === 'all' ? 'All Doctors' : filterType === 'top-rated' ? 'Top Rated' : filterType === 'most-replies' ? 'Most Replies' : 'With Location'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading doctors...</div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-sm text-muted-foreground">No doctors found. Try adjusting your search.</div>
        ) : (
          <div className="grid gap-4">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.userId}
                className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <Link
                    href={`/doctors-help/verified/${doctor.userId}`}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-semibold text-foreground">{doctor.displayName}</p>
                    <p className="text-xs text-muted-foreground">{doctor.email}</p>
                    <p className="text-xs text-muted-foreground">{doctor.specialty ?? 'Specialty not added yet'}</p>
                    <p className="text-xs text-muted-foreground">{doctor.location ?? 'Location not added yet'}</p>
                  </Link>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                        {doctor.avgRating.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">{doctor.replyCount} replies</p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={ratingLocked}
                      onClick={() => {
                        if (ratingLocked) {
                          toast.error('Suspended accounts cannot rate doctors.');
                          return;
                        }
                        setRatingDoctor({
                          userId: doctor.userId,
                          displayName: doctor.displayName,
                          specialty: doctor.specialty,
                        });
                      }}
                    >
                      Rate
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DoctorRatingDialog
        open={!!ratingDoctor}
        doctors={ratingDoctor ? [ratingDoctor] : []}
        title="Rate this doctor"
        description="Share your experience with other patients."
        submitLabel="Submit rating"
        skipLabel="Cancel"
        onSubmitted={fetchDoctors}
        onClose={() => setRatingDoctor(null)}
      />
    </div>
  );
}
