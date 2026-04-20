"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Mic } from "@mui/icons-material";

type SpeechRecognition = any;

export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [generatedNote, setGeneratedNote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);

  const dummyNotes = [
    {
      id: 1,
      patientName: "John Doe",
      preview:
        "Discussed cavity treatment and scheduled cleaning. Patient reported sensitivity in molars.",
      dateTime: "2023-10-01 10:00 AM",
    },
    {
      id: 2,
      patientName: "Jane Smith",
      preview:
        "Reviewed X-rays, recommended braces. Patient agreed to proceed with orthodontic plan.",
      dateTime: "2023-10-02 11:30 AM",
    },
    {
      id: 3,
      patientName: "Bob Johnson",
      preview:
        "Treated chipped tooth with bonding. Advised on preventive care to avoid future issues.",
      dateTime: "2023-10-03 2:00 PM",
    },
    {
      id: 4,
      patientName: "Alice Brown",
      preview:
        "Routine check-up, no issues found. Scheduled next visit in six months.",
      dateTime: "2023-10-04 9:00 AM",
    },
    {
      id: 5,
      patientName: "Charlie Wilson",
      preview:
        "Extracted wisdom tooth. Patient to follow up in one week for check.",
      dateTime: "2023-10-05 1:00 PM",
    },
    {
      id: 6,
      patientName: "Diana Lee",
      preview: "Fitted for dental crowns. Discussed oral hygiene improvements.",
      dateTime: "2023-10-06 3:30 PM",
    },
    {
      id: 7,
      patientName: "Edward Davis",
      preview:
        "Addressed gum disease concerns. Prescribed antibiotics and follow-up.",
      dateTime: "2023-10-07 10:15 AM",
    },
    {
      id: 8,
      patientName: "Fiona Garcia",
      preview:
        "Teeth whitening consultation. Patient opted for in-office treatment.",
      dateTime: "2023-10-08 12:00 PM",
    },
    {
      id: 9,
      patientName: "George Miller",
      preview: "Root canal procedure completed. Monitored for post-op pain.",
      dateTime: "2023-10-09 4:00 PM",
    },
    {
      id: 10,
      patientName: "Helen Taylor",
      preview:
        "Orthodontic adjustment. Braces tightened, next appointment in four weeks.",
      dateTime: "2023-10-10 11:00 AM",
    },
    {
      id: 11,
      patientName: "Ian Anderson",
      preview:
        "Emergency filling for cracked tooth. Advised on avoiding hard foods.",
      dateTime: "2023-10-11 2:45 PM",
    },
    {
      id: 12,
      patientName: "Julia Thomas",
      preview: "Dental implant consultation. Discussed timeline and costs.",
      dateTime: "2023-10-12 9:30 AM",
    },
  ];

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  // ------------------ SPEECH ENGINE ------------------

  const initRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("SpeechRecognition not supported in this browser.");
      return null;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript + " ";
        }
      }

      if (finalText) {
        setTranscript((prev) => (prev + " " + finalText).trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error("SpeechRecognition error:", event.error);

      if (event.error === "no-speech" || event.error === "network") {
        restartRecognition();
      }
    };

    recognition.onend = () => {
      if (isRecordingRef.current && !isPausedRef.current) {
        restartRecognition();
      }
    };

    return recognition;
  };

  const startRecognition = () => {
    if (recognitionRef.current) return;

    const recognition = initRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      console.warn("Start error:", e);
    }
  };

  const restartRecognition = () => {
    if (!isRecordingRef.current || isPausedRef.current) return;

    recognitionRef.current?.stop();
    recognitionRef.current = null;

    setTimeout(() => {
      startRecognition();
    }, 300);
  };

  const stopRecognition = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  };

  // ------------------ HANDLERS ------------------

  const handleStartRecording = () => {
    setDialogOpen(true);
  };

  const handleConfirmRecording = () => {
    if (!patientName.trim()) return;

    setTranscript("");
    setGeneratedNote("");
    setDialogOpen(false);

    setIsRecording(true);
    setIsPaused(false);

    isRecordingRef.current = true;
    isPausedRef.current = false;

    startRecognition();
  };

  const handlePauseResume = () => {
    if (!isRecordingRef.current) return;

    if (isPausedRef.current) {
      isPausedRef.current = false;
      setIsPaused(false);
      startRecognition();
    } else {
      isPausedRef.current = true;
      setIsPaused(true);
      stopRecognition();
    }
  };

  const handleStopRecording = async () => {
    isRecordingRef.current = false;
    isPausedRef.current = false;

    stopRecognition();

    setIsRecording(false);
    setIsPaused(false);
    setDialogOpen(false);

    if (!transcript.trim()) return;

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientName, transcript }),
      });

      const data = await response.json();

      if (data.note) {
        setGeneratedNote(data.note);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // ------------------ UI ------------------

  return (
    <Box sx={{ p: 2, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
            fontWeight: 600,
            color: "primary.main",
            mb: 3,
          }}
        >
          Record conversations, generate notes, and focus on patient care
          instead of documentation.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "center", md: "flex-end" },
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {isRecording && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: isPaused ? "warning.main" : "error.main",
              }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                color: isPaused ? "warning.main" : "error.main",
                fontWeight: 700,
              }}
            >
              {isPaused ? "Paused" : "Recording..."}
            </Typography>
          </Box>
        )}

        {!isRecording ? (
          <Button
            variant="contained"
            size="large"
            startIcon={<Mic />}
            onClick={handleStartRecording}
            sx={{
              fontSize: { xs: "1rem", sm: "1.5rem" },
              py: { xs: 1.5, sm: 2 },
              px: { xs: 2, sm: 4 },
              minWidth: { xs: "100%", sm: 300 },
              backgroundColor: "success.main",
              "&:hover": { backgroundColor: "success.dark" },
            }}
          >
            Start New Recording
          </Button>
        ) : (
          <Box
            sx={{ display: "flex", gap: 2, width: { xs: "100%", sm: "auto" } }}
          >
            <Button
              variant="outlined"
              onClick={handlePauseResume}
              sx={{
                flex: { xs: 1, sm: "none" },
                minWidth: { xs: "auto", sm: 140 },
                py: 1.5,
                px: { xs: 1.5, sm: 3 },
                borderWidth: 2,
                borderColor: "warning.main",
                color: "warning.main",
                fontWeight: 700,
                textTransform: "none",
                fontSize: { xs: "0.875rem", sm: "1rem" },
                "&:hover": {
                  backgroundColor: "rgba(255, 167, 38, 0.12)",
                  borderColor: "warning.dark",
                },
              }}
            >
              {isPaused ? "Resume" : "Pause"}
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={handleStopRecording}
              sx={{
                flex: { xs: 1, sm: "none" },
                minWidth: { xs: "auto", sm: 140 },
                py: 1.5,
                px: { xs: 1.5, sm: 3 },
                fontWeight: 700,
                textTransform: "none",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Stop
            </Button>
          </Box>
        )}
      </Box>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: { xs: 0, sm: 8 },
            margin: { xs: 0, sm: 2 },
            width: { xs: "100%", sm: "auto" },
            height: { xs: "100%", sm: "auto" },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            textAlign: "center",
            pb: 1,
          }}
        >
          Enter patient name
        </DialogTitle>
        <DialogContent
          sx={{
            px: { xs: 3, sm: 3 },
            py: 1,
          }}
        >
          <TextField
            autoFocus
            margin="dense"
            label="Patient name"
            type="text"
            fullWidth
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            sx={{
              "& .MuiInputLabel-root": {
                fontSize: { xs: "0.875rem", sm: "1rem" },
              },
              "& .MuiInputBase-input": {
                fontSize: { xs: "1rem", sm: "1rem" },
              },
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            px: { xs: 3, sm: 3 },
            pb: { xs: 3, sm: 2 },
          }}
        >
          <Button
            onClick={() => setDialogOpen(false)}
            fullWidth
            sx={{
              order: { xs: 2, sm: 1 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmRecording}
            disabled={!patientName.trim()}
            fullWidth
            sx={{
              order: { xs: 1, sm: 2 },
              backgroundColor: "success.main",
              "&:hover": { backgroundColor: "success.dark" },
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Start Recording Now
          </Button>
        </DialogActions>
      </Dialog>

      {generatedNote && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Generated SOAP Note</Typography>
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mb: 6 }}>
            {generatedNote}
          </Typography>
        </Box>
      )}

      {isGenerating && (
        <Typography variant="body2" sx={{ mt: 2, mb: 6 }}>
          Generating SOAP note...
        </Typography>
      )}

      <Grid container spacing={2}>
        {dummyNotes.map((note) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={note.id}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {note.patientName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {note.preview}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {note.dateTime}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
