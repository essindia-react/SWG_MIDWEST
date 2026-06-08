import { ThemeProvider } from "@mui/material/styles";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import { X } from "lucide-react";
import { theme } from "../../../theme/theme";
import type { LeadFormInput } from "../../../types/lead";
import { LeadFormStepper } from "./LeadFormStepper";

interface AddLeadDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: LeadFormInput) => void;
}

export function AddLeadDialog({ open, onClose, onSubmit }: AddLeadDialogProps) {
  const handleSubmit = (input: LeadFormInput) => {
    onSubmit(input);
    onClose();
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
        aria-labelledby="add-lead-dialog"
        PaperProps={{
          sx: { borderRadius: 3, overflow: "hidden" },
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label="Close"
          size="small"
          sx={{ position: "absolute", right: 12, top: 12, zIndex: 1, color: "#fff" }}
        >
          <X size={18} />
        </IconButton>
        <DialogContent sx={{ p: 3, pt: 2 }}>
          {open && (
            <LeadFormStepper
              key={String(open)}
              onSubmit={handleSubmit}
              onCancel={onClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
