"use client";

import { extractComponentCode } from "@/app/util";
import { compileCode } from "@/lib/remotion/compiler";
import {
  AutoFixHigh,
  CloudUpload,
  Delete,
  FileDownload,
  VideoCall,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Player } from "@remotion/player";
import { renderMediaOnWeb } from "@remotion/web-renderer";
import confetti from "canvas-confetti";
import React, { useEffect, useState } from "react";

const PROMPT_TEMPLATES = [
  {
    label: "Fresh Arrival",
    text: `Using the attached images, create a promotional video announcing a fresh arrival...`,
  },
  {
    label: "Product Spotlight",
    text: `Using the attached images, create a promotional video highlighting the featured product(s)...`,
  },
];

export default function CreateVideo() {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [hasGeneratedVideo, setHasGeneratedVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDesign, setCurrentDesign] = useState<any>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);

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
              resolve(new File([blob!], file.name, { type: "image/jpeg" }));
            },
            "image/jpeg",
            0.7,
          );
        };
      };
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedImages.length + files.length > 10) {
      setError("Maximum 10 images allowed.");
      return;
    }
    const compressed = await Promise.all(files.map(compressImage));
    const newImages = [...selectedImages, ...compressed];
    setSelectedImages(newImages);
    setImagePreviews(newImages.map((f) => URL.createObjectURL(f)));
    setError(null);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newImages.map((f) => URL.createObjectURL(f)));
  };
  function Component(): React.ComponentType {
    if (typeof window === "undefined") return () => null;
    const code = sessionStorage.getItem("createdCode");
    const compilationResult = compileCode(code || "");
    return compilationResult.Component ?? (() => null);
  }
  async function renderAndDownload() {
    setDownloading(true);
    try {
      const { getBlob } = await renderMediaOnWeb({
        composition: {
          component: Component(),
          durationInFrames: parseInt(
            sessionStorage.getItem("durationInFrames") || "1200",
            10,
          ),
          fps: 30,
          width: 320,
          height: 550,
          id: "my-composition",
        },
      });

      const blob = await getBlob();

      // trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-video.mp4";
      a.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
      alert("Your video has downloaded!");
    } catch (err) {
      setError("Failed to download video. Please try again.");
      console.log(err instanceof Error ? err.message : "Unknown error");
    }
  }
  async function handleEditVideo() {
    if (!editPrompt.trim()) {
      setError("Please describe what you want to change.");
      return;
    }

    setLoading(true);
    setIsEditing(true);
    setError(null);

    try {
      const response = await fetch("/api/editVideo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          design: currentDesign,
          editPrompt: editPrompt,
        }),
      });

      if (!response.ok) throw new Error("Edit request failed");

      const { design, result } = await response.json();
      const parsedResult = JSON.parse(result);
      let cleanedCode = parsedResult.code
        .replace(/^```(?:tsx?|jsx?)?\n?/, "")
        .replace(/\n?```\s*$/, "");
      cleanedCode = extractComponentCode(cleanedCode);

      sessionStorage.setItem("createdCode", cleanedCode);
      sessionStorage.setItem(
        "durationInFrames",
        parsedResult.durationInFrames.toString(),
      );
      setCurrentDesign(design);
      setEditPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to edit video");
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  }

  async function generateVideo() {
    if (selectedImages.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    if (!prompt.trim()) {
      setError("Please describe your video.");
      return;
    }

    setLoading(true);
    setError(null);

    const originalPrompt = prompt;
    let attempts = 0;
    const maxAttempts = 3;
    let success = false;
    let lastError = "";
    let lastCode = "";
    let finalDuration = "1200";

    while (attempts < maxAttempts && !success) {
      attempts++;
      try {
        let currentIterCode = "";
        let currentIterDuration = "1200";

        if (attempts === 1) {
          // First attempt: Regular generation
          const uploadFormData = new FormData();
          selectedImages.forEach((img) => uploadFormData.append("images", img));
          uploadFormData.append("prompt", originalPrompt);

          const request = await fetch("/api/generateVideo", {
            // Updated path to match folder name
            method: "POST",
            body: uploadFormData,
          });

          if (!request.ok) {
            const errorText = await request.text();
            throw new Error(`Initial generation failed: ${errorText}`);
          }

          const response = await request.json();
          setCurrentDesign(response.design);
          const parsedResponse = JSON.parse(response.result); // response.result is a stringified JSON from Gemini
          currentIterCode = parsedResponse.code;
          currentIterDuration =
            parsedResponse.durationInFrames?.toString() || "1200";
        } else {
          // Subsequent attempts: Use the dedicated Fix API
          const fixRequest = await fetch("/api/fixCodeErrors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: lastCode, error: lastError }),
          });

          if (!fixRequest.ok) throw new Error("Fix attempt failed");
          const fixResponse = await fixRequest.json();
          // The fix API returns { result: '{"code": "...", "explanation": "..."}' } based on your route implementation
          const parsedFix = JSON.parse(fixResponse.result);
          currentIterCode = parsedFix.code;
          currentIterDuration = lastCode ? finalDuration : "1200"; // Keep previous duration or default
        }

        // Clean and prepare code
        let cleanedCode = currentIterCode
          .replace(/^```(?:tsx?|jsx?)?\n?/, "")
          .replace(/\n?```\s*$/, "");
        cleanedCode = extractComponentCode(cleanedCode);
        // Format code using the specialized API
        try {
          const formatRequest = await fetch("/api/formatCode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: cleanedCode }),
          });

          if (formatRequest.ok) {
            const formatResponse = await formatRequest.json();
            cleanedCode = formatResponse.formatted;
          }
        } catch (formatErr) {
          console.warn("Formatting failed, using raw code:", formatErr);
        }

        lastCode = cleanedCode;

        // Validate the code via compilation
        const compilation = compileCode(cleanedCode);
        if (compilation.error) {
          console.warn(
            `Attempt ${attempts} failed validation:`,
            compilation.error,
          );
          lastError = compilation.error;
          continue;
        }

        // SUCCESS: Update state and storage
        setImagePreviews([]);
        setSelectedImages([]);
        setPrompt("");

        // Save to Supabase via API
        try {
          await fetch("/api/saveVideo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              design: currentDesign,
              code: cleanedCode,
              durationInFrames: parseInt(currentIterDuration),
            }),
          });
        } catch (dbErr) {
          console.error("Failed to save video to database:", dbErr);
        }

        sessionStorage.setItem("createdCode", cleanedCode);
        sessionStorage.setItem("durationInFrames", currentIterDuration);
        setHasGeneratedVideo(true);
        success = true;

        // 🎉 Celebratory confetti
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#8b5cf6", "#a855f7", "#d946ef", "#4ade80", "#38bdf8"],
        });

        setTimeout(() => {
          confetti({
            particleCount: 100,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#8b5cf6", "#a855f7", "#d946ef"],
          });
          confetti({
            particleCount: 100,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#8b5cf6", "#a855f7", "#d946ef"],
          });
        }, 250);
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Unknown error";
        console.error(`Attempt ${attempts} error:`, lastError);
      }
    }

    if (!success) {
      setError(
        `Failed to generate a valid video after ${maxAttempts} attempts. Last error: ${lastError}`,
      );
    }

    setLoading(false);
  }

  // Responsive video player dimensions
  const getVideoPlayerSize = () => {
    if (isMobile) {
      return { width: 280, height: 480 };
    }
    return { width: 320, height: 550 };
  };

  const videoSize = getVideoPlayerSize();

  // Check for existing video on client mount
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      sessionStorage.getItem("createdCode")
    ) {
      setHasGeneratedVideo(true);
    }
  }, []);

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      {/* Image Upload Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
          fontWeight="600"
          gutterBottom
          sx={{ color: "#e2e8f0" }}
        >
          1. Upload Your Images
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mb: 2,
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: { xs: "0.8rem", sm: "0.875rem" },
          }}
        >
          Select up to 10 images for your video (JPG, PNG, WebP)
        </Typography>

        <Button
          component="label"
          variant="outlined"
          startIcon={<CloudUpload />}
          disabled={loading}
          fullWidth
          sx={{
            py: { xs: 1.5, sm: 2 },
            borderStyle: "dashed",
            borderWidth: 2,
            borderColor: "rgba(139, 92, 246, 0.5)",
            color: "#a855f7",
            "&:hover": {
              borderStyle: "dashed",
              borderWidth: 2,
              borderColor: "#8b5cf6",
              backgroundColor: "rgba(139, 92, 246, 0.1)",
            },
          }}
        >
          Choose Images
          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
        </Button>
      </Box>

      {/* Image Previews */}
      {imagePreviews.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {imagePreviews.map((src, i) => (
            <Grid key={i} size={{ xs: 4, sm: 3, md: 2.4 }}>
              <Card
                sx={{
                  position: "relative",
                  backgroundColor: "#16213e",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <CardMedia
                  component="img"
                  image={src}
                  sx={{ height: 100, objectFit: "cover" }}
                />
                <IconButton
                  size="small"
                  onClick={() => removeImage(i)}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    bgcolor: "rgba(239, 68, 68, 0.9)",
                    color: "white",
                    "&:hover": { bgcolor: "#dc2626" },
                  }}
                >
                  <Delete sx={{ fontSize: 16 }} />
                </IconButton>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Prompt Input */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
          fontWeight="600"
          gutterBottom
          sx={{ color: "#e2e8f0" }}
        >
          2. Describe Your Video
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 2 }}
        >
          {PROMPT_TEMPLATES.map((template) => (
            <Button
              key={template.label}
              variant="outlined"
              size="small"
              startIcon={<AutoFixHigh />}
              onClick={() => setPrompt(template.text)}
              disabled={loading}
              sx={{
                color: "#a855f7",
                borderColor: "rgba(139, 92, 246, 0.4)",
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              {template.label}
            </Button>
          ))}
        </Stack>
        <TextField
          fullWidth
          multiline
          rows={5}
          placeholder="E.g., Create a high-energy video ad showcasing these products..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(22, 33, 62, 0.4)",
              "& fieldset": { borderColor: "rgba(139, 92, 246, 0.3)" },
              "&:hover fieldset": { borderColor: "rgba(139, 92, 246, 0.5)" },
            },
            "& .MuiInputBase-input": { color: "#e2e8f0" },
          }}
        />
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, bgcolor: "rgba(239, 68, 68, 0.1)", color: "#fca5a5" }}
        >
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        fullWidth
        onClick={generateVideo}
        disabled={loading || selectedImages.length === 0}
        startIcon={
          loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <VideoCall />
          )
        }
        sx={{
          py: { xs: 1.5, sm: 1.8 },
          fontSize: { xs: "0.95rem", sm: "1.1rem" },
          fontWeight: "bold",
          background: "linear-gradient(45deg, #8b5cf6 30%, #a855f7 90%)",
          boxShadow: "0 4px 20px rgba(139, 92, 246, 0.4)",
          "&:hover": {
            background: "linear-gradient(45deg, #7c3aed 30%, #9333ea 90%)",
            boxShadow: "0 6px 25px rgba(139, 92, 246, 0.5)",
          },
          "&:disabled": {
            background: "rgba(100, 100, 100, 0.3)",
            color: "rgba(255, 255, 255, 0.3)",
          },
        }}
      >
        {loading ? "Creating Your Video..." : "Create Video"}
      </Button>

      {loading && (
        <Box
          sx={{
            textAlign: "center",
            p: 3,
            bgcolor: "rgba(139, 92, 246, 0.05)",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "#fbbf24" }}>
            ⏳ This usually takes a few minutes. Please stay on this page.
          </Typography>
        </Box>
      )}

      {/* Video Player & Edit Section */}
      {!loading && hasGeneratedVideo && (
        <Stack spacing={4} alignItems="center" sx={{ mt: 8 }}>
          <Typography variant="h6" fontWeight="600" sx={{ color: "#e2e8f0" }}>
            3. Preview & Download
          </Typography>

          <Box
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 0 40px rgba(139, 92, 246, 0.2)",
              border: "4px solid rgba(139, 92, 246, 0.2)",
            }}
          >
            <Player
              component={Component()}
              durationInFrames={parseInt(
                sessionStorage.getItem("durationInFrames") || "1200",
              )}
              compositionWidth={videoSize.width}
              compositionHeight={videoSize.height}
              fps={30}
              controls
              loop
              acknowledgeRemotionLicense
            />
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={
              downloading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <FileDownload />
              )
            }
            disabled={downloading}
            onClick={renderAndDownload}
            sx={{
              px: 6,
              background: "linear-gradient(45deg, #4ade80 30%, #22c55e 90%)",
            }}
          >
            {downloading ? "Downloading..." : "Download Video"}
          </Button>

          <Paper
            sx={{
              p: 3,
              width: "100%",
              bgcolor: "rgba(255, 255, 255, 0.03)",
              borderRadius: 3,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ color: "#e2e8f0", mb: 2, fontWeight: 600 }}
            >
              Refine Your Video
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="e.g. Change the text to 'Sale ends Sunday' or use a faster transition."
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { color: "white" } }}
            />
            <Button
              fullWidth
              variant="outlined"
              startIcon={
                isEditing ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <AutoFixHigh />
                )
              }
              disabled={loading || !editPrompt.trim()}
              onClick={handleEditVideo}
              sx={{ borderColor: "#a855f7", color: "#a855f7" }}
            >
              {isEditing ? "Updating Video..." : "Apply Changes"}
            </Button>
          </Paper>
        </Stack>
      )}
    </Box>
  );
}
