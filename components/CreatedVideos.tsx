import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  IconButton,
  Button,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

import { Player, PlayerRef } from "@remotion/player";
import { compileCode } from "@/lib/remotion/compiler";

export default function CreatedVideos() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const playerRefs = useRef<Record<string, PlayerRef | null>>({}); // Track player instances

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch("/api/fetchVideos");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setVideos(data || []);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  useEffect(() => {
    videos.forEach((video) => {
      const ref = playerRefs.current[video.id];
      if (!ref) return;

      if (activeVideoId !== video.id) {
        // Pause if this video is not active
        ref.pause();
      }
    });
  }, [activeVideoId, videos]);

  const handleApplyEdit = async (id: string) => {
    setIsUpdating(true);
    try {
      // In a real app, call your AI generation API here with the new prompt
      console.log(`Editing video ${id} with prompt: ${editPrompt}`);
      // After success, update the video in Supabase and local state
      setEditingId(null);
      setEditPrompt("");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownload = async (video: any) => {
    // Logic for rendering/downloading would go here
    console.log("Download initiated for video:", video.id);
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    // const { error } = await supabase
    //   .from("created_videos")
    //   .delete()
    //   .eq("id", id);

    // if (!error) {
    //   setVideos((prev) => prev.filter((v) => v.id !== id));
    // }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#a855f7" }} />
      </Box>
    );
  }

  if (videos.length === 0) {
    return (
      <Typography
        sx={{ color: "rgba(255,255,255,0.5)", textAlign: "center", py: 10 }}
      >
        You haven't created any videos yet.
      </Typography>
    );
  }

  return (
    <Grid container spacing={4}>
      {videos.map((video) => {
        // Compile the stored code string into a component
        const compilation = compileCode(video.code);
        const VideoComponent = compilation.Component || (() => null);
        const isEditing = editingId === video.id;
        return (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={video.id}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "#16162a",
                borderRadius: 4,
                border: "1px solid rgba(255, 255, 255, 0.05)",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.02)" },
              }}
            >
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  aspectRatio: "9/16",
                  bgcolor: "#000",
                  mb: 2,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                  cursor: "pointer",
                }}
                onClick={() => setActiveVideoId(video.id)}
              >
                <Player
                  ref={(ref) => {
                    playerRefs.current[video.id] = ref;
                  }}
                  component={VideoComponent}
                  durationInFrames={parseInt(video.durationInFrames) || 1200}
                  compositionWidth={320}
                  compositionHeight={550}
                  fps={30}
                  controls
                  loop
                  style={{ width: "100%", height: "100%" }}
                  acknowledgeRemotionLicense
                />
              </Box>

              {isEditing && (
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    placeholder="Describe your changes..."
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    sx={{
                      bgcolor: "rgba(0,0,0,0.2)",
                      "& .MuiOutlinedInput-root": {
                        color: "#fff",
                        fontSize: "0.8rem",
                      },
                    }}
                  />
                  <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    disabled={isUpdating}
                    onClick={() => handleApplyEdit(video.id)}
                    sx={{ mt: 1, bgcolor: "#a855f7" }}
                  >
                    {isUpdating ? "Applying..." : "Apply Changes"}
                  </Button>
                </Box>
              )}

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                  >
                    {new Date(video.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {new Date(video.created_at).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingId(isEditing ? null : video.id);
                      setEditPrompt("");
                    }}
                    sx={{
                      color: isEditing ? "#a855f7" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(video)}
                    sx={{
                      color: "#a855f7",
                      fontWeight: "bold",
                      "&:hover": { bgcolor: "rgba(168, 85, 247, 0.1)" },
                    }}
                  >
                    Download
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(video.id)}
                    sx={{
                      color: "#f87171",
                      "&:hover": { bgcolor: "rgba(248, 113, 113, 0.1)" },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}
