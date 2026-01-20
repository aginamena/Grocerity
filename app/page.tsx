"use client";

import React, { useState } from "react";
import { RemotionRoot } from "./Y";
import { extractComponentCode } from "./util";
import { compileCode } from "@/lib/remotion/compiler";
import { Player } from "@remotion/player";
import { MyAnimation } from "./Y";

export default function Home() {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [design, setDesign] = useState<string>("");
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  // Function to compress image
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 1200;
          const maxHeight = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob!], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            "image/jpeg",
            0.7, // 70% quality
          );
        };
      };
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedImages.length + files.length > 10) {
      setError("You can upload a maximum of 10 images.");
      return;
    }

    // Compress all images before adding
    const compressedFiles = await Promise.all(files.map(compressImage));
    const newImages = [...selectedImages, ...compressedFiles];
    setSelectedImages(newImages);
    setImagePreviews(newImages.map((f) => URL.createObjectURL(f)));
    setError(null);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newImages.map((f) => URL.createObjectURL(f)));
  };

  async function generateDesign() {
    if (selectedImages.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    setLoading(true);
    setError(null);
    setDesign("");

    try {
      // Step 1: Upload images to Supabase
      const uploadFormData = new FormData();
      selectedImages.forEach((img) => {
        uploadFormData.append("images", img);
      });

      // Step 2: Send image URLs to design API
      // const request = await fetch("/api/generate_video", {
      //   method: "POST",
      //   body: uploadFormData,
      // });

      // if (!request.ok) {
      //   throw new Error("Failed to generate design");
      // }
      // const response = await request.json();
      // let finalCode = response.result;
      let finalCode = j.code;
      // Remove code block markers if present
      finalCode = finalCode.replace(/^```(?:tsx?|jsx?)?\n?/, "");
      finalCode = finalCode.replace(/\n?```\s*$/, "");
      finalCode = extractComponentCode(finalCode);

      // const compilationResult = compileCode(codeAsString); // Validate code compiles
      // console.log("Compilation result:", compilationResult);

      // setComponent(compilationResult.Component);

      console.log(finalCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1>Video Generation with Multiple Product Images</h1>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        disabled={loading}
      />

      {imagePreviews.length > 0 && (
        <div
          style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}
        >
          {imagePreviews.map((src, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img
                src={src}
                style={{ width: 120, height: 120, objectFit: "cover" }}
              />
              <button
                onClick={() => removeImage(i)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  border: "none",
                  width: 24,
                  height: 24,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={generateDesign}
        disabled={loading || selectedImages.length === 0}
        style={{ marginTop: 20 }}
      >
        {loading ? "Generating…" : "Generate Video Design"}
      </button>

      {design && (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            marginTop: 24,
            background: "#111",
            color: "#0f0",
            padding: 16,
          }}
        >
          {design}
        </pre>
      )}

      <Player
        component={MyAnimation}
        durationInFrames={y.durationInFrames}
        compositionWidth={320}
        compositionHeight={550}
        fps={y.fps}
        controls
        loop
        acknowledgeRemotionLicense
      />
    </div>
  );
}

const y = {
  code: "import React from 'react';\nimport { AbsoluteFill, Sequence, Img, useCurrentFrame, interpolate } from 'remotion';\n\nexport const MyAnimation = () => {\n  const assets = {\n    images: {\n      aisle1: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1768878259321-zhoqeoh.jpg',\n      aisle2: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1768878260267-vg3f7lt.jpg',\n    },\n  };\n\n  const Scene1 = () => {\n    const frame = useCurrentFrame();\n    const durationInFrames = 4 * 30;\n\n    const scale = interpolate(frame, [0, durationInFrames], [1.2, 1.6]);\n    const opacity = interpolate(frame, [0, 15, 114, 120], [0, 1, 1, 0], {\n      extrapolateLeft: 'clamp',\n      extrapolateRight: 'clamp',\n    });\n\n    return (\n      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>\n        <Img\n          src={assets.images.aisle1}\n          style={{\n            width: '100%',\n            height: 'auto',\n            transform: `scale(${scale})`,\n            opacity: opacity,\n          }}\n        />\n      </AbsoluteFill>\n    );\n  };\n\n  const Scene2 = () => {\n    const frame = useCurrentFrame();\n    const durationInFrames = 4 * 30;\n\n    const panY = interpolate(frame, [0, durationInFrames], [50, -150]);\n    const opacity = interpolate(frame, [0, 6, 114, 120], [0, 1, 1, 0], {\n      extrapolateLeft: 'clamp',\n      extrapolateRight: 'clamp',\n    });\n\n    return (\n      <AbsoluteFill style={{ opacity }}>\n        <Img\n          src={assets.images.aisle1}\n          style={{\n            position: 'absolute',\n            width: '150%',\n            height: 'auto',\n            left: '50%',\n            top: '50%',\n            transform: `translate(-50%, -50%) translateY(${panY}px)`,\n          }}\n        />\n      </AbsoluteFill>\n    );\n  };\n\n  const Scene3 = () => {\n    const frame = useCurrentFrame();\n    const durationInFrames = 3.5 * 30;\n\n    const panX = interpolate(frame, [0, durationInFrames], [-40, 40]);\n    const verticalOffset = -150;\n    const fadeInOpacity = interpolate(frame, [0, 6], [0, 1], {\n      extrapolateRight: 'clamp',\n    });\n    const slideY = interpolate(frame, [99, 105], [0, -550], {\n      extrapolateLeft: 'clamp',\n      extrapolateRight: 'clamp',\n    });\n\n    return (\n      <AbsoluteFill style={{ opacity: fadeInOpacity, transform: `translateY(${slideY}px)` }}>\n        <Img\n          src={assets.images.aisle2}\n          style={{\n            position: 'absolute',\n            width: '140%',\n            height: 'auto',\n            left: '50%',\n            top: '50%',\n            transform: `translate(-50%, -50%) translateX(${panX}px) translateY(${verticalOffset}px)`,\n          }}\n        />\n      </AbsoluteFill>\n    );\n  };\n\n  const Scene4 = () => {\n    const frame = useCurrentFrame();\n    \n    const slideY = interpolate(frame, [0, 6], [550, 0], {\n      extrapolateLeft: 'clamp',\n      extrapolateRight: 'clamp',\n    });\n    const scale = interpolate(frame, [6, 126], [1, 1.3], {\n      extrapolateLeft: 'clamp',\n      extrapolateRight: 'clamp',\n    });\n    const opacity = interpolate(frame, [135, 141], [1, 0], {\n      extrapolateLeft: 'clamp',\n    });\n\n    return (\n      <AbsoluteFill style={{ transform: `translateY(${slideY}px)`, opacity }}>\n        <Img\n          src={assets.images.aisle2}\n          style={{\n            width: '100%',\n            height: '100%',\n            objectFit: 'cover',\n            transformOrigin: 'center 75%',\n            transform: `scale(${scale})`,\n          }}\n        />\n      </AbsoluteFill>\n    );\n  };\n\n  const Scene5 = () => {\n    const frame = useCurrentFrame();\n    const opacity = interpolate(frame, [0, 15, 114, 120], [0, 1, 1, 0], {\n      extrapolateLeft: 'clamp',\n      extrapolateRight: 'clamp',\n    });\n\n    return (\n      <AbsoluteFill style={{ opacity }}>\n        <Img\n          src={assets.images.aisle1}\n          style={{\n            width: '100%',\n            height: '100%',\n            objectFit: 'cover',\n            filter: 'blur(8px)',\n          }}\n        />\n      </AbsoluteFill>\n    );\n  };\n\n  return (\n    <AbsoluteFill style={{ backgroundColor: 'black' }}>\n      <Sequence from={0} durationInFrames={120}>\n        <Scene1 />\n      </Sequence>\n      <Sequence from={120} durationInFrames={120}>\n        <Scene2 />\n      </Sequence>\n      <Sequence from={339} durationInFrames={141}>\n        <Scene4 />\n      </Sequence>\n      <Sequence from={240} durationInFrames={105}>\n        <Scene3 />\n      </Sequence>\n      <Sequence from={480} durationInFrames={120}>\n        <Scene5 />\n      </Sequence>\n    </AbsoluteFill>\n  );\n};",
  durationInFrames: 600,
  fps: 30,
};

const j = {
  code: "import React from 'react';\nimport { AbsoluteFill, Sequence, Img, Html5Audio, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';\n\nexport const MyAnimation = () => {\n  const assets = {\n    images: {\n      img1: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1768940103094-3x51cic.jpg',\n      img2: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1768940103977-xq4qjc8.jpg',\n      img3: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/images/images/1768940105310-wrlyhpv.jpg',\n    },\n    voiceovers: {\n      vo1: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/ebc3fa00-c0f4-4162-9053-7162ce336710.wav',\n      vo2: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/29edc480-8c87-407f-a588-91e44020d413.wav',\n      vo3: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/ae8ccb1d-a55e-4601-b7a6-41a4f8906588.wav',\n      vo4: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/e70ebf44-825d-4dd0-9c40-0bc525ad42f1.wav',\n      vo5: 'https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/public/audios/voiceovers/497040de-e818-47cc-9b67-718bfac4163e.wav',\n    },\n  };\n\n  const Scene1 = () => {\n    const frame = useCurrentFrame();\n    const { durationInFrames } = useVideoConfig();\n\n    const translateX = interpolate(frame, [0, 120], [20, -20]);\n\n    return (\n      <AbsoluteFill style={{ backgroundColor: 'white' }}>\n        <Img\n          src={assets.images.img1}\n          style={{\n            width: '100%',\n            height: '100%',\n            objectFit: 'cover',\n            objectPosition: 'right center',\n            transform: `translateX(${translateX}px)`,\n            transformOrigin: 'center center',\n          }}\n        />\n      </AbsoluteFill>\n    );\n  };\n\n  const Scene2 = () => {\n    const frame = useCurrentFrame();\n    const { durationInFrames } = useVideoConfig(); // Duration of the sequence\n\n    // Entrance Transition: Wipe Right\n    const wipeProgress = interpolate(frame, [0, 15], [100, 0], { extrapolateRight: 'clamp' });\n\n    // Main Animation: Ken Burns\n    const scale = interpolate(frame, [0, 135], [1.0, 1.15]);\n    const translateY = interpolate(frame, [0, 135], [0, -30]);\n\n    return (\n      <AbsoluteFill style={{ clipPath: `inset(0 ${wipeProgress}% 0 0)` }}>\n        <Img\n          src={assets.images.img2}\n          style={{\n            width: '100%',\n            height: '100%',\n            objectFit: 'cover',\n            objectPosition: 'center 20%',\n            transformOrigin: 'center 80%',\n            transform: `scale(${scale}) translateY(${translateY}px)`,\n          }}\n        />\n      </AbsoluteFill>\n    );\n  };\n\n  const Scene3 = () => {\n    const frame = useCurrentFrame();\n    const { fps, height } = useVideoConfig();\n\n    // Entrance Transition: Slide Down\n    const slideIn = spring({\n      frame,\n      fps,\n      from: -height,\n      to: 0,\n      durationInFrames: 18,\n    });\n\n    // Main Animation: Zoom In\n    const scale = interpolate(frame, [0, 120], [1.0, 1.2]);\n\n    return (\n      <AbsoluteFill style={{ transform: `translateY(${slideIn}px)` }}>\n        <Img\n          src={assets.images.img3}\n          style={{\n            width: '100%',\n            height: '100%',\n            objectFit: 'cover',\n            objectPosition: 'center 35%',\n            transformOrigin: 'center 35%',\n            transform: `scale(${scale})`,\n          }}\n        />\n      </AbsoluteFill>\n    );\n  };\n\n  const Scene4 = () => {\n    const frame = useCurrentFrame();\n\n    // Entrance Transition: Iris (Expand)\n    const irisRadius = interpolate(frame, [0, 15], [0, 150], { extrapolateRight: 'clamp' });\n\n    // Main Animation: Tilt\n    const yPos = interpolate(frame, [0, 105], [80, 40]);\n\n    return (\n      <AbsoluteFill style={{ clipPath: `circle(${irisRadius}% at center)` }}>\n        <Img\n          src={assets.images.img1}\n          style={{\n            width: '100%',\n            height: '100%',\n            objectFit: 'cover',\n            objectPosition: `center ${yPos}%`,\n            transformOrigin: 'center center',\n          }}\n        />\n      </AbsoluteFill>\n    );\n  };\n\n  const Scene5 = () => {\n    const frame = useCurrentFrame();\n\n    // Entrance Transition: Fade\n    const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });\n\n    // Text Animation: Fade In\n    const textOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });\n\n    return (\n      <AbsoluteFill style={{ opacity, backgroundColor: 'black' }}>\n        <Img\n          src={assets.images.img2}\n          style={{\n            width: '100%',\n            height: '100%',\n            objectFit: 'cover',\n            filter: 'blur(20px)',\n            opacity: 0.7,\n          }}\n        />\n        <AbsoluteFill\n          style={{\n            display: 'flex',\n            flexDirection: 'column',\n            justifyContent: 'center',\n            alignItems: 'center',\n            color: 'white',\n            fontFamily: 'sans-serif',\n            textAlign: 'center',\n            opacity: textOpacity,\n          }}\n        >\n          <div style={{ fontSize: '120px', fontWeight: 'bold' }}>YOUR STORE NAME</div>\n          <div style={{ fontSize: '80px', margin: '20px 0' }}>123 Main Street</div>\n          <div style={{ fontSize: '60px', fontStyle: 'italic' }}>Great Products, Great Prices.</div>\n        </AbsoluteFill>\n      </AbsoluteFill>\n    );\n  };\n\n  return (\n    <AbsoluteFill style={{ backgroundColor: 'black' }}>\n      <Sequence from={0} durationInFrames={120}>\n        <Html5Audio src={assets.voiceovers.vo1} />\n        <Scene1 />\n      </Sequence>\n      <Sequence from={120} durationInFrames={135}>\n        <Html5Audio src={assets.voiceovers.vo2} />\n        <Scene2 />\n      </Sequence>\n      <Sequence from={255} durationInFrames={120}>\n        <Html5Audio src={assets.voiceovers.vo3} />\n        <Scene3 />\n      </Sequence>\n      <Sequence from={375} durationInFrames={105}>\n        <Html5Audio src={assets.voiceovers.vo4} />\n        <Scene4 />\n      </Sequence>\n      <Sequence from={480} durationInFrames={120}>\n        <Html5Audio src={assets.voiceovers.vo5} />\n        <Scene5 />\n      </Sequence>\n    </AbsoluteFill>\n  );\n};",
  durationInFrames: 600,
  fps: 30,
};
