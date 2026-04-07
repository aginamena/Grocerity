"use client";

import SignupForm from "@/components/SignupForm";
import { Box, Button, Container, Grid, Typography } from "@mui/material";

export default function Home() {
  return (
    <Box sx={{ width: "100%", backgroundColor: "#f4f7fb", color: "#1f2937" }}>
      <Box
        sx={{
          backgroundColor: "#0d1f3c",
          color: "#fff",
          py: 2,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              AI Made Simple
            </Typography>
            <Typography sx={{ color: "#b0c4de" }}>
              📞 +1 (343) 540-8869
            </Typography>
          </Box>
        </Container>
      </Box>

      <Box sx={{ backgroundColor: "#fff", py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
                }}
              >
                <img
                  src="/ebook.png"
                  alt="eBook cover"
                  style={{
                    width: "100%",
                    display: "block",
                    objectFit: "cover",
                  }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "2rem", md: "3.25rem" },
                  fontWeight: 800,
                  color: "#111827",
                  mb: 3,
                  lineHeight: 1.05,
                }}
              >
                Discover the easiest way to use AI — save time, write better,
                and grow your work without tech skills.
              </Typography>

              <Typography
                sx={{
                  fontSize: "1rem",
                  color: "#4b5563",
                  mb: 4,
                  lineHeight: 1.8,
                }}
              >
                This guide was created for busy people who want real results
                from AI without confusing jargon. Learn exactly how to use
                ChatGPT in everyday tasks, build your confidence, and get a
                complete 7-day action plan that starts working today.
              </Typography>

              <Box sx={{ mb: 4 }}>
                {[
                  "Understand AI in plain English, with no technical terms.",
                  "Use ChatGPT to write emails, ideas, marketing copy, and plans.",
                  "Save hours every day with simple prompts and proven workflows.",
                  "Start fast with a step-by-step, non-technical 7-day starter plan.",
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                      mb: 1.5,
                    }}
                  >
                    <Typography sx={{ color: "#10b981", fontSize: "1.25rem" }}>
                      ✓
                    </Typography>
                    <Typography sx={{ color: "#334155" }}>{item}</Typography>
                  </Box>
                ))}
              </Box>

              <Button
                href="#signup"
                size="large"
                variant="contained"
                sx={{
                  backgroundColor: "#0f172a",
                  color: "#fff",
                  textTransform: "none",
                  px: 4,
                  py: 1.5,
                  "&:hover": { backgroundColor: "#111827" },
                }}
              >
                Get the Free Guide
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        id="signup"
        sx={{
          backgroundColor: "#0f172a",
          color: "#fff",
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "2rem", md: "2.75rem" },
                fontWeight: 800,
                mb: 2,
              }}
            >
              Yes, I want the free guide and 7-day AI plan!
            </Typography>
            <Typography
              sx={{ color: "#cbd5e1", fontSize: "1.05rem", lineHeight: 1.8 }}
            >
              Enter your name and email below to receive your free guide and
              start using AI with confidence today.
            </Typography>
          </Box>

          <Box
            sx={{
              backgroundColor: "#111827",
              borderRadius: 4,
              p: { xs: 4, md: 5 },
              boxShadow: "0 30px 80px rgba(15, 23, 42, 0.25)",
            }}
          >
            <SignupForm />
          </Box>
        </Container>
      </Box>

      <Box sx={{ backgroundColor: "#f8fafc", py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography
            sx={{
              textAlign: "center",
              fontSize: { xs: "1.75rem", md: "2.25rem" },
              fontWeight: 700,
              color: "#111827",
              mb: 6,
            }}
          >
            What readers are saying
          </Typography>

          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <Box
                sx={{
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  overflow: "hidden",
                  mx: "auto",
                  border: "4px solid #0f172a",
                }}
              >
                <img
                  src="/sarah.jpg"
                  alt="Reader testimonial"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 9 }}>
              <Typography
                sx={{
                  fontSize: "1.125rem",
                  fontStyle: "italic",
                  color: "#334155",
                  mb: 3,
                  lineHeight: 1.9,
                }}
              >
                "I finally stopped guessing how to use AI. This guide gave me an
                easy, real-world plan that helped me automate content, improve
                my writing, and save hours every week. If you want AI that
                actually works for you, start here."
              </Typography>
              <Typography sx={{ fontWeight: 700, color: "#111827" }}>
                Sarah Chen
              </Typography>
              <Typography sx={{ color: "#64748b" }}>
                Marketing Director, Tech Startup
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        sx={{
          backgroundColor: "#f59e0b",
          py: { xs: 8, md: 10 },
          color: "#111827",
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontSize: { xs: "2rem", md: "2.75rem" },
              fontWeight: 800,
              mb: 3,
            }}
          >
            Ready to stop wondering and start doing?
          </Typography>

          <Button
            href="#signup"
            size="large"
            variant="contained"
            sx={{
              backgroundColor: "#111827",
              color: "#fff",
              textTransform: "none",
              px: 4,
              py: 1.5,
              "&:hover": { backgroundColor: "#0f172a" },
            }}
          >
            Yes, send me the guide
          </Button>
        </Container>
      </Box>

      <Box sx={{ backgroundColor: "#111827", py: 3, textAlign: "center" }}>
        <Typography sx={{ color: "#94a3b8", fontSize: "0.9rem" }}>
          © 2026 AI Made Simple. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
