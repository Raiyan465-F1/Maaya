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

- Register (optionally anonymously)
- Track menstrual cycles and symptoms
- Access a personalized health dashboard
- Receive predictive cycle insights
- Read educational content

### Community Members

Users can:

- Participate in moderated forums
- Post questions anonymously
- Upvote helpful responses
- Engage in peer-to-peer discussions

### Verified Doctors / Contributors

Health professionals can:

- Maintain a professional profile
- Answer user questions
- Provide expert guidance

### Administrators / Moderators

Admins manage:

- System operations
- User roles
- Content moderation
- Educational resources

This SRS defines the **system structure, features, requirements, interfaces, and technology stack** up to **Sprint 2 development goals**.

---

## 1.3 Definitions, Acronyms, and Abbreviations

| Term | Meaning |
|-----|------|
| STI | Sexually Transmitted Infection |
| OTP | One-Time Password used for authentication |
| JWT | JSON Web Token used for secure sessions |
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
- OTP verification
- Messaging services

However, the **core application logic and data management remain internal** to the platform.

---

## 2.2 Product Features

| # | Feature | Description |
|--|--|--|
| 1 | User Registration & Authentication | Secure account creation using OTP or NextAuth |
| 2 | User Profile Management | Profile customization with privacy preferences |
| 3 | Personal Health Dashboard | Displays reminders, saved content, and cycle insights |
| 4 | Cycle Tracking Calendar | Record and visualize menstrual cycle information |
| 5 | Cycle Pattern Analysis | Predict next cycle and identify irregularities |
| 6 | Symptom Logging | Track cramps, fatigue, headaches, mood changes |
| 7 | Pregnancy Likelihood Estimator | Statistical estimate based on cycle phase |
| 8 | STI Awareness Guidance | Educational symptom checklists |
| 9 | Educational Articles Hub | Curated reproductive health articles |
| 10 | Categorized Learning Sections | Topic-based educational organization |
| 11 | Search & Recommendations | Discover relevant learning content |
| 12 | Community Discussion Forum | Moderated community discussions |
| 13 | Anonymous Posting | Hide user identity in forum |
| 14 | Comment & Reply System | Threaded discussions |
| 15 | Voting System | Upvote helpful responses |
| 16 | Content Moderation | Admin review and removal tools |
| 17 | Doctor Directory | Verified medical professionals |
| 18 | Doctor Q&A | Submit medical questions |
| 19 | Notification System | Reminders and alerts |
| 20 | Privacy Controls | Secure storage and privacy options |
| 21 | Educational Quiz | Knowledge check after reading content |
| 22 | RBAC | Role-based permissions |

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
- Third-party email/OTP services are available
- Educational content can be curated appropriately
- Users provide accurate tracking data
- Doctors must be verified before participation

---

# 3. System Requirements

## 3.1 Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-1 | User registration |
| FR-2 | OTP verification |
| FR-3 | Secure login |
| FR-4 | Profile management |
| FR-5 | Anonymous mode |
| FR-6 | Health dashboard |
| FR-7 | Cycle log entry |
| FR-8 | Symptom logging |
| FR-9 | Cycle prediction |
| FR-10 | Pregnancy likelihood estimation |
| FR-11 | Educational content repository |
| FR-12 | Content categorization |
| FR-13 | Search and recommendations |
| FR-14 | STI awareness guidance |
| FR-15 | Forum posting |
| FR-16 | Threaded comments |
| FR-17 | Voting system |
| FR-18 | Content moderation |
| FR-19 | Doctor directory |
| FR-20 | Doctor Q&A |
| FR-21 | Notifications and reminders |
| FR-22 | Privacy and data protection |
| FR-23 | Knowledge quizzes |

---

## 3.2 Non-Functional Requirements

### Performance

- System must support concurrent users
- Average page load ≤ **2 seconds**

### Security

- HTTPS required
- Sensitive health data must be protected
- Proper privacy compliance

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

# 3.3 External Interface Requirements

## User Interface

- Responsive web interface
- Clear navigation
- Easy access to learning, tracking, and community sections

## Software Interfaces

- Integration with email / OTP services
- PostgreSQL database
- REST APIs between frontend and backend

## Communication Interfaces

- Secure HTTP client-server communication
- Notifications via email or other channels

---

# 4. Technology Stack & Architecture

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

# 5. Conclusion

MAAYA addresses a significant gap in reproductive health awareness and education. The platform integrates health tracking, educational content, community discussions, and expert guidance within a privacy-focused environment.

While the project has a broad scope and certain challenges, it remains a feasible and valuable initiative aimed at improving access to reliable reproductive health information.

---