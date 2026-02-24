**The Ink Sprint: A Competitive Writing Tournament Platform**

**Project Overview**

The Ink Sprint is a high-concurrency, real-time web application designed for writers to compete in timed "Flash Fiction" challenges. The platform synchronizes tournament lobbies, manages live state across multiple clients, and provides deep-text analysis and searchability for completed works.

**Core Technical Requirements** 

This project satisfies all course objectives and utilizes the following mandated technologies:

1. **Primary Backend**

    * Node.js: The core runtime for our API and event orchestration.

2. **Course Technologies**

    * Socket.io: Used for real-time room synchronization, broadcasting prompts, and locking editors upon timer expiration.


    * Redis: Implements a sub-millisecond caching layer for active tournament clocks and "Dirty Draft" recovery to prevent data loss.


    * Workers: Offloads heavy text analysis (word count, readability scores) to background threads to keep the main event loop responsive.


    * Next.js (Framework) : Powers the responsive frontend, satisfying the Framework, CSS3, and AJAX requirements.


    * NoSQL(DataBase) : A document-based approach for storing complex story data and user histories.

3. **Independent Technologies (External Services)**

     * RabbitMQ: A message broker that handles post-tournament asynchronous tasks, such as PDF certificate generation.


     * ElasticSearch: Provides advanced full-text indexing for the story library, allowing for deep-text search by theme or keyword.

**Future Roadmap (Post-Graduation)**

  * AI-Moderation: Deploying a microservice to flag plagiarism or inappropriate content in real-time.

  * Global Elo Ranking: Implementing a skill-based matchmaking system stored in Redis to pair writers of similar experience.

  * Monetization Engine: Integrating Stripe for "Grand Prize" tournaments with secure entry-fee processing.

**Feature Set**

  1. **Real-Time Tournament Lifecycle**
The core of the application is a synchronized state machine. Using Socket.io, the server broadcasts a "Sync Start" event that triggers the prompt reveal and unlocks the editor for all participants at the exact same millisecond. This prevents any unfair advantage and ensures the competitive integrity of the tournament.

  2. **Persistence & Resilience**
To meet production standards, the app uses Redis for session-state management. If a writer’s browser fails at minute 14 of a 15-minute sprint, they can refresh and immediately resume writing from their last cached "Dirty Draft" in Redis, which is saved automatically every five seconds.

  3. **Enterprise-Grade Security**
The platform is protected against XSS and JS Injections by sanitizing all story submissions through a strict Content Security Policy (CSP). Authentication and authorization are handled via Firebase Auth, ensuring that only registered users can participate in competitive tiers.
