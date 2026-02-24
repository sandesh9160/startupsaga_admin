import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { siteConfig } from "@/config/site";

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
});

/**
 * Metadata for the Admin Dashboard
 */
export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.adminUrl),
    title: {
        default: `Dashboard | ${siteConfig.name}`,
        template: `%s | ${siteConfig.name} Admin`,
    },
    description: "Secure administrative interface for StartupSaga content management.",
    robots: {
        index: false,
        follow: false,
    },
};

/**
 * @function RootLayout
 * @description The main structural wrapper for the Admin application.
 * Provides theme providers, accessibility enhancements, and font variables.
 */
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${playfair.variable} font-sans antialiased`} suppressHydrationWarning>
                <Providers>
                    {/* Main content area */}
                    <main className="min-h-screen bg-background">
                        {children}
                    </main>
                </Providers>
            </body>
        </html>
    );
}
