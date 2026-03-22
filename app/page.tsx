"use client";

import EmailIcon from "@mui/icons-material/Email";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
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

export default function BoutiqueLandingPage() {
  const scrollToForm = () => {
    document
      .getElementById("signup-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const testimonials = [
    {
      name: "Sarah",
      role: "Boutique Owner",
      text: "I used one of these captions and got more engagement than my last 10 posts combined.",
    },
    {
      name: "Melissa",
      role: "Online Boutique",
      text: "These made posting so much easier. I don’t sit there stuck anymore.",
    },
    {
      name: "Jenna",
      role: "Fashion Seller",
      text: "Simple, but they actually work. I started getting more clicks and sales.",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
        color: "#fff",
        pb: 10,
      }}
    >
      {/* 🔥 HERO SECTION */}
      <Box sx={{ py: { xs: 8, md: 12 }, textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            fontWeight="900"
            sx={{
              fontSize: { xs: "2.5rem", md: "4.2rem" },
              background: "linear-gradient(to right, #fff, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.1,
              mb: 3,
            }}
          >
            Stop Struggling to Write Captions—Get 30 Proven Captions That Will
            Boost Your Sales Today!
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 5, lineHeight: 1.6 }}
          >
            Stop guessing what to post. These plug-and-play captions are
            designed to help you sell your products faster on Instagram, TikTok,
            and Facebook.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={scrollToForm}
            sx={{
              bgcolor: "#8b5cf6",
              px: 6,
              py: 2.5,
              fontSize: "1.2rem",
              fontWeight: "bold",
              borderRadius: "50px",
              boxShadow: "0 0 30px rgba(139, 92, 246, 0.4)",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            Get 30 Free Captions Now
          </Button>

          {/* Proof Bar */}
          <Grid container spacing={2} sx={{ mt: 8 }}>
            {[
              "Ready-to-post captions for your boutique",
              "Designed to increase engagement & sales",
              "Works for new arrivals, promos & everyday posts",
            ].map((text, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="center"
                  alignItems="center"
                >
                  <CheckCircleOutlineIcon
                    sx={{ color: "#8b5cf6", fontSize: 20 }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.6)", fontWeight: "bold" }}
                  >
                    {text.toUpperCase()}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="md">
        {/* 📦 WHAT THEY’RE GETTING */}
        <Paper
          sx={{
            p: { xs: 4, md: 8 },
            borderRadius: 8,
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            mb: 12,
          }}
        >
          <Typography
            variant="h4"
            fontWeight="900"
            textAlign="center"
            sx={{ mb: 6 }}
          >
            What You’ll Get (Free)
          </Typography>
          <Grid container spacing={3}>
            {[
              "30 proven product captions you can copy & paste",
              "Captions for new arrivals, low stock & flash sales",
              "“Scroll-stopping” hooks that grab attention",
              "Simple CTAs that turn views into orders",
              "Works for clothing, accessories & fashion brands",
            ].map((bullet, i) => (
              <Grid size={{ xs: 12 }} key={i}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#8b5cf6",
                    }}
                  />
                  <Typography variant="h6" sx={{ fontSize: "1.1rem" }}>
                    {bullet}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* 🧠 PAIN SECTION */}
        <Box sx={{ mb: 12, textAlign: "center" }}>
          <Typography
            variant="h4"
            fontWeight="900"
            sx={{ mb: 4, color: "#ef4444" }}
          >
            Struggling to Know What to Post for Your Boutique?
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: "rgba(255,255,255,0.8)", mb: 4 }}
          >
            If you run a boutique, you’ve probably felt this:
          </Typography>
          <Stack
            spacing={2}
            sx={{ maxWidth: "600px", margin: "0 auto", textAlign: "left" }}
          >
            {[
              "You have great products… but your posts don’t get much engagement",
              "You don’t know what to write in your captions",
              "You spend way too much time trying to come up with content",
              "You’re posting—but it’s not turning into sales",
            ].map((text, i) => (
              <Paper
                key={i}
                sx={{
                  p: 2,
                  bgcolor: "rgba(239, 68, 68, 0.05)",
                  border: "1px solid rgba(239, 68, 68, 0.1)",
                  color: "#fca5a5",
                }}
              >
                <Typography>❌ {text}</Typography>
              </Paper>
            ))}
          </Stack>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ mt: 4, color: "#8b5cf6" }}
          >
            These captions fix that.
          </Typography>
        </Box>

        {/* 👇 PRODUCT PREVIEW */}
        <Box sx={{ mb: 12, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="900" sx={{ mb: 1 }}>
            Preview of Your 30 Viral Captions
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.6)", mb: 4 }}>
            Ready-to-use captions designed to help you sell more—without
            overthinking your content.
          </Typography>
          <Paper
            elevation={24}
            sx={{
              maxWidth: "600px",
              margin: "0 auto",
              borderRadius: 4,
              overflow: "hidden",
              position: "relative",
              cursor: "pointer",
            }}
            onClick={scrollToForm}
          >
            <Box
              component="img"
              src="/sneakpeak.png"
              sx={{ width: "100%", filter: "blur(2px)" }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.4)",
              }}
            >
              <Button variant="contained" sx={{ bgcolor: "#8b5cf6" }}>
                VIEW FULL PDF
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* 👤 PERSONAL SECTION */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={8}
          alignItems="center"
          sx={{ mb: 12 }}
        >
          <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
            <Avatar
              src="/menaagina.jpg"
              sx={{
                width: 200,
                height: 200,
                mb: 4,
                border: "4px solid #8b5cf6",
                margin: { xs: "0 auto", md: "0 0 32px 0" },
              }}
            />
            <Typography variant="h4" fontWeight="900" gutterBottom>
              I Created This for Boutique Owners Who Want Simpler Marketing
            </Typography>
            <Typography
              sx={{ color: "rgba(255, 255, 255, 0.8)", lineHeight: 1.8 }}
            >
              I’ve worked with ChatGPT and content systems since 2023, helping
              businesses create content faster and more consistently.
              <br />
              <br />
              But I noticed something: Boutique owners don’t need complicated
              strategies. They just need captions that actually help them sell.
              <br />
              <br />
              So I put together 30 captions you can use immediately to promote
              your products and start seeing more engagement and sales.
            </Typography>
          </Box>
          <Box id="signup-form" sx={{ flex: 1, width: "100%" }}>
            <SignupForm />
          </Box>
        </Stack>

        {/* ⚡ HOW IT WORKS */}
        <Box sx={{ mb: 12, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="900" sx={{ mb: 8 }}>
            How it works
          </Typography>
          <Grid container spacing={4}>
            {[
              { t: "Download the captions", d: "Get instant access to all 30" },
              {
                t: "Copy & paste",
                d: "Use them for your posts (takes seconds)",
              },
              {
                t: "Start getting more sales",
                d: "No more guessing what to write",
              },
            ].map((step, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Box
                  sx={{
                    p: 4,
                    bgcolor: "rgba(139, 92, 246, 0.05)",
                    border: "1px solid rgba(139, 92, 246, 0.1)",
                    borderRadius: 6,
                  }}
                >
                  <Typography
                    variant="h3"
                    fontWeight="900"
                    sx={{ color: "#8b5cf6", mb: 2 }}
                  >
                    0{i + 1}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {step.t}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {step.d}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 🚨 MID-PAGE CTA */}
        <Box sx={{ mb: 12, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="900" mb={2}>
            Stop Overthinking Your Captions
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 4 }}>
            You already have the products. Now you just need the words that help
            them sell.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={scrollToForm}
            sx={{ bgcolor: "#8b5cf6", px: 6, py: 2, borderRadius: 10 }}
          >
            Get My 30 Free Boutique Captions
          </Button>
        </Box>

        {/* 💬 TESTIMONIALS */}
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 8 }} />
        <Box sx={{ mb: 12 }}>
          <Typography variant="h4" fontWeight="900" textAlign="center" mb={6}>
            What other boutique owners are saying
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((t, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Paper
                  sx={{
                    p: 4,
                    height: "100%",
                    bgcolor: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 6,
                  }}
                >
                  <FormatQuoteIcon
                    sx={{ color: "#8b5cf6", fontSize: 40, mb: 2 }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      color: "rgba(255,255,255,0.9)",
                      fontStyle: "italic",
                      mb: 3,
                    }}
                  >
                    "{t.text}"
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ color: "#8b5cf6" }}
                  >
                    — {t.name}, {t.role}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 🧲 FINAL CTA */}
        <Box
          sx={{
            p: { xs: 6, md: 10 },
            textAlign: "center",
            bgcolor: "#8b5cf6",
            borderRadius: 8,
            boxShadow: "0 20px 50px rgba(139, 92, 246, 0.3)",
          }}
        >
          <Typography variant="h3" fontWeight="900" color="#fff" gutterBottom>
            Want More Sales From Your Boutique Posts?
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: "rgba(255,255,255,0.9)", mb: 6 }}
          >
            Start using captions that are designed to convert—without spending
            hours thinking about what to write.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={scrollToForm}
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: "#fff",
              color: "#8b5cf6",
              px: 6,
              py: 2.5,
              fontSize: "1.2rem",
              fontWeight: "900",
              borderRadius: "50px",
              "&:hover": { bgcolor: "#f3f4f6" },
            }}
          >
            Get 30 Free Viral Product Captions
          </Button>
        </Box>

        {/* Footer info */}
        <Stack
          alignItems="center"
          sx={{ mt: 10, textAlign: "center", opacity: 0.5 }}
        >
          <Typography variant="caption">
            I'd really like to get to know you and the type of business you're
            running. You can email me at the address below
          </Typography>
          <Button
            size="small"
            sx={{
              color: "#fff",
              textTransform: "none",
              textDecoration: "underline",
            }}
            href="mailto:aginamena5@gmail.com"
          >
            aginamena5@gmail.com
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
