The Ink Sprint: A Competitive Writing Tournament Platform
Project Overview

The Ink Sprint is a high-concurrency, real-time web application designed for writers to compete in timed "Flash Fiction" challenges. The platform synchronizes tournament lobbies, manages live state across multiple clients, and provides deep-text analysis and searchability for completed works.

Core Technical Requirements (CS 554)
This project satisfies all course objectives and utilizes the following mandated technologies:

1. Primary Backend

Node.js: The core runtime for our API and event orchestration.

2. Course Technologies

Socket.io: Used for real-time room synchronization, broadcasting prompts, and locking editors upon timer expiration.


Redis: Implements a sub-millisecond caching layer for active tournament clocks and "Dirty Draft" recovery to prevent data loss.


Workers: Offloads heavy text analysis (word count, readability scores) to background threads to keep the main event loop responsive.


Next.js (React): Powers the responsive frontend, satisfying the Framework, CSS3, and AJAX requirements.


NoSQL: A document-based approach for storing complex story data and user histories.

3. Independent Technologies (External Services)

RabbitMQ: A message broker that handles post-tournament asynchronous tasks, such as PDF certificate generation.


ElasticSearch: Provides advanced full-text indexing for the story library, allowing for deep-text search by theme or keyword.

Future Roadmap (Post-Graduation)
AI-Moderation: Deploying a microservice to flag plagiarism or inappropriate content in real-time.

Global Elo Ranking: Implementing a skill-based matchmaking system stored in Redis to pair writers of similar experience.

Monetization Engine: Integrating Stripe for "Grand Prize" tournaments with secure entry-fee processing.
