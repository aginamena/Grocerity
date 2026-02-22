"use client";

import CreateVideo from "@/components/CreateVideo";
import Pricing from "@/components/Pricing";
import Showcase from "@/components/Showcase";
import {
  Description,
  Download,
  PhotoLibrary,
  PlayCircle,
} from "@mui/icons-material";
import {
  Box,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useState } from "react";

export default function Home() {
  const isMobile = useMediaQuery("(max-width:600px)");

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

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

  // Cycle through loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [loadingMessages.length]);

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
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3.25rem" },
            }}
          >
            Turn product photos into scroll stopping videos in minutes
          </Typography>
          <Typography
            variant={isMobile ? "body1" : "h6"}
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              maxWidth: 800,
              mx: "auto",
              lineHeight: { xs: 1.7, md: 1.9 },
              fontWeight: 400,
              fontSize: { xs: "0.95rem", sm: "1.1rem", md: "1.35rem" },
              px: { xs: 1, sm: 2, md: 0 },
            }}
          >
            <Box component="span" sx={highlightStyles.generate}>
              No filming, no editing, and no marketing team required.
            </Box>{" "}
            Instantly generate professional short-form content from your grocery
            listings to{" "}
            <Box component="span" sx={highlightStyles.growSales}>
              capture attention and boost sales!
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
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            bgcolor: "#16162a",
            borderRadius: 4,
            border: "1px solid rgba(255, 255, 255, 0.05)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.46)",
          }}
        >
          <CreateVideo />
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
            At Benaiah, our mission is to make sure that...
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
          Benaiah is made with love{" "}
          <Box component="span" sx={{ color: "#f43f5e" }}>
            ❤️
          </Box>
        </Typography>
      </Container>
    </Box>
  );
}
