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

// Curated verified educational videos repository
const CURATED_VIDEO_CATALOG: RecommendedVideo[] = [
  // Setup & Environment
  {
    id: 'setup-1',
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
    topics: ['environment', 'setup', 'jdk', 'tooling', 'install', 'intellij', 'maven']
  },
  {
    id: 'setup-2',
    title: 'Java in 100 Seconds — Overview & Architecture',
    channel: 'Fireship',
    embedUrl: 'https://www.youtube.com/embed/m4-HM_sCvtQ',
    watchUrl: 'https://www.youtube.com/watch?v=m4-HM_sCvtQ',
    durationLabel: '2 mins',
    durationMinutes: 2,
    level: 'BEGINNER',
    format: 'CRASH_COURSE',
    language: 'EN',
    description: 'Ultra-fast summary of how JVM bytecode execution, memory management, and modern Java work.',
    topics: ['environment', 'setup', 'overview', 'fundamentals', 'architecture']
  },
  {
    id: 'setup-3',
    title: 'Java Complete Course for Beginners',
    channel: 'Bro Code',
    embedUrl: 'https://www.youtube.com/embed/xk4_1vDrzzo',
    watchUrl: 'https://www.youtube.com/watch?v=xk4_1vDrzzo',
    durationLabel: '4 hours',
    durationMinutes: 240,
    level: 'BEGINNER',
    format: 'DEEP_DIVE',
    language: 'EN',
    description: 'Comprehensive, zero-prior-knowledge walkthrough from installation to first working programs.',
    topics: ['environment', 'fundamentals', 'data types', 'variables', 'syntax', 'beginners']
  },

  // Data Types & Control Flow
  {
    id: 'syntax-1',
    title: 'Java Variables, Data Types & Operators Explained',
    channel: 'Programming with Mosh',
    embedUrl: 'https://www.youtube.com/embed/eIrMbAQSU34',
    watchUrl: 'https://www.youtube.com/watch?v=eIrMbAQSU34',
    durationLabel: '35 mins',
    durationMinutes: 35,
    level: 'BEGINNER',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Primitive types, reference types, type casting, mathematical operators, and memory implications.',
    topics: ['data types', 'operators', 'variables', 'primitives', 'syntax', 'casting']
  },
  {
    id: 'syntax-2',
    title: 'Control Flow, If-Else & Switch Pattern Matching',
    channel: 'Telusko',
    embedUrl: 'https://www.youtube.com/embed/8cm1x4bC610',
    watchUrl: 'https://www.youtube.com/watch?v=8cm1x4bC610',
    durationLabel: '22 mins',
    durationMinutes: 22,
    level: 'BEGINNER',
    format: 'CRASH_COURSE',
    language: 'EN',
    description: 'Conditional statements, boolean logic, ternary operators, and modern Java switch expressions.',
    topics: ['control flow', 'conditionals', 'if-else', 'switch', 'logic', 'loops']
  },
  {
    id: 'syntax-3',
    title: 'Loops in Java — For, While, Do-While & For-Each',
    channel: 'Bro Code',
    embedUrl: 'https://www.youtube.com/embed/BBpAmxU_NQo',
    watchUrl: 'https://www.youtube.com/watch?v=BBpAmxU_NQo',
    durationLabel: '18 mins',
    durationMinutes: 18,
    level: 'BEGINNER',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Iteration constructs, loop control with break and continue, and solving algorithmic loops.',
    topics: ['loops', 'algorithmic', 'drills', 'while', 'for-each', 'iteration']
  },
  {
    id: 'syntax-hi',
    title: 'Java Complete Course in Hindi for Beginners',
    channel: 'CodeWithHarry',
    embedUrl: 'https://www.youtube.com/embed/ntLJmHOJ0ME',
    watchUrl: 'https://www.youtube.com/watch?v=ntLJmHOJ0ME',
    durationLabel: '2 hours',
    durationMinutes: 120,
    level: 'BEGINNER',
    format: 'HANDS_ON',
    language: 'HI',
    description: 'Step-by-step Hindi tutorial covering syntax, variables, loops, conditional logic, and exercises.',
    topics: ['environment', 'data types', 'syntax', 'loops', 'operators', 'hindi']
  },

  // Object-Oriented Programming (OOP)
  {
    id: 'oop-1',
    title: 'Object-Oriented Programming (OOP) in Java',
    channel: 'Programming with Mosh',
    embedUrl: 'https://www.youtube.com/embed/pTB0EiLXUC8',
    watchUrl: 'https://www.youtube.com/watch?v=pTB0EiLXUC8',
    durationLabel: '45 mins',
    durationMinutes: 45,
    level: 'INTERMEDIATE',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Master Encapsulation, Abstraction, Inheritance, and Polymorphism through clear real-world examples.',
    topics: ['oop', 'class', 'object', 'modeling', 'encapsulation', 'abstraction']
  },
  {
    id: 'oop-2',
    title: 'Inheritance and Polymorphism Demystified',
    channel: 'Telusko',
    embedUrl: 'https://www.youtube.com/embed/2nmfP_K3vY8',
    watchUrl: 'https://www.youtube.com/watch?v=2nmfP_K3vY8',
    durationLabel: '30 mins',
    durationMinutes: 30,
    level: 'INTERMEDIATE',
    format: 'DEEP_DIVE',
    language: 'EN',
    description: 'Method overriding vs overloading, dynamic method dispatch, super keyword, and interface contracts.',
    topics: ['inheritance', 'polymorphism', 'abstract', 'interface', 'overriding', 'dispatch']
  },
  {
    id: 'oop-3',
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
    topics: ['collections', 'framework', 'list', 'set', 'map', 'streams', 'generics']
  },
  {
    id: 'oop-4',
    title: 'Exception Handling in Java — Try, Catch, Finally & Custom Exceptions',
    channel: 'Java Brains',
    embedUrl: 'https://www.youtube.com/embed/1XAfapkBQjk',
    watchUrl: 'https://www.youtube.com/watch?v=1XAfapkBQjk',
    durationLabel: '32 mins',
    durationMinutes: 32,
    level: 'INTERMEDIATE',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Checked vs unchecked exceptions, try-with-resources, throwing custom business exceptions, and logging.',
    topics: ['exception', 'robustness', 'handling', 'error', 'try-catch', 'debugging']
  },

  // Databases & SQL
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
    topics: ['database', 'schema', 'relational', 'design', 'normalization', '3nf', 'sql']
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
    topics: ['sql', 'query', 'optimization', 'indexes', 'b-tree', 'performance', 'explain']
  },
  {
    id: 'sql-3',
    title: 'Spring Data JPA & Hibernate Mapping Crash Course',
    channel: 'Amigoscode',
    embedUrl: 'https://www.youtube.com/embed/8SGI_XS5OPw',
    watchUrl: 'https://www.youtube.com/watch?v=8SGI_XS5OPw',
    durationLabel: '1 hr 10m',
    durationMinutes: 70,
    level: 'INTERMEDIATE',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Entity relationships (@OneToMany, @ManyToOne), Lazy loading, derived repository methods, and JPQL.',
    topics: ['spring data', 'jpa', 'hibernate', 'mapping', 'orm', 'entity', 'repositories']
  },

  // Spring Boot & Web APIs
  {
    id: 'spring-1',
    title: 'Spring Boot 3 Full Course — Build REST APIs',
    channel: 'Amigoscode',
    embedUrl: 'https://www.youtube.com/embed/9SGDpanrc8U',
    watchUrl: 'https://www.youtube.com/watch?v=9SGDpanrc8U',
    durationLabel: '2 hours',
    durationMinutes: 120,
    level: 'INTERMEDIATE',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Complete hands-on guide to building scalable, production-ready REST controllers with Spring Boot 3.',
    topics: ['spring boot', 'rest', 'controllers', 'web services', 'api', 'endpoints']
  },
  {
    id: 'spring-2',
    title: 'Spring Boot Validation & Global Exception Handling',
    channel: 'Daily Code Buffer',
    embedUrl: 'https://www.youtube.com/embed/L5bkgp5tCqg',
    watchUrl: 'https://www.youtube.com/watch?v=L5bkgp5tCqg',
    durationLabel: '25 mins',
    durationMinutes: 25,
    level: 'INTERMEDIATE',
    format: 'CRASH_COURSE',
    language: 'EN',
    description: 'Implementing @RestControllerAdvice, custom error responses, and Jakarta @Valid request validation.',
    topics: ['validation', 'error handling', 'restcontrolleradvice', 'bad request', 'dto']
  },
  {
    id: 'spring-3',
    title: 'Spring Security 6 & JWT Authentication Full Tutorial',
    channel: 'Amigoscode',
    embedUrl: 'https://www.youtube.com/embed/KxqlJblhzfI',
    watchUrl: 'https://www.youtube.com/watch?v=KxqlJblhzfI',
    durationLabel: '1 hr 30m',
    durationMinutes: 90,
    level: 'ADVANCED',
    format: 'DEEP_DIVE',
    language: 'EN',
    description: 'Stateless authentication filter chain, token issuance, password encryption, and endpoint protection.',
    topics: ['spring security', 'jwt', 'authentication', 'security filter chain', 'authorization']
  },

  // Testing & Deployment
  {
    id: 'test-1',
    title: 'Spring Boot Unit & Integration Testing with MockMvc & JUnit 5',
    channel: 'Dan Vega',
    embedUrl: 'https://www.youtube.com/embed/F4jZkKXZH6Q',
    watchUrl: 'https://www.youtube.com/watch?v=F4jZkKXZH6Q',
    durationLabel: '42 mins',
    durationMinutes: 42,
    level: 'INTERMEDIATE',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Unit testing services with Mockito and integration testing REST endpoints with MockMvc.',
    topics: ['testing', 'integration testing', 'junit', 'mockmvc', 'mockito', 'quality']
  },
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
    topics: ['frontend integration', 'react', 'axios', 'ui', 'full stack', 'polish']
  },
  {
    id: 'deploy-1',
    title: 'Docker & Docker Compose for Full Stack Applications',
    channel: 'Traversy Media',
    embedUrl: 'https://www.youtube.com/embed/3c-iBn73dDE',
    watchUrl: 'https://www.youtube.com/watch?v=3c-iBn73dDE',
    durationLabel: '40 mins',
    durationMinutes: 40,
    level: 'ADVANCED',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Containerizing Java Spring Boot and React applications with MySQL multi-container Docker Compose.',
    topics: ['deployment', 'docker', 'docker compose', 'containers', 'devops', 'readme']
  },

  // Generic / Fitness / Productivity Fallbacks
  {
    id: 'fitness-1',
    title: 'Foundational Movement & Progressive Workout Pacing',
    channel: 'Jeremy Ethier',
    embedUrl: 'https://www.youtube.com/embed/tz_bH6c5mNk',
    watchUrl: 'https://www.youtube.com/watch?v=tz_bH6c5mNk',
    durationLabel: '15 mins',
    durationMinutes: 15,
    level: 'BEGINNER',
    format: 'HANDS_ON',
    language: 'EN',
    description: 'Science-based mobility, dynamic stretching, posture alignment, and injury-free workout execution.',
    topics: ['fitness', 'workout', 'movement', 'stretching', 'mobility', 'baseline', 'conditioning']
  },
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
    topics: ['productivity', 'deep work', 'focus', 'planning', 'habits', 'consistency', 'review']
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
        embedUrl: trimmed,
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
 * Generates an optimized YouTube search URL based on user's exact topic specification.
 */
export function generateCustomYouTubeSearchUrl(
  topicTitle: string,
  userCustomKeywords?: string,
  format?: VideoSpecificationFormat,
  level?: VideoSpecificationLevel,
  language?: VideoSpecificationLanguage
): string {
  const queryParts: string[] = [topicTitle];

  if (userCustomKeywords && userCustomKeywords.trim()) {
    queryParts.push(userCustomKeywords.trim());
  }

  if (format && format !== 'ALL') {
    switch (format) {
      case 'CRASH_COURSE':
        queryParts.push('crash course overview');
        break;
      case 'HANDS_ON':
        queryParts.push('hands on tutorial step by step');
        break;
      case 'DEEP_DIVE':
        queryParts.push('deep dive complete architecture masterclass');
        break;
      case 'INTERVIEW_PREP':
        queryParts.push('interview questions common mistakes');
        break;
    }
  }

  if (level && level !== 'ALL') {
    queryParts.push(level.toLowerCase());
  }

  if (language && language !== 'ALL') {
    if (language === 'HI') queryParts.push('in hindi');
    if (language === 'ES') queryParts.push('en español');
  }

  queryParts.push('tutorial');
  const fullQuery = queryParts.join(' ');
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(fullQuery)}`;
}

/**
 * Matches topic title & user specifications to return curated recommendations.
 */
export function getVideosForTopic(
  topicTitle: string,
  milestoneTitle?: string,
  filters?: Partial<VideoSpecificationFilters>
): RecommendedVideo[] {
  const queryStr = `${topicTitle} ${milestoneTitle || ''} ${filters?.customKeywords || ''}`.toLowerCase();
  const queryWords = queryStr.split(/[\s,–—\-_/]+/).filter(w => w.length > 2);

  // Score each video in the catalog
  const scored = CURATED_VIDEO_CATALOG.map(video => {
    let score = 0;

    // Check topic keyword overlap
    for (const keyword of video.topics) {
      if (queryStr.includes(keyword)) {
        score += 8;
      }
      for (const word of queryWords) {
        if (keyword.includes(word) || word.includes(keyword)) {
          score += 4;
        }
      }
    }

    // Title match
    const videoTitleLower = video.title.toLowerCase();
    for (const word of queryWords) {
      if (videoTitleLower.includes(word)) {
        score += 5;
      }
    }

    // Filter by Level Specification
    if (filters?.level && filters.level !== 'ALL') {
      if (video.level === filters.level) {
        score += 6;
      } else {
        score -= 4;
      }
    }

    // Filter by Format Specification
    if (filters?.format && filters.format !== 'ALL') {
      if (video.format === filters.format) {
        score += 6;
      } else {
        score -= 3;
      }
    }

    // Filter by Language Specification
    if (filters?.language && filters.language !== 'ALL') {
      if (video.language === filters.language) {
        score += 8;
      } else {
        score -= 10;
      }
    }

    // Filter by Duration Specification
    if (filters?.duration && filters.duration !== 'ALL') {
      if (filters.duration === 'QUICK' && video.durationMinutes <= 15) score += 6;
      else if (filters.duration === 'MEDIUM' && video.durationMinutes > 15 && video.durationMinutes <= 45) score += 6;
      else if (filters.duration === 'COMPREHENSIVE' && video.durationMinutes > 45) score += 6;
    }

    return { video, score };
  });

  // Sort descending by relevance score
  scored.sort((a, b) => b.score - a.score);

  // Return top matching videos (at least 3 fallback videos)
  const results = scored.filter(s => s.score > 0).map(s => s.video);

  if (results.length < 3) {
    // Append general top-rated fallbacks if fewer than 3 matches
    for (const item of CURATED_VIDEO_CATALOG) {
      if (!results.some(r => r.id === item.id)) {
        results.push(item);
        if (results.length >= 4) break;
      }
    }
  }

  return results.slice(0, 6);
}
