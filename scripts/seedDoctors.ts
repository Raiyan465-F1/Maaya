import { randomUUID } from "crypto";
import { inArray } from "drizzle-orm";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/schema";

config({ path: ".env" });

async function seed() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error("Missing DATABASE_URL in .env");
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);
  const db = drizzle({ client: sql, schema });

  console.log("Seeding dummy doctor data...");

  // Create doctors (insert if missing, otherwise reuse existing IDs)
  const doctorEmails = [
    "dr.alexa@example.com",
    "dr.omar@example.com",
    "dr.sana@example.com",
  ];

  const existingDoctors = await db
    .select({ id: schema.users.id, email: schema.users.email })
    .from(schema.users)
    .where(inArray(schema.users.email, doctorEmails));

  const doctorIdMap = new Map<string, string>();
  existingDoctors.forEach((row) => doctorIdMap.set(row.email, row.id));

  const doctorIds = doctorEmails.map((email, idx) => {
    if (!doctorIdMap.has(email)) {
      const newId = randomUUID();
      doctorIdMap.set(email, newId);
      return newId;
    }
    return doctorIdMap.get(email)!;
  });

  const newDoctors = doctorEmails
    .map((email, idx) => ({
      userId: doctorIds[idx],
      email,
      passwordHash: "$2b$10$EXAMPLEHASH0000000000000000000000000000",
      role: "doctor",
      accountStatus: "active",
      ageGroup: idx === 0 ? "30-35" : idx === 1 ? "40-45" : "35-40",
      gender: idx === 0 ? "female" : idx === 1 ? "male" : "female",
      location: idx === 0 ? "Dhaka" : idx === 1 ? "Chattogram" : "Sylhet",
    }))
    .filter((d) => !existingDoctors.find((e) => e.email === d.email));

  if (newDoctors.length > 0) {
    await db.insert(schema.users).values(newDoctors as any);
  }

  // Profiles
  // Ensure profiles exist for each doctor (skip if already exists)
  const existingProfiles = await db
    .select({ userId: schema.doctorProfiles.userId })
    .from(schema.doctorProfiles)
    .where(inArray(schema.doctorProfiles.userId, doctorIds));

  const existingProfileIds = new Set(existingProfiles.map((p) => p.userId));

  const profilesToInsert = doctorIds
    .filter((id) => !existingProfileIds.has(id))
    .map((id) => {
      const idx = doctorIds.indexOf(id);
      return {
        userId: id,
        specialty: idx === 0 ? "Gynecology" : idx === 1 ? "Endocrinology" : "Nutrition",
        availabilityInfo:
          idx === 0
            ? "Mon–Fri 9am–2pm"
            : idx === 1
            ? "Tue/Thu 2pm–6pm"
            : "Mon/Wed/Fri 11am–4pm",
      };
    });

  if (profilesToInsert.length > 0) {
    await db.insert(schema.doctorProfiles).values(profilesToInsert);
  }


  // Create question posts
  // Ensure there are at least two questions (avoid duplicates)
  const existingQuestions = await db
    .select({ questionText: schema.doctorQuestions.questionText })
    .from(schema.doctorQuestions)
    .where(inArray(schema.doctorQuestions.questionText, [
      "What is the best way to ease cramps during periods?",
      "How often should I check my thyroid levels?",
    ]));

  const existingTexts = new Set(existingQuestions.map((q) => q.questionText));

  const questionsToInsert = [];
  if (!existingTexts.has("What is the best way to ease cramps during periods?")) {
    questionsToInsert.push({
      userId: doctorIds[0],
      questionText: "What is the best way to ease cramps during periods?",
      isAnonymous: false,
    });
  }
  if (!existingTexts.has("How often should I check my thyroid levels?")) {
    questionsToInsert.push({
      userId: doctorIds[1],
      questionText: "How often should I check my thyroid levels?",
      isAnonymous: false,
    });
  }

  if (questionsToInsert.length > 0) {
    await db.insert(schema.doctorQuestions).values(questionsToInsert);
  }

  // Create activity (answers)
  // Map existing questions to their IDs so we can reference them.
  const questionRows = await db
    .select({ id: schema.doctorQuestions.id, text: schema.doctorQuestions.questionText })
    .from(schema.doctorQuestions)
    .where(
      inArray(schema.doctorQuestions.questionText, [
        "What is the best way to ease cramps during periods?",
        "How often should I check my thyroid levels?",
      ])
    );

  const questionIdByText = new Map(questionRows.map((q) => [q.text, q.id]));

  const answersToInsert = [
    {
      questionText: "What is the best way to ease cramps during periods?",
      doctorUserId: doctorIds[2],
      answerText: "Warm compresses and hydration help a lot. If pain is severe, see a doctor.",
    },
    {
      questionText: "What is the best way to ease cramps during periods?",
      doctorUserId: doctorIds[0],
      answerText: "Tracking your cycle and consulting a doctor if pain persists is a good step.",
    },
    {
      questionText: "How often should I check my thyroid levels?",
      doctorUserId: doctorIds[1],
      answerText: "Checking thyroid levels annually is common; more often if symptoms appear.",
    },
  ]
    .map((entry) => ({
      questionId: questionIdByText.get(entry.questionText)!,
      doctorUserId: entry.doctorUserId,
      answerText: entry.answerText,
    }))
    .filter((entry) => entry.questionId);

  if (answersToInsert.length > 0) {
    await db.insert(schema.doctorAnswers).values(answersToInsert);
  }

  // Add ratings
  await db.insert(schema.doctorRatings).values([
    {
      doctorUserId: doctorIds[0],
      userId: doctorIds[1],
      rating: 5,
      comment: "Very helpful!",
    },
    {
      doctorUserId: doctorIds[0],
      userId: doctorIds[2],
      rating: 4,
      comment: "Clear and friendly response.",
    },
    {
      doctorUserId: doctorIds[1],
      userId: doctorIds[0],
      rating: 5,
      comment: "Great guidance.",
    },
    {
      doctorUserId: doctorIds[2],
      userId: doctorIds[0],
      rating: 4,
      comment: "Very helpful advice.",
    },
  ]);

  console.log("Seeding complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
