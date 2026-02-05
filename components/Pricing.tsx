import { Chat, CheckCircle, Star } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
} from "@mui/material";

const Pricing = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:960px)");

  const tiers = [
    {
      title: "Do It Yourself",
      price: "$30",
      period: "/month",
      billing: "billed monthly",
      description:
        "Perfect for those looking to create their own social videos quickly.",
      benefits: [
        "Unlimited HD Video Generations",
        "AI-Powered Scripting & Storytelling",
        "Professional AI Voiceovers",
        "Upload up to 10 Images per Video",
        "No Watermarks on Your Content",
        "Social Media Ready (9:16 Aspect Ratio)",
      ],
      buttonText: "Do It Yourself",
      highlight: false,
    },
    {
      title: "Set And Forget",
      price: "$199",
      period: "/month",
      billing: "billed monthly",
      description:
        "AI follows your content calendar to generate and deliver ready-to-post videos.",
      benefits: [
        "AI-Generated Social Media Content Calendar",
        "Bulk Image Uploads (up to 50+ per month)",
        "Autopilot Video Creation based on your schedule",
        "Ready-to-post videos delivered to your inbox",
        "Strategic Captions, Hashtags & Voiceovers",
        "Custom Brand Style & Logo Overlay",
        "Priority Video Processing & Support",
      ],
      buttonText: "Set And Forget. Coming Soon",
      highlight: true,
    },
    {
      title: "Enterprise",
      price: "Custom",
      period: "",
      billing: "Speak with us",
      description: "Full-service solution for grocery chains and franchises.",
      benefits: [
        "Everything in Professional",
        "Management for multiple locations",
        "Dedicated Content Strategist",
        "Custom Video Templates",
        "API Access for bulk video generation",
        "Whitelabeling options",
      ],
      buttonText: "Coming Soon",
      highlight: false,
      icon: <Chat />,
    },
  ];

  return (
    <Box sx={{ py: { xs: 10, md: 15 } }}>
      <Box sx={{ textAlign: "center", mb: 8 }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          component="h2"
          fontWeight="bold"
          gutterBottom
          sx={{
            background:
              "linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Choose Your Growth Plan
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "1.2rem",
            maxWidth: 700,
            mx: "auto",
          }}
        >
          Whether you're a local grocer or a national chain, our platform will
          help you create short form video content in minutes.
        </Typography>
      </Box>

      <Grid container spacing={4} alignItems="stretch">
        {tiers.map((tier, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Card
              elevation={tier.highlight ? 24 : 4}
              sx={{
                height: "100%",
                background: "rgba(26, 26, 46, 0.6)",
                backdropFilter: "blur(20px)",
                borderRadius: 6,
                border: tier.highlight
                  ? "2px solid rgba(139, 92, 246, 0.6)"
                  : "1px solid rgba(139, 92, 246, 0.2)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateY(-10px)",
                  borderColor: "rgba(139, 92, 246, 0.5)",
                },
                ...(tier.highlight && {
                  background: "rgba(26, 26, 46, 0.9)",
                  boxShadow: "0 0 50px rgba(139, 92, 246, 0.15)",
                }),
              }}
            >
              {tier.highlight && (
                <Box
                  sx={{
                    position: "absolute",
                    top: -18,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background:
                      "linear-gradient(45deg, #8b5cf6 30%, #a855f7 90%)",
                    color: "white",
                    px: 3,
                    py: 0.5,
                    borderRadius: 10,
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    zIndex: 2,
                  }}
                >
                  <Star
                    sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }}
                  />{" "}
                  Professional
                </Box>
              )}

              <CardContent sx={{ p: { xs: 3, md: 4 }, flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: tier.highlight ? "#a855f7" : "#fff",
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  {tier.title}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", mb: 0.5 }}>
                  <Typography
                    variant="h3"
                    fontWeight="800"
                    sx={{ color: "#fff" }}
                  >
                    {tier.price}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: "rgba(255, 255, 255, 0.4)", ml: 1 }}
                  >
                    {tier.period}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: "#4ade80", fontWeight: 600, mb: 2, height: 20 }}
                >
                  {tier.billing}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.5)", mb: 4 }}
                >
                  {tier.description}
                </Typography>

                <Divider
                  sx={{ borderColor: "rgba(139, 92, 246, 0.1)", mb: 3 }}
                />

                <List sx={{ mb: 2 }}>
                  {tier.benefits.map((benefit, i) => (
                    <ListItem
                      key={i}
                      disableGutters
                      sx={{ py: 1, alignItems: "flex-start" }}
                    >
                      <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                        <CheckCircle
                          sx={{
                            color: tier.highlight ? "#a855f7" : "#4ade80",
                            fontSize: 20,
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={benefit}
                        primaryTypographyProps={{
                          sx: {
                            color: "rgba(255, 255, 255, 0.8)",
                            fontSize: "0.95rem",
                            lineHeight: 1.4,
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>

              <Box sx={{ p: { xs: 3, md: 4 }, pt: 0 }}>
                <Button
                  fullWidth
                  variant={tier.highlight ? "contained" : "outlined"}
                  size="large"
                  startIcon={tier.icon}
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 700,
                    textTransform: "none",
                    ...(tier.highlight
                      ? {
                          background:
                            "linear-gradient(45deg, #8b5cf6 30%, #a855f7 90%)",
                          "&:hover": {
                            background:
                              "linear-gradient(45deg, #7c3aed 30%, #9333ea 90%)",
                          },
                        }
                      : {
                          borderColor: "rgba(139, 92, 246, 0.5)",
                          color: "#fff",
                          "&:hover": {
                            borderColor: "#8b5cf6",
                            background: "rgba(139, 92, 246, 0.05)",
                          },
                        }),
                  }}
                >
                  {tier.buttonText}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Pricing;
