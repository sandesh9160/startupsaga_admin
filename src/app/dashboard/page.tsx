import { getStoriesCount, getStartupsCount, getSubmissionsCount, getCitiesCount } from "@/lib/api";
import { DashboardClientContent } from "@/components/dashboard/DashboardClientContent";

export default async function DashboardPage() {
    let initialCounts = { stories: 0, startups: 0, submissions: 0, hubs: 0 };

    try {
        const [storiesCount, startupsCount, submissionsCount, citiesCount] = await Promise.all([
            getStoriesCount(),
            getStartupsCount(),
            getSubmissionsCount("pending"),
            getCitiesCount()
        ]);
        initialCounts = {
            stories: storiesCount,
            startups: startupsCount,
            submissions: submissionsCount,
            hubs: citiesCount
        };
    } catch (error) {
        console.error("Failed to fetch dashboard data on server", error);
    }

    return (
        <DashboardClientContent initialCounts={initialCounts} />
    );
}
