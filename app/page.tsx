"use client";

import { compileCode } from "@/lib/remotion/compiler";
import {
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

  async function generateDesign() {
    if (selectedImages.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    if (!prompt.trim()) {
      setError("Please describe your video.");
      return;
    }
    setImagePreviews([]);
    setSelectedImages([]);
    setPrompt("");
    setLoading(true);
    setError(null);

    try {
      const uploadFormData = new FormData();
      selectedImages.forEach((img) => {
        uploadFormData.append("images", img);
      });
      uploadFormData.append("prompt", prompt);

      const request = await fetch("/api/generate_video", {
        method: "POST",
        body: uploadFormData,
      });

      if (!request.ok) {
        throw new Error("Failed to generate video");
      }
      const response = await request.json();
      const parsedResponse = JSON.parse(response.result);
      let finalCode = parsedResponse.code.replace(/^```(?:tsx?|jsx?)?\n?/, "");
      finalCode = finalCode.replace(/\n?```\s*$/, "");
      finalCode = extractComponentCode(finalCode);

      sessionStorage.setItem("createdCode", finalCode.toString());
      sessionStorage.setItem(
        "durationInFrames",
        parsedResponse.durationInFrames?.toString() || "150",
      );
      setHasGeneratedVideo(true);

      // 🎉 Trigger confetti celebration
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#8b5cf6", "#a855f7", "#d946ef", "#4ade80", "#38bdf8"],
      });

      // Fire confetti from both sides for extra celebration
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
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
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
      text: "You grow your audience and increase sales through short-form video",
      color: "#4ade80",
    },
  ];

  // Cycle through loading messages
  useEffect(() => {
    if (!loading) {
      setLoadingMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [loading]);

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
              boost awareness, increase sales, and grow your audience!
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
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 3 : 4}
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
            onClick={generateDesign}
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
                  mb: 3,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                ⏳ Creating a professional video can take up to 4 minutes...
                Please be patient.
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "rgba(255, 255, 255, 0.6)",
                  mb: 2,
                  fontWeight: 500,
                }}
              >
                At Grocerity, our mission is to make sure that...
              </Typography>
              <Box
                sx={{
                  minHeight: { xs: 60, sm: 50 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant={isMobile ? "body1" : "h6"}
                  sx={{
                    color: loadingMessages[loadingMessageIndex].color,
                    fontWeight: 600,
                    transition: "all 0.5s ease-in-out",
                    animation: "fadeInUp 0.5s ease-out",
                    "@keyframes fadeInUp": {
                      "0%": {
                        opacity: 0,
                        transform: "translateY(10px)",
                      },
                      "100%": {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    },
                  }}
                  key={loadingMessageIndex}
                >
                  {loadingMessages[loadingMessageIndex].text}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 1,
                  mt: 2,
                }}
              >
                {loadingMessages.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor:
                        index === loadingMessageIndex
                          ? loadingMessages[loadingMessageIndex].color
                          : "rgba(255, 255, 255, 0.3)",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </Box>
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
                  ⏳ Downloading your video can take up to 1 minute... Please be
                  patient.
                </Typography>
              )}
            </Box>
          )}
        </Paper>

        {/* Footer */}
        <Typography
          variant="body2"
          sx={{
            textAlign: "center",
            mt: { xs: 3, md: 5 },
            color: "rgba(255, 255, 255, 0.5)",
            fontStyle: "italic",
            fontSize: { xs: "0.875rem", sm: "1rem" },
          }}
        >
          Grocerity is made with love ❤️
        </Typography>
      </Container>
    </Box>
  );
}
