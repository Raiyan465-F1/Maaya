# MAAYA  
## Smart Women's Health  
### Software Requirements Specification (SRS)

---

## Team Members

| Student ID | Name |
|------------|------|
| 23341023 | Abdullah Noor |
| 23301335 | Ateaf Akram Chowdhury |
| 23301049 | Mehruma Mahmud |
| 23301140 | Raiyan Rahman |

---

# Table of Contents

1. Introduction  
   - Purpose  
   - Scope  
   - Definitions, Acronyms, and Abbreviations  
   - References  
   - Overview  

2. Overall Description  
   - Product Perspective  
   - Product Features  
   - User Classes and Characteristics  
   - Operating Environment  
   - Constraints  
   - Assumptions and Dependencies  

3. System Requirements  
   - Functional Requirements  
   - Non-Functional Requirements  
   - External Interface Requirements  

4. Technology Stack & Architectural Overview  

5. Conclusion

---

# 1. Introduction

## 1.1 Purpose

Masuma is a young woman who has recently experienced her first menstrual cycle. Because she had little prior knowledge about this physical change, the experience caused fear and confusion. Due to social stigma surrounding reproductive health topics, she also felt uncomfortable discussing it with family members.

If accessible and supportive guidance had been available, the situation would have been far less distressing.

**MAAYA** aims to address this issue by providing a platform focused on reproductive health awareness and education. The platform targets not only women who may lack access to accurate information but also young adults transitioning into new stages of life.

The goal is to promote a more empathetic society where stigmas around reproductive health and sexual education can be addressed openly and responsibly.

---

## 1.2 Scope

The MAAYA web application supports several types of stakeholders:

### General Users
Users can:

- Register and log in with email + password
- Manage a personal profile (privacy preferences and optional demographic fields)
- Participate in community discussions (forum) with optional anonymous posting
- Submit questions to verified doctors and receive responses
- View a personalized dashboard (their questions + replies + feedback alerts)

### Community Members

Users can:

- Create, edit, and delete their own forum posts and comments
- Upvote/downvote posts and comments
- Report posts and comments (for moderation review)
- Post anonymously (identity hidden to other users; admins can resolve the real author **only for reported content** during moderation)

### Verified Doctors / Contributors

Health professionals can:

- Maintain a professional profile (specialty, bio, availability, etc.)
- Review and answer user questions
- Appear in “verified doctors” listings (directory)

### Administrators / Moderators

Admins manage:

- System operations and access control (RBAC)
- Doctor onboarding
- Moderation workflows (report review UI is present but “coming soon”)

This SRS reflects the **current codebase** (MVP) and explicitly tags each feature/requirement as one of:

- **Implemented**
- **Partially implemented (UI stub / API only / limited scope)**
- **Planned (not implemented yet)**

---

## 1.3 Definitions, Acronyms, and Abbreviations

| Term | Meaning |
|-----|------|
| STI | Sexually Transmitted Infection |
| OTP | One-Time Password used for authentication (planned) |
| JWT | JSON Web Token used for secure sessions (planned if token-based auth is added) |
| NextAuth | Authentication framework for Next.js |
| RBAC | Role-Based Access Control |
| GDPR | Data protection and privacy regulation |
| PostgreSQL | Relational database system |
| Fertile Window | Time in cycle with higher pregnancy likelihood |

---

## 1.4 References

Documentation sources include:

- Next.js
- Node.js
- PostgreSQL
- Tailwind CSS
- shadcn/ui

---

## 1.5 Overview

This document is structured as follows:

- **Section 2:** System overview and product description  
- **Section 3:** Functional and non-functional requirements  
- **Section 4:** Technology stack and architecture  
- **Section 5:** Final conclusions

---

# 2. Overall Description

## 2.1 Product Perspective

MAAYA is a **standalone web platform** focused on:

- Women's health literacy
- Reproductive health awareness
- Community support

The platform integrates:

- Health tracking
- Educational resources
- Moderated discussions
- Expert guidance

Third-party services may be used for:

- Email notifications
- Messaging services

However, the **core application logic and data management remain internal** to the platform.

---

## 2.2 Product Features

| # | Feature | Description | Status (current codebase) |
|--|--|--|--|
| 1 | User Registration & Authentication | Secure account creation and login. | **Implemented (email + password via NextAuth credentials)**; **OTP planned** |
| 2 | OTP Verification | Verify users via one-time passwords. | **Planned** |
| 3 | User Profile Management | Profile customization with privacy preferences (plus doctor profile fields). | **Implemented** |
| 4 | Personal Health Dashboard | Displays user activity and insights. | **Partially implemented** (doctor Q&A + alerts implemented; tracking/insights planned) |
| 5 | Cycle Tracking Calendar | Record and visualize menstrual cycle information. | **Planned / stub UI** |
| 6 | Cycle Pattern Analysis | Predict next cycle and identify irregularities. | **Planned** |
| 7 | Symptom Logging | Track cramps, fatigue, headaches, mood changes. | **Planned** |
| 8 | Pregnancy Likelihood Estimator | Statistical estimate based on cycle phase. | **Planned** |
| 9 | STI Awareness Guidance | Educational symptom checklists. | **Planned** |
| 10 | Educational Articles Hub | Curated reproductive health articles. | **Planned / stub UI** |
| 11 | Categorized Learning Sections | Topic-based educational organization. | **Planned** |
| 12 | Search & Recommendations | Discover relevant learning content. | **Planned** |
| 13 | Community Discussion Forum | Moderated community discussions. | **Implemented** |
| 14 | Anonymous Posting | Hide user identity in forum / doctor questions. | **Implemented** |
| 15 | Comment & Reply System | Threaded discussions. | **Implemented** |
| 16 | Voting System | Upvote helpful responses (posts + comments). | **Implemented** |
| 17 | Media Attachments (Forum) | Allow adding image/video links to posts. | **Implemented** |
| 18 | Reporting | Users can report forum posts. | **Implemented** (review workflow **planned**) |
| 19 | Content Moderation | Admin review and removal tools. | **Implemented** (reports queue + actions); advanced tooling **planned** |
| 20 | Doctor Directory | Verified medical professionals. | **Partially implemented** (static verified doctors pages + DB-backed doctor profiles) |
| 21 | Doctor Q&A | Submit medical questions and receive doctor replies. | **Implemented** |
| 22 | Notification System | Reminders and alerts. | **Partially implemented** (alerts generated + shown on dashboard; reminders center planned) |
| 23 | Educational Quiz | Knowledge check after reading content. | **Planned** |
| 24 | RBAC | Role-based permissions. | **Implemented** |
| 25 | Doctor Onboarding | Admin creates verified doctor accounts. | **Implemented** |

---

## 2.2.1 Extras (implemented beyond the original SRS baseline)

The following items are **already implemented in the current codebase** and were not clearly captured in the original high-level SRS feature list (or were underspecified). Each item is tagged with **[EXTRA]**.

- **[EXTRA] Forum media attachments**: Forum posts can include image/video links.
- **[EXTRA] Forum reporting flow (posts + comments)**: Users can report posts and comments, with a dedicated admin review queue.
- **[EXTRA] Admin moderation dashboard**: Admins can review reports, mark them reviewed/pending, and change content status (active/hidden/removed).
- **[EXTRA] Admin user management**: Admins can update user account status (ex: active/suspended/banned) from admin tooling.
- **[EXTRA] Admin-only anonymous author resolution**: Anonymous forum authors are only resolved for admins when the content is reported.
- **[EXTRA] Doctor onboarding (admin tooling)**: Admins can create verified doctor accounts from an admin page + API.
- **[EXTRA] Doctor access-code registration path**: A dedicated doctor registration page exists that validates a shared doctor access code (env-configured).
- **[EXTRA] Dashboard feedback alerts**: When a doctor replies to a user’s question, an in-app alert is created and shown on the dashboard.

---

## 2.3 User Classes and Characteristics

### General Users
Primary users seeking:

- Health tracking
- Education
- Support

The interface must be **simple, friendly, and non-judgmental**.

### Community Users
Users who actively participate in discussions and require:

- Moderation safeguards
- Anonymous posting

### Verified Doctors
Medical professionals providing expert advice.

### Administrators
Users with elevated privileges responsible for:

- moderation
- role management
- platform safety

---

## 2.4 Operating Environment

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive UI for desktop, tablet, and mobile
- Server built with **Next.js / Node.js**
- Database: **PostgreSQL**
- Deployment: local, containerized, or cloud

---

## 2.5 Constraints

- Limited project timeline
- Sensitive health data requires strict privacy handling
- Community moderation must prevent misinformation
- Predictive tools must remain **educational, not diagnostic**
- Availability of verified doctors may limit early content

---

## 2.6 Assumptions and Dependencies

- Users have stable internet access
- NextAuth session configuration is available in the deployment environment
- OTP/email providers may be integrated later (not required for the current MVP)
- Educational content can be curated appropriately
- Users provide accurate tracking data
- Doctors must be verified before participation

---

# 3. System Requirements

## 3.1 Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| FR-1 | User registration | **Implemented** (email + password); OTP-based registration **planned** |
| FR-2 | OTP verification | **Planned** |
| FR-3 | Secure login | **Implemented** (NextAuth credentials sessions); JWT token auth **planned if needed** |
| FR-4 | Profile management | **Implemented** (user + doctor profile fields) |
| FR-5 | Anonymous mode | **Implemented** (forum + doctor questions) |
| FR-6 | Health dashboard | **Partially implemented** (doctor Q&A history + alerts implemented; cycle insights planned) |
| FR-7 | Cycle log entry | **Planned** |
| FR-8 | Symptom logging | **Planned** |
| FR-9 | Cycle prediction | **Planned** |
| FR-10 | Pregnancy likelihood estimation | **Planned** |
| FR-11 | Educational content repository | **Planned / stub UI** |
| FR-12 | Content categorization | **Planned** |
| FR-13 | Search and recommendations | **Planned** |
| FR-14 | STI awareness guidance | **Planned** |
| FR-15 | Forum posting | **Implemented** |
| FR-16 | Threaded comments | **Implemented** |
| FR-17 | Voting system | **Implemented** |
| FR-18 | Reporting system (forum) | **Implemented** (posts + comments, submission + moderation queue) |
| FR-19 | Content moderation | **Implemented** (report queue + status actions); extended tooling **planned** |
| FR-20 | Doctor directory | **Partially implemented** |
| FR-21 | Doctor Q&A | **Implemented** |
| FR-22 | Notifications and reminders | **Partially implemented** (alerts implemented; reminders center planned) |
| FR-23 | Privacy and data protection | **Implemented (baseline)**; ongoing hardening **planned** |
| FR-24 | Knowledge quizzes | **Planned** |
| FR-25 | RBAC | **Implemented** |
| FR-26 | Doctor onboarding (admin creates doctor accounts) | **Implemented** |
| FR-27 | Admin user management | **Implemented** (update account status) |

---

## 3.2 Non-Functional Requirements

### Performance

- System must support concurrent users
- Average page load ≤ **2 seconds**

### Security

- HTTPS required
- Sensitive health data must be protected
- Proper privacy compliance
- Passwords must be hashed at rest (no plaintext storage)
- Role-gated actions must be enforced server-side (not only in UI)

### Reliability

- High availability for core services
- Regular backups

### Maintainability

- Modular architecture
- Consistent coding standards
- Updated documentation

### Scalability

System should support future scaling with minimal reconfiguration.

---

## 3.3 External Interface Requirements

## User Interface

- Responsive web interface
- Clear navigation
- Easy access to dashboard, forum, doctor help, and profile sections

## Software Interfaces

- Integration with NextAuth for sessions
- PostgreSQL database
- REST APIs between frontend and backend

## Communication Interfaces

- Secure HTTP client-server communication
- In-app alerts (email/SMS integrations are future work)

---

## 4. Technology Stack & Architecture

### Frontend
- Next.js
- React
- Tailwind CSS
- shadcn/ui

### Backend
- Next.js server routes
- Node.js

### Database
- PostgreSQL

### Development Environment
- Node.js
- pnpm
- Git
- Local or hosted PostgreSQL

### Architecture Layers

**Presentation Layer**
- Next.js UI for dashboards, tracking, and forum

**Application Layer**
- Server logic for authentication, moderation, predictions

**Data Layer**
- PostgreSQL storing users, logs, forum content, and reminders

---

## 5. Conclusion

MAAYA addresses a significant gap in reproductive health awareness and education. The current MVP integrates community discussions, verified doctor Q&A, and role-based access in a privacy-focused environment, with health tracking and educational modules planned for future iterations.

While the project has a broad scope and certain challenges, it remains a feasible and valuable initiative aimed at improving access to reliable reproductive health information.

---