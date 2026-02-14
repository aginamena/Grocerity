import { Box, Typography, Paper, useMediaQuery, Grid } from "@mui/material";
import { History as HistoryIcon } from "@mui/icons-material";
import { useRef, useState, useEffect } from "react";

const videos = [
  "https://npwvumlrloaqzpdswggg.supabase.co/storage/v1/object/sign/showcase/my-video%20(45).mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjJlZDI3MC1mMzVmLTQyZjAtYjk5MC1iODQ0OWI3NjBiNDQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzaG93Y2FzZS9teS12aWRlbyAoNDUpLm1wNCIsImlhdCI6MTc3MTA4OTAwOCwiZXhwIjo0OTI0Njg5MDA4fQ.mGLc3g3A-Gylq4WFJx9Z01AzIY7P5OM8nRNCZSo3RpE",
  "https://npwvumlrloaqzpdswggg.supabase.co/storage/v1/object/sign/showcase/my-video%20(43).mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjJlZDI3MC1mMzVmLTQyZjAtYjk5MC1iODQ0OWI3NjBiNDQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzaG93Y2FzZS9teS12aWRlbyAoNDMpLm1wNCIsImlhdCI6MTc3MTA4OTAzOCwiZXhwIjo0OTI0Njg5MDM4fQ.AnkZm2QV8mghQUkhdg9L4tpD32AqbTkwDzNQc6G7J2Y",
  "https://npwvumlrloaqzpdswggg.supabase.co/storage/v1/object/sign/showcase/my-video%20(42).mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjJlZDI3MC1mMzVmLTQyZjAtYjk5MC1iODQ0OWI3NjBiNDQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzaG93Y2FzZS9teS12aWRlbyAoNDIpLm1wNCIsImlhdCI6MTc3MTA4OTA1OCwiZXhwIjo0OTI0Njg5MDU4fQ.2ClBT0GjbmVZ5kA72slt1mbXxXfIEwqT1gw8fRrHtMw",
  "https://npwvumlrloaqzpdswggg.supabase.co/storage/v1/object/sign/showcase/my-video%20(41).mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjJlZDI3MC1mMzVmLTQyZjAtYjk5MC1iODQ0OWI3NjBiNDQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzaG93Y2FzZS9teS12aWRlbyAoNDEpLm1wNCIsImlhdCI6MTc3MTA4OTA4NiwiZXhwIjo0OTI0Njg5MDg2fQ.0STtJpV_aQinXyJItx75uV-n4WjfV9oQ3K-un0PmnEk",
  "https://npwvumlrloaqzpdswggg.supabase.co/storage/v1/object/sign/showcase/my-video%20(48).mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MjJlZDI3MC1mMzVmLTQyZjAtYjk5MC1iODQ0OWI3NjBiNDQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzaG93Y2FzZS9teS12aWRlbyAoNDgpLm1wNCIsImlhdCI6MTc3MTA5MDkwMywiZXhwIjo0OTI0NjkwOTAzfQ.vyNITSCyvORBpp44d3bRKpGMIyegUtqAUdYS8-bLQwM"
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
