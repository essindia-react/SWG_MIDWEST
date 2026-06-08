import { Box, Typography } from "@mui/material";

interface WorkspaceSectionProps {
  title: string;
  children: React.ReactNode;
}

export function WorkspaceSection({ title, children }: WorkspaceSectionProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Box sx={{ width: 4, height: 20, borderRadius: 1, bgcolor: "primary.main" }} />
        <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>{title}</Typography>
      </Box>
      {children}
    </Box>
  );
}
