"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Divider,
} from "@mui/material";
import ScheduleVideos from "@/components/ScheduleVideos";
import CreateVideo from "@/components/CreateVideo";
import CreatedVideos from "@/components/CreatedVideos";

const AccountSettings = () => (
  <Typography sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "1.25rem" }}>
    Update your profile information, notification preferences, and security
    settings.
  </Typography>
);

const MENU_ITEMS = [
  {
    id: "created-videos",
    label: "Created Videos",
    Component: CreatedVideos,
  },
  {
    id: "schedule-videos",
    label: "Schedule Videos",
    Component: ScheduleVideos,
  },
  {
    id: "create-video",
    label: "Create Video",
    Component: CreateVideo,
  },
  {
    id: "settings",
    label: "Account Settings",
    Component: AccountSettings,
  },
];

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("created-videos");

  const currentItem = MENU_ITEMS.find((item) => item.id === activeTab);
  const ActiveComponent = currentItem?.Component || (() => null);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
        p: { xs: 2, md: 4 },
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: "100%",
          maxWidth: "1440px",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
          minHeight: "750px",
          borderRadius: 4,
          overflow: "hidden",
          background: "rgba(26, 26, 46, 0.8)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(139, 92, 246, 0.2)",
        }}
      >
        {/* Left Sidebar Menu */}
        <Box sx={{ borderRight: "1px solid rgba(139, 92, 246, 0.15)", p: 2 }}>
          <Typography
            variant="h6"
            sx={{
              px: 2,
              mb: 3,
              fontWeight: "bold",
              background: "linear-gradient(90deg, #8b5cf6 0%, #a855f7 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Dashboard
          </Typography>
          <List component="nav" sx={{ p: 0 }}>
            {MENU_ITEMS.map((item) => (
              <ListItem disablePadding key={item.id} sx={{ mb: 1 }}>
                <ListItemButton
                  selected={activeTab === item.id}
                  onClick={() => setActiveTab(item.id)}
                  sx={{
                    borderRadius: 2,
                    "&.Mui-selected": {
                      backgroundColor: "rgba(139, 92, 246, 0.15)",
                      "&:hover": {
                        backgroundColor: "rgba(139, 92, 246, 0.25)",
                      },
                    },
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.05)" },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    sx={{
                      color: activeTab === item.id ? "#a855f7" : "#e2e8f0",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Right Content Area */}
        <Box sx={{ p: { xs: 2, md: 4 }, overflowY: "auto", maxHeight: "90vh" }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: "#fff", mb: 2 }}
          >
            {currentItem?.label}
          </Typography>
          <Divider sx={{ mb: 4, borderColor: "rgba(139, 92, 246, 0.1)" }} />
          <Box>
            <ActiveComponent />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
