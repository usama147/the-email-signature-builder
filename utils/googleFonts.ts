// In a real-world scenario, you might fetch this from the Google Fonts API.
// For this environment, we use a static, curated list of popular fonts.
const popularGoogleFonts = [
    "Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", "Source Sans Pro",
    "Slabo 27px", "Raleway", "PT Sans", "Merriweather", "Noto Sans", "Poppins",
    "Ubuntu", "Playfair Display", "Roboto Condensed", "Nunito", "Lora", "Fira Sans",
    "Inter", "Quicksand", "Work Sans", "Nunito Sans", "PT Serif", "Dosis", "Rubik",
    "Oxygen", "Karla", "Arimo", "Josefin Sans", "Anton", "Cabin", "Lobster",
    "Yanone Kaffeesatz", "Abril Fatface", "Pacifico", "Comfortaa", "Exo 2",
    "Kanit", "Bree Serif", "Crimson Text", "Varela Round", "Fjalla One", "Maven Pro",
    "Patua One", "Questrial", "Signika", "Teko", "Archivo", "Barlow",
    "Libre Baskerville", "Cormorant Garamond", "Zilla Slab", "BioRhyme",
    "Space Grotesk", "DM Sans", "Manrope", "Sora", "Red Hat Display", "Epilogue",
    "Outfit", "Public Sans", "Urbanist", "Figtree", "Onest", "Wix Madefor Display",
    "Geologica", "Instrument Sans", "Schibsted Grotesk", "Hanken Grotesk", "Bricolage Grotesque",
    "Young Serif", "Fraunces", "Alegreya", "Asap", "Bitter", "Catamaran", "Domine",

    // Add more...
    "Abel", "Acme", "Actor", "Adamina", "Advent Pro", "Aguafina Script", "Alata",
    "Alatsi", "Aldrich", "Alef", "Alegreya Sans", "Alegreya Sans SC", "Alex Brush",

    // Sans-serif
    "IBM Plex Sans", "Red Hat Text", "Jost", "Mulish", "Overpass", "Sarabun", "Bai Jamjuree",
    "Gantari", "Be Vietnam Pro", "Lexend", "Plus Jakarta Sans", "Syne", "Urbanist",

    // Serif
    "Source Serif Pro", "EB Garamond", "Playfair Display SC", "Gentium Book Basic",
    "Cardo", "Old Standard TT", "Libre Caslon Text", "Spectral", "Noticia Text",

    // Display
    "Righteous", "Passion One", "Fredoka One", "Alfa Slab One", "Bangers", "Ultra",
    "Shrikhand", "Graduate", "Luckiest Guy", "Changa One",

    // Handwriting
    "Caveat", "Dancing Script", "Shadows Into Light", "Indie Flower", "Permanent Marker",
    "Architects Daughter", "Sacramento", "Gochi Hand", "Patrick Hand", "Kalam",

    // Monospace
    "Inconsolata", "Source Code Pro", "Roboto Mono", "Space Mono", "IBM Plex Mono",
    "JetBrains Mono", "Fira Code", "Cutive Mono"
];

export async function searchGoogleFonts(query: string): Promise<string[]> {
    const lowerCaseQuery = query.toLowerCase();
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!query) {
        return [];
    }
    
    // Use a Set to avoid duplicates if names are similar
    const resultSet = new Set<string>();

    popularGoogleFonts.forEach(font => {
        if (font.toLowerCase().includes(lowerCaseQuery)) {
            resultSet.add(font);
        }
    });
    
    return Array.from(resultSet).slice(0, 10); // Return top 10 matches
}