'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Doctor {
  userId: string;
  email: string;
  specialty: string;
  availabilityInfo: string;
}

export default function VerifiedDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('/api/doctors');
        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
        }
      } catch (error) {
        console.error('Failed to load doctors', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      doc.email.toLowerCase().includes(term) ||
      doc.specialty.toLowerCase().includes(term) ||
      doc.availabilityInfo.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-widest text-secondary uppercase mb-3">
            Verified Doctors
          </p>
          <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight">
            Meet our medical professionals
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mt-2">
            Browse the list of verified doctors available in the app.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/doctors-help" className="w-full sm:w-auto">
            <Button variant="outline" size="sm">
              Back to Q&A
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            className="w-full pl-10 pr-10 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Search doctors by name, specialty, or availability..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading doctors…</div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-sm text-muted-foreground">No doctors found. Try adjusting your search.</div>
        ) : (
          <div className="grid gap-4">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.userId} className="rounded-2xl border border-border p-5 bg-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{doctor.email}</p>
                    <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                    <p className="text-xs text-muted-foreground">{doctor.availabilityInfo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
