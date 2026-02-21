import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted">
            <div className="text-center p-8 bg-background rounded-2xl shadow-xl max-w-lg w-full animate-fade-up">
                <h1 className="mb-4 text-7xl font-serif font-bold text-accent">404</h1>
                <h2 className="mb-4 text-2xl font-bold">Oops! Page not found</h2>
                <p className="mb-8 text-muted-foreground">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <form action="/stories" method="get" className="flex items-center gap-2 mb-6">
                    <Input
                        name="search"
                        placeholder="Search stories..."
                        className="h-11 rounded-xl"
                    />
                    <Button type="submit" variant="outline" className="h-11 rounded-xl px-5">
                        Search
                    </Button>
                </form>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/stories">Stories</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/startups">Startups</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/categories">Categories</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/cities">Cities</Link>
                    </Button>
                </div>

                <Button asChild variant="accent" size="lg" className="w-full bg-accent hover:bg-accent/90 text-white">
                    <Link href="/submit">
                        Submit Startup
                    </Link>
                </Button>
            </div>
        </div>
    );
}
