import { Box, Typography, Paper, useMediaQuery, Grid } from "@mui/material";
import { History as HistoryIcon } from "@mui/icons-material";
import { useRef, useState, useEffect } from "react";

const videos = [
  "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/sign/showcase/videos/my-video%20(42).mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjdkZjVmMC1mMzkwLTQ1MmItOWYxMy1hYzQ2M2NmZWVkZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzaG93Y2FzZS92aWRlb3MvbXktdmlkZW8gKDQyKS5tcDQiLCJpYXQiOjE3NzA5NzU4MjEsImV4cCI6NDkyNDU3NTgyMX0.ma-nFYG5G33RMEtn4QZV6u8SmlWKdhnVG2hejqHXgQU",
  "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/sign/showcase/videos/my-video%20(43).mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjdkZjVmMC1mMzkwLTQ1MmItOWYxMy1hYzQ2M2NmZWVkZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzaG93Y2FzZS92aWRlb3MvbXktdmlkZW8gKDQzKS5tcDQiLCJpYXQiOjE3NzA5NzU5MDQsImV4cCI6NDkyNDU3NTkwNH0.zQHVF5EptBeJqDpiIPhp-bzeeVF7H6oLNSTO3vawXLk",
  "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/sign/showcase/videos/my-video%20(41).mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjdkZjVmMC1mMzkwLTQ1MmItOWYxMy1hYzQ2M2NmZWVkZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzaG93Y2FzZS92aWRlb3MvbXktdmlkZW8gKDQxKS5tcDQiLCJpYXQiOjE3NzA5NzMzNzUsImV4cCI6NDkyNDU3MzM3NX0.alCkwRKmBnM40j5Wzd0bSeBPdD8QqglMRoHUx4anPR8",
  "https://vxfpglnrdktcbfmitjqk.supabase.co/storage/v1/object/sign/showcase/videos/my-video%20(45).mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83NjdkZjVmMC1mMzkwLTQ1MmItOWYxMy1hYzQ2M2NmZWVkZTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzaG93Y2FzZS92aWRlb3MvbXktdmlkZW8gKDQ1KS5tcDQiLCJpYXQiOjE3NzA5NzU5ODQsImV4cCI6NDkyNDU3NTk4NH0.Zeg83dQMg1XXlx7dUKkGnUg5JqjdHA43bv1_B_2qOeg",
];

// Simplified Video Card Component to play MP4 directly
const VideoCard = ({
  videoUrl,
  isPlaying,
  onPlay,
}: {
  videoUrl: string;
  isPlaying: boolean;
  onPlay: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync video playback with the isPlaying prop
  useEffect(() => {
    if (!isPlaying && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <Paper
      elevation={4}
      sx={{
        width: "100%",
        maxWidth: 320,
        aspectRatio: "9 / 16",
        bgcolor: "rgba(26, 26, 46, 0.6)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(139, 92, 246, 0.2)",
        borderRadius: 3,
        overflow: "hidden",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          border: "1px solid rgba(139, 92, 246, 0.5)",
        },
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        onPlay={onPlay}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </Paper>
  );
};

export default function Showcase() {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  return (
    <Box sx={{ mt: { xs: 4, md: 6 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <HistoryIcon sx={{ color: "#a855f7", mr: 1.5 }} />
        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight="bold"
          sx={{ color: "#e2e8f0" }}
        >
          Showcase
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{ color: "rgba(255,255,255,0.5)", mb: 4 }}
      >
        All videos were created using Grocerity
      </Typography>

      <Grid container spacing={3}>
        {videos.map((video, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <VideoCard
              videoUrl={video}
              isPlaying={playingIndex === index}
              onPlay={() => setPlayingIndex(index)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
