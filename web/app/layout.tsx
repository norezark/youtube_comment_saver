import type { Metadata } from "next";
import ThemeRegistry from "./themeRegistry";

export const metadata: Metadata = {
    title: "Youtube Comment Viewer",
    description: "Youtube viewer with comments.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <meta
                    name="viewport"
                    content="initial-scale=1, width=device-width"
                />
            </head>
            <body>
                <ThemeRegistry>{children}</ThemeRegistry>
            </body>
        </html>
    );
}
