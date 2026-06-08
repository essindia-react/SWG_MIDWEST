import React from "react";
import { BrowserRouter } from "react-router";
import { AppProviders } from "./providers/AppProviders";
import { AppRoutes } from "../routes/index";

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
}
