# The Ink Sprint: A Competitive Writing Tournament Platform

## Project Overview

The Ink Sprint is a web application designed for hosting creative writing competitions where participants submit entries within a defined time window (ranging from hours to days), after which submissions are reviewed and winners are selected. The platform will manage contests, user participation, secure submissions, and judging workflows while providing downloadable results for participants.

The system aims to create an organized and accessible environment for running writing competitions without requiring manual coordination. Users will be able to create contests with prompts and deadlines, participants will submit their work through a guided interface, and judges will evaluate entries. The contest creator can select whether only they can vote, pick specific judges from the list of users, or let anyone vote. An aggregate score based on the average creativity, style, and storytelling scores is tabulated after the voting stage and 1st, 2nd, and 3rd place are awarded. Certificates for the top three entries are generated using ImageMagick, and can be downloaded by that user in .png format.

---

# Running the Project

## Recommended Setup: Docker

Use Docker for the most consistent setup. This includes MongoDB, Redis, and ImageMagick for certificate generation.

Build and start the containers:

`docker-compose up -d --build`

Seed the Docker MongoDB database:

`docker-compose exec server npm run seed`

Open the app:

Frontend: http://localhost:5173  
GraphQL: http://localhost:4000

View Docker logs:

`docker-compose logs -f`

To reset stale Docker data and reseed from scratch:

`docker-compose down -v`

`docker-compose up -d --build`

`docker-compose exec server npm run seed`

## Local Development Setup

Use this for faster frontend/backend development. Requires MongoDB and ImageMagick installed locally.

Install dependencies:

`npm install`

Seed the local MongoDB database:

`npm run seed`

Start the app:

`npm run dev`

Open the app:

Frontend: http://localhost:5173  
GraphQL: http://localhost:4000


## Core Technical Requirements

This project satisfies all course objectives and utilizes the following technologies:

### 1. Primary Backend

- **Node.js:** The core runtime for our API and application logic.

### 2. Course Technologies

- **React:** Used to build the frontend interface, including authentication pages, contest listings, submission forms, and judging dashboards, enabling a dynamic and responsive user experience.

- **GraphQL:** Serves as the API layer between the frontend and backend, managing queries and mutations for contests, submissions, user data, and judging results while allowing flexible data retrieval for different user roles.

- **Firebase Authentication:** Handles user registration and login, providing secure identity management without requiring custom authentication logic. Verified user identity will be used to control permissions for submissions and judging actions.

- **Redis:** Provides an optional caching layer for the backend. The application is configured to connect to Redis in Docker or locally, and falls back safely to MongoDB-backed queries if Redis is unavailable.
 

### 3. Independent Technologies 

- **Docker:** A containerization platform used to package the application and its dependencies into a consistent environment that runs the same across development machines and deployment systems. This simplifies collaboration and deployment across different operating systems.

- **ImageMagick:** A command-line image processing tool that is used to programmatically generate downloadable winner certificates using contest data such as participant name, contest title, and date.

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

Judges can review submissions and assign scores, and winners are selected automatically using aggregate scores.

### 3. User Authentication and Security

Authentication and authorization are handled through Firebase Authentication, ensuring that only registered users can participate, submit entries, or perform judging actions.

### 4. Automated Result Artifacts

Once winners are determined, the system will generate downloadable certificates using ImageMagick, providing participants with tangible results from the competition.
