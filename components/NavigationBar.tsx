import { AppBar, Box, Toolbar, Typography } from "@mui/material";

export default function NavigationBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
            }}
          >
            Grocerity
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
