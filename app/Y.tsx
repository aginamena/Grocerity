import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Img,
  Html5Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

export const MyAnimation = () => {
  const assets = {
    images: {
      img1: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1768940103094-3x51cic.jpg",
      img2: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1768940103977-xq4qjc8.jpg",
      img3: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1768940105310-wrlyhpv.jpg",
    },
    voiceovers: {
      vo1: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/ebc3fa00-c0f4-4162-9053-7162ce336710.wav",
      vo2: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/29edc480-8c87-407f-a588-91e44020d413.wav",
      vo3: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/ae8ccb1d-a55e-4601-b7a6-41a4f8906588.wav",
      vo4: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/e70ebf44-825d-4dd0-9c40-0bc525ad42f1.wav",
      vo5: "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/497040de-e818-47cc-9b67-718bfac4163e.wav",
    },
  };

  const Scene1 = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const translateX = interpolate(frame, [0, 120], [20, -20]);

    return (
      <AbsoluteFill style={{ backgroundColor: "white" }}>
        <Img
          src={assets.images.img1}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "right center",
            transform: `translateX(${translateX}px)`,
            transformOrigin: "center center",
          }}
        />
      </AbsoluteFill>
    );
  };

  const Scene2 = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig(); // Duration of the sequence

    // Entrance Transition: Wipe Right
    const wipeProgress = interpolate(frame, [0, 15], [100, 0], {
      extrapolateRight: "clamp",
    });

    // Main Animation: Ken Burns
    const scale = interpolate(frame, [0, 135], [1.0, 1.15]);
    const translateY = interpolate(frame, [0, 135], [0, -30]);

    return (
      <AbsoluteFill style={{ clipPath: `inset(0 ${wipeProgress}% 0 0)` }}>
        <Img
          src={assets.images.img2}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 20%",
            transformOrigin: "center 80%",
            transform: `scale(${scale}) translateY(${translateY}px)`,
          }}
        />
      </AbsoluteFill>
    );
  };

  const Scene3 = () => {
    const frame = useCurrentFrame();
    const { fps, height } = useVideoConfig();

    // Entrance Transition: Slide Down
    const slideIn = spring({
      frame,
      fps,
      from: -height,
      to: 0,
      durationInFrames: 18,
    });

    // Main Animation: Zoom In
    const scale = interpolate(frame, [0, 120], [1.0, 1.2]);

    return (
      <AbsoluteFill style={{ transform: `translateY(${slideIn}px)` }}>
        <Img
          src={assets.images.img3}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 35%",
            transformOrigin: "center 35%",
            transform: `scale(${scale})`,
          }}
        />
      </AbsoluteFill>
    );
  };

  const Scene4 = () => {
    const frame = useCurrentFrame();

    // Entrance Transition: Iris (Expand)
    const irisRadius = interpolate(frame, [0, 15], [0, 150], {
      extrapolateRight: "clamp",
    });

    // Main Animation: Tilt
    const yPos = interpolate(frame, [0, 105], [80, 40]);

    return (
      <AbsoluteFill style={{ clipPath: `circle(${irisRadius}% at center)` }}>
        <Img
          src={assets.images.img1}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `center ${yPos}%`,
            transformOrigin: "center center",
          }}
        />
      </AbsoluteFill>
    );
  };

  const Scene5 = () => {
    const frame = useCurrentFrame();

    // Entrance Transition: Fade
    const opacity = interpolate(frame, [0, 20], [0, 1], {
      extrapolateRight: "clamp",
    });

    // Text Animation: Fade In
    const textOpacity = interpolate(frame, [0, 30], [0, 1], {
      extrapolateRight: "clamp",
    });

    return (
      <AbsoluteFill style={{ opacity, backgroundColor: "black" }}>
        <Img
          src={assets.images.img2}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(20px)",
            opacity: 0.7,
          }}
        />
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontFamily: "sans-serif",
            textAlign: "center",
            opacity: textOpacity,
          }}
        >
          <div style={{ fontSize: "120px", fontWeight: "bold" }}>
            YOUR STORE NAME
          </div>
          <div style={{ fontSize: "80px", margin: "20px 0" }}>
            123 Main Street
          </div>
          <div style={{ fontSize: "60px", fontStyle: "italic" }}>
            Great Products, Great Prices.
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence from={0} durationInFrames={120}>
        <Html5Audio src={assets.voiceovers.vo1} />
        <Scene1 />
      </Sequence>
      <Sequence from={120} durationInFrames={135}>
        <Html5Audio src={assets.voiceovers.vo2} />
        <Scene2 />
      </Sequence>
      <Sequence from={255} durationInFrames={120}>
        <Html5Audio src={assets.voiceovers.vo3} />
        <Scene3 />
      </Sequence>
      <Sequence from={375} durationInFrames={105}>
        <Html5Audio src={assets.voiceovers.vo4} />
        <Scene4 />
      </Sequence>
      <Sequence from={480} durationInFrames={120}>
        <Html5Audio src={assets.voiceovers.vo5} />
        <Scene5 />
      </Sequence>
    </AbsoluteFill>
  );
};
