"use client";

import Pricing from "@/components/Pricing";
import Showcase from "@/components/Showcase";
import { compileCode } from "@/lib/remotion/compiler";
import {
  AutoFixHigh,
  CloudUpload,
  Delete,
  Description,
  Download,
  FileDownload,
  PhotoLibrary,
  PlayCircle,
  VideoCall,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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
import { extractComponentCode } from "./util";

export default function Home() {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [hasGeneratedVideo, setHasGeneratedVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  //for edits
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
              const compressedFile = new File([blob!], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
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
      setError("You can upload a maximum of 10 images.");
      return;
    }

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
    let finalDuration = "150";

    while (attempts < maxAttempts && !success) {
      attempts++;
      try {
        let currentIterCode = "";
        let currentIterDuration = "150";

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
            parsedResponse.durationInFrames?.toString() || "150";
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
          currentIterDuration = lastCode ? finalDuration : "150"; // Keep previous duration or default
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

  const steps = [
    {
      icon: <PhotoLibrary />,
      text: "Upload the images of the products you sell in the store",
    },
    {
      icon: <Description />,
      text: "Give a clear description of the video you want to create",
    },
    {
      icon: <PlayCircle />,
      text: "Click the Generate Video button to start creating your video",
    },
    {
      icon: <Download />,
      text: "Watch your created video and download it to post on social media",
    },
  ];

  // Highlighted text styles
  const highlightStyles = {
    stopWasting: {
      color: "#f87171",
      fontWeight: 700,
    },
    generate: {
      color: "#a855f7",
      fontWeight: 700,
    },
    postConsistently: {
      color: "#38bdf8",
      fontWeight: 700,
    },
    growSales: {
      color: "#4ade80",
      fontWeight: 700,
    },
  };

  // Responsive video player dimensions
  const getVideoPlayerSize = () => {
    if (isMobile) {
      return { width: 280, height: 480 };
    }
    return { width: 320, height: 550 };
  };

  const videoSize = getVideoPlayerSize();

  const loadingMessages = [
    {
      text: "You spend less time planning content and more time growing your business",
      color: "#f87171",
    },
    {
      text: "You generate professional product videos in seconds",
      color: "#a855f7",
    },
    {
      text: "You increase sales through our short-form video",
      color: "#4ade80",
    },
  ];
  const PROMPT_TEMPLATES = [
    {
      label: "Fresh Arrival",
      text: `Using the attached images, create a promotional video announcing a fresh arrival or new product now available in-store. Highlight freshness, quality, or uniqueness. End with a clear call to action telling viewers where and how to shop.

Product Information:
[Enter product name, category, and key highlights such as freshness, origin, seasonality, or brand]

Availability:
[Now available / Limited time / Seasonal]

Call to Action (end of video):
Phone: [Enter phone number]
Address: [Enter store address]

Additional Notes (optional):
[Include tone, style, audience, or any other details to guide the video creation]`,
    },
    {
      label: "Product(s) Spotlight",
      text: `Using the attached images, create a promotional video highlighting the featured product(s). Emphasize the value of the special(s) and include a clear, compelling call to action that tells viewers exactly where and how to purchase.

Product Information:
[Enter product details, pricing, and any special offers here]

Call to Action (end of video):
Phone: [Enter phone number]
Address: [Enter store address]

Additional Notes (optional):
[Include tone, style, audience, or any other details to guide the video creation]`,
    },
  ];

  // Cycle through loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [loadingMessages.length]);

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
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
        py: { xs: 3, sm: 4, md: 6 },
        px: { xs: 2, sm: 0 },
      }}
    >
      <Container maxWidth="md">
        {/* Hero Section */}
        <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 4, md: 5 } }}>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            component="h1"
            fontWeight="bold"
            gutterBottom
            sx={{
              background:
                "linear-gradient(90deg, #8b5cf6 0%, #a855f7 50%, #d946ef 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.2,
              mb: { xs: 2, md: 3 },
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3rem" },
            }}
          >
            Create short videos to promote your grocery products on social media
          </Typography>
          <Typography
            variant={isMobile ? "body1" : "h6"}
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              maxWidth: 700,
              mx: "auto",
              lineHeight: { xs: 1.7, md: 1.9 },
              fontWeight: 400,
              fontSize: { xs: "0.95rem", sm: "1rem", md: "1.25rem" },
              px: { xs: 1, sm: 2, md: 0 },
            }}
          >
            <Box component="span" sx={highlightStyles.stopWasting}>
              Stop wasting time deciding what to post.
            </Box>{" "}
            <Box component="span" sx={highlightStyles.generate}>
              Instantly generate professional short-form videos
            </Box>{" "}
            showcasing your products to{" "}
            <Box component="span" sx={highlightStyles.growSales}>
              boost awareness and increase sales!
            </Box>
          </Typography>
        </Box>

        {/* How It Works Section */}
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: { xs: 3, md: 4 },
            borderRadius: { xs: 2, md: 3 },
            background: "rgba(26, 26, 46, 0.6)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(139, 92, 246, 0.15)",
          }}
        >
          <Typography
            variant={isMobile ? "h6" : "h5"}
            fontWeight="600"
            sx={{
              color: "#e2e8f0",
              mb: 2,
              textAlign: "center",
            }}
          >
            How It Works
          </Typography>
          <List sx={{ py: 0 }}>
            {steps.map((step, index) => (
              <ListItem
                key={index}
                sx={{
                  py: { xs: 1, sm: 1.5 },
                  px: { xs: 1, sm: 2 },
                  borderRadius: 2,
                  mb: 1,
                  flexDirection: { xs: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  "&:hover": {
                    backgroundColor: "rgba(139, 92, 246, 0.08)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: { xs: 40, sm: 48 },
                    mt: { xs: 0.5, sm: 0 },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 32, sm: 36 },
                      height: { xs: 32, sm: 36 },
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: { xs: "1rem", sm: "1.2rem" },
                    }}
                  >
                    {step.icon}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={step.text}
                  sx={{
                    color: "rgba(255, 255, 255, 0.85)",
                    fontWeight: 500,
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Main Card */}
        <Paper
          elevation={10}
          sx={{
            p: { xs: 2.5, sm: 3, md: 4 },
            borderRadius: { xs: 3, md: 4 },
            background: "rgba(26, 26, 46, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
          }}
        >
          {/* Image Upload Section */}
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            fontWeight="600"
            gutterBottom
            sx={{ color: "#e2e8f0" }}
          >
            Upload Your Images
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
            fullWidth={isMobile}
            sx={{
              mb: 3,
              py: { xs: 1.2, sm: 1.5 },
              px: { xs: 3, sm: 4 },
              borderStyle: "dashed",
              borderWidth: 2,
              borderColor: "rgba(139, 92, 246, 0.5)",
              color: "#a855f7",
              fontSize: { xs: "0.875rem", sm: "1rem" },
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

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <Grid
              container
              spacing={{ xs: 1, sm: 2 }}
              sx={{ mb: { xs: 3, md: 4 } }}
            >
              {imagePreviews.map((src, i) => (
                <Grid size={{ xs: 4, sm: 3, md: 2 }} key={i}>
                  <Card
                    sx={{
                      position: "relative",
                      backgroundColor: "#16213e",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      borderRadius: { xs: 1.5, sm: 2 },
                      overflow: "hidden",
                      "&:hover .delete-btn": { opacity: 1 },
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={src}
                      sx={{
                        height: { xs: 80, sm: 100 },
                        objectFit: "cover",
                      }}
                    />
                    <IconButton
                      className="delete-btn"
                      size="small"
                      onClick={() => removeImage(i)}
                      sx={{
                        position: "absolute",
                        top: { xs: 2, sm: 4 },
                        right: { xs: 2, sm: 4 },
                        bgcolor: "#ef4444",
                        color: "white",
                        opacity: { xs: 1, sm: 0.8 },
                        transition: "opacity 0.2s",
                        padding: { xs: "4px", sm: "8px" },
                        "&:hover": {
                          bgcolor: "#dc2626",
                          opacity: 1,
                        },
                      }}
                    >
                      <Delete sx={{ fontSize: { xs: 16, sm: 20 } }} />
                    </IconButton>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Prompt Input */}
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            fontWeight="600"
            gutterBottom
            sx={{ color: "#e2e8f0" }}
          >
            Describe Your Video
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
            }}
          >
            You can choose one of the templates below (and fill it up) or write
            your own!
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
                  fontSize: { xs: "0.75rem", sm: "0.85rem" },
                  "&:hover": {
                    borderColor: "#8b5cf6",
                    backgroundColor: "rgba(139, 92, 246, 0.1)",
                  },
                }}
              >
                {template.label}
              </Button>
            ))}
          </Stack>
          <TextField
            fullWidth
            multiline
            rows={8}
            placeholder="E.g., Create a high-energy video ad showcasing these products with dynamic transitions. Include a call-to-action to visit our store..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(22, 33, 62, 0.6)",
                fontSize: { xs: "0.875rem", sm: "1rem" },
                "& fieldset": {
                  borderColor: "rgba(139, 92, 246, 0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(139, 92, 246, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#8b5cf6",
                },
              },
              "& .MuiInputBase-input": {
                color: "#e2e8f0",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "rgba(255, 255, 255, 0.4)",
                opacity: 1,
              },
            }}
          />

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fca5a5",
                fontSize: { xs: "0.875rem", sm: "1rem" },
                "& .MuiAlert-icon": {
                  color: "#f87171",
                },
              }}
            >
              {error}
            </Alert>
          )}

          {/* Generate Button */}
          <Button
            variant="contained"
            size={isMobile ? "medium" : "large"}
            fullWidth
            onClick={generateVideo}
            disabled={loading || selectedImages.length === 0}
            startIcon={
              loading ? (
                <CircularProgress size={isMobile ? 18 : 20} color="inherit" />
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

          {/* Loading Value Propositions */}
          {loading && (
            <Box
              sx={{
                mt: 4,
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                background: "rgba(139, 92, 246, 0.08)",
                border: "1px solid rgba(139, 92, 246, 0.2)",
                textAlign: "center",
              }}
            >
              {/* Patience Message */}
              <Typography
                variant="body2"
                sx={{
                  color: "#fbbf24",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                ⏳ Creating a professional video can take a few minutes...
                Please be patient.
              </Typography>
            </Box>
          )}

          {/* Video Player */}
          {!loading && hasGeneratedVideo && (
            <Box sx={{ mt: { xs: 3, md: 4 }, textAlign: "center" }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                fontWeight="600"
                gutterBottom
                sx={{ color: "#e2e8f0" }}
              >
                Your Created Video
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "0 4px 30px rgba(139, 92, 246, 0.3)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  mx: "auto",
                  maxWidth: "fit-content",
                }}
              >
                <Player
                  component={Component()}
                  durationInFrames={parseInt(
                    sessionStorage.getItem("durationInFrames") || "150",
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
                size={isMobile ? "medium" : "large"}
                startIcon={
                  downloading ? (
                    <CircularProgress
                      size={isMobile ? 18 : 20}
                      color="inherit"
                    />
                  ) : (
                    <FileDownload />
                  )
                }
                disabled={downloading}
                sx={{
                  py: { xs: 1.2, sm: 1.5 },
                  px: { xs: 4, sm: 5 },
                  mt: { xs: 2.5, sm: 3 },
                  fontSize: { xs: "0.95rem", sm: "1.1rem" },
                  fontWeight: "bold",
                  background:
                    "linear-gradient(45deg, #4ade80 30%, #22c55e 90%)",
                  boxShadow: "0 4px 20px rgba(74, 222, 128, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #22c55e 30%, #16a34a 90%)",
                    boxShadow: "0 6px 25px rgba(74, 222, 128, 0.4)",
                    transform: "translateY(-2px)",
                  },
                  "&:disabled": {
                    background:
                      "linear-gradient(45deg, #4ade80 30%, #22c55e 90%)",
                    opacity: 0.7,
                    color: "white",
                  },
                  transition: "all 0.2s ease",
                }}
                onClick={renderAndDownload}
              >
                {downloading ? "Downloading..." : "Download Video"}
              </Button>
              <Box sx={{ mt: 4, width: "100%", maxWidth: 500, mx: "auto" }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#e2e8f0", mb: 1, textAlign: "left" }}
                >
                  Want to change something?
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="e.g, Change the address to 123 Main St. or I don't like the 5th caption, remove it from the image."
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  sx={{
                    mb: 2,
                    background: "rgba(255, 255, 255, 0.05)",
                    "& .MuiOutlinedInput-root": { color: "white" },
                  }}
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
                  sx={{
                    borderColor: "#a855f7",
                    color: "#a855f7",
                    "&:hover": {
                      borderColor: "#8b5cf6",
                      bgcolor: "rgba(139, 92, 246, 0.1)",
                    },
                  }}
                >
                  {isEditing ? "Editing Video..." : "Apply Changes"}
                </Button>
              </Box>
              {/* Downloading Patience Message */}
              {downloading && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#fbbf24",
                    mt: 2,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  ⏳ Downloading your video can take a few minutes... Please be
                  patient.
                </Typography>
              )}
            </Box>
          )}
        </Paper>
        <Showcase />
        <Pricing />
        <Box sx={{ mt: 8, textAlign: "center", pb: 4 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "rgba(255, 255, 255, 0.5)",
              mb: 3,
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontSize: "0.75rem",
            }}
          >
            At Grocerity, our mission is to make sure that...
          </Typography>

          <Box
            sx={{
              minHeight: { xs: 80, sm: 100 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: { xs: 2, md: 4 },
            }}
          >
            <Typography
              variant={isMobile ? "h6" : "h4"}
              sx={{
                color: loadingMessages[loadingMessageIndex].color,
                fontWeight: 700,
                transition: "color 0.4s ease",
                animation: "slideIn 0.4s ease-out",
                lineHeight: 1.4,
                "@keyframes slideIn": {
                  "0%": { opacity: 0, transform: "translateY(15px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" },
                },
              }}
              key={loadingMessageIndex}
            >
              {loadingMessages[loadingMessageIndex].text}
            </Typography>
          </Box>

          {/* Styled Indicators */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1.5,
              mt: 4,
            }}
          >
            {loadingMessages.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: index === loadingMessageIndex ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    index === loadingMessageIndex
                      ? loadingMessages[loadingMessageIndex].color
                      : "rgba(255, 255, 255, 0.2)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Footer */}
        <Typography
          variant="body2"
          sx={{
            textAlign: "center",
            mt: 4,
            color: "rgba(255, 255, 255, 0.4)",
            fontStyle: "italic",
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          Grocerity is made with love{" "}
          <Box component="span" sx={{ color: "#f43f5e" }}>
            ❤️
          </Box>
        </Typography>
      </Container>
    </Box>
  );
}
