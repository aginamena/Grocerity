"use client";
import EmailIcon from "@mui/icons-material/Email";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import GroupIcon from "@mui/icons-material/Group";
import SavingsIcon from "@mui/icons-material/Savings";
import SpeedIcon from "@mui/icons-material/Speed";
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import SignupForm from "@/components/SignupForm";

export default function ChecklistLandingPage() {
  const scrollToForm = () => {
    document
      .getElementById("signup-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };
  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "E-commerce Owner",
      image: "https://i.pravatar.cc/150?u=sarah", // Replace with real photo paths
      text: "The blueprint changed everything. I used to spend 10 hours a week on social media. Now ChatGPT does it in minutes. Result: 40% increase in engagement and 10+ hours saved weekly.",
    },
    {
      name: "Marcus Chen",
      role: "Real Estate Agent",
      image: "https://i.pravatar.cc/150?u=marcus",
      text: "Mena's guide is genius. My weekly newsletters are automated and result in 3x more bookings. It’s like having a full-time assistant without the $4k/month salary.",
    },
    {
      name: "Elena Rodriguez",
      role: "Marketing Consultant",
      image: "https://i.pravatar.cc/150?u=elena",
      text: "Using these prompt techniques, I finish client work 3x faster. I’ve increased my client capacity by 50% while still getting my weekends back!",
    },
  ];
  const stats = [
    {
      label: "Saves 5–10 hours/week for most users",
      icon: <SpeedIcon sx={{ fontSize: 40, color: "#8b5cf6" }} />,
    },
    {
      label: "Used by 347+ small business owners",

      icon: <GroupIcon sx={{ fontSize: 40, color: "#8b5cf6" }} />,
    },
    {
      label: "Cuts content creation time by ~60%",
      icon: <SavingsIcon sx={{ fontSize: 40, color: "#8b5cf6" }} />,
    },
  ];
  const steps = [
    {
      number: "01",
      title: "Download the blueprint",
      desc: "Enter your details to get instant access to the PDF guide.",
    },
    {
      number: "02",
      title: "Copy the prompts & setup",
      desc: "Follow the step-by-step instructions to configure your ChatGPT.",
    },
    {
      number: "03",
      title: "Start automating your marketing",
      desc: "Watch as ChatGPT handles your content and customer research.",
    },
  ];
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
        color: "#fff",
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="md">
        {/* SECTION 1: HERO */}
        <Stack
          spacing={3}
          alignItems="center"
          sx={{ textAlign: "center", mb: 10 }}
        >
          <Typography
            variant="h2"
            fontWeight="900"
            sx={{
              fontSize: { xs: "2.5rem", md: "4rem" },
              background: "linear-gradient(to right, #fff, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            How Small Businesses Use ChatGPT to Get More Customers—Without
            Hiring
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              lineHeight: 1.6,
              maxWidth: "700px",
            }}
          >
            Stop doing everything yourself! Let ChatGPT handle the heavy lifting
            while you focus on growing your business. From creating social media
            content and writing blogs to supporting your marketing and
            sales—there’s a smarter way to get it all done.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={scrollToForm}
            sx={{
              bgcolor: "#8b5cf6",
              px: 6,
              py: 2,
              fontSize: "1.1rem",
              fontWeight: "bold",
              borderRadius: "50px",
              boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            Get My Free Automation Blueprint Now
          </Button>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 10 }}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 4 }} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: "center",
                  bgcolor: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(139, 92, 246, 0.1)",
                  borderRadius: 4,
                }}
              >
                {stat.icon}
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.5)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mb: 10, textAlign: "center" }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
            What's Inside the Blueprint
          </Typography>
          <Paper
            elevation={20}
            sx={{
              maxWidth: "600px",
              margin: "0 auto",
              position: "relative",
              overflow: "hidden",
              borderRadius: 4,
              border: "1px solid rgba(139, 92, 246, 0.3)",
              background: "#fff",
              p: 1,
              cursor: "pointer",
            }}
            onClick={scrollToForm}
          >
            <Box
              component="img"
              src="/sneakpeak.png"
              alt="Blueprint Preview"
              sx={{
                width: "100%",
                height: "auto",
                display: "block",
                filter: "blur(0.5px)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "50%",
                background: "linear-gradient(to top, #0a0a0a, transparent)",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                pb: 4,
              }}
            >
              <Button variant="contained" sx={{ bgcolor: "#8b5cf6" }}>
                View Full PDF
              </Button>
            </Box>
          </Paper>
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 6 }} />
        {/* SECTION 3: BIO & FORM */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={6}
          alignItems="flex-start"
          sx={{ mb: 10 }}
        >
          <Box sx={{ flex: 1 }}>
            <Avatar
              src="/menaagina.jpg"
              sx={{
                width: 180,
                height: 180,
                mb: 3,
                border: "4px solid #8b5cf6",
              }}
            />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Nice to meet you!
            </Typography>
            <Typography
              sx={{ color: "rgba(255, 255, 255, 0.8)", lineHeight: 1.8 }}
            >
              My name is <strong>Mena Agina</strong> and I’ve been using ChatGPT
              since 2023 to automate content, marketing, and customer workflows.
              This system now runs a large part of my business—and I built this
              blueprint to help other small business owners do the same without
              hiring expensive agencies or assistants.
              <br />
              <br />
              I'd like to share these strategies with you! Fill the form to get
              your business automation blueprint.
            </Typography>
          </Box>
          <Box id="signup-form" sx={{ flex: 1, width: "100%" }}>
            <SignupForm />
          </Box>
        </Stack>
        {/* HOW IT WORKS SECTION */}
        <Box sx={{ mb: 12, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 6 }}>
            How it works
          </Typography>
          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Stack spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: "2px solid #8b5cf6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#8b5cf6",
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      background: "rgba(139, 92, 246, 0.1)",
                    }}
                  >
                    {step.number}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {step.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                  >
                    {step.desc}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 6 }} />
        {/* SECTION 2: THE VALUE PROP */}
        <Paper
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 6,
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            mb: 10,
          }}
        >
          <Stack spacing={4}>
            <Typography variant="h4" fontWeight="bold" textAlign="center">
              Ready to automate your growth?
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "1.1rem" }}
            >
              I've created a Business Automation Blueprint for you to be able to
              automate your content creation. Click on the button below to
              download the Business Automation Blueprint.
            </Typography>
            <Button
              variant="outlined"
              size="large"
              onClick={scrollToForm}
              sx={{
                borderColor: "#8b5cf6",
                color: "#fff",
                py: 1.5,
                "&:hover": {
                  borderColor: "#7c3aed",
                  bgcolor: "rgba(139, 92, 246, 0.1)",
                },
              }}
            >
              Get My Free Automation Blueprint Now
            </Button>
          </Stack>
        </Paper>
        <Box sx={{ mb: 10, textAlign: "center" }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
            What's Inside the Blueprint
          </Typography>
          <Paper
            elevation={20}
            sx={{
              maxWidth: "600px",
              margin: "0 auto",
              position: "relative",
              overflow: "hidden",
              borderRadius: 4,
              border: "1px solid rgba(139, 92, 246, 0.3)",
              background: "#fff",
              p: 1,
              cursor: "pointer",
            }}
            onClick={scrollToForm}
          >
            <Box
              component="img"
              src="/sneakpeak.png"
              alt="Blueprint Preview"
              sx={{
                width: "100%",
                height: "auto",
                display: "block",
                filter: "blur(0.5px)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "50%",
                background: "linear-gradient(to top, #0a0a0a, transparent)",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                pb: 4,
              }}
            >
              <Button variant="contained" sx={{ bgcolor: "#8b5cf6" }}>
                View Full PDF
              </Button>
            </Box>
          </Paper>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 6 }} />
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            sx={{ mb: 6 }}
          >
            What other small business owners are saying
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((t, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Paper
                  sx={{
                    p: 4,
                    height: "100%",
                    bgcolor: "rgba(139, 92, 246, 0.05)",
                    border: "1px solid rgba(139, 92, 246, 0.1)",
                    borderRadius: 4,
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >
                  <FormatQuoteIcon
                    sx={{ color: "#8b5cf6", fontSize: 40, opacity: 0.5, mb: 1 }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      color: "rgba(255,255,255,0.9)",
                      fontStyle: "italic",
                      mb: 3,
                      flexGrow: 1,
                    }}
                  >
                    "{t.text}"
                  </Typography>
                  <Avatar
                    src={t.image}
                    sx={{ width: 48, height: 48, border: "2px solid #8b5cf6" }}
                  />
                  <Box sx={{ mt: "auto" }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ color: "#8b5cf6" }}
                    >
                      {t.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {t.role}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 6 }} />

        {/* SECTION 4: CONTACT */}
        <Stack alignItems="center" spacing={2} sx={{ textAlign: "center" }}>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)" }}>
            I'd really like to get to know you and the type of business you're
            running. Let's chat!
          </Typography>
          <Button
            href="mailto:aginamena5@gmail.com"
            startIcon={<EmailIcon />}
            sx={{ color: "#8b5cf6", textTransform: "none", fontSize: "1.1rem" }}
          >
            aginamena5@gmail.com
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
