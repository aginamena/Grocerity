"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  IconButton,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  useMediaQuery,
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  VideoCall,
  AutoFixHigh,
  FileDownload,
} from "@mui/icons-material";
import { Player } from "@remotion/player";
import { renderMediaOnWeb } from "@remotion/web-renderer";
import confetti from "canvas-confetti";
import { compileCode } from "@/lib/remotion/compiler";
import { extractComponentCode } from "@/app/util";

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

  async function generateVideo() {
    if (selectedImages.length === 0 || !prompt.trim()) {
      setError("Please upload images and provide a description.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const uploadFormData = new FormData();
      selectedImages.forEach((img) => uploadFormData.append("images", img));
      uploadFormData.append("prompt", prompt);

      const request = await fetch("/api/generateVideo", {
        method: "POST",
        body: uploadFormData,
      });
      if (!request.ok) throw new Error("Generation failed");

      const response = await request.json();
      setCurrentDesign(response.design);
      const parsed = JSON.parse(response.result);
      let cleanedCode = extractComponentCode(
        parsed.code.replace(/^```tsx?\n?/, "").replace(/\n?```$/, ""),
      );

      sessionStorage.setItem("createdCode", cleanedCode);
      sessionStorage.setItem(
        "durationInFrames",
        parsed.durationInFrames?.toString() || "150",
      );
      setHasGeneratedVideo(true);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function DynamicComponent() {
    if (typeof window === "undefined") return null;
    const code = sessionStorage.getItem("createdCode");
    const compilation = compileCode(code || "");
    const Comp = compilation.Component;
    return Comp ? <Comp /> : null;
  }

  return (
    <Box>
      <Typography
        variant="h6"
        fontWeight="600"
        gutterBottom
        sx={{ color: "#e2e8f0" }}
      >
        Upload Your Images
      </Typography>
      <Button
        component="label"
        variant="outlined"
        startIcon={<CloudUpload />}
        disabled={loading}
        fullWidth
        sx={{
          mb: 3,
          py: 1.5,
          borderStyle: "dashed",
          borderColor: "rgba(139, 92, 246, 0.5)",
          color: "#a855f7",
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

      {imagePreviews.length > 0 && (
        <Grid container spacing={1} sx={{ mb: 3 }}>
          {imagePreviews.map((src, i) => (
            <Grid key={i} item xs={4} sm={3} md={2}>
              <Card
                sx={{
                  position: "relative",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                }}
              >
                <CardMedia
                  component="img"
                  image={src}
                  sx={{ height: 80, objectFit: "cover" }}
                />
                <IconButton
                  size="small"
                  onClick={() => removeImage(i)}
                  sx={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    bgcolor: "#ef4444",
                    color: "white",
                  }}
                >
                  <Delete sx={{ fontSize: 16 }} />
                </IconButton>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Typography
        variant="h6"
        fontWeight="600"
        gutterBottom
        sx={{ color: "#e2e8f0" }}
      >
        Describe Your Video
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={6}
        placeholder="Describe the video ad..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        sx={{
          mb: 3,
          "& .MuiOutlinedInput-root": {
            bgcolor: "rgba(22, 33, 62, 0.6)",
            color: "#e2e8f0",
          },
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
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
          py: 1.5,
          fontWeight: "bold",
          background: "linear-gradient(45deg, #8b5cf6 30%, #a855f7 90%)",
        }}
      >
        {loading ? "Creating..." : "Create Video"}
      </Button>

      {hasGeneratedVideo && !loading && (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Box
            sx={{
              display: "inline-block",
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid rgba(139, 92, 246, 0.3)",
            }}
          >
            <Player
              component={DynamicComponent as any}
              durationInFrames={Number(
                sessionStorage.getItem("durationInFrames") || 150,
              )}
              compositionWidth={320}
              compositionHeight={550}
              fps={30}
              controls
              style={{ width: isMobile ? "280px" : "320px" }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
