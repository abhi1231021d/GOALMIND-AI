package com.resumekit;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.springframework.stereotype.Service;

/** Generates selectable-text PDF and editable DOCX documents from source-backed resume content. */
@Service
class SubmissionDocumentService {
    private static final Pattern HEADING = Pattern.compile(
            "(?i)^(summary|professional summary|profile|objective|experience|work experience|employment|education|skills|technical skills|projects|certifications|awards|publications|volunteer experience|languages|selected impact|core skills)$");
    private static final Set<String> TEMPLATES = Set.of("classic", "sidebar", "editorial", "modern", "bold");
    private static final java.util.Map<String, Color> ACCENTS = java.util.Map.of(
            "ocean", new Color(43, 93, 132), "teal", new Color(26, 112, 104),
            "plum", new Color(111, 71, 112), "ember", new Color(174, 82, 49));
    private static final List<String> REVIEW_CHECKLIST = List.of(
            "Confirm your name, contact details, dates, titles, and every achievement against the original.",
            "Check that candidate-provided details are accurate and appropriate for this application.",
            "Review the target role; job-description text is not copied as candidate evidence.",
            "Resolve or remove every clearly marked placeholder before submitting.",
            "Open the exported file and check page breaks, text, and formatting before submission.");
    private static final Color BLUE = new Color(42, 91, 130);

    ResumeDocumentPreview prepare(ResumeDocumentRequest request, String source) {
        if (request == null) throw new IllegalArgumentException("Document request is required.");
        if (source == null || source.isBlank()) throw new IllegalArgumentException("Resume text is required.");
        if (source.length() > 300_000) throw new IllegalArgumentException("Resume text is too large.");
        String template = canonicalTemplate(request.template());
        String role = safeField(request.targetRole(), "Target role", 160);
        String details = safeField(request.experienceDetails(), "Candidate details", 3_000);
        String accent = normalizeAccent(request.accentColor());
        List<ResumeDocumentBlock> blocks = new ArrayList<>();
        boolean nameSeen = false;
        boolean hasSummary = false;
        boolean sidebarTemplate = template.equals("sidebar");
        String activeColumn = "main";
        for (String raw : normalize(source).split("\n", -1)) {
            String line = raw.strip();
            if (line.isEmpty()) {
                if (!blocks.isEmpty() && !blocks.get(blocks.size() - 1).type().equals("spacer"))
                    blocks.add(new ResumeDocumentBlock("spacer", "", activeColumn));
                continue;
            }
            if (!nameSeen) {
                activeColumn = sidebarTemplate ? "sidebar" : "main";
                blocks.add(new ResumeDocumentBlock("name", line, activeColumn));
                nameSeen = true;
                if (!role.isBlank()) blocks.add(new ResumeDocumentBlock("target", "Target role: " + role, activeColumn));
            } else if (HEADING.matcher(line).matches()) {
                hasSummary |= line.equalsIgnoreCase("summary") || line.equalsIgnoreCase("professional summary");
                activeColumn = sidebarTemplate && isSidebarSection(line) ? "sidebar" : "main";
                blocks.add(new ResumeDocumentBlock("heading", line.toUpperCase(Locale.ROOT), activeColumn));
            } else if (line.matches("^[•●▪◦*-]\\s+.*")) {
                blocks.add(new ResumeDocumentBlock("bullet", line.replaceFirst("^[•●▪◦*-]\\s*", ""), activeColumn));
            } else if (line.matches("(?i).*(?:[\\w.+-]+@[\\w.-]+\\.[a-z]{2,}|https?://\\S+|\\+?\\d[\\d ()-]{7,}\\d).*")) {
                activeColumn = sidebarTemplate ? "sidebar" : activeColumn;
                blocks.add(new ResumeDocumentBlock("contact", line, activeColumn));
            } else {
                blocks.add(new ResumeDocumentBlock("body", line, activeColumn));
            }
        }
        if (!details.isBlank()) {
            blocks.add(new ResumeDocumentBlock("heading", "CANDIDATE-PROVIDED DETAILS"));
            Arrays.stream(details.split("\\R")).map(String::strip).filter(line -> !line.isBlank())
                    .forEach(line -> blocks.add(new ResumeDocumentBlock("bullet", line, "main")));
        }
        boolean placeholders = request.includePlaceholders() && !hasSummary;
        if (placeholders) {
            blocks.add(new ResumeDocumentBlock("heading", "SUMMARY", "main"));
            blocks.add(new ResumeDocumentBlock("placeholder", "[ADD A VERIFIED PROFESSIONAL SUMMARY]", "main"));
        }
        return new ResumeDocumentPreview(template, baseFilename(template, role), role, List.copyOf(blocks),
                REVIEW_CHECKLIST, placeholders, accent);
    }

    byte[] toPdf(ResumeDocumentPreview preview) throws IOException {
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDType0Font font = PDType0Font.load(document, unicodeFont(preview.template()).toFile());
            List<ResumeDocumentBlock> sidebar = new ArrayList<>();
            List<ResumeDocumentBlock> main = new ArrayList<>();
            for (ResumeDocumentBlock block : preview.blocks()) {
                ("sidebar".equals(block.column()) ? sidebar : main).add(block);
            }
            if (sidebar.isEmpty()) main.add(0, new ResumeDocumentBlock("name", ""));
            List<PDPage> pages = new ArrayList<>();
            if (preview.template().equals("sidebar")) {
                drawSidebarPdf(document, pages, sidebar, main, font, preview);
            } else {
                drawMainPdf(document, pages, main, font, preview);
            }
            drawPageNumbers(document, pages, font);
            document.save(output);
            return output.toByteArray();
        } catch (IOException e) {
            throw e;
        } catch (Exception e) {
            throw new IOException("Resume text could not be encoded with the installed Unicode font.", e);
        }
    }

    byte[] toDocx(ResumeDocumentPreview preview) throws IOException {
        try (XWPFDocument document = new XWPFDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            document.getProperties().getCoreProperties().setTitle("Resume");
            document.getProperties().getCoreProperties().setCreator("AI Resume Analyzer");
            var margins = document.getDocument().getBody().addNewSectPr().addNewPgMar();
            margins.setLeft(java.math.BigInteger.valueOf(850));
            margins.setRight(java.math.BigInteger.valueOf(850));
            margins.setTop(java.math.BigInteger.valueOf(720));
            margins.setBottom(java.math.BigInteger.valueOf(720));

            if (preview.template().equals("sidebar")) {
                XWPFTable table = document.createTable(1, 2);
                table.setWidth("100%");
                table.getCTTbl().getTblPr().unsetTblBorders();
                table.getCTTbl().getTblPr().addNewTblBorders().addNewInsideV().setVal(
                        org.openxmlformats.schemas.wordprocessingml.x2006.main.STBorder.NIL);
                var leftCell = table.getRow(0).getCell(0);
                var rightCell = table.getRow(0).getCell(1);
                leftCell.setWidth("30%");
                rightCell.setWidth("70%");
                setCellFill(leftCell, preview.accentColor().substring(1));
                List<ResumeDocumentBlock> sidebar = new ArrayList<>();
                List<ResumeDocumentBlock> main = new ArrayList<>();
                for (ResumeDocumentBlock block : preview.blocks()) {
                    ("sidebar".equals(block.column()) ? sidebar : main).add(block);
                }
                appendSidebarCell(leftCell, sidebar, preview);
                appendMainCell(rightCell, main, preview);
            } else for (ResumeDocumentBlock block : preview.blocks()) {
                if (block.type().equals("spacer")) continue;
                XWPFParagraph paragraph = document.createParagraph();
                appendDocxBlock(paragraph, block, preview, false);
            }
            document.write(output);
            return output.toByteArray();
        } catch (RuntimeException e) {
            throw new IOException("Could not generate the editable DOCX resume.", e);
        }
    }

    String exportFilename(ResumeDocumentPreview preview, String format) {
        String extension = format.toLowerCase(Locale.ROOT);
        if (!Set.of("pdf", "docx").contains(extension))
            throw new IllegalArgumentException("Choose PDF or DOCX export.");
        return preview.filename() + "." + extension;
    }

    private PdfPage newPage(PDDocument document, List<PDPage> pages) {
        PDPage page = new PDPage(PDRectangle.LETTER);
        document.addPage(page);
        pages.add(page);
        return new PdfPage(page, 748);
    }

    private void drawMainPdf(PDDocument document, List<PDPage> pages, List<ResumeDocumentBlock> blocks,
                             PDType0Font font, ResumeDocumentPreview preview) throws IOException {
        PdfPage current = newPage(document, pages);
        Color accent = accent(preview.accentColor());
        if (preview.template().equals("bold")) {
            try (PDPageContentStream stream = new PDPageContentStream(document, current.page,
                    PDPageContentStream.AppendMode.APPEND, true, true)) {
                stream.setNonStrokingColor(accent);
                stream.addRect(0, 780, 612, 12);
                stream.fill();
            }
            current.y = 724;
        }
        boolean editorial = preview.template().equals("editorial");
        for (ResumeDocumentBlock block : blocks) {
            if (block.type().equals("spacer")) { current.y -= 6; continue; }
            float size = pdfSize(preview.template(), block.type());
            float leading = size * 1.38f;
            float left = preview.template().equals("bold") ? 68 : 54;
            List<String> lines = wrap(block.text(), font, size, 612 - left - 54);
            if (current.y - leading * (block.type().equals("heading") ? 2 : 1) < 50)
                current = newPage(document, pages);
            if (block.type().equals("heading") && editorial) {
                current.y -= 5;
                try (PDPageContentStream stream = new PDPageContentStream(document, current.page,
                        PDPageContentStream.AppendMode.APPEND, true, true)) {
                    stream.setStrokingColor(accent);
                    stream.setLineWidth(1.2f);
                    stream.moveTo(left, current.y - 3);
                    stream.lineTo(558, current.y - 3);
                    stream.stroke();
                }
            }
            for (int i = 0; i < lines.size(); i++) {
                if (current.y < 50) current = newPage(document, pages);
                try (PDPageContentStream stream = new PDPageContentStream(document, current.page,
                        PDPageContentStream.AppendMode.APPEND, true, true)) {
                    stream.beginText();
                    stream.setFont(font, size);
                    stream.setNonStrokingColor(pdfColor(preview, block.type()));
                    float x = left + (block.type().equals("bullet") ? 14 : 0);
                    if (preview.template().equals("modern")
                            && (block.type().equals("name") || block.type().equals("target")))
                        x = Math.max(54, (612 - font.getStringWidth(lines.get(i)) * size / 1000) / 2);
                    stream.newLineAtOffset(x, current.y);
                    stream.showText(block.type().equals("bullet") && i == 0 ? "•  " + lines.get(i) : lines.get(i));
                    stream.endText();
                }
                current.y -= leading;
            }
            if (block.type().equals("heading")) current.y -= 4;
        }
    }

    private void drawSidebarPdf(PDDocument document, List<PDPage> pages, List<ResumeDocumentBlock> sidebar,
                                List<ResumeDocumentBlock> main, PDType0Font font,
                                ResumeDocumentPreview preview) throws IOException {
        int leftPages = requiredPages(sidebar, font, 152);
        int rightPages = requiredPages(main, font, 344);
        int count = Math.max(1, Math.max(leftPages, rightPages));
        for (int index = 0; index < count; index++) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            document.addPage(page);
            pages.add(page);
            try (PDPageContentStream stream = new PDPageContentStream(document, page)) {
                stream.setNonStrokingColor(accent(preview.accentColor()));
                stream.addRect(0, 0, 190, 792);
                stream.fill();
            }
            drawColumn(document, page, sidebar, index, font, 22, 152, 742,
                    Color.WHITE, true, accent(preview.accentColor()));
            drawColumn(document, page, main, index, font, 214, 344, 742,
                    new Color(35, 44, 52), false, accent(preview.accentColor()));
        }
    }

    private int requiredPages(List<ResumeDocumentBlock> blocks, PDType0Font font, float width) throws IOException {
        float used = 0;
        for (ResumeDocumentBlock block : blocks) {
            if (block.type().equals("spacer")) { used += 5; continue; }
            float size = block.type().equals("name") ? 19 : block.type().equals("heading") ? 10 : 8.5f;
            used += Math.max(1, wrap(block.text(), font, size, width).size()) * size * 1.4f + 4;
        }
        return Math.max(1, (int) Math.ceil(used / 685));
    }

    private void drawColumn(PDDocument document, PDPage page, List<ResumeDocumentBlock> blocks, int pageIndex,
                            PDType0Font font, float x, float width, float top, Color textColor,
                            boolean sidebar, Color accentColor) throws IOException {
        float consumed = 0;
        for (ResumeDocumentBlock block : blocks) {
            if (block.type().equals("spacer")) { consumed += 5; continue; }
            float size = block.type().equals("name") ? 19 : block.type().equals("heading") ? 10 : block.type().equals("target") ? 8.5f : 8.5f;
            float leading = size * 1.4f;
            List<String> lines = wrap(block.text(), font, size, width);
            float blockHeight = lines.size() * leading + (block.type().equals("heading") ? 8 : 4);
            float pageStart = pageIndex * 685;
            if (consumed + blockHeight > pageStart && consumed < pageStart + 685) {
                float lineStart = Math.max(0, pageStart - consumed);
                for (int i = 0; i < lines.size(); i++) {
                    float lineOffset = i * leading;
                    if (lineOffset + leading <= lineStart || lineOffset + leading > lineStart + 685) continue;
                    try (PDPageContentStream stream = new PDPageContentStream(document, page,
                            PDPageContentStream.AppendMode.APPEND, true, true)) {
                        stream.beginText();
                        stream.setFont(font, size);
                        stream.setNonStrokingColor(block.type().equals("heading") && !sidebar ? accentColor : textColor);
                        stream.newLineAtOffset(x + (block.type().equals("bullet") ? 8 : 0),
                                top - (consumed - pageStart) - lineOffset);
                        String line = block.type().equals("bullet") && i == 0 ? "•  " + lines.get(i) : lines.get(i);
                        stream.showText(line);
                        stream.endText();
                    }
                }
            }
            consumed += blockHeight;
        }
    }

    private void drawPageNumbers(PDDocument document, List<PDPage> pages, PDType0Font font) throws IOException {
        for (int i = 0; i < pages.size(); i++) {
            try (PDPageContentStream stream = new PDPageContentStream(document, pages.get(i),
                    PDPageContentStream.AppendMode.APPEND, true, true)) {
                stream.beginText();
                stream.setFont(font, 8);
                stream.setNonStrokingColor(new Color(115, 126, 137));
                stream.newLineAtOffset(500, 25);
                stream.showText((i + 1) + " / " + pages.size());
                stream.endText();
            }
        }
    }

    private void appendDocxBlock(XWPFParagraph paragraph, ResumeDocumentBlock block,
                                 ResumeDocumentPreview preview, boolean sidebar) {
        paragraph.setSpacingAfter(block.type().equals("heading") ? 100 : 55);
        if (preview.template().equals("modern")) {
            paragraph.setSpacingAfter(block.type().equals("heading") ? 180 : 85);
            if (block.type().equals("name") || block.type().equals("target"))
                paragraph.setAlignment(org.apache.poi.xwpf.usermodel.ParagraphAlignment.CENTER);
        }
        if (block.type().equals("heading")) paragraph.setKeepNext(true);
        if (block.type().equals("bullet")) {
            paragraph.setIndentationLeft(260);
            paragraph.setFirstLineIndent(-180);
        }
        String text = block.type().equals("bullet") ? "•  " + block.text() : block.text();
        XWPFRun run = paragraph.createRun();
        setRun(run, text, docxSize(preview.template(), block.type()), docxColor(preview, block.type(), sidebar),
                block.type().equals("name") || block.type().equals("heading"),
                block.type().equals("placeholder"));
        run.setFontFamily(preview.template().equals("editorial") ? "Georgia" : "Arial");
        if (preview.template().equals("bold") && block.type().equals("name") && !sidebar) {
            run.setColor("FFFFFF");
            paragraph.getCTP().addNewPPr().addNewShd().setFill(preview.accentColor().substring(1));
            paragraph.setSpacingBefore(160);
            paragraph.setSpacingAfter(160);
        }
    }

    private void setCellFill(org.apache.poi.xwpf.usermodel.XWPFTableCell cell, String color) {
        cell.setColor(color);
    }

    private void appendSidebarCell(org.apache.poi.xwpf.usermodel.XWPFTableCell cell,
                                   List<ResumeDocumentBlock> blocks, ResumeDocumentPreview preview) {
        boolean first = true;
        for (ResumeDocumentBlock block : blocks) {
            if (block.type().equals("spacer")) continue;
            XWPFParagraph paragraph = first ? cell.getParagraphs().get(0) : cell.addParagraph();
            first = false;
            appendDocxBlock(paragraph, block, preview, true);
        }
    }

    private void appendMainCell(org.apache.poi.xwpf.usermodel.XWPFTableCell cell,
                                List<ResumeDocumentBlock> blocks, ResumeDocumentPreview preview) {
        boolean first = true;
        for (ResumeDocumentBlock block : blocks) {
            if (block.type().equals("spacer")) continue;
            XWPFParagraph paragraph = first ? cell.getParagraphs().get(0) : cell.addParagraph();
            first = false;
            appendDocxBlock(paragraph, block, preview, false);
        }
    }

    private boolean isSidebarSection(String heading) {
        String value = heading.toLowerCase(Locale.ROOT);
        return value.contains("skill") || value.contains("education") || value.contains("language")
                || value.contains("certification") || value.contains("contact");
    }

    private List<String> wrap(String text, PDType0Font font, float size, float maxWidth) throws IOException {
        if (text.isEmpty()) return List.of("");
        List<String> result = new ArrayList<>();
        StringBuilder line = new StringBuilder();
        for (String word : text.split("\\s+")) {
            String candidate = line.isEmpty() ? word : line + " " + word;
            if (!line.isEmpty() && font.getStringWidth(candidate) * size / 1000 > maxWidth) {
                result.add(line.toString());
                line.setLength(0);
                line.append(word);
            } else {
                if (!line.isEmpty()) line.append(' ');
                line.append(word);
            }
            if (font.getStringWidth(line.toString()) * size / 1000 > maxWidth) {
                StringBuilder chunk = new StringBuilder();
                for (int offset = 0; offset < line.length();) {
                    int end = line.offsetByCodePoints(offset, 1);
                    String point = line.substring(offset, end);
                    if (!chunk.isEmpty() && font.getStringWidth(chunk + point) * size / 1000 > maxWidth) {
                        result.add(chunk.toString());
                        chunk.setLength(0);
                    }
                    chunk.append(point);
                    offset = end;
                }
                line.setLength(0);
                line.append(chunk);
            }
        }
        if (!line.isEmpty()) result.add(line.toString());
        return result;
    }

    private Path unicodeFont(String template) throws IOException {
        List<Path> serifCandidates = List.of(Path.of("C:\\Windows\\Fonts\\georgia.ttf"),
                Path.of("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"),
                Path.of("/Library/Fonts/Georgia.ttf"));
        if (template.equals("editorial")) {
            Path serif = serifCandidates.stream().filter(Files::isRegularFile).findFirst().orElse(null);
            if (serif != null) return serif;
        }
        List<Path> candidates = List.of(
                Path.of("C:\\Windows\\Fonts\\arial.ttf"),
                Path.of("C:\\Windows\\Fonts\\segoeui.ttf"),
                Path.of("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
                Path.of("/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf"),
                Path.of("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"),
                Path.of("/Library/Fonts/Arial Unicode.ttf"),
                Path.of("/System/Library/Fonts/Supplemental/Arial Unicode.ttf"));
        return candidates.stream().filter(Files::isRegularFile).findFirst()
                .orElseThrow(() -> new IOException("Install Arial, Segoe UI, or DejaVu Sans to export Unicode PDF text."));
    }

    private float pdfSize(String type) {
        return pdfSize("classic", type);
    }

    private float pdfSize(String template, String type) {
        if (type.equals("name") && (template.equals("modern") || template.equals("bold"))) return 24;
        if (type.equals("name") && template.equals("editorial")) return 25;
        return switch (type) {
            case "name" -> 22;
            case "target" -> 10;
            case "heading" -> 11;
            case "placeholder" -> 9;
            case "bullet" -> 9.2f;
            default -> 9.5f;
        };
    }

    private Color pdfColor(ResumeDocumentPreview preview, String type) {
        if (type.equals("placeholder")) return new Color(151, 83, 42);
        if (type.equals("target")) return new Color(88, 100, 112);
        if (!type.equals("name") && !type.equals("heading")) return new Color(35, 44, 52);
        return accent(preview.accentColor());
    }

    private int docxSize(String type) {
        return docxSize("classic", type);
    }

    private int docxSize(String template, String type) {
        if (template.equals("editorial") && type.equals("name")) return 25;
        if (template.equals("modern") && type.equals("name")) return 24;
        if (template.equals("bold") && type.equals("name")) return 24;
        return switch (type) {
            case "name" -> 22;
            case "target" -> 10;
            case "heading" -> 11;
            case "placeholder" -> 9;
            default -> 10;
        };
    }

    private String docxColor(ResumeDocumentPreview preview, String type, boolean sidebar) {
        if (type.equals("placeholder")) return "97532A";
        if (sidebar) return "FFFFFF";
        if (!type.equals("name") && !type.equals("heading")) return "232C34";
        return preview.accentColor().substring(1);
    }

    private void setRun(XWPFRun run, String text, int size, String color, boolean bold, boolean italic) {
        run.setText(text);
        run.setFontFamily("Arial");
        run.setFontSize(size);
        run.setColor(color);
        run.setBold(bold);
        run.setItalic(italic);
    }

    private String canonicalTemplate(String value) {
        String template = value == null ? "classic" : value.trim().toLowerCase(Locale.ROOT);
        return TEMPLATES.contains(template) ? template : "classic";
    }

    private String normalizeAccent(String value) {
        String candidate = value == null ? "ocean" : value.trim().toLowerCase(Locale.ROOT);
        if (!ACCENTS.containsKey(candidate)) throw new IllegalArgumentException("Choose a supported accent color.");
        return "#" + String.format("%02x%02x%02x", ACCENTS.get(candidate).getRed(),
                ACCENTS.get(candidate).getGreen(), ACCENTS.get(candidate).getBlue());
    }

    private Color accent(String hex) {
        return Color.decode(hex);
    }

    private Color accent(String key, boolean ignored) {
        return ACCENTS.getOrDefault(key, BLUE);
    }

    private Color accentFor(ResumeDocumentPreview preview) { return accent(preview.accentColor()); }

    private String safeField(String value, String label, int maximum) {
        String normalized = value == null ? "" : normalize(value);
        if (normalized.length() > maximum) throw new IllegalArgumentException(label + " is too long.");
        if (normalized.indexOf('\u0000') >= 0) throw new IllegalArgumentException(label + " contains an invalid character.");
        return normalized;
    }

    private String baseFilename(String template, String role) {
        String slug = role == null ? "" : Normalizer.normalize(role, Normalizer.Form.NFKD)
                .replaceAll("\\p{M}", "").replaceAll("[^A-Za-z0-9]+", "-")
                .replaceAll("^-+|-+$", "").toLowerCase(Locale.ROOT);
        if (slug.length() > 40) slug = slug.substring(0, 40);
        return "resume-" + (slug.isBlank() ? "candidate" : slug) + "-" + template;
    }

    private String normalize(String text) {
        return Pattern.compile("[\\p{Cntrl}&&[^\\r\\n\\t]]")
                .matcher(text.replace("\r\n", "\n").replace('\r', '\n').replace('\u0000', ' '))
                .replaceAll("").trim();
    }

    private static final class PdfPage {
        private final PDPage page;
        private float y;
        private PdfPage(PDPage page, float y) { this.page = page; this.y = y; }
    }
}
