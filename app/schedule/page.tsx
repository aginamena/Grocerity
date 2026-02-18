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
  CalendarMonth as CalendarIcon,
  AddPhotoAlternate as AddPhotoIcon,
  Description as DescriptionIcon,
  Email as EmailIcon,
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

export default function CalendarPage() {
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
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography
        variant="h3"
        gutterBottom
        align="center"
        sx={{ fontWeight: 800, color: "primary.main", mb: 4 }}
      >
        Video Content Scheduler
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          bgcolor: "rgba(26, 26, 46, 0.6)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Day Picker */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <CalendarIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Select Posting Days
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={selectedDays}
            onChange={handleDayChange}
            fullWidth
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 1,
            }}
          >
            {DAYS_OF_WEEK.map((day) => (
              <ToggleButton
                key={day}
                value={day}
                sx={{
                  borderRadius: "12px !important",
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                }}
              >
                {day.substring(0, 3)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Configuration for each day */}
        {selectedDays.map((day) => (
          <Box key={day} sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              color="primary.main"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              {day} Content
            </Typography>
            <Card
              sx={{ p: 3, bgcolor: "rgba(255,255,255,0.02)", borderRadius: 3 }}
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Video Description"
                    placeholder={`Describe the video for ${day}...`}
                    value={dayConfigs[day]?.prompt || ""}
                    onChange={(e) => handlePromptChange(day, e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      border: "1px dashed rgba(255,255,255,0.2)",
                      borderRadius: 2,
                      p: 2,
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageChange(day, e)}
                      disabled={dayConfigs[day]?.images.length >= 10}
                    />
                    <AddPhotoIcon sx={{ mb: 1 }} />
                    <Typography variant="body2">
                      Images ({dayConfigs[day]?.images.length || 0}/10)
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}
                  >
                    {dayConfigs[day]?.previews.map((src, index) => (
                      <Box key={index} sx={{ position: "relative" }}>
                        <CardMedia
                          component="img"
                          image={src}
                          sx={{ width: 50, height: 50, borderRadius: 1 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeImage(day, index)}
                          sx={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            bgcolor: "error.main",
                            p: 0.2,
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 10, color: "white" }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Box>
        ))}

        <Divider sx={{ my: 4 }} />

        {/* Final Submission Info */}
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <EmailIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography sx={{ fontWeight: 600 }}>Delivery Email</Typography>
          </Box>
          <TextField
            fullWidth
            placeholder="where should we send your videos?"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isProcessing}
            sx={{ mb: 4 }}
          />
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={isProcessing || selectedDays.length === 0}
            startIcon={isProcessing ? <CircularProgress size={20} /> : null}
            sx={{ py: 2, fontWeight: "bold", borderRadius: 3 }}
          >
            {isProcessing ? "Saving Schedule..." : "Confirm Schedule"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
