import React from "react";
import { Player } from "@remotion/player";
import {
  Sequence,
  useCurrentFrame,
  interpolate,
  Img,
  Html5Audio,
  useVideoConfig,
  AbsoluteFill,
} from "remotion";

// --- Asset URLs ---
const assets = {
  images: {
    img1: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1768780614488-grgb7sj.jpg",
    img2: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1768780614990-w3qj5dh.jpg",
    img3: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1768780615235-j214lvs.jpg",
  },
  voiceovers: {
    vo1: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/a6cc0946-c7c0-42ab-8608-ef219f722cca.wav",
    vo2: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/9644cc09-5317-4744-97b4-925a1fbfdeb9.wav",
    vo3: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/534455fe-c66b-4f28-abf9-eb1eb7c0cd9d.wav",
    vo4: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/67a177c7-d0bb-4ab4-b2a0-5ad5cf0460d4.wav",
    vo5: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/c81f2507-26ea-45ff-984f-54d212509601.wav",
    vo6: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/57484870-fff3-4219-89e8-77ef7f352ead.wav",
  },
};

// --- Project Settings ---
const VIDEO_WIDTH = 320;
const VIDEO_HEIGHT = 550;
const VIDEO_FPS = 30;
const TOTAL_DURATION_IN_SECONDS = 18;
const TOTAL_DURATION_IN_FRAMES = TOTAL_DURATION_IN_SECONDS * VIDEO_FPS;

// Helper to convert seconds to frames for timing accuracy
const s = (seconds: number) => seconds * VIDEO_FPS;

// --- Scene Components ---

// Scene 1: 0.0s – 3.5s
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [1.2, 1.5]);

  return (
    <AbsoluteFill>
      <Sequence from={s(0.2)}>
        <Html5Audio src={assets.voiceovers.vo1} />
      </Sequence>
      <Img
        src={assets.images.img1}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};

// Scene 2: 3.5s – 7.0s
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Pan from left to right across the image.
  // Image is 180% wide (320 * 1.8 = 576px). Extra width is 256px.
  // TranslateX from 0 to -256 moves the image left, creating a rightward pan effect.
  const translateX = interpolate(frame, [0, durationInFrames], [0, -256]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Sequence from={s(0.2)}>
        <Html5Audio src={assets.voiceovers.vo2} />
      </Sequence>
      <Img
        src={assets.images.img2}
        style={{
          position: "absolute",
          width: "180%",
          height: "auto",
          // Vertically position to focus on the bottom two shelves
          top: "-25%",
          transform: `translateX(${translateX}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Scene 3: 7.0s – 9.5s
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Pan from right to left across the image.
  // Image is 200% wide (320 * 2 = 640px). Extra width is 320px.
  // TranslateX from -320 to 0 moves the image right, creating a leftward pan effect.
  const translateX = interpolate(frame, [0, durationInFrames], [-320, 0]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Sequence from={s(0.2)}>
        <Html5Audio src={assets.voiceovers.vo3} />
      </Sequence>
      <Img
        src={assets.images.img3}
        style={{
          position: "absolute",
          width: "200%",
          height: "auto",
          // Vertically position to focus on the top shelf of coffee bags
          top: "5%",
          transform: `translateX(${translateX}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Scene 4: 9.5s – 13.0s
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Fast zoom-out from 250% to 150%
  const scale = interpolate(frame, [0, durationInFrames], [2.5, 1.5]);

  return (
    <AbsoluteFill>
      <Sequence from={s(0.2)}>
        <Html5Audio src={assets.voiceovers.vo4} />
      </Sequence>
      <Img
        src={assets.images.img3}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          // Focus on ZADIG sauces on the middle shelf
          objectPosition: "center 60%",
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};

// Scene 5: 13.0s – 15.5s (Rapid Cuts Montage)
const Scene5: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={s(0.2)}>
        <Html5Audio src={assets.voiceovers.vo5} />
      </Sequence>

      {/* 13.0s-13.8s: Close-up on "Soya Rice" */}
      <Sequence from={0} durationInFrames={s(0.8)}>
        <Img
          src={assets.images.img1}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 35%",
            transform: "scale(3.5)",
          }}
        />
      </Sequence>

      {/* 13.8s-14.6s: Close-up on red beans */}
      <Sequence from={s(0.8)} durationInFrames={s(0.8)}>
        <Img
          src={assets.images.img2}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            transform: "scale(2.5)",
          }}
        />
      </Sequence>

      {/* 14.6s-15.5s: Close-up on spice jars */}
      <Sequence from={s(1.6)} durationInFrames={s(0.9)}>
        <Img
          src={assets.images.img3}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 85%",
            transform: "scale(3)",
          }}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

// Scene 6: 15.5s – 18.0s (Call to Action)
const Scene6: React.FC = () => {
  const frame = useCurrentFrame();

  // Fade-in from 15.5s to 16.0s (0 to 0.5s into the sequence)
  const opacity = interpolate(frame, [0, s(0.5)], [0, 1], {
    extrapolateRight: "clamp",
  });

  const textStyle: React.CSSProperties = {
    fontFamily: "sans-serif",
    color: "white",
    textAlign: "center",
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    width: "90%",
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#A0522D", opacity }}>
      <Sequence from={s(0.2)}>
        <Html5Audio src={assets.voiceovers.vo6} />
      </Sequence>

      <div
        style={{
          ...textStyle,
          top: "40%",
          fontSize: "48px",
          fontWeight: "bold",
          zIndex: 3,
        }}
      >
        [YOUR STORE NAME]
      </div>
      <div
        style={{
          ...textStyle,
          top: "55%",
          fontSize: "24px",
          fontWeight: "400",
          zIndex: 2,
        }}
      >
        Your One-Stop Shop for Authentic Groceries
      </div>
      <div
        style={{
          ...textStyle,
          top: "85%",
          fontSize: "18px",
          fontWeight: "300",
          zIndex: 1,
        }}
      >
        [Store Address / Website Here]
      </div>
    </AbsoluteFill>
  );
};

// --- Main Video Component ---
const FlavorVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence from={s(0)} durationInFrames={s(3.5)}>
        <Scene1 />
      </Sequence>
      <Sequence from={s(3.5)} durationInFrames={s(3.5)}>
        <Scene2 />
      </Sequence>
      <Sequence from={s(7.0)} durationInFrames={s(2.5)}>
        <Scene3 />
      </Sequence>
      <Sequence from={s(9.5)} durationInFrames={s(3.5)}>
        <Scene4 />
      </Sequence>
      <Sequence from={s(13.0)} durationInFrames={s(2.5)}>
        <Scene5 />
      </Sequence>
      <Sequence from={s(15.5)} durationInFrames={s(2.5)}>
        <Scene6 />
      </Sequence>
    </AbsoluteFill>
  );
};

// --- Player Root Component ---
const playerProps = {
  component: FlavorVideo,
  durationInFrames: TOTAL_DURATION_IN_FRAMES,
  compositionWidth: VIDEO_WIDTH,
  compositionHeight: VIDEO_HEIGHT,
  fps: VIDEO_FPS,
  style: {
    width: "100%",
    maxWidth: `${VIDEO_WIDTH}px`,
    aspectRatio: `${VIDEO_WIDTH} / ${VIDEO_HEIGHT}`,
    display: "block",
    margin: "auto",
  },
  controls: true,
  loop: true,
};

export const RemotionRoot: React.FC = () => {
  return <Player {...playerProps} />;
};
