package com.resumekit;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Validates whether an uploaded document or text payload is a legitimate resume / CV.
 * Rejects non-resume content (source code, invoices, recipes, legal terms, grocery lists, random notes).
 */
public final class ResumeValidator {

    private static final Pattern CODE_INDICATOR = Pattern.compile(
            "(?m)^\\s*(import\\s+[a-z0-9_.]+|package\\s+[a-z0-9_.]+|#include\\s*<|public\\s+class\\s+|def\\s+[a-z_][a-z0-9_]*\\s*\\(|class\\s+[A-Za-z0-9_]+\\s*:\\s*$|function\\s+[a-z_]|const\\s+[a-z_].*=\\s*require|<!DOCTYPE\\s+html|<html[\\s>])");

    private static final Pattern INVOICE_INDICATOR = Pattern.compile(
            "(?i)\\b(invoice\\s+(?:number|#|no|date)|bill\\s+to\\s*:|amount\\s+due|total\\s+due|subtotal\\s*:|remit\\s+(?:payment|to)|due\\s+date\\s*:)\\b");

    private static final Pattern LEGAL_OR_POLICY_INDICATOR = Pattern.compile(
            "(?i)\\b(terms\\s+of\\s+service|privacy\\s+policy|terms\\s+and\\s+conditions|end\\s+user\\s+license\\s+agreement|all\\s+rights\\s+reserved|governing\\s+law\\s+and\\s+jurisdiction)\\b");

    private static final Pattern RECIPE_INDICATOR = Pattern.compile(
            "(?i)\\b(prep\\s+time\\s*:|cook\\s+time\\s*:|servings\\s*:|preheat\\s+oven|tablespoons?\\s+of|teaspoons?\\s+of)\\b");

    private static final Pattern RESUME_TITLE_KEYWORD = Pattern.compile(
            "(?i)\\b(r[ée]sum[ée]|curriculum\\s+vitae|\\bcv\\b)");

    private static final Pattern SECTION_HEADING = Pattern.compile(
            "(?i)^[\\s#*•-]*\\b(experience|work|employment|career|history|positions|education|academic|qualifications?|degree|degrees|skills?|technical|technologies|proficiencies|competencies|summary|profile|objective|statement|about\\s+me|projects?|portfolio|certifications?|certificates?|credentials|licenses?|awards?|honors?|coursework|training|background|achievements?|expertise)\\b.*",
            Pattern.MULTILINE);

    private static final Pattern DATE_RANGE = Pattern.compile(
            "(?i)\\b(?:19|20)\\d{2}\\s*(?:-|–|—|to|/)\\s*(?:present|current|now|(?:19|20)\\d{2}|\\d{2})\\b|"
            + "\\b(?:0?[1-9]|1[0-2])/(?:19|20)?\\d{2}\\b|"
            + "\\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\.?\\s+(?:19|20)?\\d{2}\\b|"
            + "\\b(?:since|from)\\s+(?:19|20)\\d{2}\\b");

    private static final Pattern CONTACT_EMAIL = Pattern.compile(
            "[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}");

    private static final Pattern CONTACT_PHONE = Pattern.compile(
            "(?:\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}");

    private static final Pattern CONTACT_LINK = Pattern.compile(
            "(?i)\\b(?:linkedin\\.com/in/|github\\.com/)\\S+");

    private static final Pattern ROLE_TITLES = Pattern.compile(
            "(?i)\\b(engineer|developer|designer|manager|specialist|analyst|consultant|coordinator|director|lead|intern|associate|architect|administrator|officer|technician|representative|executive|supervisor|assistant|nurse|accountant|scientist|teacher|sales|recruiter|programmer|writer|editor|founder|co-founder|vp|head|fellow|student|researcher|candidate)\\b");

    private static final Pattern ACTION_VERBS = Pattern.compile(
            "(?i)\\b(led|built|created|improved|managed|delivered|designed|launched|reduced|increased|developed|owned|coordinated|implemented|maintained|collaborated|achieved|analyzed|spearheaded|streamlined|supervised|engineered|programmed|supported|resolved|guided|facilitated|trained|negotiated|authored|presented|automated|researched)\\b");

    private static final Pattern BULLET_POINT = Pattern.compile(
            "(?m)^[\\s•●▪◦*-]+\\s+\\S+|^\\s*\\d+[.)]\\s+\\S+");

    private static final Pattern COMMON_TECH_OR_SKILL = Pattern.compile(
            "(?i)\\b(java|python|javascript|typescript|c\\+\\+|c#|sql|html|css|react|angular|vue|aws|azure|gcp|docker|kubernetes|linux|git|agile|scrum|figma|analytics|excel|word|powerpoint|spring|node|nodejs|express|django|flask|rest|api|devops|cloud|tableau|powerbi|machine\\s+learning|data)\\b");

    private ResumeValidator() {}

    public static boolean isResume(String text) {
        if (text == null) return false;
        String trimmed = text.trim();
        if (trimmed.length() < 25) return false;

        String[] words = trimmed.split("\\s+");
        if (words.length < 5) return false;

        // Check for strong non-resume indicators (source code, invoices, recipes, legal terms)
        int codeMatches = countMatches(CODE_INDICATOR, trimmed);
        int invoiceMatches = countMatches(INVOICE_INDICATOR, trimmed);
        int legalMatches = countMatches(LEGAL_OR_POLICY_INDICATOR, trimmed);
        int recipeMatches = countMatches(RECIPE_INDICATOR, trimmed);

        // Resume positive signals
        int sectionCount = countSectionHeadings(trimmed);
        boolean hasResumeKeyword = RESUME_TITLE_KEYWORD.matcher(trimmed).find();
        boolean hasDateRange = DATE_RANGE.matcher(trimmed).find();
        boolean hasContact = CONTACT_EMAIL.matcher(trimmed).find() || CONTACT_PHONE.matcher(trimmed).find() || CONTACT_LINK.matcher(trimmed).find();
        boolean hasRole = ROLE_TITLES.matcher(trimmed).find();
        int actionCount = countMatches(ACTION_VERBS, trimmed);
        int bulletCount = countMatches(BULLET_POINT, trimmed);
        boolean hasKnownSkill = COMMON_TECH_OR_SKILL.matcher(trimmed).find();

        // Immediate disqualification if strong anti-patterns match and no resume sections/keywords/contacts
        if ((codeMatches >= 1 || invoiceMatches >= 2 || legalMatches >= 1 || recipeMatches >= 1) && sectionCount == 0 && !hasResumeKeyword && !hasContact) {
            return false;
        }

        // Calculate confidence score
        int score = 0;
        if (hasResumeKeyword) score += 4;
        score += Math.min(sectionCount * 3, 9);
        if (hasDateRange) score += 3;
        if (hasContact) score += 3;
        if (hasRole) score += 2;
        if (actionCount >= 3) score += 3;
        else if (actionCount >= 1) score += 1;
        if (bulletCount >= 2) score += 2;
        if (hasKnownSkill) score += 2;

        boolean structuralAnchor = (sectionCount >= 1)
                || hasResumeKeyword
                || (hasRole && (hasDateRange || hasKnownSkill || actionCount >= 1))
                || (hasContact && (hasKnownSkill || hasRole || sectionCount >= 1))
                || (hasDateRange && (hasKnownSkill || actionCount >= 1));

        return score >= 4 && structuralAnchor;
    }

    private static int countSectionHeadings(String text) {
        int count = 0;
        Matcher m = SECTION_HEADING.matcher(text);
        while (m.find()) {
            count++;
            if (count >= 10) break;
        }
        return count;
    }

    private static int countMatches(Pattern pattern, String text) {
        Matcher matcher = pattern.matcher(text);
        int count = 0;
        while (matcher.find()) {
            count++;
            if (count >= 10) break;
        }
        return count;
    }
}
