package com.resumekit;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.TextPosition;

/**
 * Layout-aware PDF text stripper that detects multi-column resumes (e.g. sidebar layouts)
 * and extracts text in logical reading order rather than horizontal raster order.
 */
public class ColumnAwarePdfStripper extends PDFTextStripper {

    private final List<TextChar> pageChars = new ArrayList<>();
    private final StringBuilder resultBuilder = new StringBuilder();

    public ColumnAwarePdfStripper() throws IOException {
        super();
        setSortByPosition(true);
    }

    public static String extractText(byte[] pdfBytes) throws IOException {
        try (PDDocument document = PDDocument.load(new ByteArrayInputStream(pdfBytes))) {
            ColumnAwarePdfStripper stripper = new ColumnAwarePdfStripper();
            stripper.writeText(document, new java.io.StringWriter());
            return stripper.getExtractedText();
        }
    }

    public String getExtractedText() {
        return resultBuilder.toString();
    }

    @Override
    protected void startPage(PDPage page) throws IOException {
        pageChars.clear();
        super.startPage(page);
    }

    @Override
    protected void processTextPosition(TextPosition text) {
        if (text != null && text.getUnicode() != null && !text.getUnicode().isEmpty()) {
            pageChars.add(new TextChar(
                    text.getUnicode(),
                    text.getXDirAdj(),
                    text.getYDirAdj(),
                    text.getWidthDirAdj(),
                    text.getHeightDir(),
                    text.getFontSizeInPt()
            ));
        }
        super.processTextPosition(text);
    }

    @Override
    protected void endPage(PDPage page) throws IOException {
        super.endPage(page);
        if (pageChars.isEmpty()) {
            return;
        }

        PDRectangle cropBox = page.getCropBox() != null ? page.getCropBox() : page.getMediaBox();
        float pageWidth = cropBox != null ? cropBox.getWidth() : 612f;

        String pageText = processPageLayout(pageChars, pageWidth);
        if (!pageText.isBlank()) {
            if (!resultBuilder.isEmpty()) {
                resultBuilder.append("\n\n");
            }
            resultBuilder.append(pageText);
        }
        pageChars.clear();
    }

    private String processPageLayout(List<TextChar> chars, float pageWidth) {
        List<TextLine> lines = assembleLines(chars);
        if (lines.isEmpty()) {
            return "";
        }

        Gutter gutter = detectColumnGutter(lines, pageWidth);
        if (gutter == null) {
            // Single-column layout: order lines top-to-bottom
            return renderLines(lines);
        }

        // Multi-column layout: separate header, left column, right column, footer
        List<TextLine> headerLines = new ArrayList<>();
        List<TextLine> leftColumnLines = new ArrayList<>();
        List<TextLine> rightColumnLines = new ArrayList<>();
        List<TextLine> footerLines = new ArrayList<>();

        float splitX = (gutter.left + gutter.right) / 2.0f;
        float columnTop = gutter.topY;
        float columnBottom = gutter.bottomY;

        for (TextLine line : lines) {
            boolean isFullWidth = (line.maxX - line.minX) > (0.60f * pageWidth);
            if (isFullWidth && line.maxY <= columnTop) {
                headerLines.add(line);
            } else if (isFullWidth && line.minY >= columnBottom) {
                footerLines.add(line);
            } else if (line.centerX() < splitX) {
                leftColumnLines.add(line);
            } else {
                rightColumnLines.add(line);
            }
        }

        StringBuilder sb = new StringBuilder();
        if (!headerLines.isEmpty()) {
            sb.append(renderLines(headerLines));
        }

        String leftText = renderLines(leftColumnLines);
        String rightText = renderLines(rightColumnLines);

        if (!leftText.isBlank()) {
            if (!sb.isEmpty()) sb.append("\n\n");
            sb.append(leftText);
        }
        if (!rightText.isBlank()) {
            if (!sb.isEmpty()) sb.append("\n\n");
            sb.append(rightText);
        }
        if (!footerLines.isEmpty()) {
            String footerText = renderLines(footerLines);
            if (!footerText.isBlank()) {
                if (!sb.isEmpty()) sb.append("\n\n");
                sb.append(footerText);
            }
        }

        return sb.toString();
    }

    private List<TextLine> assembleLines(List<TextChar> chars) {
        if (chars.isEmpty()) return Collections.emptyList();

        List<TextChar> sorted = new ArrayList<>(chars);
        sorted.sort(Comparator.comparingDouble((TextChar c) -> c.y).thenComparingDouble(c -> c.x));

        List<List<TextChar>> lineClusters = new ArrayList<>();
        List<TextChar> currentCluster = new ArrayList<>();
        float currentY = -1;
        float currentHeight = 10f;

        for (TextChar c : sorted) {
            if (currentCluster.isEmpty()) {
                currentCluster.add(c);
                currentY = c.y;
                currentHeight = Math.max(8f, c.height);
            } else {
                float yDiff = Math.abs(c.y - currentY);
                if (yDiff <= Math.max(3.0f, currentHeight * 0.45f)) {
                    currentCluster.add(c);
                } else {
                    lineClusters.add(currentCluster);
                    currentCluster = new ArrayList<>();
                    currentCluster.add(c);
                    currentY = c.y;
                    currentHeight = Math.max(8f, c.height);
                }
            }
        }
        if (!currentCluster.isEmpty()) {
            lineClusters.add(currentCluster);
        }

        List<TextLine> lines = new ArrayList<>();
        for (List<TextChar> cluster : lineClusters) {
            lines.addAll(splitLineByHorizontalGaps(cluster));
        }

        lines.sort(Comparator.comparingDouble((TextLine l) -> l.minY).thenComparingDouble(l -> l.minX));
        return lines;
    }

    private List<TextLine> splitLineByHorizontalGaps(List<TextChar> cluster) {
        cluster.sort(Comparator.comparingDouble(c -> c.x));
        List<TextLine> result = new ArrayList<>();
        List<TextChar> currentSegment = new ArrayList<>();

        for (int i = 0; i < cluster.size(); i++) {
            TextChar c = cluster.get(i);
            if (currentSegment.isEmpty()) {
                currentSegment.add(c);
            } else {
                TextChar prev = currentSegment.get(currentSegment.size() - 1);
                float gap = c.x - (prev.x + prev.width);
                // If there's a huge gap on the same vertical line (> 28 points), split it across columns
                if (gap > 28.0f) {
                    result.add(createLine(currentSegment));
                    currentSegment = new ArrayList<>();
                }
                currentSegment.add(c);
            }
        }
        if (!currentSegment.isEmpty()) {
            result.add(createLine(currentSegment));
        }
        return result;
    }

    private TextLine createLine(List<TextChar> chars) {
        StringBuilder text = new StringBuilder();
        float minX = Float.MAX_VALUE;
        float maxX = -Float.MAX_VALUE;
        float minY = Float.MAX_VALUE;
        float maxY = -Float.MAX_VALUE;

        for (int i = 0; i < chars.size(); i++) {
            TextChar c = chars.get(i);
            minX = Math.min(minX, c.x);
            maxX = Math.max(maxX, c.x + c.width);
            minY = Math.min(minY, c.y);
            maxY = Math.max(maxY, c.y + c.height);

            if (i > 0) {
                TextChar prev = chars.get(i - 1);
                float gap = c.x - (prev.x + prev.width);
                if (gap > (prev.width * 0.25f) && !c.unicode.equals(" ") && !text.isEmpty() && !text.toString().endsWith(" ")) {
                    text.append(" ");
                }
            }
            text.append(c.unicode);
        }
        return new TextLine(text.toString().trim(), minX, maxX, minY, maxY);
    }

    private Gutter detectColumnGutter(List<TextLine> lines, float pageWidth) {
        if (lines.size() < 6) return null;

        // Sample candidate gutters between 18% and 75% of page width
        float minScanX = 0.18f * pageWidth;
        float maxScanX = 0.75f * pageWidth;
        int numBins = 60;
        float binWidth = (maxScanX - minScanX) / numBins;

        int bestStartBin = -1;
        int bestLength = 0;
        int currentStartBin = -1;
        int currentLength = 0;

        for (int i = 0; i < numBins; i++) {
            float binLeft = minScanX + i * binWidth;
            float binRight = binLeft + binWidth;

            // Count lines that cross this bin (excluding full-width lines)
            long crossings = lines.stream().filter(l -> {
                boolean isFullWidth = (l.maxX - l.minX) > (0.60f * pageWidth);
                return !isFullWidth && l.minX < binRight && l.maxX > binLeft;
            }).count();

            if (crossings == 0) {
                if (currentStartBin == -1) currentStartBin = i;
                currentLength++;
            } else {
                if (currentLength > bestLength) {
                    bestLength = currentLength;
                    bestStartBin = currentStartBin;
                }
                currentStartBin = -1;
                currentLength = 0;
            }
        }
        if (currentLength > bestLength) {
            bestLength = currentLength;
            bestStartBin = currentStartBin;
        }

        // Gutter must be at least ~14 points wide
        float totalGutterWidth = bestLength * binWidth;
        if (bestStartBin == -1 || totalGutterWidth < 14.0f) {
            return null;
        }

        float gutterLeft = minScanX + bestStartBin * binWidth;
        float gutterRight = gutterLeft + totalGutterWidth;
        float splitX = (gutterLeft + gutterRight) / 2.0f;

        long leftCount = lines.stream().filter(l -> l.centerX() < splitX && (l.maxX - l.minX) <= (0.60f * pageWidth)).count();
        long rightCount = lines.stream().filter(l -> l.centerX() >= splitX && (l.maxX - l.minX) <= (0.60f * pageWidth)).count();

        // Both columns must have at least 3 lines
        if (leftCount < 3 || rightCount < 3) {
            return null;
        }

        // Find vertical bounds of column region
        float topY = Float.MAX_VALUE;
        float bottomY = -Float.MAX_VALUE;
        for (TextLine l : lines) {
            boolean isCol = (l.maxX - l.minX) <= (0.60f * pageWidth);
            if (isCol) {
                topY = Math.min(topY, l.minY);
                bottomY = Math.max(bottomY, l.maxY);
            }
        }

        return new Gutter(gutterLeft, gutterRight, topY, bottomY);
    }

    private String renderLines(List<TextLine> lines) {
        StringBuilder sb = new StringBuilder();
        for (TextLine line : lines) {
            if (!line.text.isBlank()) {
                if (!sb.isEmpty()) sb.append("\n");
                sb.append(line.text);
            }
        }
        return sb.toString();
    }

    private static class TextChar {
        final String unicode;
        final float x;
        final float y;
        final float width;
        final float height;
        final float fontSize;

        TextChar(String unicode, float x, float y, float width, float height, float fontSize) {
            this.unicode = unicode;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.fontSize = fontSize;
        }
    }

    private static class TextLine {
        final String text;
        final float minX;
        final float maxX;
        final float minY;
        final float maxY;

        TextLine(String text, float minX, float maxX, float minY, float maxY) {
            this.text = text;
            this.minX = minX;
            this.maxX = maxX;
            this.minY = minY;
            this.maxY = maxY;
        }

        float centerX() {
            return (minX + maxX) / 2.0f;
        }
    }

    private static class Gutter {
        final float left;
        final float right;
        final float topY;
        final float bottomY;

        Gutter(float left, float right, float topY, float bottomY) {
            this.left = left;
            this.right = right;
            this.topY = topY;
            this.bottomY = bottomY;
        }
    }
}
