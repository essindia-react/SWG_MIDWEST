import React, { useCallback, useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { X } from "lucide-react";

interface InventorySlideDrawerProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export function InventorySlideDrawer({
  title,
  subtitle,
  onClose,
  children,
  width = 520,
}: InventorySlideDrawerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 280);
  }, [onClose]);

  return (
    <>
      <Box
        onClick={handleClose}
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "rgba(0,0,0,0.4)",
          zIndex: 1200,
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.28s ease",
        }}
      />
      <Box
        sx={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: { xs: "100%", sm: width },
          maxWidth: "100vw",
          bgcolor: "background.paper",
          zIndex: 1300,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
          transform: isVisible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s ease",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            px: 3,
            py: 2.5,
            borderBottom: 1,
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: "1.125rem", fontWeight: 700 }}>{title}</Typography>
            {subtitle && (
              <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <IconButton onClick={handleClose} size="small" aria-label="Close">
            <X size={18} />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflow: "auto", px: 3, py: 2.5 }}>{children}</Box>
      </Box>
    </>
  );
}
