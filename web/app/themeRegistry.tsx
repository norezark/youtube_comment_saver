"use client";
import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { darkTheme } from "./theme";

export default function ThemeRegistry({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppRouterCacheProvider>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <body>{children}</body>
            </ThemeProvider>
        </AppRouterCacheProvider>
    );
}
