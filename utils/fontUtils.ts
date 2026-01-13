
export const getFontStack = (fontFamily: string): string => {
  const sansSerifFallback = "Helvetica, Arial, sans-serif";
  const serifFallback = "Georgia, 'Times New Roman', Times, serif";
  const monospaceFallback = "'Courier New', Courier, monospace";
  const cursiveFallback = "'Brush Script MT', cursive";

  // Map of popular fonts to their specific fallbacks
  const stacks: Record<string, string> = {
      'Lato': `'Lato', ${sansSerifFallback}`,
      'Open Sans': `'Open Sans', ${sansSerifFallback}`,
      'Roboto': `'Roboto', ${sansSerifFallback}`,
      'Montserrat': `'Montserrat', ${sansSerifFallback}`,
      'Poppins': `'Poppins', ${sansSerifFallback}`,
      'Oswald': `'Oswald', ${sansSerifFallback}`,
      'Raleway': `'Raleway', ${sansSerifFallback}`,
      'Nunito': `'Nunito', ${sansSerifFallback}`,
      'Source Sans Pro': `'Source Sans Pro', ${sansSerifFallback}`,
      'Inter': `'Inter', ${sansSerifFallback}`,
      
      'Merriweather': `'Merriweather', ${serifFallback}`,
      'Playfair Display': `'Playfair Display', ${serifFallback}`,
      'Lora': `'Lora', ${serifFallback}`,
      'PT Serif': `'PT Serif', ${serifFallback}`,
      'Roboto Slab': `'Roboto Slab', ${serifFallback}`,
      
      'Inconsolata': `'Inconsolata', ${monospaceFallback}`,
      'Roboto Mono': `'Roboto Mono', ${monospaceFallback}`,
  };

  // Return specific stack if known
  if (stacks[fontFamily]) {
      return stacks[fontFamily];
  }

  // Heuristics for unknown fonts based on name
  const lower = fontFamily.toLowerCase();
  if (lower.includes('sans')) return `'${fontFamily}', ${sansSerifFallback}`;
  if (lower.includes('serif')) return `'${fontFamily}', ${serifFallback}`;
  if (lower.includes('mono')) return `'${fontFamily}', ${monospaceFallback}`;
  if (lower.includes('script') || lower.includes('hand')) return `'${fontFamily}', ${cursiveFallback}`;

  // Default fallback
  return `'${fontFamily}', Arial, Helvetica, sans-serif`;
};
