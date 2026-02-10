import { Box, Typography, Paper, useMediaQuery, Grid } from "@mui/material";
import { History as HistoryIcon } from "@mui/icons-material";
import { Player, PlayerRef } from "@remotion/player";
import { compileCode } from "@/lib/remotion/compiler";
import { extractComponentCode } from "@/app/util";
import { useMemo, useRef, useEffect, useState } from "react";

// Keep your hardcoded videos here for now
const videos = [
  {
    code: 'import { AbsoluteFill, Img, useCurrentFrame, interpolate, spring } from \'remotion\';\nimport { Audio } from \'@remotion/media\';\nexport const MyAnimation = () => {\n  const frame = useCurrentFrame();\n  const width = 320;\n  const height = 550;\n  const fps = 30;\n\n  const imageUrls = [\n    "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770662335678-bfw5gk7.jpg",\n    "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770662337039-cy1a8k8.jpg",\n    "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770662338063-gnv8c86.jpg",\n    "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770662339233-tmhu4cy.jpg",\n    "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770662340357-0ad831m.jpg",\n    "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770662341474-9rv38u9.jpg",\n    "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770662342668-djb2jiv.jpeg",\n    "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770662343814-lsg2zwp.jpeg",\n    "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770662344712-l956pv2.jpeg"\n  ];\n\n  const durations = [204, 132, 216, 156, 156, 156, 192, 228, 348];\n  const audioUrl = "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/0646f7c1-c938-42bf-ad1b-1d0a2ca99c63.wav";\n\n  const cumulatedDurations = durations.reduce((acc, current, i) => {\n    acc.push((acc.length > 0 ? acc[acc.length - 1] : 0) + current);\n    return acc;\n  }, []);\n\n  let activeIndex = durations.findIndex((_, i) => frame < cumulatedDurations[i]);\n  if (activeIndex === -1) {\n    activeIndex = durations.length - 1;\n  }\n\n  const segmentStartFrame = activeIndex === 0 ? 0 : cumulatedDurations[activeIndex - 1];\n  const frameInSegment = frame - segmentStartFrame;\n\n  const fadeDuration = 30;\n  const wipeDuration = 45;\n\n  const currentImageUrl = imageUrls[activeIndex];\n\n  const imageStyle = {\n    position: \'absolute\',\n    width: \'100%\',\n    height: \'100%\',\n    objectFit: \'cover\',\n  };\n\n  let opacity = 1;\n  let clipPath = \'none\';\n\n  switch (activeIndex) {\n    case 0:\n      opacity = 1;\n      break;\n    case 1:\n    case 2:\n    case 3:\n    case 4:\n    case 5:\n      opacity = interpolate(frameInSegment, [0, fadeDuration], [0, 1], {\n        extrapolateLeft: "clamp",\n        extrapolateRight: "clamp",\n      });\n      break;\n    case 6: {\n      const progress = spring({\n        frame: frameInSegment,\n        fps,\n        config: { damping: 200, stiffness: 100 },\n        durationInFrames: wipeDuration,\n        from: 0,\n        to: 1\n      });\n      const maxRadius = Math.sqrt(width * width + height * height) / 2;\n      const radius = interpolate(progress, [0, 1], [0, maxRadius]);\n      clipPath = `circle(${radius}px at 50% 50%)`;\n      break;\n    }\n    case 7: {\n      const progress = spring({\n        frame: frameInSegment,\n        fps,\n        config: { damping: 200, stiffness: 100 },\n        durationInFrames: wipeDuration,\n        from: 0,\n        to: 1\n      });\n      const maxRadius = Math.sqrt(width * width + height * height) / 2;\n      const radius = interpolate(progress, [0, 1], [0, maxRadius]);\n      clipPath = `circle(${radius}px at 50% 50%)`;\n      break;\n    }\n    case 8:\n      opacity = 1;\n      break;\n    default:\n      opacity = 1;\n  }\n\n  if (frame === 0 && activeIndex === 0) {\n    opacity = 1;\n  }\n\n  return (\n    <AbsoluteFill style={{ backgroundColor: \'black\' }}>\n      <Img\n        src={currentImageUrl}\n        style={{\n          ...imageStyle,\n          opacity: opacity,\n          clipPath: clipPath,\n        }}\n        crossOrigin="anonymous"\n      />\n      <Audio src={audioUrl} />\n    </AbsoluteFill>\n  );\n};\n',
    durationInFrames: 1788,
  },
  {
    code: "import { AbsoluteFill, Img, useCurrentFrame, interpolate } from 'remotion';\nimport { Audio } from '@remotion/media';\nimport { useVideoConfig } from 'remotion';\n\nexport const MyAnimation = () => {\n  const frame = useCurrentFrame();\n  const { width, height } = useVideoConfig();\n\n  const durations = [108, 144, 180, 108, 144, 204, 192, 156, 348];\n  const imageLinks = [\n    \"https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770662969797-7we3jmy.jpeg\",\n    \"https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770662970939-o4ssr43.jpeg\",\n    \"https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770662971973-0vlipcm.jpeg\",\n    \"https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770662972924-qbfbanu.jpeg\",\n    \"https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770662974063-aeaei08.jpeg\",\n    \"https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770662975486-1usc839.jpeg\",\n    \"https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770662976630-5z6g0pa.jpg\",\n    \"https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770662977667-zl1zxc7.jpg\",\n    \"https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770662978927-ygpj7g9.jpeg\"\n  ];\n  const audioUrl = \"https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/02df5c77-ec85-49a2-8f91-9e0863dc324c.wav\";\n\n  const totalDurationInFrames = durations.reduce((a, b) => a + b, 0);\n\n  let currentFrameCumulative = 0;\n  let activeIndex = 0;\n  let segmentStartFrame = 0;\n\n  for (let i = 0; i < durations.length; i++) {\n    if (frame >= currentFrameCumulative && frame < currentFrameCumulative + durations[i]) {\n      activeIndex = i;\n      segmentStartFrame = currentFrameCumulative;\n      break;\n    }\n    currentFrameCumulative += durations[i];\n  }\n\n  if (frame >= totalDurationInFrames) {\n      activeIndex = durations.length - 1;\n      segmentStartFrame = totalDurationInFrames - durations[durations.length - 1];\n  }\n\n  const currentImage = imageLinks[activeIndex];\n  const transitionDuration = 30;\n\n  let animationProgress = 1;\n  if (activeIndex > 0) {\n    animationProgress = interpolate(\n      frame,\n      [segmentStartFrame, segmentStartFrame + transitionDuration],\n      [0, 1],\n      { extrapolateLeft: \"clamp\", extrapolateRight: \"clamp\" }\n    );\n  }\n\n  const imageStyle = {\n    width: '100%',\n    height: '100%',\n    objectFit: 'cover',\n    position: 'absolute',\n    left: 0,\n    top: 0,\n    transform: 'none',\n    opacity: 1,\n    clipPath: 'none'\n  };\n\n  if (activeIndex > 0) {\n      if (activeIndex === 1) { // Fade\n        imageStyle.opacity = animationProgress;\n      } else if (activeIndex === 2) { // Iris\n        const irisSize = interpolate(animationProgress, [0, 1], [0, 50], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });\n        imageStyle.clipPath = `circle(${irisSize}% at 50% 50%)`;\n      } else if (activeIndex === 3) { // Wipe (Left-to-right)\n        const wipeProgress = interpolate(animationProgress, [0, 1], [100, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });\n        imageStyle.clipPath = `inset(0% ${wipeProgress}% 0% 0%)`;\n      } else if (activeIndex === 4) { // ClockWipe (Expanding square with rounded corners from center)\n        const insetVal = interpolate(animationProgress, [0, 1], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });\n        const borderRadius = interpolate(animationProgress, [0, 1], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });\n        imageStyle.clipPath = `inset(${insetVal}% ${insetVal}% ${insetVal}% ${insetVal}% round ${borderRadius}%)`;\n      } else if (activeIndex === 5) { // Push (Slide in from right)\n        const translateFactor = interpolate(animationProgress, [0, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });\n        imageStyle.transform = `translateX(calc(100% * ${translateFactor}))`;\n      } else if (activeIndex === 6) { // DiagonalWipe (Top-left to bottom-right sweep)\n        const diagonalX = interpolate(animationProgress, [0, 1], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });\n        imageStyle.clipPath = `polygon(0% 0%, ${diagonalX}% 0%, 100% 100%, 0% 100%)`;\n      } else if (activeIndex === 7) { // ZoomIn\n        const scaleZoom = interpolate(animationProgress, [0, 1], [0.5, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });\n        imageStyle.transform = `scale(${scaleZoom})`;\n      } else if (activeIndex === 8) { // Fade (Outro image)\n        imageStyle.opacity = animationProgress;\n      }\n  }\n\n  return (\n    <AbsoluteFill style={{ backgroundColor: 'black' }}>\n      <Img\n        src={currentImage}\n        style={imageStyle}\n        crossOrigin=\"anonymous\"\n      />\n      <Audio src={audioUrl} />\n    </AbsoluteFill>\n  );\n};\n",
    durationInFrames: 1584,
  },
  {
    code: 'import { AbsoluteFill, Img, useCurrentFrame, interpolate, spring } from \'remotion\';\nimport { Audio } from \'@remotion/media\';\n\nexport const MyAnimation = () => {\n  const frame = useCurrentFrame();\n  const fps = 30;\n  const width = 320;\n  const height = 550;\n\n  const images = [\n    { src: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770664771018-z3hq0yf.webp", duration: 192, animation: "None" },\n    { src: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770664772745-f5ipbu5.jpeg", duration: 180, animation: "WipeRight" },\n    { src: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770664774056-liote6y.jpeg", duration: 180, animation: "WipeUp" },\n    { src: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770664775199-55gzodk.jpeg", duration: 192, animation: "IrisOut" },\n    { src: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770664776393-nd7v1yg.jpeg", duration: 192, animation: "WipeDown" },\n    { src: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770664777805-5czo88n.jpeg", duration: 180, animation: "ClockWipe" },\n    { src: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770664778884-qgumutm.jpg", duration: 192, animation: "WipeLeft" },\n    { src: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770664780126-9qclagh.jpg", duration: 204, animation: "IrisIn" },\n    { src: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770664781472-xbxseeb.jpg", duration: 252, animation: "Fade" }\n  ];\n\n  const durations = images.map(img => img.duration);\n  const totalDuration = durations.reduce((a, b) => a + b, 0);\n\n  // Calculate activeIndex based on frame\n  const cumulatedDurations = durations.map((_, i) => durations.slice(0, i + 1).reduce((a, b) => a + b, 0));\n  let activeIndex = cumulatedDurations.findIndex(cumDur => frame < cumDur);\n  if (activeIndex === -1) {\n    activeIndex = images.length - 1; // Fallback: Render last image if frame is past total duration\n  }\n\n  // Determine the start frame of the current segment and the frame within that segment\n  const startFrameOfSegment = activeIndex === 0 ? 0 : cumulatedDurations[activeIndex - 1];\n  const frameInSegment = frame - startFrameOfSegment;\n  const currentImage = images[activeIndex];\n\n  // Base spring animation for most transitions\n  const animationProgress = spring({\n    frame: frameInSegment,\n    fps,\n    config: { stiffness: 100, damping: 10 },\n    from: 0,\n    to: 1,\n    durationInFrames: 30 // 1 second for transitions\n  });\n\n  let imageStyle = {\n    objectFit: \'cover\',\n    width: \'100%\',\n    height: \'100%\',\n    position: \'absolute\',\n    // Reset all transforms by default, then apply specific animation transforms\n    transform: \'translateY(0) translateX(0) scale(1) rotateZ(0deg)\', \n    opacity: 1\n  };\n\n  // Apply animation styles based on the current segment\'s animation type\n  if (currentImage.animation === "WipeRight") {\n    const translateX = interpolate(animationProgress, [0, 1], [-width, 0]);\n    imageStyle.transform = `translateX(${translateX}px)`;\n  } else if (currentImage.animation === "WipeUp") {\n    const translateY = interpolate(animationProgress, [0, 1], [height, 0]);\n    imageStyle.transform = `translateY(${translateY}px)`;\n  } else if (currentImage.animation === "IrisOut") {\n    imageStyle.transform = `scale(${animationProgress})`;\n  } else if (currentImage.animation === "WipeDown") {\n    const translateY = interpolate(animationProgress, [0, 1], [-height, 0]);\n    imageStyle.transform = `translateY(${translateY}px)`;\n  } else if (currentImage.animation === "ClockWipe") {\n    const scale = animationProgress;\n    const rotateZ = interpolate(animationProgress, [0, 1], [-90, 0]);\n    imageStyle.transform = `scale(${scale}) rotateZ(${rotateZ}deg)`;\n  } else if (currentImage.animation === "WipeLeft") {\n    const translateX = interpolate(animationProgress, [0, 1], [width, 0]);\n    imageStyle.transform = `translateX(${translateX}px)`;\n  } else if (currentImage.animation === "IrisIn") {\n    // IrisIn interpreted as a \'pop-in\' with a bouncier spring\n    const scaleWithBounce = spring({\n      frame: frameInSegment,\n      fps,\n      config: { stiffness: 200, damping: 15, mass: 1 },\n      from: 0,\n      to: 1,\n      durationInFrames: 45 // Slightly longer for the bounce effect\n    });\n    imageStyle.transform = `scale(${scaleWithBounce})`;\n  } else if (currentImage.animation === "Fade") {\n    imageStyle.opacity = animationProgress;\n  }\n  // For "None" animation (first segment), default opacity and transform values apply, \n  // ensuring it\'s fully visible at frame 0 without animation.\n\n  return (\n    <AbsoluteFill>\n      <Img\n        src={currentImage.src}\n        style={imageStyle}\n        crossOrigin="anonymous"\n      />\n      <Audio src="https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/06b8608b-edd5-4642-bc3c-6cfd2cc0796a.wav" />\n    </AbsoluteFill>\n  );\n};\n',
    durationInFrames: 1764,
  },
  {
    code: "import { AbsoluteFill, Img, useCurrentFrame, interpolate } from 'remotion';\nimport { Audio } from '@remotion/media';\n\nexport const MyAnimation = () => {\n  const frame = useCurrentFrame();\n  const width = 320, height = 550;\n\n  const images = [\n    { src: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770663466217-00ollsg.webp', animation: 'None' },\n    { src: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770663467660-7ozfff2.webp', animation: 'Iris In' },\n    { src: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770663468726-2doqoja.webp', animation: 'Wipe Right' },\n    { src: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770663469686-lkgrbx4.webp', animation: 'ClockWipe' },\n    { src: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770663470468-3u0s2c2.webp', animation: 'Fade' },\n    { src: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770663471435-gco4o2f.webp', animation: 'Wipe Up' },\n    { src: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770663472377-5nn18m7.jpeg', animation: 'Iris Out' },\n    { src: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770663473217-8qmhsqr.jpeg', animation: 'Fade' },\n    { src: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770663474362-qm5eaeb.jpeg', animation: 'Wipe Down' },\n    { src: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1770663475474-e6cr6hr.jpeg', animation: 'ClockWipe' }\n  ];\n\n  const durations = [144, 168, 168, 180, 144, 180, 156, 228, 156, 360];\n  const audioSrc = 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/34183e7e-cbd0-427d-8b46-90ba813cb91a.wav';\n  const transitionFrames = 30; \n\n  let currentCumulatedDuration = 0;\n  let imageToRenderIndex = images.length - 1; \n  let segmentStartFrame = 0; \n\n  for (let i = 0; i < durations.length; i++) {\n    if (frame < currentCumulatedDuration + durations[i]) {\n      imageToRenderIndex = i;\n      segmentStartFrame = currentCumulatedDuration;\n      break;\n    }\n    currentCumulatedDuration += durations[i];\n  }\n\n  const currentImage = images[imageToRenderIndex];\n  const animationType = currentImage.animation;\n\n  let imageStyle = {\n    position: 'absolute',\n    left: 0,\n    top: 0,\n    width: '100%',\n    height: '100%',\n    objectFit: 'cover',\n  };\n\n  if (imageToRenderIndex > 0) {\n    const animationProgressFrame = frame - segmentStartFrame;\n    const clampedAnimationProgressFrame = Math.min(animationProgressFrame, transitionFrames);\n\n    switch (animationType) {\n      case 'Iris In': {\n        const animatedRadius = interpolate(clampedAnimationProgressFrame, [0, transitionFrames], [0, 75], { extrapolateRight: 'clamp' });\n        imageStyle = { ...imageStyle, clipPath: `circle(${animatedRadius}% at 50% 50%)` };\n        break;\n      }\n      case 'Wipe Right': {\n        const animatedClip = interpolate(clampedAnimationProgressFrame, [0, transitionFrames], [100, 0], { extrapolateRight: 'clamp' });\n        imageStyle = { ...imageStyle, clipPath: `inset(0% ${animatedClip}% 0% 0%)` };\n        break;\n      }\n      case 'ClockWipe': {\n        const animatedScale = interpolate(clampedAnimationProgressFrame, [0, transitionFrames], [0, 1], { extrapolateRight: 'clamp' });\n        const animatedRotate = interpolate(clampedAnimationProgressFrame, [0, transitionFrames], [0, 360], { extrapolateRight: 'clamp' });\n        imageStyle = { ...imageStyle, transform: `scale(${animatedScale}) rotate(${animatedRotate}deg)`, transformOrigin: 'center' };\n        break;\n      }\n      case 'Fade': {\n        const animatedOpacity = interpolate(clampedAnimationProgressFrame, [0, transitionFrames], [0, 1], { extrapolateRight: 'clamp' });\n        imageStyle = { ...imageStyle, opacity: animatedOpacity };\n        break;\n      }\n      case 'Wipe Up': {\n        const animatedClip = interpolate(clampedAnimationProgressFrame, [0, transitionFrames], [100, 0], { extrapolateRight: 'clamp' });\n        imageStyle = { ...imageStyle, clipPath: `inset(${animatedClip}% 0% 0% 0%)` };\n        break;\n      }\n      case 'Iris Out': {\n        const animatedRadius = interpolate(clampedAnimationProgressFrame, [0, transitionFrames], [100, 75], { extrapolateRight: 'clamp' });\n        imageStyle = { ...imageStyle, clipPath: `circle(${animatedRadius}% at 50% 50%)` };\n        break;\n      }\n      case 'Wipe Down': {\n        const animatedClip = interpolate(clampedAnimationProgressFrame, [0, transitionFrames], [100, 0], { extrapolateRight: 'clamp' });\n        imageStyle = { ...imageStyle, clipPath: `inset(0% 0% ${animatedClip}% 0%)` };\n        break;\n      }\n      default:\n        break;\n    }\n  }\n\n  return (\n    <AbsoluteFill style={{ backgroundColor: 'black' }}>\n      <Img\n        src={currentImage.src}\n        style={imageStyle}\n        crossOrigin=\"anonymous\"\n      />\n      <Audio src={audioSrc} />\n    </AbsoluteFill>\n  );\n};\n",
    durationInFrames: 1884,
  },
];

// Memoized Video Card Component
const VideoCard = ({
  video,
  videoSize,
  isPlaying,
  onPlay,
}: {
  video: (typeof videos)[0];
  videoSize: { width: number; height: number };
  isPlaying: boolean;
  onPlay: () => void;
}) => {
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    if (!isPlaying && playerRef.current?.isPlaying()) {
      playerRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handlePlay = () => {
      onPlay();
    };

    player.addEventListener("play", handlePlay);
    return () => {
      player.removeEventListener("play", handlePlay);
    };
  }, [onPlay]);

  const Comp = useMemo(() => {
    try {
      let finalCode = video.code.replace(/^```(?:tsx?|jsx?)?\n?/, "");
      finalCode = finalCode.replace(/\n?```\s*$/, "");
      finalCode = extractComponentCode(finalCode);
      const compilationResult = compileCode(finalCode || "");
      return compilationResult.Component;
    } catch (e) {
      console.error("Compilation error:", e);
      return null;
    }
  }, [video.code]);

  if (!Comp) return null;

  return (
    <Paper
      elevation={4}
      sx={{
        width: "100%",
        maxWidth: 320,
        aspectRatio: "9 / 16",
        bgcolor: "rgba(26, 26, 46, 0.6)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(139, 92, 246, 0.2)",
        borderRadius: 3,
        overflow: "hidden",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          border: "1px solid rgba(139, 92, 246, 0.5)",
        },
      }}
    >
      <Player
        ref={playerRef}
        component={Comp}
        durationInFrames={video.durationInFrames}
        compositionWidth={videoSize.width}
        compositionHeight={videoSize.height}
        fps={30}
        controls
        acknowledgeRemotionLicense
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </Paper>
  );
};

export default function Showcase() {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  // Default video size - made responsive
  const videoSize = { width: 320, height: 550 };

  return (
    <Box sx={{ mt: { xs: 4, md: 6 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <HistoryIcon sx={{ color: "#a855f7", mr: 1.5 }} />
        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight="bold"
          sx={{ color: "#e2e8f0" }}
        >
          Showcase
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{ color: "rgba(255,255,255,0.5)", mb: 4 }}
      >
        All videos were created using Grocerity
      </Typography>

      <Grid container spacing={3}>
        {videos.map((video, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <VideoCard
              video={video}
              videoSize={videoSize}
              isPlaying={playingIndex === index}
              onPlay={() => setPlayingIndex(index)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
