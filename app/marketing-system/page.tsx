"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SecurityIcon from "@mui/icons-material/Security";
import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FavoriteIcon from "@mui/icons-material/Favorite";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Link from "next/link";

export default function MarketingSystemSalesPage() {
  const earlyAccessPrice = 199;
  const regularPrice = 399;

  const corePillars = [
    {
      title: "GET: The Social Attraction Engine",
      icon: <PersonAddIcon sx={{ fontSize: 40, color: "#8b5cf6" }} />,
      desc: "Stop shouting into the void. Use our viral caption templates and reel frameworks to turn complete strangers into followers and first-time buyers.",
    },
    {
      title: "KEEP: The Loyalty Loop",
      icon: <FavoriteIcon sx={{ fontSize: 40, color: "#8b5cf6" }} />,
      desc: "Getting a customer is hard; keeping them is easy if you have the right system. Automate your post-purchase emails and engagement so they keep coming back.",
    },
    {
      title: "GROW: The Referral Rocket",
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: "#8b5cf6" }} />,
      desc: "Transform your best customers into a volunteer sales force. Learn how to incentivize existing buyers so they bring their friends along.",
    },
  ];

  return (
    <Box sx={{ bgcolor: "#0a0a0a", color: "#fff", minHeight: "100vh" }}>
      {/* ⏳ SCARCITY BAR */}
      <Box sx={{ bgcolor: "#8b5cf6", py: 1, textAlign: "center" }}>
        <Typography variant="body2" fontWeight="bold">
          ⚠️ EARLY ACCESS ENDS APRIL 1ST. PRICE INCREASES TO ${regularPrice}{" "}
          USD.
        </Typography>
      </Box>

      {/* 🔥 HERO SECTION */}
      <Container maxWidth="lg" sx={{ pt: 10, pb: 15, textAlign: "center" }}>
        <Typography
          variant="overline"
          sx={{ color: "#8b5cf6", fontWeight: "bold", letterSpacing: 2 }}
        >
          EXCLUSIVE EARLY ACCESS
        </Typography>
        <Typography
          variant="h1"
          fontWeight="900"
          sx={{
            fontSize: { xs: "2.8rem", md: "4.5rem" },
            lineHeight: 1.1,
            mt: 2,
            mb: 4,
            background: "linear-gradient(to bottom, #fff, #a855f7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Start Growing Your Boutique Sales with a Proven Marketing System
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: "rgba(255,255,255,0.7)",
            maxWidth: "800px",
            mx: "auto",
            mb: 6,
          }}
        >
          Stop Guessing, Start Getting Results: Transform your social media into
          a sales machine
        </Typography>

        <Button
          variant="contained"
          size="large"
          href="#pricing"
          onClick={() => {}}
          sx={{
            bgcolor: "#8b5cf6",
            px: 8,
            py: 2.5,
            fontSize: "1.3rem",
            fontWeight: "900",
            borderRadius: 100,
            boxShadow: "0 0 40px rgba(139, 92, 246, 0.4)",
            "&:hover": { bgcolor: "#7c3aed" },
          }}
        >
          GET EARLY ACCESS FOR ${earlyAccessPrice} USD
        </Button>
      </Container>

      {/* 🛠️ THE 3-STEP PROCESS SECTION */}
      <Container maxWidth="lg" sx={{ mb: 15 }}>
        <Grid container spacing={4}>
          {corePillars.map((pillar, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Paper
                sx={{
                  p: 5,
                  height: "100%",
                  bgcolor: "rgba(139, 92, 246, 0.03)",
                  border: "1px solid rgba(139, 92, 246, 0.15)",
                  borderRadius: 6,
                  textAlign: "center",
                }}
              >
                {pillar.icon}
                <Typography variant="h5" fontWeight="900" sx={{ mt: 3, mb: 2 }}>
                  {pillar.title}
                </Typography>
                <Typography
                  sx={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}
                >
                  {pillar.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 🖼️ PDF PREVIEW */}
      <Container maxWidth="md" sx={{ mb: 15 }}>
        <Typography variant="h4" textAlign="center" fontWeight="bold" mb={4}>
          Inside the Step-By-Step Blueprint
        </Typography>
        <Paper
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid rgba(139, 92, 246, 0.3)",
          }}
        >
          <Box
            component="img"
            src="/marketing_system_preview.png"
            sx={{ width: "100%", height: "auto" }}
          />
        </Paper>
      </Container>

      {/* 💬 TESTIMONIALS */}
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Typography variant="h4" textAlign="center" fontWeight="900" mb={8}>
          What Other Sellers are Saying
        </Typography>
        <Stack spacing={4}>
          {[
            {
              name: "Sarah Jenkins",
              role: "Boutique Owner",
              text: "The 'Keep' section changed my business. I stopped chasing new leads every hour and started focused on the customers I already had. My repeat buyer rate doubled in a month!",
            },
            {
              name: "Mark T.",
              role: "Fashion Entrepreneur",
              text: "I was stuck at $3k months. Using the 'Grow' referral strategy, my customers literally started doing my marketing for me. Just hit my first $12k month.",
            },
          ].map((t, i) => (
            <Paper key={i} sx={{ p: 5, bgcolor: "#161625", borderRadius: 4 }}>
              <FormatQuoteIcon sx={{ color: "#8b5cf6", opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" sx={{ fontStyle: "italic", mb: 3 }}>
                "{t.text}"
              </Typography>
              <Typography fontWeight="bold" color="#8b5cf6">
                — {t.name}, {t.role}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Container>

      {/* 🏷️ PRICING */}
      <Box id="pricing" sx={{ py: 15, bgcolor: "rgba(139, 92, 246, 0.05)" }}>
        <Container maxWidth="sm">
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 8,
              border: "3px solid #8b5cf6",
              bgcolor: "#0a0a0a",
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              EARLY ACCESS PASS
            </Typography>
            <Typography
              variant="h2"
              fontWeight="900"
              sx={{ my: 2, color: "#8b5cf6" }}
            >
              ${earlyAccessPrice} USD
            </Typography>
            <Typography
              sx={{ textDecoration: "line-through", opacity: 0.4, mb: 4 }}
            >
              Normally ${regularPrice} USD
            </Typography>

            <Stack spacing={2} textAlign="left" sx={{ mb: 4 }}>
              <Stack direction="row" spacing={2}>
                <CheckCircleIcon sx={{ color: "#8b5cf6" }} />
                <Typography>GET: Social Attraction System</Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <CheckCircleIcon sx={{ color: "#8b5cf6" }} />
                <Typography>KEEP: Retention & Loyalty Engine</Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <CheckCircleIcon sx={{ color: "#8b5cf6" }} />
                <Typography>GROW: Viral Referral Blueprints</Typography>
              </Stack>
            </Stack>

            <Button
              variant="contained"
              fullWidth
              sx={{
                py: 2,
                bgcolor: "#8b5cf6",
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
            >
              <Link href="https://buy.stripe.com/eVq5kC3Fc8Spf3o9V3c7u06">
                INSTANT EARLY ACCESS
              </Link>
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* ❓ FAQ / OBJECTIONS */}
      <Container maxWidth="md" sx={{ py: 15 }}>
        <Typography variant="h4" textAlign="center" fontWeight="900" mb={8}>
          Common Boredom/Objections
        </Typography>
        <Stack spacing={2}>
          {[
            {
              q: "What if I don't have many followers?",
              a: "The 'GET' section is built specifically for small accounts. You don't need a huge following to make a huge profit.",
            },
            {
              q: "Is this hard to set up?",
              a: "No. Everything is step-by-step. If you can copy and paste, you can run this marketing system.",
            },
            {
              q: "How long does it take to see results?",
              a: "Most sellers see a lift in engagement within 48 hours and an increase in sales within the first 14 days.",
            },
          ].map((item, i) => (
            <Accordion
              key={i}
              sx={{
                bgcolor: "#111",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
              >
                <Typography fontWeight="bold">{item.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ opacity: 0.7 }}>{item.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
