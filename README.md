# The Ink Sprint: A Competitive Writing Tournament Platform

## Project Overview

The Ink Sprint is a web application designed for hosting creative writing competitions where participants submit entries within a defined time window (ranging from hours to days), after which submissions are reviewed and winners are selected. The platform will manage contests, user participation, secure submissions, and judging workflows while providing downloadable results for participants.

The system aims to create an organized and accessible environment for running writing competitions without requiring manual coordination. Administrators will be able to create contests with prompts and deadlines, participants will submit their work through a guided interface, and judges or administrators will evaluate entries and assign placements.

---

## Running the project

Install dependencies:

`npm install`

Start the app:

`npm run dev`

Frontend: http://localhost:5173  
GraphQL: http://localhost:4000

## Core Technical Requirements

This project satisfies all course objectives and utilizes the following mandated technologies:

### 1. Primary Backend

- **Node.js:** The core runtime for our API and application logic.

### 2. Course Technologies

- **React:** Used to build the frontend interface, including authentication pages, contest listings, submission forms, and judging dashboards, enabling a dynamic and responsive user experience.

- **GraphQL:** Serves as the API layer between the frontend and backend, managing queries and mutations for contests, submissions, user data, and judging results while allowing flexible data retrieval for different user roles.

- **Firebase Authentication:** Handles user registration and login, providing secure identity management without requiring custom authentication logic. Verified user identity will be used to control permissions for submissions and judging actions.

### 3. Independent Technologies (External Services)

- **Docker:** A containerization platform used to package the application and its dependencies into a consistent environment that runs the same across development machines and deployment systems. This simplifies collaboration and deployment across different operating systems.

- **ImageMagick:** A command-line image processing tool that will be used to programmatically generate downloadable winner certificates using contest data such as participant name, contest title, and date.

---

## Future Roadmap (Post-Graduation)

- Expanded judging analytics and scoring metrics for competitions.
- Public contest galleries and search functionality for completed submissions.
- Optional monetization features for premium or sponsored contests.

---

## Feature Set

### 1. Contest Lifecycle Management

Administrators can create contests with prompts, deadlines, and submission rules. Participants can submit their writing within the allowed time window, and submissions become locked after the deadline passes.

### 2. Submission and Judging Workflow

Judges or administrators can review submissions, assign scores or placements, and select winners through a structured interface designed to simplify evaluation.

### 3. User Authentication and Security

Authentication and authorization are handled through Firebase Authentication, ensuring that only registered users can participate, submit entries, or perform judging actions.

### 4. Automated Result Artifacts

Once winners are determined, the system will generate downloadable certificates using ImageMagick, providing participants with tangible results from the competition.
