"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Button,
  Grid,
  IconButton,
  Divider,
  Card,
  CardMedia,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  CalendarMonth,
  AddPhotoAlternate as AddPhotoIcon,
  Description as DescriptionIcon,
  Email,
  InfoOutlined,
} from "@mui/icons-material";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface DayConfig {
  prompt: string;
  images: File[];
  previews: string[];
}

export default function ScheduleVideos() {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [dayConfigs, setDayConfigs] = useState<Record<string, DayConfig>>({});
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDayChange = (
    _event: React.MouseEvent<HTMLElement>,
    newDays: string[],
  ) => {
    if (newDays.length <= 4) {
      setSelectedDays(newDays);
      const updatedConfigs = { ...dayConfigs };
      newDays.forEach((day) => {
        if (!updatedConfigs[day]) {
          updatedConfigs[day] = { prompt: "", images: [], previews: [] };
        }
      });
      setDayConfigs(updatedConfigs);
    }
  };

  const handlePromptChange = (day: string, prompt: string) => {
    setDayConfigs((prev) => ({ ...prev, [day]: { ...prev[day], prompt } }));
  };

  const handleImageChange = (
    day: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files) {
      const currentConfig = dayConfigs[day];
      const newFiles = Array.from(e.target.files);
      const totalImages = [...currentConfig.images, ...newFiles].slice(0, 10);
      const newPreviews = totalImages.map((file) => URL.createObjectURL(file));
      currentConfig.previews.forEach((p) => URL.revokeObjectURL(p));
      setDayConfigs((prev) => ({
        ...prev,
        [day]: { ...prev[day], images: totalImages, previews: newPreviews },
      }));
    }
  };

  const removeImage = (day: string, index: number) => {
    const config = dayConfigs[day];
    const newImages = config.images.filter((_, i) => i !== index);
    URL.revokeObjectURL(config.previews[index]);
    const newPreviews = config.previews.filter((_, i) => i !== index);
    setDayConfigs((prev) => ({
      ...prev,
      [day]: { ...prev[day], images: newImages, previews: newPreviews },
    }));
  };

  const handleSubmit = async () => {
    if (selectedDays.length === 0)
      return alert("Please select at least one day");
    if (!email || !/^\S+@\S+\.\S+$/.test(email))
      return alert("Please enter a valid email address");

    for (const day of selectedDays) {
      if (!dayConfigs[day].prompt || dayConfigs[day].images.length === 0) {
        return alert(
          `Incomplete data for ${day}. Need description and images.`,
        );
      }
    }

    setIsProcessing(true);
    try {
      // We now pack all data into a single request to be saved for the cron job
      const formData = new FormData();
      formData.append("email", email);

      selectedDays.forEach((day) => {
        const config = dayConfigs[day];
        formData.append("days", day);
        formData.append(`prompt_${day}`, config.prompt);
        config.images.forEach((img) => formData.append(`images_${day}`, img));
      });

      const response = await fetch("/api/schedule", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to save schedule");

      alert(`Schedule saved!`);
    } catch (error) {
      console.error("Scheduler Error:", error);
      alert("Failed to save schedule. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          bgcolor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(139, 92, 246, 0.2)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <InfoOutlined sx={{ color: "#a855f7" }} />
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#fff" }}>
            How to Use the Scheduler
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
              <span style={{ color: "#a855f7", fontWeight: "bold" }}>
                1. Select Days:
              </span>{" "}
              Pick up to 4 days for recurring weekly video generation.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
              <span style={{ color: "#a855f7", fontWeight: "bold" }}>
                2. Add Content:
              </span>{" "}
              Provide a description and up to 10 images for each selected day.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
              <span style={{ color: "#a855f7", fontWeight: "bold" }}>
                3. Confirm:
              </span>{" "}
              Enter your email and save. We'll handle the weekly generation
              automatically.
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Posting Days Selection */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <CalendarMonth sx={{ color: "#a855f7" }} />
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold" }}>
            Select Posting Days
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={selectedDays}
          onChange={handleDayChange}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            "& .MuiToggleButton-root": {
              border: "1px solid rgba(139, 92, 246, 0.2) !important",
              color: "#e2e8f0",
              borderRadius: "8px !important",
              px: 3,
              "&.Mui-selected": {
                bgcolor: "rgba(139, 92, 246, 0.2)",
                color: "#a855f7",
              },
            },
          }}
        >
          {DAYS_OF_WEEK.map((day) => (
            <ToggleButton key={day} value={day}>
              {day.substring(0, 3).toUpperCase()}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Configuration for each day */}
      {selectedDays.map((day) => (
        <Paper
          key={day}
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            bgcolor: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(139, 92, 246, 0.15)",
            animation: "fadeIn 0.3s ease-in",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <DescriptionIcon sx={{ color: "#a855f7", fontSize: "1.2rem" }} />
            <Typography
              variant="subtitle1"
              sx={{ color: "#fff", fontWeight: "bold" }}
            >
              {day} Content
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder={`Describe the video for ${day}...`}
            value={dayConfigs[day]?.prompt || ""}
            onChange={(e) => handlePromptChange(day, e.target.value)}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.02)",
                "& fieldset": { borderColor: "rgba(139, 92, 246, 0.2)" },
                "&:hover fieldset": { borderColor: "rgba(139, 92, 246, 0.5)" },
                "&.Mui-focused fieldset": { borderColor: "#a855f7" },
              },
            }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.5)", display: "block", mb: 1 }}
            >
              Upload up to 10 product images for this day
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<AddPhotoIcon />}
              size="small"
              sx={{
                color: "#e2e8f0",
                borderColor: "rgba(139, 92, 246, 0.3)",
                "&:hover": {
                  borderColor: "#a855f7",
                  bgcolor: "rgba(139, 92, 246, 0.1)",
                },
              }}
            >
              Add Images
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={(e) => handleImageChange(day, e)}
              />
            </Button>
          </Box>

          <Grid container spacing={1}>
            {dayConfigs[day]?.previews?.map((preview, index) => (
              <Grid key={index} size={{ xs: 4, sm: 3, md: 2 }}>
                <Box
                  sx={{
                    position: "relative",
                    pt: "100%",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={preview}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <Tooltip title="Remove image">
                    <IconButton
                      size="small"
                      onClick={() => removeImage(day, index)}
                      sx={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        bgcolor: "rgba(0,0,0,0.5)",
                        color: "#f87171",
                        p: 0.5,
                        "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: "1rem" }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}

      <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.1)" }} />

      <Box sx={{ maxWidth: 500 }}>
        <Typography
          sx={{
            color: "#fff",
            mb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Email /> Delivery Email
        </Typography>
        <TextField
          fullWidth
          placeholder="where should we send your videos?"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            input: { color: "#fff" },
            "& .MuiOutlinedInput-root": {
              bgcolor: "rgba(255,255,255,0.05)",
              "& fieldset": { borderColor: "rgba(139, 92, 246, 0.2)" },
            },
          }}
        />
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={isProcessing}
          sx={{
            mt: 2,
            py: 1.5,
            bgcolor: "#8b5cf6",
            "&:hover": { bgcolor: "#7c3aed" },
            fontWeight: "bold",
            borderRadius: 2,
          }}
        >
          {isProcessing ? "Saving..." : "CONFIRM SCHEDULE"}
        </Button>
      </Box>
    </Box>
  );
}
