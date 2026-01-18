import { Player } from "@remotion/player";
import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Html5Audio,
} from "remotion";

// --- Asset Imports ---
// Replace these URLs with your local or remote asset paths.
const image1 =
  "https://assets.json2video.com/clients/corrcejJXS/uploads/PXL_20260106_201818392.MP.jpg"; // Shelf with porridge, beans, and grains.
const image2 =
  "https://assets.json2video.com/clients/corrcejJXS/uploads/PXL_20260106_201641208.jpg"; // Alternate angle of the beans and grains shelf.
const image3 =
  "https://assets.json2video.com/clients/corrcejJXS/uploads/unnamed (8).webp"; // Aisle with coffee, sauces, and spices.
const image4 =
  "https://assets.json2video.com/clients/corrcejJXS/uploads/unnamed (7).webp"; // Aisle with pancake mix, canned goods, and oils.

const vo1 =
  "https://storage.cloud.google.com/grocerity/Looking%20to%20restock%20y.mp3"; // "Looking to restock your pantry?"
const vo2 =
  "https://storage.cloud.google.com/grocerity/We%20ve%20got%20everything.mp3"; // "We've got everything you need!"
const vo3 =
  "https://storage.cloud.google.com/grocerity/From%20wholesome%20grain.mp3"; // "From wholesome grains and beans..."
const vo4 =
  "https://storage.cloud.google.com/grocerity/to%20rich%20aromatic%20cof.mp3"; // "...to rich, aromatic coffee..."
const vo5 =
  "https://storage.cloud.google.com/grocerity/and%20all%20the%20spices%20a.mp3"; // "...and all the spices and sauces to bring your meals to life!"
const vo6 =
  "https://storage.cloud.google.com/grocerity/Come%20discover%20your%20n.mp3"; // "Come discover your new favorites today!"

// --- Scene Components ---

const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 90], [1.2, 1]);

  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      <Img
        src={image4}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const translateX = interpolate(frame, [90, 165], [0, -(0.3 * width)]);

  return (
    <Img
      src={image2}
      style={{
        position: "absolute",
        width: "130%",
        height: "auto",
        top: "50%",
        transform: `translateY(-50%) translateX(${translateX}px)`,
      }}
    />
  );
};

const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  // Pan from top shelf (Porridge) down to middle shelf (beans)
  const translateY = interpolate(frame, [165, 285], [20, -50]);

  return (
    <Img
      src={image1}
      style={{
        position: "absolute",
        width: "110%",
        height: "auto",
        left: "50%",
        transform: `translateX(-50%) translateY(${translateY}px)`,
      }}
    />
  );
};

const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  // Pan across the coffee bags on the top shelf
  const translateX = interpolate(frame, [285, 390], [0, -(0.5 * width)]);

  return (
    <Img
      src={image3}
      style={{
        position: "absolute",
        width: "150%",
        height: "auto",
        top: "-15%", // Position image to focus on the top shelf with coffee
        transform: `translateX(${translateX}px)`,
      }}
    />
  );
};

const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  // Fast pan downwards from middle to bottom shelf
  const translateY = interpolate(frame, [405, 525], [0, -150], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Img
      src={image3}
      style={{
        position: "absolute",
        width: "100%",
        height: "auto",
        transform: `translateY(${translateY}px)`,
      }}
    />
  );
};

const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [540, 660], [1, 1.05]);
  const opacity = interpolate(frame, [650, 660], [1, 0], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={image4}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};

// --- Main Video Component ---

const PantryVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
      {/* Scene 1: 0.0s - 3.0s */}
      <Sequence from={0} durationInFrames={90}>
        <Scene1 />
        <Html5Audio src={vo1} trimBefore={15} /> {/* Starts at 0.5s */}
      </Sequence>

      {/* Scene 2: 3.0s - 5.5s */}
      <Sequence from={90} durationInFrames={75}>
        <Scene2 />
        <Html5Audio src={vo2} trimBefore={6} />{" "}
        {/* Starts at 3.2s (0.2s into scene) */}
      </Sequence>

      {/* Scene 3: 5.5s - 9.5s */}
      <Sequence from={165} durationInFrames={120}>
        <Scene3 />
        <Html5Audio src={vo3} trimBefore={6} />{" "}
        {/* Starts at 5.7s (0.2s into scene) */}
      </Sequence>

      {/* Scene 4: 9.5s - 13.0s */}
      <Sequence from={285} durationInFrames={105}>
        <Scene4 />
        <Html5Audio src={vo4} trimBefore={6} />{" "}
        {/* Starts at 9.7s (0.2s into scene) */}
      </Sequence>

      {/* Scene 5: 13.0s - 18.0s */}
      <Sequence from={390} durationInFrames={150}>
        <Scene5 />
        <Html5Audio src={vo5} trimBefore={6} />{" "}
        {/* Starts at 13.2s (0.2s into scene) */}
      </Sequence>

      {/* Scene 6: 18.0s - 22.0s */}
      <Sequence from={540} durationInFrames={120}>
        <Scene6 />
        <Html5Audio src={vo6} trimBefore={6} />{" "}
        {/* Starts at 18.2s (0.2s into scene) */}
      </Sequence>
    </AbsoluteFill>
  );
};

// --- Root Player Component ---
export const RemotionRoot: React.FC = () => {
  return (
    <Player
      component={PantryVideo}
      durationInFrames={660} // 22 seconds * 30 FPS
      compositionWidth={320}
      compositionHeight={550}
      fps={30}
      style={{
        width: 320,
        height: 550,
        border: "1px solid #ccc",
      }}
      controls
      loop
      acknowledgeRemotionLicense
    />
  );
};
