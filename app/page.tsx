"use client";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
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
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [session, setSession] = useState<any>("");

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
  async function handleConnect() {
    const sessionName = `qr_${Date.now()}`;
    setSession(sessionName);
    setIsConnecting(true);
    setQrCode(null);
    setSessionStatus("Initializing Session...");
    setTimer(0);

    let qrCount = 0;
    let qrExpiresAt = 0;
    const maxQrCodes = 6;

    try {
      // Create session
      await fetch(`/api/waha/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: sessionName }),
      });

      // Start session
      await fetch(`/api/waha/sessions/${sessionName}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/waha/sessions/${sessionName}`);
          const statusData = await res.json();
          const status = statusData.status;

          const now = Math.floor(Date.now() / 1000);

          // ✅ SUCCESS
          if (status === "WORKING") {
            clearInterval(pollInterval);
            setIsConnected(true);
            setQrCode(null);
            setTimer(0);
            setSessionStatus("CONNECTED ✅");
            setIsConnecting(false);
            return;
          }

          // ❌ FAILURE
          if (status === "FAILED" || status === "STOPPED") {
            clearInterval(pollInterval);
            setSessionStatus("FAILED");
            setQrCode(null);
            setTimer(0);
            setIsConnecting(false);
            return;
          }

          // 📱 QR SCAN FLOW
          if (status === "SCAN_QR_CODE") {
            let remaining = Math.max(0, qrExpiresAt - now);
            setTimer(remaining);
            setSessionStatus("Scan QR Code");

            // Generate new QR if expired or first time
            if (remaining === 0) {
              if (qrCount >= maxQrCodes) {
                clearInterval(pollInterval);
                setSessionStatus("QR LIMIT REACHED");
                setQrCode(null);
                setTimer(0);
                setIsConnecting(false);
                return;
              }

              qrCount++;

              const duration = qrCount === 1 ? 60 : 20;
              qrExpiresAt = now + duration;
              setTimer(duration);

              const qrRes = await fetch(`/api/waha/${sessionName}/auth/qr`);

              const qrData = await qrRes.json();
              console.log("QR Data:", qrData);
              if (qrData?.data) {
                setQrCode(
                  `data:${qrData.mimetype || "image/png"};base64,${qrData.data}`,
                );
              }
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 1000);
    } catch (error) {
      console.error(error);
      setIsConnecting(false);
      setSessionStatus("FAILED TO START");
    }
  }

  async function getAllGroups() {
    setIsSyncing(true);
    try {
      const request = await fetch(`/api/waha/${session}/groups?limit=20`);
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
    if (selectedGroups.length === 0) {
      return alert("Please select at least one group.");
    }

    // Check for Content (Text or Images)
    const hasText = generalText.length > 0;
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
          session,
          selectedGroups,
          images,
          generalText: generalText.trim(),
          selectedDays,
          postTime: "09:00", // Hardcoded for now, can be made dynamic later
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
        p: { xs: 1.5, sm: 3, md: 6 },
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
          borderRadius: { xs: 4, md: 6 },
          p: { xs: 2.5, sm: 4, md: 5 },
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
                  {/* Session Status Display */}
                  {sessionStatus && !qrCode && (
                    <Typography
                      variant="overline"
                      sx={{ fontWeight: "bold", color: "#8b5cf6" }}
                    >
                      STATUS: {sessionStatus}
                    </Typography>
                  )}
                  {qrCode && (
                    <Stack
                      spacing={2}
                      alignItems="center"
                      sx={{ mt: 2, width: "100%", maxWidth: 300 }}
                    >
                      <Box sx={{ textAlign: "center", mb: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "#fff", fontWeight: "bold" }}
                        >
                          HOW TO SCAN:
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            display: "block",
                          }}
                        >
                          1. Open WhatsApp on your phone
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            display: "block",
                          }}
                        >
                          2. Tap Menu or Settings &gt; Linked Devices
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            display: "block",
                          }}
                        >
                          3. Tap on Link a Device & scan the code
                        </Typography>
                      </Box>

                      <Box sx={{ position: "relative" }}>
                        <Paper
                          elevation={10}
                          sx={{
                            p: 2,
                            bgcolor: "#fff",
                            borderRadius: 4,
                            border: "4px solid #8b5cf6",
                            transition: "all 0.3s ease",
                            filter:
                              timer === 0 ? "blur(4px) grayscale(1)" : "none",
                          }}
                        >
                          <Box
                            component="img"
                            src={qrCode}
                            alt="WhatsApp QR Code"
                            sx={{ width: 220, height: 220 }}
                          />
                        </Paper>
                        <Avatar
                          sx={{
                            position: "absolute",
                            top: -15,
                            right: -15,
                            bgcolor: timer < 10 ? "#ef4444" : "#8b5cf6",
                            width: 45,
                            height: 45,
                            fontSize: "0.9rem",
                            fontWeight: "bold",
                            border: "3px solid #1a1a1a",
                            boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)",
                          }}
                        >
                          {timer}s
                        </Avatar>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ color: "#8b5cf6", fontWeight: "bold" }}
                      >
                        EXPIRES IN {timer}s - SCAN NOW
                      </Typography>
                    </Stack>
                  )}
                </Box>

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
                {/* Groups Display Section */}
                {groups.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.5)",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      SELECT DESTINATION GROUPS:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {groups.map((group) => {
                        const isSelected = selectedGroups.find(
                          (g) => g.id === group.id,
                        );
                        return (
                          <Button
                            key={group.id}
                            variant={isSelected ? "contained" : "outlined"}
                            onClick={() => handleToggleGroup(group)}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontSize: "0.75rem",
                              bgcolor: isSelected
                                ? "#8b5cf6"
                                : "rgba(255,255,255,0.05)",
                              color: "#fff",
                              borderColor: isSelected
                                ? "#8b5cf6"
                                : "rgba(139, 92, 246, 0.3)",
                              "&:hover": {
                                bgcolor: isSelected
                                  ? "#7c3aed"
                                  : "rgba(139, 92, 246, 0.1)",
                              },
                            }}
                          >
                            {group.name}
                          </Button>
                        );
                      })}
                    </Box>
                  </Box>
                )}
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

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}
              >
                <TextField
                  type="time"
                  fullWidth={false}
                  value="09:00"
                  sx={{
                    width: { xs: "100%", sm: 200 },
                    bgcolor: "rgba(0,0,0,0.2)",
                    "& input": { color: "#fff" },
                  }}
                />
                <Tooltip
                  title="Post will be posted at 9am EST using your selected days"
                  arrow
                >
                  <InfoOutlinedIcon sx={{ color: "#8b5cf6", cursor: "help" }} />
                </Tooltip>
              </Box>

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
