"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

const COLLAPSED_WIDTH = 76;
const EXPANDED_WIDTH = 250;

function SidebarContent({ items, activeKey, expanded, onSelect }) {
  return (
    <Stack sx={{ height: "100%", pt: 2 }}>
      <Typography sx={{ px: 2, pb: 1, fontSize: 12, textTransform: "uppercase", color: "text.secondary" }}>
        {expanded ? "Navigation" : ""}
      </Typography>
      <List sx={{ px: 1 }}>
        {items.map((item) => {
          const Icon = item.icon;
          const selected = activeKey === item.key;
          return (
            <Tooltip key={item.key} title={expanded ? "" : item.label} placement="right">
              <ListItemButton
                selected={selected}
                onClick={() => onSelect(item.key)}
                sx={{
                  borderRadius: 2,
                  minHeight: 44,
                  mb: 0.5,
                  justifyContent: expanded ? "initial" : "center",
                  px: expanded ? 1.5 : 1,
                }}
              >
                <ListItemIcon sx={{ minWidth: expanded ? 38 : "auto" }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                {expanded ? <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} /> : null}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Box sx={{ mt: "auto", p: 1.5 }}>
        <ListItemButton component={Link} href="/" sx={{ borderRadius: 2, justifyContent: expanded ? "initial" : "center" }}>
          <ListItemText primary={expanded ? "Public Listing" : "P"} primaryTypographyProps={{ fontSize: 13 }} />
        </ListItemButton>
      </Box>
    </Stack>
  );
}

export default function HoverSidebar({ items, activeKey, onSelect, mobileOpen, onMobileClose }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
          transition: "width .4s ease",
          borderRight: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 1200,
        }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <SidebarContent items={items} activeKey={activeKey} expanded={expanded} onSelect={onSelect} />
      </Box>

      <Drawer open={mobileOpen} onClose={onMobileClose} sx={{ display: { md: "none" } }}>
        <Box sx={{ width: EXPANDED_WIDTH }}>
          <SidebarContent items={items} activeKey={activeKey} expanded onSelect={(key) => {
            onSelect(key);
            onMobileClose();
          }} />
        </Box>
      </Drawer>
    </>
  );
}
