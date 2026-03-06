"use client";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Box,
  Button,
  Card,
  CardMedia,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Divider,
} from "@mui/material";
import { ChangeEvent, useState } from "react";

interface ImageItem {
  id: string;
  base64: string;
  caption: string;
}

export default function Home2() {
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<
    { id: string; name: string }[]
  >([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [generalText, setGeneralText] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [postTime, setPostTime] = useState("09:00");
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);

  // Loading States
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const DAYS_OF_WEEK = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const apikey = "b5d2364e1bcb47268dd820aa076c333f";

  async function handleConnect() {
    const input = prompt(
      "Please enter your WhatsApp phone number with country code (e.g., 13439972096):",
    );

    // 2. Validate input is not null and contains only digits
    if (input === null) return; // User cancelled

    const phoneNumber = input.replace(/\D/g, "");
    if (phoneNumber.length < 10) {
      alert(
        "Invalid phone number. Please include your country code and at least 10 digits.",
      );
      return;
    }
    const sessionName = Date.now().toString(); // Unique session name based on timestamp
    setIsConnecting(true);
    setPairingCode(null);
    setSessionStatus("Initializing...");

    try {
      // 1. Create & Start Session
      await fetch("http://localhost:3000/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": apikey,
        },
        body: JSON.stringify({ name: sessionName }),
      });

      await fetch(`http://localhost:3000/api/sessions/${sessionName}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": apikey,
        },
      });

      // 2. Poll for Status
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch(
            `http://localhost:3000/api/sessions/${sessionName}`,
            {
              headers: { "X-Api-Key": apikey },
            },
          );
          const data = await res.json();
          const currentStatus = data.status.toUpperCase();
          console.log("Current Session Status:", currentStatus);
          // Update general status
          if (currentStatus === "WORKING") {
            clearInterval(pollInterval);
            setIsConnected(true);
            setPairingCode(null);
            setSessionStatus("CONNECTED ✅");
            setIsConnecting(false);
          } else if (currentStatus === "SCAN_QR_CODE" && !pairingCode) {
            console.log("requs-cod");
            const codeReq = await fetch(
              `http://localhost:3000/api/${sessionName}/auth/request-code`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Api-Key": apikey,
                },
                body: JSON.stringify({ phoneNumber }),
              },
            );
            const codeData = await codeReq.json();
            console.log("codeData", codeData);
            if (codeData.code) {
              setPairingCode(codeData.code);
              setSessionStatus(null); // Hide the "SCAN QR CODE" text once code is ready
              setIsConnecting(false);
            }
          } else if (!pairingCode) {
            setSessionStatus(currentStatus.replace(/_/g, " "));
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 1000);
    } catch (error) {
      console.error(error);
      setIsConnecting(false);
      setSessionStatus("FAILED");
    }
  }

  async function getAllGroups() {
    setIsSyncing(true);
    try {
      const request = await fetch(
        "http://localhost:3000/api/gg/groups?limit=20",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": apikey,
          },
        },
      );
      const data = await request.json();
      const parsedGroups = data.map((group: any) => ({
        id: group.id._serialized,
        name: group.name,
      }));
      setGroups(parsedGroups);
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  }
  const handleToggleGroup = (group: { id: string; name: string }) => {
    setSelectedGroups((prev) =>
      prev.find((g) => g.id === group.id)
        ? prev.filter((g) => g.id !== group.id)
        : [...prev, { id: group.id, name: group.name }],
    );
  };

  const updateImageCaption = (id: string, caption: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, caption } : img)),
    );
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.type === "image/jpeg" || file.type === "image/jpg") {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(",")[1];
          setImages((prev) => [
            ...prev,
            {
              id: Math.random().toString(36),
              base64: base64String,
              caption: "",
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = "";
  };

  const handleToggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  async function saveToSupabase() {
    // Check for Groups
    if (selectedGroups.length === 0) {
      return alert("Please select at least one group.");
    }

    // Check for Content (Text or Images)
    const hasText = generalText.trim().length > 0;
    const hasImages = images.length > 0;

    if (!hasText && !hasImages) {
      return alert(
        "Please provide content to send (either a text message, images, or both).",
      );
    }

    // Check for Schedule
    if (selectedDays.length === 0) {
      return alert("Please select at least one day for the schedule.");
    }
    setIsScheduling(true);
    try {
      const response = await fetch("/api/scheduledPosts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedGroups,
          images,
          generalText,
          selectedDays,
          postTime,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save schedule");
      }

      alert(
        "Post scheduled! Our system will now handle the automated posting based on your selected days and time.",
      );
      // Clear content after successful schedule
      setImages([]);
      setGeneralText("");
    } catch (error: any) {
      console.error(error);
      alert(`Error saving schedule: ${error.message}`);
    } finally {
      setIsScheduling(false);
    }
  }

  const StepHeader = ({
    title,
    instruction,
  }: {
    title: string;
    instruction: string;
  }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ color: "#8b5cf6", fontWeight: "bold" }}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "rgba(255, 255, 255, 0.6)", fontStyle: "italic" }}
      >
        {instruction}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
        p: { xs: 1.5, sm: 3, md: 6 }, // Reduced padding on mobile
        color: "#fff",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: "900px",
          width: "100%",
          background: "rgba(26, 26, 46, 0.4)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          borderRadius: { xs: 4, md: 6 }, // Softer corners on desktop
          p: { xs: 2.5, sm: 4, md: 5 }, // Adaptive internal padding
        }}
      >
        <Stack spacing={1} sx={{ mb: { xs: 3, md: 4 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="h4"
              fontWeight="900"
              sx={{ fontSize: { xs: "1.75rem", md: "2.125rem" } }}
            >
              Automate your WhatsApp Posts
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={{ xs: 3, md: 4 }}>
          {/* STEP 1: SYNC & SELECT */}
          <Box>
            <StepHeader
              title="Step 1: Connect & Sync"
              instruction="Link your WhatsApp account to start."
            />
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "rgba(139,92,246,0.05)",
                border: "1px solid rgba(139,92,246,0.1)",
              }}
            >
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting || isConnected}
                    variant="contained"
                    sx={{
                      bgcolor: isConnected ? "#10b981" : "#8b5cf6",
                      py: 1.2,
                      minWidth: 180,
                    }}
                  >
                    {isConnecting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : isConnected ? (
                      "ACCOUNT LINKED"
                    ) : (
                      "CONNECT ACCOUNT"
                    )}
                  </Button>

                  {/* Replacement logic: Status text is hidden if pairingCode exists */}
                  {sessionStatus && !pairingCode && (
                    <Typography
                      variant="overline"
                      sx={{ fontWeight: "bold", color: "#8b5cf6" }}
                    >
                      STATUS: {sessionStatus}
                    </Typography>
                  )}

                  {/* Prominent Replacement Code */}
                  {pairingCode && (
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        bgcolor: "#000",
                        borderRadius: 2,
                        border: "2px solid #8b5cf6",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "#8b5cf6", fontWeight: "bold" }}
                      >
                        CODE:
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 900,
                          letterSpacing: 4,
                          color: "#fff",
                          fontFamily: "monospace",
                        }}
                      >
                        {pairingCode}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {pairingCode && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.6)",
                      bgcolor: "rgba(0,0,0,0.2)",
                      p: 1.5,
                      borderRadius: 1,
                      border: "1px solid rgba(139,92,246,0.2)",
                    }}
                  >
                    <b>How to connect:</b> Open WhatsApp &gt; Settings &gt;
                    Linked Devices &gt; Link a Device &gt;{" "}
                    <b>Link with phone number instead</b>. Enter the code above.
                  </Typography>
                )}

                <Divider
                  sx={{ borderColor: "rgba(255,255,255,0.05)", my: 1 }}
                />

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Button
                    onClick={getAllGroups}
                    disabled={!isConnected || isSyncing}
                    variant="outlined"
                    sx={{
                      py: 1,
                      color: isConnected ? "#fff" : "rgba(255,255,255,0.2)",
                      borderColor: isConnected
                        ? "#8b5cf6"
                        : "rgba(255,255,255,0.1)",
                    }}
                  >
                    {isSyncing ? (
                      <CircularProgress size={20} />
                    ) : (
                      "SYNC WHATSAPP GROUPS"
                    )}
                  </Button>
                  <Tooltip title="Fetches your top 20 active groups.">
                    <InfoOutlinedIcon sx={{ opacity: 0.4 }} fontSize="small" />
                  </Tooltip>
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* STEP 2: CONTENT CREATION */}
          <Box>
            <StepHeader
              title="Step 2: Content Creation"
              instruction="Send text, images, or both combined."
            />
            <Stack spacing={3}>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="filled"
                placeholder="Enter message text..."
                value={generalText}
                onChange={(e) => setGeneralText(e.target.value)}
                sx={{
                  bgcolor: "rgba(255,255,255,0.03)",
                  borderRadius: 2,
                  "& .MuiInputBase-root": { color: "#fff" },
                }}
              />

              <Box>
                <Button
                  component="label"
                  fullWidth
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    color: "#8b5cf6",
                    borderColor: "rgba(139, 92, 246, 0.4)",
                    mb: 2,
                    py: 1.5,
                  }}
                >
                  Add Images
                  <input
                    type="file"
                    hidden
                    accept=".jpg, .jpeg"
                    multiple
                    onChange={handleFileChange}
                  />
                </Button>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr 1fr",
                      sm: "repeat(3, 1fr)",
                      md: "repeat(4, 1fr)",
                    },
                    gap: 1.5,
                  }}
                >
                  {images.map((img) => (
                    <Card
                      key={img.id}
                      sx={{
                        bgcolor: "#111827",
                        border: "1px solid rgba(255,255,255,0.1)",
                        position: "relative",
                      }}
                    >
                      <CardMedia
                        component="img"
                        sx={{
                          height: { xs: 100, sm: 120 },
                          objectFit: "cover",
                        }}
                        image={`data:image/jpeg;base64,${img.base64}`}
                      />
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Caption..."
                        value={img.caption}
                        onChange={(e) =>
                          updateImageCaption(img.id, e.target.value)
                        }
                        sx={{
                          "& .MuiInputBase-input": {
                            fontSize: "0.7rem",
                            color: "#ccc",
                            p: 0.8,
                          },
                        }}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeImage(img.id)}
                        sx={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          bgcolor: "rgba(0,0,0,0.5)",
                        }}
                      >
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </Card>
                  ))}
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* STEP 3: SCHEDULING */}
          <Box>
            <StepHeader
              title="Step 3: Scheduling"
              instruction="Select automated trigger times."
            />
            <Paper
              sx={{
                p: { xs: 2, md: 4 },
                borderRadius: 4,
                bgcolor: "rgba(139, 92, 246, 0.08)",
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {DAYS_OF_WEEK.map((day) => (
                  <Button
                    key={day}
                    variant={
                      selectedDays.includes(day) ? "contained" : "outlined"
                    }
                    onClick={() => handleToggleDay(day)}
                    sx={{
                      borderRadius: 10,
                      bgcolor: selectedDays.includes(day)
                        ? "#8b5cf6"
                        : "transparent",
                      color: "#fff",
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                      minWidth: { xs: "70px", sm: "90px" },
                      px: { xs: 1 },
                    }}
                  >
                    {day.substring(0, 3)}
                  </Button> // Abbreviated on mobile
                ))}
              </Box>

              <TextField
                type="time"
                fullWidth={false}
                value={postTime}
                onChange={(e) => setPostTime(e.target.value)}
                sx={{
                  width: { xs: "100%", sm: 200 },
                  mb: 4,
                  bgcolor: "rgba(0,0,0,0.2)",
                  "& input": { color: "#fff" },
                }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={saveToSupabase}
                disabled={
                  isScheduling ||
                  selectedGroups.length === 0 ||
                  (generalText.trim().length === 0 && images.length === 0) ||
                  selectedDays.length === 0
                }
                sx={{ py: 2, fontWeight: "bold", bgcolor: "#8b5cf6" }}
              >
                {isScheduling ? (
                  <CircularProgress size={26} color="inherit" />
                ) : (
                  "Confirm Schedule"
                )}
              </Button>
            </Paper>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
