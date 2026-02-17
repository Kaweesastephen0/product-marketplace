"use client";

import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";

export default function AppHeader({ title, subtitle, user, onOpenSidebar, onLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: "1px solid", borderColor: "divider", backdropFilter: "blur(8px)" }}
    >
      <Toolbar sx={{ gap: 1, minHeight: 70 }}>
        <IconButton sx={{ display: { md: "none" } }} onClick={onOpenSidebar}>
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        <Button
          color="inherit"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          endIcon={<ExpandMoreIcon />}
          sx={{ textTransform: "none" }}
        >
          <Avatar sx={{ width: 28, height: 28, mr: 1 }}>{(user?.email || "U").charAt(0).toUpperCase()}</Avatar>
          <Box textAlign="left">
            <Typography variant="body2" lineHeight={1.1}>
              {user?.email || "User"}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
              {user?.role || "role"}
            </Typography>
          </Box>
        </Button>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem disabled>{user?.email}</MenuItem>
          <MenuItem onClick={onLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
