/**
 * Video Recommendation & Specification Engine for GoalMind AI
 * Matches roadmap topics with verified educational videos tailored to user specifications.
 */

export type VideoSpecificationLevel = 'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type VideoSpecificationFormat = 'ALL' | 'CRASH_COURSE' | 'HANDS_ON' | 'DEEP_DIVE' | 'INTERVIEW_PREP';
export type VideoSpecificationDuration = 'ALL' | 'QUICK' | 'MEDIUM' | 'COMPREHENSIVE';
export type VideoSpecificationLanguage = 'ALL' | 'EN' | 'HI' | 'ES';

export interface VideoSpecificationFilters {
  level: VideoSpecificationLevel;
  format: VideoSpecificationFormat;
  duration: VideoSpecificationDuration;
  language: VideoSpecificationLanguage;
  customKeywords?: string;
}

export interface RecommendedVideo {
  id: string;
  title: string;
  channel: string;
  embedUrl: string;
  watchUrl: string;
  durationLabel: string;
  durationMinutes: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  format: 'CRASH_COURSE' | 'HANDS_ON' | 'DEEP_DIVE' | 'INTERVIEW_PREP';
  language: 'EN' | 'HI' | 'ES';
  description: string;
  topics: string[];
}

// Curated verified educational videos repository across all core computer science & engineering domains
export const CURATED_VIDEO_CATALOG: RecommendedVideo[] = [
  // --- SYSTEM DESIGN & DISTRIBUTED SYSTEMS ---
  {
    id: 'sys-design-1',
    title: 'System Design Interview – Step by Step Guide',
    channel: 'Gaurav Sen',
    embedUrl: 'https://www.youtube.com/embed/i53Gi_K3o7I',
    watchUrl: 'https://www.youtube.com/watch?v=i53Gi_K3o7I',
    durationLabel: '24 mins',
    durationMinutes: 24,
    level: 'INTERMEDIATE',
    format: 'CRASH_COURSE',
    language: 'EN',
    description: 'System decomposition, capacity estimation, high-availability architecture, and trade-off evaluation.',
    topics: ['system design', 'architecture', 'decomposition', 'scalability', 'distributed', 'blueprint', 'foundations']
  },
  {
    id: 'sys-design-2',
    title: 'Database Sharding & Horizontal Scaling Architecture',
    channel: 'ByteByteGo',
    embedUrl: 'https://www.youtube.com/embed/5faMjKuB9bc',
    watchUrl: 'https://www.youtube.com/watch?v=5faMjKuB9bc',
    durationLabel: '15 mins',
    durationMinutes: 15,
    level: 'ADVANCED',
    format: 'DEEP_DIVE',
    language: 'EN',
    description: 'Range sharding, hash sharding, consistent hashing, replication lag, and rebalancing strategies.',
    topics: ['sharding', 'horizontal scaling', 'database', 'consistent hashing', 'replication', 'high-throughput', 'persistence']
  },
  {
    id: 'sys-design-3',
    title: 'Distributed Caching Strategies with Redis & Memcached',
    channel: 'ByteByteGo',
    embedUrl: 'https://www.youtube.com/embed/bUHFg8CZFcA',
    watchUrl: 'https://www.youtube.com/watch?v=bUHFg8CZFcA',
    durationLabel: '14 mins',
    durationMinutes: 14,
    level: 'INTERMEDIATE',
    format: 'CRASH_COURSE',
    language: 'EN',
    description: 'Cache-aside, read-through, write-through, write-back, cache stampede, and TTL invalidation policies.',
    topics: ['caching', 'redis', 'memcached', 'cache invalidation', 'distributed cache', 'latency', 'resilience']
  },
  {
    id: 'sys-design-4',
    title: 'Microservices Architecture Patterns & Service Discovery',
    channel: 'TechWorld with Nana',
    embedUrl: 'https://www.youtube.com/embed/j50W9E-KzC0',
    watchUrl: 'https://www.youtube.com/watch?v=j50W9E-KzC0',
    durationLabel: '25 mins',
    durationMinutes: 25,
    level: 'INTERMEDIATE',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Monolith to microservices decomposition, API gateways, service discovery, and circuit breaking.',
    topics: ['microservices', 'service layer', 'api gateway', 'circuit breaker', 'service discovery', 'resilient']
  },
  {
    id: 'sys-design-5',
    title: 'Apache Kafka Architecture & Event-Driven Systems',
    channel: 'Hussein Nasser',
    embedUrl: 'https://www.youtube.com/embed/S068j5yP98c',
    watchUrl: 'https://www.youtube.com/watch?v=S068j5yP98c',
    durationLabel: '32 mins',
    durationMinutes: 32,
    level: 'ADVANCED',
    format: 'DEEP_DIVE',
    language: 'EN',
    description: 'Topic partitioning, consumer groups, offset management, exactly-once semantics, and message queues.',
    topics: ['kafka', 'event-driven', 'messaging', 'queue', 'pub-sub', 'streaming', 'async']
  },
  {
    id: 'sys-design-6',
    title: 'API Gateway Pattern, Reverse Proxies & Rate Limiting',
    channel: 'ByteByteGo',
    embedUrl: 'https://www.youtube.com/embed/3oI_k9VjC-8',
    watchUrl: 'https://www.youtube.com/watch?v=3oI_k9VjC-8',
    durationLabel: '16 mins',
    durationMinutes: 16,
    level: 'INTERMEDIATE',
    format: 'CRASH_COURSE',
    language: 'EN',
    description: 'Token bucket rate limiting, reverse proxies, SSL termination, and client authentication.',
    topics: ['api gateway', 'rate limiting', 'reverse proxy', 'nginx', 'traffic', 'security']
  },

  // --- DATABASES, SQL & PERSISTENCE ---
  {
    id: 'sql-1',
    title: 'Relational Database Design & Normalization (1NF, 2NF, 3NF)',
    channel: 'freeCodeCamp',
    embedUrl: 'https://www.youtube.com/embed/ztHopE5Wnpc',
    watchUrl: 'https://www.youtube.com/watch?v=ztHopE5Wnpc',
    durationLabel: '50 mins',
    durationMinutes: 50,
    level: 'INTERMEDIATE',
    format: 'DEEP_DIVE',
    language: 'EN',
    description: 'Primary keys, foreign keys, eliminating redundancy, and designing robust 3NF schemas.',
    topics: ['database', 'schema', 'relational', 'design', 'normalization', '3nf', 'sql', 'tables']
  },
  {
    id: 'sql-2',
    title: 'SQL Query Optimization & Database Indexing Internals',
    channel: 'Hussein Nasser',
    embedUrl: 'https://www.youtube.com/embed/7S_tz1z_5bA',
    watchUrl: 'https://www.youtube.com/watch?v=7S_tz1z_5bA',
    durationLabel: '38 mins',
    durationMinutes: 38,
    level: 'ADVANCED',
    format: 'DEEP_DIVE',
    language: 'EN',
    description: 'B-Tree indexes, Clustered vs Secondary indexes, EXPLAIN query plans, and optimizing slow JOINs.',
    topics: ['sql', 'query', 'optimization', 'indexes', 'b-tree', 'performance', 'explain', 'joins']
  },
  {
    id: 'sql-3',
    title: 'Spring Data JPA & Hibernate Entity Mapping',
    channel: 'Amigoscode',
    embedUrl: 'https://www.youtube.com/embed/8SGI_XS5OPw',
    watchUrl: 'https://www.youtube.com/watch?v=8SGI_XS5OPw',
    durationLabel: '1 hr 10m',
    durationMinutes: 70,
    level: 'INTERMEDIATE',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Entity relationships (@OneToMany, @ManyToOne), Lazy loading, derived repository methods, and JPQL.',
    topics: ['spring data', 'jpa', 'hibernate', 'mapping', 'orm', 'entity', 'repositories', 'persistence']
  },
  {
    id: 'sql-4',
    title: 'PostgreSQL Complete Course for Developers',
    channel: 'freeCodeCamp',
    embedUrl: 'https://www.youtube.com/embed/qw--VYLpxG4',
    watchUrl: 'https://www.youtube.com/watch?v=qw--VYLpxG4',
    durationLabel: '4 hours',
    durationMinutes: 240,
    level: 'BEGINNER',
    format: 'DEEP_DIVE',
    language: 'EN',
    description: 'Complete PostgreSQL walkthrough: relational schemas, transactions, constraints, views, and stored functions.',
    topics: ['postgresql', 'postgres', 'sql', 'database', 'queries', 'crud']
  },
  {
    id: 'sql-5',
    title: 'Redis Crash Course – In-Memory Database & Cache',
    channel: 'Traversy Media',
    embedUrl: 'https://www.youtube.com/embed/jgpVdJB29f8',
    watchUrl: 'https://www.youtube.com/watch?v=jgpVdJB29f8',
    durationLabel: '35 mins',
    durationMinutes: 35,
    level: 'BEGINNER',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Redis data structures: Strings, Hashes, Lists, Sets, Sorted Sets, and Pub/Sub in real applications.',
    topics: ['redis', 'in-memory', 'cache', 'key-value', 'nosql', 'fast']
  },

  // --- DATA STRUCTURES & ALGORITHMS ---
  {
    id: 'dsa-1',
    title: 'Data Structures and Algorithms in Java / Python',
    channel: 'freeCodeCamp',
    embedUrl: 'https://www.youtube.com/embed/8hly31xKli0',
    watchUrl: 'https://www.youtube.com/watch?v=8hly31xKli0',
    durationLabel: '5 hours',
    durationMinutes: 300,
    level: 'BEGINNER',
    format: 'DEEP_DIVE',
    language: 'EN',
    description: 'Arrays, Linked Lists, Stacks, Queues, Binary Trees, and Big-O notation complexity analysis.',
    topics: ['dsa', 'data structures', 'algorithms', 'arrays', 'linked list', 'complexity', 'big-o']
  },
  {
    id: 'dsa-2',
    title: 'Two Heaps Pattern – Find Median from Data Stream',
    channel: 'NeetCode',
    embedUrl: 'https://www.youtube.com/embed/itmhHWaHupI',
    watchUrl: 'https://www.youtube.com/watch?v=itmhHWaHupI',
    durationLabel: '15 mins',
    durationMinutes: 15,
    level: 'ADVANCED',
    format: 'INTERVIEW_PREP',
    language: 'EN',
    description: 'Min-Heap and Max-Heap balance technique to compute median in continuous streams with O(log N) insert.',
    topics: ['heaps', 'median', 'stream', 'priority queue', 'leetcode', 'algorithms', 'trees']
  },
  {
    id: 'dsa-3',
    title: 'LRU Cache Design & Implementation with HashMap + Doubly Linked List',
    channel: 'NeetCode',
    embedUrl: 'https://www.youtube.com/embed/7ABFKPK2hD4',
    watchUrl: 'https://www.youtube.com/watch?v=7ABFKPK2hD4',
    durationLabel: '18 mins',
    durationMinutes: 18,
    level: 'ADVANCED',
    format: 'INTERVIEW_PREP',
    language: 'EN',
    description: 'Building O(1) get and put operations with custom doubly linked list nodes and hash map lookups.',
    topics: ['lru cache', 'cache', 'doubly linked list', 'hashmap', 'o(1)', 'algorithms']
  },
  {
    id: 'dsa-4',
    title: 'Graph Algorithms – BFS, DFS, Dijkstra & Topological Sort',
    channel: 'freeCodeCamp',
    embedUrl: 'https://www.youtube.com/embed/tWVWeAqZ0WU',
    watchUrl: 'https://www.youtube.com/watch?v=tWVWeAqZ0WU',
    durationLabel: '2 hours',
    durationMinutes: 120,
    level: 'INTERMEDIATE',
    format: 'DEEP_DIVE',
    language: 'EN',
    description: 'Adjacency list representations, breadth-first search, depth-first search, shortest path, and cycle detection.',
    topics: ['graph', 'bfs', 'dfs', 'dijkstra', 'topological sort', 'matrix', 'traversal']
  },
  {
    id: 'dsa-5',
    title: 'Dynamic Programming – Learn to Solve Any DP Problem',
    channel: 'freeCodeCamp',
    embedUrl: 'https://www.youtube.com/embed/oBt53YbR9Kk',
    watchUrl: 'https://www.youtube.com/watch?v=oBt53YbR9Kk',
    durationLabel: '5 hours',
    durationMinutes: 300,
    level: 'ADVANCED',
    format: 'DEEP_DIVE',
    language: 'EN',
    description: 'Memoization vs Tabulation, grid traveler, canSum, bestSum, and allConstruct problem patterns.',
    topics: ['dynamic programming', 'dp', 'memoization', 'tabulation', 'recursion', 'optimization']
  },

  // --- BACKEND & JAVA / SPRING BOOT ---
  {
    id: 'spring-1',
    title: 'Spring Boot 3 Full Course – Build Production REST APIs',
    channel: 'Amigoscode',
    embedUrl: 'https://www.youtube.com/embed/9SGDpanrc8U',
    watchUrl: 'https://www.youtube.com/watch?v=9SGDpanrc8U',
    durationLabel: '2 hours',
    durationMinutes: 120,
    level: 'INTERMEDIATE',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Dependency injection, @RestController, request mappings, response entities, and DTO architectures.',
    topics: ['spring boot', 'rest controllers', 'java', 'backend', 'api', 'framework', 'crud']
  },
  {
    id: 'spring-2',
    title: 'Spring Boot Validation & Centralized Error Handling',
    channel: 'Amigoscode',
    embedUrl: 'https://www.youtube.com/embed/L5bkgp5tCqg',
    watchUrl: 'https://www.youtube.com/watch?v=L5bkgp5tCqg',
    durationLabel: '25 mins',
    durationMinutes: 25,
    level: 'INTERMEDIATE',
    format: 'HANDS_ON',
    language: 'EN',
    description: '@Valid, Jakarta constraints, @RestControllerAdvice, custom error envelopes, and HTTP status codes.',
    topics: ['validation', 'error handling', 'exception', 'restcontrolleradvice', 'jakarta', 'dto']
  },
  {
    id: 'spring-3',
    title: 'Spring Security 6 & JWT Token Authentication Complete Guide',
    channel: 'Amigoscode',
    embedUrl: 'https://www.youtube.com/embed/KxqlJblhzfI',
    watchUrl: 'https://www.youtube.com/watch?v=KxqlJblhzfI',
    durationLabel: '1 hr 30m',
    durationMinutes: 90,
    level: 'ADVANCED',
    format: 'DEEP_DIVE',
    language: 'EN',
    description: 'Stateless session creation, OncePerRequestFilter, BCrypt password hashing, and role authorization.',
    topics: ['spring security', 'jwt', 'authentication', 'authorization', 'bearer token', 'security', 'crypto']
  },
  {
    id: 'java-setup-1',
    title: 'Java 21 Setup & IntelliJ IDEA Complete Guide',
    channel: 'Amigoscode',
    embedUrl: 'https://www.youtube.com/embed/grEKMHj3558',
    watchUrl: 'https://www.youtube.com/watch?v=grEKMHj3558',
    durationLabel: '28 mins',
    durationMinutes: 28,
    level: 'BEGINNER',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Install JDK 21 LTS, configure JAVA_HOME, PATH variables, and configure IntelliJ IDEA with Git and Maven.',
    topics: ['environment', 'setup', 'jdk', 'tooling', 'install', 'intellij', 'maven', 'java']
  },
  {
    id: 'java-oop-1',
    title: 'Object-Oriented Programming (OOP) in Java Explained',
    channel: 'Programming with Mosh',
    embedUrl: 'https://www.youtube.com/embed/pTB0EiLXUC8',
    watchUrl: 'https://www.youtube.com/watch?v=pTB0EiLXUC8',
    durationLabel: '45 mins',
    durationMinutes: 45,
    level: 'INTERMEDIATE',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Master Encapsulation, Abstraction, Inheritance, and Polymorphism through clear real-world examples.',
    topics: ['oop', 'class', 'object', 'encapsulation', 'inheritance', 'polymorphism', 'abstraction']
  },
  {
    id: 'java-coll-1',
    title: 'Java Collections Framework Complete Masterclass',
    channel: 'Amigoscode',
    embedUrl: 'https://www.youtube.com/embed/GdAon8gm-0U',
    watchUrl: 'https://www.youtube.com/watch?v=GdAon8gm-0U',
    durationLabel: '1 hr 15m',
    durationMinutes: 75,
    level: 'INTERMEDIATE',
    format: 'DEEP_DIVE',
    language: 'EN',
    description: 'ArrayList, LinkedList, HashSet, TreeSet, HashMap, TreeMap, and Stream API functional operations.',
    topics: ['collections', 'list', 'set', 'map', 'hashmap', 'streams', 'generics', 'java']
  },

  // --- TESTING & ARCHITECTURAL RIGOR ---
  {
    id: 'test-1',
    title: 'Deterministic Testing Harness – JUnit 5 & Mockito in Spring Boot',
    channel: 'Amigoscode',
    embedUrl: 'https://www.youtube.com/embed/F4jZkKXZH6Q',
    watchUrl: 'https://www.youtube.com/watch?v=F4jZkKXZH6Q',
    durationLabel: '1 hr 15m',
    durationMinutes: 75,
    level: 'INTERMEDIATE',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Unit testing services with Mockito, MockMvc REST controller testing, and assertJ assertions.',
    topics: ['testing', 'junit', 'mockito', 'integration testing', 'ci', 'test harness', 'automation', 'qa']
  },
  {
    id: 'test-2',
    title: 'Clean Code Principles & SOLID Architecture',
    channel: 'freeCodeCamp',
    embedUrl: 'https://www.youtube.com/embed/y7Tq3XWj8m0',
    watchUrl: 'https://www.youtube.com/watch?v=y7Tq3XWj8m0',
    durationLabel: '42 mins',
    durationMinutes: 42,
    level: 'INTERMEDIATE',
    format: 'CRASH_COURSE',
    language: 'EN',
    description: 'Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.',
    topics: ['clean code', 'solid', 'refactoring', 'architecture', 'best practices', 'design patterns']
  },

  // --- FRONTEND & REACT / TYPESCRIPT ---
  {
    id: 'front-1',
    title: 'Full-Stack React + Spring Boot Integration & State',
    channel: 'freeCodeCamp',
    embedUrl: 'https://www.youtube.com/embed/bMknfKXIFA8',
    watchUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    durationLabel: '1 hr 45m',
    durationMinutes: 105,
    level: 'INTERMEDIATE',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Connecting React client with Spring Boot backend, managing Axios JWT interceptors, and error handling.',
    topics: ['frontend integration', 'react', 'axios', 'ui', 'full stack', 'polish', 'web']
  },
  {
    id: 'front-2',
    title: 'React 18 & TypeScript Crash Course for Developers',
    channel: 'Traversy Media',
    embedUrl: 'https://www.youtube.com/embed/BCg4U15nu48',
    watchUrl: 'https://www.youtube.com/watch?v=BCg4U15nu48',
    durationLabel: '1 hr 10m',
    durationMinutes: 70,
    level: 'BEGINNER',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Components, props, useState, useEffect, custom hooks, and strict TypeScript types.',
    topics: ['react', 'typescript', 'components', 'hooks', 'state', 'frontend']
  },
  {
    id: 'front-3',
    title: 'Core Web Vitals Optimization (LCP, INP, CLS)',
    channel: 'Google Chrome Developers',
    embedUrl: 'https://www.youtube.com/embed/zQnBQ4tB3ZA',
    watchUrl: 'https://www.youtube.com/watch?v=zQnBQ4tB3ZA',
    durationLabel: '22 mins',
    durationMinutes: 22,
    level: 'ADVANCED',
    format: 'DEEP_DIVE',
    language: 'EN',
    description: 'Optimizing Largest Contentful Paint, Interaction to Next Paint, Cumulative Layout Shift, and bundle size.',
    topics: ['web vitals', 'performance', 'lcp', 'inp', 'cls', 'lighthouse', 'optimization']
  },

  // --- DEVOPS, DOCKER & CLOUD ARCHITECTURE ---
  {
    id: 'deploy-1',
    title: 'Docker & Docker Compose for Full Stack Applications',
    channel: 'TechWorld with Nana',
    embedUrl: 'https://www.youtube.com/embed/3c-iBn73dDE',
    watchUrl: 'https://www.youtube.com/watch?v=3c-iBn73dDE',
    durationLabel: '40 mins',
    durationMinutes: 40,
    level: 'ADVANCED',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Containerizing Java Spring Boot and React applications with MySQL multi-container Docker Compose.',
    topics: ['deployment', 'docker', 'docker compose', 'containers', 'devops', 'readme', 'infrastructure']
  },
  {
    id: 'deploy-2',
    title: 'Kubernetes Tutorial for Beginners [Complete In-Depth Course]',
    channel: 'TechWorld with Nana',
    embedUrl: 'https://www.youtube.com/embed/X48VuDVv0do',
    watchUrl: 'https://www.youtube.com/watch?v=X48VuDVv0do',
    durationLabel: '3.5 hours',
    durationMinutes: 210,
    level: 'ADVANCED',
    format: 'DEEP_DIVE',
    language: 'EN',
    description: 'Pods, Services, Ingress, ConfigMaps, Secrets, Deployments, and StatefulSets explained clearly.',
    topics: ['kubernetes', 'k8s', 'pods', 'cluster', 'cloud', 'devops', 'orchestration']
  },
  {
    id: 'deploy-3',
    title: 'GitHub Actions CI/CD Complete Pipeline Tutorial',
    channel: 'TechWorld with Nana',
    embedUrl: 'https://www.youtube.com/embed/R8_veQiYBjI',
    watchUrl: 'https://www.youtube.com/watch?v=R8_veQiYBjI',
    durationLabel: '45 mins',
    durationMinutes: 45,
    level: 'INTERMEDIATE',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Build, test, containerize, and deploy automatically on pull requests using GitHub Actions workflows.',
    topics: ['ci/cd', 'github actions', 'pipeline', 'automation', 'workflow', 'devops']
  },

  // --- AI, MACHINE LEARNING & LLMS ---
  {
    id: 'ai-1',
    title: 'Neural Networks & Deep Learning Explained Mathematically',
    channel: '3Blue1Brown',
    embedUrl: 'https://www.youtube.com/embed/aircAruvnKk',
    watchUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
    durationLabel: '19 mins',
    durationMinutes: 19,
    level: 'INTERMEDIATE',
    format: 'DEEP_DIVE',
    language: 'EN',
    description: 'Gradient descent, backpropagation, activation functions, and matrix operations under the hood.',
    topics: ['ai', 'machine learning', 'neural network', 'deep learning', 'backpropagation', 'math']
  },
  {
    id: 'ai-2',
    title: 'Retrieval Augmented Generation (RAG) System Architecture',
    channel: 'IBM Technology',
    embedUrl: 'https://www.youtube.com/embed/q8pUPiun5K0',
    watchUrl: 'https://www.youtube.com/watch?v=q8pUPiun5K0',
    durationLabel: '12 mins',
    durationMinutes: 12,
    level: 'ADVANCED',
    format: 'CRASH_COURSE',
    language: 'EN',
    description: 'Vector databases, dense retrieval, embedding models, and contextual hallucination reduction.',
    topics: ['rag', 'llm', 'vector database', 'embeddings', 'ai architecture', 'generative ai']
  },

  // --- INTERVIEW MASTERY & BEHAVIORAL ---
  {
    id: 'interview-1',
    title: 'How to Answer Behavioral Interview Questions with STAR Method',
    channel: 'Exponent',
    embedUrl: 'https://www.youtube.com/embed/PJKYqLH4eoY',
    watchUrl: 'https://www.youtube.com/watch?v=PJKYqLH4eoY',
    durationLabel: '16 mins',
    durationMinutes: 16,
    level: 'INTERMEDIATE',
    format: 'INTERVIEW_PREP',
    language: 'EN',
    description: 'Structuring Situation, Task, Action, and Result to convey personal ownership and quantifiable impact.',
    topics: ['star method', 'behavioral', 'interview', 'leadership', 'communication', 'soft skills']
  },
  {
    id: 'interview-2',
    title: 'The System Design Interview Framework (FAANG Standard)',
    channel: 'Exponent',
    embedUrl: 'https://www.youtube.com/embed/1qw5ITr3k9E',
    watchUrl: 'https://www.youtube.com/watch?v=1qw5ITr3k9E',
    durationLabel: '20 mins',
    durationMinutes: 20,
    level: 'ADVANCED',
    format: 'INTERVIEW_PREP',
    language: 'EN',
    description: 'Scoping requirements, high-level design, deep dive into bottlenecks, and failure mode defense.',
    topics: ['system design interview', 'interview prep', 'faang', 'architecture interview', 'framework']
  },

  // --- GENERAL HABIT & PRODUCTIVITY FALLBACK ---
  {
    id: 'prod-1',
    title: 'Deep Work Mastery — Focus Sprint & Pomodoro Mechanics',
    channel: 'Ali Abdaal',
    embedUrl: 'https://www.youtube.com/embed/mK9k2t5J1yE',
    watchUrl: 'https://www.youtube.com/watch?v=mK9k2t5J1yE',
    durationLabel: '20 mins',
    durationMinutes: 20,
    level: 'BEGINNER',
    format: 'CRASH_COURSE',
    language: 'EN',
    description: 'The science of high-focus deep work sprints, eliminating digital friction, and habit consistency.',
    topics: ['productivity', 'deep work', 'focus', 'planning', 'habits', 'consistency', 'review', 'general']
  }
];

/**
 * Normalizes any YouTube URL into an embeddable URL and direct watch URL.
 * Handles watch?v=, youtu.be/, shorts/, embed/, mobile URLs, and cleans tracking parameters.
 */
export function cleanAndFormatEmbedUrl(rawUrl: string): { embedUrl: string; watchUrl: string; isValid: boolean } {
  if (!rawUrl || !rawUrl.trim()) {
    return { embedUrl: '', watchUrl: '', isValid: false };
  }

  const trimmed = rawUrl.trim();

  try {
    // 1. YouTube watch format: https://www.youtube.com/watch?v=VIDEO_ID
    if (trimmed.includes('youtube.com/watch')) {
      const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        const cleanId = videoId.split('&')[0];
        return {
          embedUrl: `https://www.youtube.com/embed/${cleanId}`,
          watchUrl: `https://www.youtube.com/watch?v=${cleanId}`,
          isValid: true
        };
      }
    }

    // 2. YouTube short format: https://youtu.be/VIDEO_ID
    if (trimmed.includes('youtu.be/')) {
      const parts = trimmed.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
      if (parts) {
        return {
          embedUrl: `https://www.youtube.com/embed/${parts}`,
          watchUrl: `https://www.youtube.com/watch?v=${parts}`,
          isValid: true
        };
      }
    }

    // 3. YouTube shorts format: https://www.youtube.com/shorts/VIDEO_ID
    if (trimmed.includes('youtube.com/shorts/')) {
      const parts = trimmed.split('youtube.com/shorts/')[1]?.split('?')[0]?.split('&')[0];
      if (parts) {
        return {
          embedUrl: `https://www.youtube.com/embed/${parts}`,
          watchUrl: `https://www.youtube.com/watch?v=${parts}`,
          isValid: true
        };
      }
    }

    // 4. Already YouTube embed format: https://www.youtube.com/embed/VIDEO_ID
    if (trimmed.includes('youtube.com/embed/')) {
      const parts = trimmed.split('youtube.com/embed/')[1]?.split('?')[0]?.split('&')[0];
      return {
        embedUrl: `https://www.youtube.com/embed/${parts}`,
        watchUrl: parts ? `https://www.youtube.com/watch?v=${parts}` : trimmed,
        isValid: true
      };
    }

    // 5. Generic HTTPS video (e.g. Vimeo, MP4 stream)
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return {
        embedUrl: trimmed,
        watchUrl: trimmed,
        isValid: true
      };
    }

    return { embedUrl: '', watchUrl: '', isValid: false };
  } catch (e) {
    return { embedUrl: trimmed, watchUrl: trimmed, isValid: false };
  }
}

/**
 * Matches topic title & milestone to return top-tier curated recommendations.
 * Automatically identifies the best matching video tutorial without requiring user input.
 */
export function getVideosForTopic(
  topicTitle: string,
  milestoneTitle?: string,
  filters?: Partial<VideoSpecificationFilters>
): RecommendedVideo[] {
  const queryStr = `${topicTitle || ''} ${milestoneTitle || ''} ${filters?.customKeywords || ''}`.toLowerCase();
  const queryWords = queryStr.split(/[\s,–—\-_/]+/).filter(w => w.length > 2);

  // Score each video in the catalog
  const scored = CURATED_VIDEO_CATALOG.map(video => {
    let score = 0;

    // Check exact topic keyword overlap
    for (const keyword of video.topics) {
      if (queryStr.includes(keyword)) {
        score += 12;
      }
      for (const word of queryWords) {
        if (keyword === word) {
          score += 8;
        } else if (keyword.includes(word) || word.includes(keyword)) {
          score += 4;
        }
      }
    }

    // Title match
    const videoTitleLower = video.title.toLowerCase();
    for (const word of queryWords) {
      if (videoTitleLower.includes(word)) {
        score += 6;
      }
    }

    // Description match
    const videoDescLower = video.description.toLowerCase();
    for (const word of queryWords) {
      if (videoDescLower.includes(word)) {
        score += 2;
      }
    }

    // Filter by Level Specification
    if (filters?.level && filters.level !== 'ALL') {
      if (video.level === filters.level) score += 6;
      else score -= 4;
    }

    // Filter by Format Specification
    if (filters?.format && filters.format !== 'ALL') {
      if (video.format === filters.format) score += 6;
      else score -= 3;
    }

    // Filter by Language Specification
    if (filters?.language && filters.language !== 'ALL') {
      if (video.language === filters.language) score += 8;
      else score -= 10;
    }

    return { video, score };
  });

  // Sort descending by relevance score
  scored.sort((a, b) => b.score - a.score);

  // Return top matching videos
  const results = scored.filter(s => s.score > 0).map(s => s.video);

  if (results.length < 3) {
    // Append general high-signal fallbacks if fewer than 3 matches
    for (const item of CURATED_VIDEO_CATALOG) {
      if (!results.some(r => r.id === item.id)) {
        results.push(item);
        if (results.length >= 4) break;
      }
    }
  }

  return results.slice(0, 6);
}

/**
 * Returns the single #1 best video URL for any topic, ensuring instant 0-second playable embed.
 */
export function getBestVideoForTask(taskTitle: string, milestoneTitle?: string, fallbackUrl?: string): {
  embedUrl: string;
  watchUrl: string;
  title: string;
  channel: string;
} {
  // If task already has a verified, non-empty videoUrl
  if (fallbackUrl && fallbackUrl.trim().length > 10) {
    const cleaned = cleanAndFormatEmbedUrl(fallbackUrl);
    if (cleaned.isValid && cleaned.embedUrl) {
      return {
        embedUrl: cleaned.embedUrl,
        watchUrl: cleaned.watchUrl,
        title: taskTitle || 'Topic Lesson',
        channel: 'Curated Guide'
      };
    }
  }

  // Find top matched video from catalog
  const matches = getVideosForTopic(taskTitle, milestoneTitle);
  const best = matches[0] || CURATED_VIDEO_CATALOG[0];

  return {
    embedUrl: best.embedUrl,
    watchUrl: best.watchUrl,
    title: best.title,
    channel: best.channel
  };
}

/**
 * Generates an optimized YouTube search URL based on user's exact topic specification.
 */
export function generateCustomYouTubeSearchUrl(
  topicTitle: string,
  userCustomKeywords?: string,
  format?: VideoSpecificationFormat,
  level?: VideoSpecificationLevel,
  language?: VideoSpecificationLanguage
): string {
  const queryParts: string[] = [topicTitle || 'Software Engineering'];

  if (userCustomKeywords && userCustomKeywords.trim()) {
    queryParts.push(userCustomKeywords.trim());
  }

  if (format && format !== 'ALL') {
    switch (format) {
      case 'CRASH_COURSE': queryParts.push('crash course overview'); break;
      case 'HANDS_ON': queryParts.push('hands on tutorial step by step'); break;
      case 'DEEP_DIVE': queryParts.push('deep dive complete architecture masterclass'); break;
      case 'INTERVIEW_PREP': queryParts.push('interview questions common mistakes'); break;
    }
  }

  if (level && level !== 'ALL') queryParts.push(level.toLowerCase());
  if (language && language === 'HI') queryParts.push('in hindi');
  if (language && language === 'ES') queryParts.push('en español');

  queryParts.push('tutorial');
  const fullQuery = queryParts.join(' ');
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(fullQuery)}`;
}
