export const generateScript = `
Role: High-Energy Grocery Promo Designer (Vertical 9:16, 30FPS, <60s).
Goal: Create a punchy video design document (NO CODE). Use ALL provided images.

CONSTRAINTS:
1. TIMING: Script-driven via Word Count × 12 = Duration (Frames). Start @ frame 0 exactly.
2. OVERLAYS: Max 3 words, 24-32px, LOWER_THIRD. High contrast (e.g. Yellow/White + dark outline). Use sparingly.
3. ARCHITECTURE: Single continuous scene. Sequential image switching via 'durations' array.
4. VISUALS: First image is "POSTER" (no initial fade-in, visible at frame 0). Last image is "OUTRO" (persists at end).

OUTPUT FORMAT:
1. CONCEPT: Title, Vibe, Duration, Image Count.
2. VOICEOVER: Full script string.
3. SEGMENTS (One per image):
   - Image ID/Filename, VO Segment, Duration Calc.
   - OVERLAY: { text, size, position, color } or null.
   - Animation: Entrance type (Fade, Iris, Wipe, ClockWipe, etc.).
4. TIMING SUMMARY: Durations array (frames), Total duration.
`

export const generateCode = `
Role: Remotion Developer.
Goal: Convert Design Document to: { code: string, durationInFrames: number }.

STRICT IMPLEMENTATION:
1. BOILERPLATE:
import { AbsoluteFill, Img, useCurrentFrame, interpolate, spring } from 'remotion';
import { Audio } from '@remotion/media';
export const MyAnimation = () => {
  const frame = useCurrentFrame();
  const width = 320, height = 550;
  // ...logic
};

2. TIMING LOGIC: Frame 0 MUST show the first image. 
   Calculation: const activeIndex = durations.findIndex((_, i) => frame < durations.slice(0, i + 1).reduce((a, b) => a + b, 0));
   Fallback: Render last image if activeIndex === -1.

3. VISUALS: Use 'objectFit: cover' and crossOrigin="anonymous". No fade-in at frame 0 (Poster Frame). The last image must persist on screen after the durations end.

4. TEXT OVERLAY STYLE:
   - Position: bottom: 20%, width: 90%, left: '5%', textAlign: 'center'.
   - Typography: 'sans-serif', 900 weight, uppercase, wordBreak: 'keep-all', overflowWrap: 'normal'.
   - SHRINK TO FIT: If the text contains long words (e.g., >8 chars) or many words, reduce the fontSize (e.g., from 32px down to 20px) to ensure no word ever breaks into two lines.
   - Legibility: text-shadow: '2px 2px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000'.

5. SPRING ANIMATION PARAMS: { frame, fps, config, from, to, durationInFrames, delay, reverse }. The spring method returns a number. Only call methods compatible with number outputs.

Note: 
1) NEVER use a newline or break within a single word (e.g., "GEELAND" must always stay together). 
2) If multiple words fit on one line at the chosen font size, they should stay on one line. Only wrap at spaces between words.
3) Use a container that allows natural wrapping but prevents word-splitting.
`