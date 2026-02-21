/**
 * @file config/site.ts
 * @description Global site configuration and constants.
 */

export const siteConfig = {
    name: "StartupSaga",
    fullName: "StartupSaga.in",
    description: "The official platform for Indian startup stories and ecosystem directory.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    adminUrl: "http://localhost:3001",
    links: {
        github: "https://github.com/startupsaga",
        twitter: "https://twitter.com/startupsaga",
    },
    ogImage: "/og-image.jpg",
};

export type SiteConfig = typeof siteConfig;
