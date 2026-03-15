# MAAYA

**MAAYA** is a platform built to make reproductive health information more accessible, supportive, and stigma-free.

Many people struggle to find reliable information about reproductive health, or feel uncomfortable asking questions openly. MAAYA aims to change that by creating a space where people can **learn, track their health, and connect with others in a safe environment**.

Our goal is to combine **education, personal health tools, and community support** into a single platform that encourages awareness and informed decision-making when it comes to adulthood.

---

## What You Can Do With MAAYA

MAAYA provides a space where users can:

- Track aspects of their reproductive health and personal symptoms
- Access educational resources related to reproductive wellness
- Participate in discussions with a supportive community
- Ask questions and receive guidance from medical professionals
- Stay informed through reminders and alerts related to their health

Rather than focusing on just one aspect of health, MAAYA brings together **knowledge, personal tracking, and community interaction** so users can better understand and manage their wellbeing.

---

## Current Account Views

MAAYA now includes different dashboard experiences for different account types.

- `user` accounts can submit posts/questions for doctors, see their own history, and track whether each post is still marked **Reply pending** or already answered.
- `doctor` accounts can read individual user posts, reply to pending ones, and move answered posts out of the pending queue automatically.
- `admin` accounts currently share the doctor-facing review and reply view.

The login flow routes signed-in users to `/dashboard`, where the interface adjusts automatically based on the account role stored in the user record.

---

## Doctor Account Setup

Doctor accounts can now be created from the website at `/register/doctor`.

To enable that flow in practice, add this environment variable to `.env`:

```env
DOCTOR_REGISTRATION_CODE=choose-a-shared-secret-code
```

Anyone who knows that code can register a doctor account and immediately use the doctor dashboard after logging in.

---

## Our Mission

Reproductive health is often surrounded by stigma, misinformation, and limited access to trusted resources.

MAAYA aims to help address these challenges by:

- Encouraging **open and respectful conversations**
- Providing **reliable educational content**
- Supporting **privacy and anonymous participation**
- Connecting users with **medical insight when needed**

By creating a platform that blends **technology, education, and community**, MAAYA hopes to make reproductive health knowledge easier to access for everyone.

---

## Tech Stack

MAAYA is being developed using a modern web technology stack.

**Frontend**
- React / Next.js
- Tailwind CSS

**Backend**
- Node.js

**Database**
- PostgreSQL
- Drizzle ORM

Additional tools and infrastructure will evolve as the project grows.

---

## Project Status

MAAYA is currently in active development.

The current focus is on building the core platform infrastructure, including user systems, health tracking, educational resources, community features, and role-based doctor support workflows.

Future development will continue to expand the platform's capabilities and accessibility.

---

## Contributing

MAAYA is an evolving project, and contributions are welcome.
Developers, designers, and contributors interested in improving reproductive health accessibility are encouraged to participate.

More contribution guidelines will be added as the project develops.

---

Creating a supportive space where people can **learn, share, and take control of their reproductive health.**
