import { CompatibilityResult, CompatibilityStatus } from "../types";

export function checkCompatibility(html: string): CompatibilityResult[] {
    const results: CompatibilityResult[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // --- Perform checks on the parsed HTML document ---

    // 1. Check for Rounded Corners (border-radius)
    const hasBorderRadius = !!doc.querySelector('[style*="border-radius"]');
    if (hasBorderRadius) {
        results.push({
            id: 'border-radius',
            title: 'Rounded Corners',
            message: 'border-radius has poor support in most versions of Outlook on Windows. Corners may appear square.',
            status: CompatibilityStatus.Poor
        });
    } else {
        results.push({
            id: 'border-radius',
            title: 'Rounded Corners',
            message: 'No rounded corners detected. Good for compatibility.',
            status: CompatibilityStatus.Good
        });
    }

    // 2. Check for CSS Margins
    const hasMargin = !!doc.querySelector('[style*="margin"]');
    if (hasMargin) {
         results.push({
            id: 'css-margins',
            title: 'CSS Margins',
            message: 'The `margin` property is not reliably supported in Outlook. For spacing, use `padding` on table cells or Spacer components.',
            status: CompatibilityStatus.Poor
        });
    }

    // 3. Check for CSS Positioning
    const hasPosition = !!doc.querySelector('[style*="position"]');
    if (hasPosition) {
        results.push({
            id: 'css-position',
            title: 'CSS Positioning',
            message: 'The `position` property is used for fine-tuning layout. This has poor support in many versions of Outlook and may cause elements to overlap or misalign.',
            status: CompatibilityStatus.Poor
        });
    }


    // 4. Check for Animated GIFs
    const hasAnimatedGif = !!doc.querySelector('img[src$=".gif"]');
    if (hasAnimatedGif) {
        results.push({
            id: 'animated-gifs',
            title: 'Animated GIFs',
            message: 'Outlook on Windows will only display the first frame of an animated GIF. Ensure the first frame is acceptable as a static image.',
            status: CompatibilityStatus.Warning
        });
    }

    // 5. Check for Image Alt Text
    const images = doc.querySelectorAll('img');
    const imagesMissingAlt = Array.from(images).some(img => !img.alt?.trim());
    if (imagesMissingAlt) {
        results.push({
            id: 'image-alt-text',
            title: 'Image Alt Text',
            message: 'One or more images are missing descriptive alt text. Alt text is important for accessibility and when images are blocked by email clients.',
            status: CompatibilityStatus.Warning
        });
    } else if (images.length > 0) {
        results.push({
            id: 'image-alt-text',
            title: 'Image Alt Text',
            message: 'All images have alt text. Great for accessibility!',
            status: CompatibilityStatus.Good
        });
    }

    // 6. Check for max-width (Responsiveness)
    const hasMaxWidth = !!doc.querySelector('table[style*="max-width"]');
    if (hasMaxWidth) {
         results.push({
            id: 'responsive-max-width',
            title: 'Responsive Width',
            message: '`max-width` is used for responsiveness, which is great for modern clients but may be ignored by older versions of Outlook.',
            status: CompatibilityStatus.Warning
        });
    }
    
    // 7. Check for Table-based layout
    const hasTable = !!doc.querySelector('table');
    const hasFlexOrGrid = !!doc.querySelector('[style*="display: flex"]') || !!doc.querySelector('[style*="display: grid"]');
    if (hasTable && !hasFlexOrGrid) {
        results.push({
            id: 'table-layout',
            title: 'Table-Based Layout',
            message: 'The signature correctly uses a table-based layout, which is the gold standard for email client compatibility.',
            status: CompatibilityStatus.Good
        });
    } else {
         results.push({
            id: 'table-layout',
            title: 'Layout Method',
            message: 'The signature layout may not be using tables correctly, or it contains unsupported CSS like Flexbox or Grid, which will break in many email clients.',
            status: CompatibilityStatus.Poor
        });
    }

    // 8. Check for Custom Web Fonts
    const hasFontFace = html.includes('@font-face');
    const hasGoogleFont = html.includes('@import url(');
    if (hasFontFace || hasGoogleFont) {
         results.push({
            id: 'custom-web-fonts',
            title: 'Custom Web Fonts',
            message: 'Custom fonts are used, which have limited support. They may not render in Outlook, iOS Mail, or some versions of Gmail. Ensure your fallback fonts are acceptable.',
            status: CompatibilityStatus.Warning
        });
    } else {
        results.push({
            id: 'custom-web-fonts',
            title: 'Web Safe Fonts',
            message: 'Only web-safe fonts are used, ensuring consistent text rendering across all email clients.',
            status: CompatibilityStatus.Good
        });
    }

    // 9. Check for Image Borders
    const imagesMissingBorder = Array.from(images).some(img => img.getAttribute('border') !== '0');
    if (images.length > 0 && !imagesMissingBorder) {
         results.push({
            id: 'image-borders',
            title: 'Image Borders',
            message: 'All images are set with border="0", which prevents unwanted borders in some email clients like Outlook.',
            status: CompatibilityStatus.Good
        });
    }
    
    return results;
}