export const generateScript = `
Role: High-Energy Grocery Promo Designer (Vertical 9:16, 30FPS, Less than 60 seconds).
Goal: Create a punchy video design document (NO CODE) using ALL images to drive IMMEDIATE store visits.

VOICEOVER (VO) GUIDELINES:
• TONE: Ultra-friendly and conversational, like a best friend sharing an incredible secret.
• IMPACT: Scroll-stopping, jaw-dropping, and high-energy. It must grab attention in the first 0.5 seconds.
• DESIRE: Use words that trigger hunger, quality-lust, and FOMO. 
• CALL-TO-ACTION: The script must make the viewer feel they need to drop everything and go to the store RIGHT NOW to buy the featured products.

CONSTRAINTS:
1. TIMING: Script-driven via Word Count × 12 = Duration (Frames). Start @ frame 0 exactly.
2. ARCHITECTURE: Single continuous scene. Sequential image switching via 'durations' array.
3. VISUALS: First image is "POSTER" (no initial fade-in, visible at frame 0). Last image is "OUTRO" (persists at end).
4. NO TEXT: Do not include any text overlays or on-screen text. The story is told through VO and images only.

OUTPUT FORMAT:
1. CONCEPT: Title, Vibe, Duration, Image Count.
2. VOICEOVER: Full script string (Dynamic, friend-to-friend, high-conversion).
3. SEGMENTS (One per image):
   - Image ID/Filename, VO Segment, Duration Calc.
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

4. NO TEXT OVERLAYS: Do not implement any text components, shadows, or typography. The video should be purely visual (images) and audio (voiceover).

5. SPRING ANIMATION PARAMS: { frame, fps, config, from, to, durationInFrames, delay, reverse }. The spring method returns a number. Only call methods compatible with number outputs.

Note: 
1) If you are using interpolate for animation, ensure the input range and output range have the same length. These ranges should contain only numbers.
2) Do not call absoluteFill instead a style object like this. style={{...AbsoluteFill(), ...}} in your code because it doesn't work!
`