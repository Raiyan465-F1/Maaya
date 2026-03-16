import Image from "next/image";
import Link from "next/link";

import { verifiedDoctors } from "@/lib/verified-doctors";

export default function VerifiedDoctorsPage() {
  return (
    <main className="min-h-screen bg-background py-20">
      <section className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <p className="font-mono text-xs tracking-widest text-primary uppercase mb-3">
            MAAYA Team
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground leading-[1.1] tracking-tight">
            Verified Doctors
          </h1>
          <p className="text-muted-foreground text-base mt-4 max-w-2xl">
            Meet qualified doctors who support the MAAYA community with trusted guidance and
            evidence-based reproductive health education.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {verifiedDoctors.map((doctor) => (
            <article
              key={doctor.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm"
            >
              <div className="relative mb-5 overflow-hidden rounded-xl border border-primary/15">
                <Image
                  src={doctor.image}
                  alt={`${doctor.name} profile image`}
                  width={480}
                  height={480}
                  className="w-full h-auto"
                />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-foreground">{doctor.name}</h2>
                  <p className="text-sm text-primary font-medium mt-1">{doctor.specialty}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                  Verified
                </span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mt-4">{doctor.bio}</p>
            </article>
          ))}
        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-primary border border-primary/30 hover:bg-primary/5 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
