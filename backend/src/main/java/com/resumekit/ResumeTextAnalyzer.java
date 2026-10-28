package com.resumekit;

import java.util.*;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/** Deterministic resume signals used by demo mode and as guardrails around AI output. */
@Component
class ResumeTextAnalyzer {
    private static final Pattern EMAIL = Pattern.compile("[\\w.+-]+@[\\w-]+\\.[\\w.-]+");
    private static final Pattern URL = Pattern.compile("(?i)\\b(?:https?://|www\\.)\\S+");
    private static final Pattern METRIC = Pattern.compile("(?i)(\\b\\d+(?:\\.\\d+)?\\s*%|\\$\\s*\\d[\\d,.]*|\\b\\d[\\d,.]*\\s*\\+?\\s*(?:users|customers|people|projects|years|months))");
    private static final Pattern DATE = Pattern.compile("(?i)\\b(?:19|20)\\d{2}\\s*(?:-|–|—|to)\\s*(?:present|current|(?:19|20)\\d{2})\\b");
    private static final List<String> TERMS = List.of(
            // Core professional skills
            "leadership","management","strategy","stakeholder","communication","collaboration","project management",
            "problem solving","critical thinking","teamwork","decision making","mentoring","coaching",
            // Research & analysis
            "research","analytics","data analysis","business intelligence","market research","user research",
            "usability testing","a/b testing","statistical analysis","forecasting","modeling",
            // Web & frontend development
            "javascript","typescript","react","vue","angular","html","css","responsive design","web development",
            "frontend","ui development","user interface","material design","bootstrap","tailwind",
            // Backend & API development
            "java","python","php","node.js","ruby","go","rust","c#","dotnet","backend","api","rest","graphql",
            "microservices","web services","server side","programming",
            // Mobile development
            "mobile","ios","android","swift","kotlin","flutter","react native","cross platform",
            // Database & data
            "sql","mysql","postgresql","mongodb","nosql","database","redis","elasticsearch","data warehouse",
            "bigquery","snowflake","cassandra","dynamodb",
            // Cloud & DevOps
            "aws","azure","gcp","google cloud","cloud computing","docker","kubernetes","devops","ci/cd",
            "jenkins","gitlab","github actions","terraform","infrastructure as code","containerization",
            "cloud architecture","serverless","lambda",
            // Design & UX
            "figma","sketch","adobe xd","design","ux design","ui design","prototyping","accessibility",
            "design systems","wireframing","mockup","user experience","visual design","interaction design",
            "illustration","graphics","adobe creative",
            // Product & planning
            "product management","roadmap","product strategy","requirement gathering","agile","scrum","kanban",
            "jira","asana","monday.com","confluence","documentation","technical writing",
            // Testing & QA
            "testing","quality assurance","test automation","selenium","junit","pytest","cypress","manual testing",
            "regression testing","performance testing","load testing","security testing",
            // Data science & ML
            "machine learning","deep learning","artificial intelligence","tensorflow","pytorch","scikit learn",
            "natural language processing","computer vision","data science","predictive analytics",
            "neural networks","supervised learning","unsupervised learning",
            // Tools & frameworks
            "excel","tableau","power bi","looker","d3.js","visualization","git","svn","version control",
            "jira","confluence","slack","sharepoint","linux","unix","windows","mac",
            // Security & compliance
            "security","cybersecurity","information security","compliance","gdpr","ccpa","encryption",
            "authentication","authorization","access control","vulnerability assessment","penetration testing",
            // Business & marketing
            "marketing","digital marketing","seo","sem","content marketing","email marketing","social media",
            "analytics","customer support","crm","sales","business development","account management",
            "customer success","retention","customer satisfaction",
            // Additional technical
            "performance optimization","scalability","reliability","monitoring","logging","troubleshooting",
            "debugging","code review","refactoring","design patterns","architecture","integration",
            "automation","scripting","batch processing"
    );

    ResumeSignals inspect(String resume, String targetRole, String jobDescription) {
        String text = normalize(resume);
        List<String> lines = nonEmptyLines(text);
        List<String> bullets = lines.stream().filter(this::isBullet).map(this::stripBullet).toList();
        List<String> metrics = findAll(METRIC, text);
        List<String> links = findAll(URL, text);
        List<String> emails = findAll(EMAIL, text);
        List<String> dates = findAll(DATE, text);
        Set<String> present = lower(text);
        String targetContext = (value(targetRole) + " " + value(jobDescription)).toLowerCase(Locale.ROOT);
        Set<String> targetTerms = lower(targetContext);
        boolean hasTarget = !targetContext.isBlank();
        List<String> matched = TERMS.stream().filter(term -> containsTerm(text, term))
                .filter(term -> !hasTarget || targetMatches(term, targetContext, targetTerms)).toList();
        List<String> missing = hasTarget
                ? TERMS.stream().filter(t -> targetMatches(t, targetContext, targetTerms))
                    .filter(t -> !containsTerm(text, t)).toList()
                : List.of();
        return new ResumeSignals(text, lines, bullets, metrics, links, emails, dates, matched, missing,
                sectionNames(text), wordCount(text), text.length(), bulletsWithAction(bullets), chronological(dates));
    }
    ResumeSignals inspect(String resume) { return inspect(resume, "", ""); }

    String normalize(String value) {
        if (value == null) return "";
        return value.replace("\u0000", "").replace("\r\n", "\n").replace('\r', '\n').trim();
    }
    private List<String> nonEmptyLines(String text) {
        return Arrays.stream(text.split("\n")).map(String::trim).filter(s -> !s.isBlank()).toList();
    }
    private boolean isBullet(String line) { return line.matches("^[•●▪◦*-]\\s+.+") || line.matches("^\\d+[.)]\\s+.+"); }
    private String stripBullet(String line) { return line.replaceFirst("^[•●▪◦*-]\\s+|^\\d+[.)]\\s+", "").trim(); }
    private List<String> findAll(Pattern pattern, String text) {
        var matcher = pattern.matcher(text); List<String> values = new ArrayList<>();
        while (matcher.find()) values.add(matcher.group().replaceAll("[.,;)]$", ""));
        return values.stream().distinct().limit(30).toList();
    }
    private Set<String> lower(String text) {
        Set<String> values = new HashSet<>();
        for (String term : TERMS) if (containsTerm(text, term)) values.add(term);
        return values;
    }
    private List<String> sectionNames(String text) {
        List<String> names = new ArrayList<>();
        for (String line : nonEmptyLines(text)) {
            String candidate = line.toLowerCase(Locale.ROOT).replaceAll("[^a-z ]", "").trim();
            if (Set.of("summary","profile","experience","employment","work experience","education","skills","projects","certifications","awards").contains(candidate)) names.add(candidate);
        }
        return names;
    }
    private int wordCount(String text) { return text.isBlank() ? 0 : text.trim().split("\\s+").length; }
    private List<String> bulletsWithAction(List<String> bullets) {
        return bullets.stream().filter(b -> b.matches("(?i).*(led|built|created|improved|managed|delivered|designed|launched|reduced|increased|developed|owned).*")).toList();
    }
    private boolean chronological(List<String> dates) {
        int previous = Integer.MAX_VALUE;
        for (String date : dates) {
            var years = date.replaceAll("[^0-9 ]", " ").trim().split("\\s+");
            if (years.length == 0) continue;
            try { int year = Integer.parseInt(years[0]); if (year > previous) return false; previous = year; } catch (NumberFormatException ignored) { }
        }
        return true;
    }
    private String value(String value) { return value == null ? "" : value; }
    private boolean relatedTargetTerm(String term, Set<String> targetTerms) {
        return (term.equals("strategy") && (targetTerms.contains("design") || targetTerms.contains("product")))
                || (term.equals("design systems") && targetTerms.contains("design"));
    }
    private boolean targetMatches(String term, String rawContext, Set<String> targetTerms) {
        return rawContext.contains(term) || relatedTargetTerm(term, targetTerms)
                || (term.equals("design systems") && rawContext.contains("design"));
    }
    private boolean containsTerm(String text, String term) {
        String expression = "(?i)(?<![\\p{Alnum}])" + termExpression(term) + "(?![\\p{Alnum}])";
        if (Pattern.compile(expression).matcher(text).find()) return true;
        return term.endsWith("s") && Pattern.compile("(?i)(?<![\\p{Alnum}])"
                + termExpression(term.substring(0, term.length() - 1)) + "(?![\\p{Alnum}])").matcher(text).find();
    }
    private String termExpression(String term) {
        return String.join("\\s+", Arrays.stream(term.split(" ")).map(Pattern::quote).toList());
    }
}

record ResumeSignals(String text, List<String> lines, List<String> bullets, List<String> metrics,
                     List<String> links, List<String> emails, List<String> dates,
                     List<String> matchedTerms, List<String> missingTerms, List<String> sections,
                     int words, int characters, List<String> actionBullets, boolean chronological) {
    boolean hasContact() { return !emails.isEmpty() || !links.isEmpty(); }
    boolean hasImpact() { return !metrics.isEmpty(); }
    boolean hasUsefulStructure() { return sections.size() >= 2 && !bullets.isEmpty(); }
}
