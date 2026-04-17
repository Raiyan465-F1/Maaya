import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getVerifiedDoctorById, verifiedDoctors } from "@/lib/verified-doctors";

type DoctorProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return verifiedDoctors.map((doctor) => ({ id: doctor.id }));
}

export default async function DoctorProfilePage({ params }: DoctorProfilePageProps) {
  const { id } = await params;
  const doctor = getVerifiedDoctorById(id);

  if (!doctor) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background py-20">
      <section className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <Link
            href="/verified-doctors"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary border border-primary/25 hover:bg-primary/5 transition-colors"
          >
            Back to all verified doctors
          </Link>
        </div>

        <article className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="grid md:grid-cols-[16rem_1fr] gap-8 items-start">
            <div className="relative overflow-hidden rounded-2xl border border-primary/15">
              <Image
                src={doctor.image}
                alt={`${doctor.name} profile image`}
                width={480}
                height={480}
                className="w-full h-auto"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  {doctor.name}
                </h1>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                  Verified
                </span>
              </div>

              <p className="text-primary font-semibold text-base mb-5">{doctor.specialty}</p>

              <p className="text-muted-foreground text-base leading-relaxed">{doctor.bio}</p>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
