import React from "react";
import { Box, Typography } from "@mui/material";
import { Check } from "lucide-react";
import type { WorkspaceStep } from "./workspaceSteps";

const ICON_SIZE = 40;
const STEP_GAP = 24;
const STEP_HEIGHT = ICON_SIZE + STEP_GAP;
const LINE_LEFT = ICON_SIZE / 2 - 1;
const BRAND_GREEN = "#2E7D32";

interface WorkspaceVerticalStepperProps {
  steps: WorkspaceStep[];
  activeStep: number;
  onStepClick: (index: number) => void;
}

export function WorkspaceVerticalStepper({
  steps,
  activeStep,
  onStepClick,
}: WorkspaceVerticalStepperProps) {
  const trackHeight = (steps.length - 1) * STEP_HEIGHT;
  const progressHeight = activeStep * STEP_HEIGHT;

  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        borderRight: 1,
        borderColor: "divider",
        bgcolor: "background.default",
        px: 3,
        py: 4,
        overflowY: "auto",
      }}
    >
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* ICON COLUMN */}
        <Box
          sx={{
            position: "relative",
            width: ICON_SIZE,
            flexShrink: 0,
            height: trackHeight + ICON_SIZE,
          }}
        >
          {/* Background line */}
          <Box
            sx={{
              position: "absolute",
              left: LINE_LEFT,
              top: ICON_SIZE / 2,
              height: trackHeight,
              width: 2,
              bgcolor: "#E2E8F0",
              borderRadius: 1,
            }}
          />

          {/* Progress line */}
          <Box
            sx={{
              position: "absolute",
              left: LINE_LEFT,
              top: ICON_SIZE / 2,
              height: progressHeight,
              width: 2,
              bgcolor: BRAND_GREEN,
              borderRadius: 1,
              transition: "height 0.35s ease",
            }}
          />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            const isFilled = isActive || isCompleted;

            return (
              <Box
                key={step.id}
                component="button"
                type="button"
                onClick={() => onStepClick(index)}
                sx={{
                  position: "absolute",
                  left: 0,
                  top: index * STEP_HEIGHT,
                  width: ICON_SIZE,
                  height: ICON_SIZE,
                  p: 0,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  bgcolor: isFilled ? BRAND_GREEN : "#FFFFFF",
                  color: isFilled ? "#FFFFFF" : "#94A3B8",
                  border: isFilled ? "none" : "2px solid #E2E8F0",
                  boxShadow: isActive
                    ? "0 0 0 5px rgba(46, 125, 50, 0.18)"
                    : "none",
                  transition:
                    "box-shadow 0.2s ease, background-color 0.2s ease",
                  zIndex: 1,
                }}
              >
                {isCompleted ? (
                  <Check size={18} strokeWidth={2.5} />
                ) : (
                  <Icon size={18} strokeWidth={2.25} />
                )}
              </Box>
            );
          })}
        </Box>

        {/* LABEL COLUMN */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            height: trackHeight + ICON_SIZE,
            position: "relative",
          }}
        >
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;

            return (
              <Box
                key={step.id}
                component="button"
                type="button"
                onClick={() => onStepClick(index)}
                sx={{
                  position: "absolute",
                  top: index * STEP_HEIGHT,
                  left: 0,
                  height: ICON_SIZE,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1rem",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive
                      ? "#0F172A"
                      : isCompleted
                      ? "#64748B"
                      : "#94A3B8",
                    lineHeight: 1.2,
                  }}
                >
                  {step.label}
                </Typography>

                {isActive && (
                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: BRAND_GREEN,
                      lineHeight: 1.2,
                    }}
                  >
                    Active Step
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}