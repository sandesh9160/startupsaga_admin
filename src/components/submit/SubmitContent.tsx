"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, Sparkles, User, FileText, Rocket, ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { submitStartup, getCities, getCategories } from "@/lib/api";

// --- Form Schemas for Steps ---

const startupSchema = z.object({
    startupName: z.string().min(2, "Startup name must be at least 2 characters."),
    tagline: z.string().min(10, "Tagline must be at least 10 characters.").max(150, "Tagline cannot exceed 150 characters."),
    email: z.string().email("Please enter a valid email."),
    website: z.string().url("Please enter a valid URL.").optional().or(z.literal("")),
    city: z.string().min(1, "Please select a city."),
    foundedYear: z.string().regex(/^\d{4}$/, "Please enter a valid year (e.g. 2023).").optional().or(z.literal("")),
    category: z.string().min(1, "Please select a category."),
    fundingStage: z.string().min(1, "Please select a funding stage."),
    logoUrl: z.string().url("Please enter a valid image URL.").optional().or(z.literal("")),
});

const founderSchema = z.object({
    founderName: z.string().min(2, "Founder name is required."),
    founderRole: z.string().min(2, "Founder role is required."),
    linkedinUrl: z.string().url("Please enter a valid LinkedIn URL.").optional().or(z.literal("")),
    founderBio: z.string().min(50, "Please provide a short bio (min 50 chars).").optional().or(z.literal("")),
});

const storySchema = z.object({
    storyTitle: z.string().min(5, "Story title must be at least 5 characters."),
    storyContent: z.string().min(200, "Please tell us your story in detail (min 200 chars)."),
    coverImageUrl: z.string().url("Please enter a valid image URL.").optional().or(z.literal("")),
});

// Merged schema for final submission
const combinedSchema = startupSchema.merge(founderSchema).merge(storySchema);

type FormValues = z.infer<typeof combinedSchema>;

const STEPS = [
    { id: 1, title: "Startup Details", icon: Rocket, description: "Tell us about your company" },
    { id: 2, title: "Founder Details", icon: User, description: "Who is behind the vision?" },
    { id: 3, title: "Your Story", icon: FileText, description: "Share your journey" },
];

export function SubmitContent() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [cities, setCities] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    // Fetch cities and categories on mount
    useEffect(() => {
        async function loadOptions() {
            try {
                const [citiesData, categoriesData] = await Promise.all([
                    getCities(),
                    getCategories()
                ]);
                setCities(citiesData);
                setCategories(categoriesData);
            } catch (error) {
                console.error("Failed to load cities and categories", error);
            }
        }
        loadOptions();
    }, []);

    // We keep a single form instance but validate per step manually if needed
    // or just use a single large form. for multi-step wiz, single large form state is easier.
    const form = useForm<FormValues>({
        resolver: zodResolver(combinedSchema),
        mode: "onChange", // Validate on change to allow enabling 'Next' button
        defaultValues: {
            startupName: "",
            tagline: "",
            email: "",
            website: "",
            city: "",
            foundedYear: new Date().getFullYear().toString(),
            category: "",
            fundingStage: "",
            logoUrl: "",
            founderName: "",
            founderRole: "Founder & CEO",
            linkedinUrl: "",
            founderBio: "",
            storyTitle: "",
            storyContent: "",
            coverImageUrl: "",
        },
    });

    const { trigger, handleSubmit, formState } = form;

    // Function to validate current step before moving next
    const createStepValidator = async (fields: (keyof FormValues)[]) => {
        const result = await trigger(fields);
        if (result) setCurrentStep((prev) => prev + 1);
    };

    const handleNext = async () => {
        if (currentStep === 1) {
            await createStepValidator(["startupName", "tagline", "email", "website", "city", "foundedYear", "category", "fundingStage"]);
        } else if (currentStep === 2) {
            await createStepValidator(["founderName", "founderRole", "linkedinUrl", "founderBio"]);
        }
    };

    const handlePrev = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            await submitStartup({
                startupName: values.startupName,
                founderName: values.founderName,
                email: values.email,
                website: values.website || "",
                description: values.tagline,
                fullStory: values.storyContent,
                city: values.city,
                category: values.category,
                fundingStage: values.fundingStage,
            });
            setIsSuccess(true);
            toast.success("Startup submitted successfully!");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error: any) {
            console.error("Submission error:", error);
            toast.error(error.message || "Failed to submit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="container max-w-2xl py-20 text-center animate-fade-in">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-4xl font-bold mb-4 font-serif text-foreground">Story Submitted!</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                    Thank you for sharing your journey with StartupSaga. Your story has been successfully received and is now pending admin approval.
                </p>
                <div className="flex justify-center gap-4">
                    <Button onClick={() => window.location.href = '/'} variant="outline" size="lg">
                        Return to Home
                    </Button>
                    <Button onClick={() => window.location.href = '/stories'} variant="accent" size="lg">
                        Read Other Stories
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container-wide py-12 md:py-20">
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-accent/10 mb-6">
                    <Sparkles className="h-6 w-6 text-accent" />
                </div>
                <h1 className="text-4xl font-bold mb-4 font-serif text-foreground">Submit Your Startup Story</h1>
                <p className="text-lg text-muted-foreground">
                    Join hundreds of Indian founders sharing their journey.
                </p>
            </div>

            <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-12">

                {/* Sidebar / Timeline (Desktop) */}
                <div className="hidden lg:block w-72 shrink-0">
                    <div className="sticky top-24">
                        <div className="relative pl-8 border-l border-border space-y-12">
                            {STEPS.map((step) => {
                                const Icon = step.icon;
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;

                                return (
                                    <div key={step.id} className="relative">
                                        {/* Dot on the line */}
                                        <div className={cn(
                                            "absolute -left-[37px] top-0 w-4 h-4 rounded-full border-2 transition-colors duration-300 bg-background",
                                            isActive ? "border-accent bg-accent text-white" :
                                                isCompleted ? "border-accent bg-accent" : "border-muted-foreground/30"
                                        )}>
                                            {isCompleted && <CheckCircle className="h-full w-full text-white p-0.5" />}
                                        </div>

                                        <div className={cn("transition-opacity duration-300", isActive ? "opacity-100" : "opacity-60")}>
                                            <h3 className={cn("font-bold text-lg mb-1 flex items-center gap-2", isActive ? "text-accent" : "text-foreground")}>
                                                {step.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">{step.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Mobile Steps Indicator */}
                <div className="lg:hidden w-full mb-6">
                    <div className="flex justify-between items-center relative">
                        {/* Progress Bar Background */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10" />
                        {/* Active Progress */}
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-accent -z-10 transition-all duration-300"
                            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                        />

                        {STEPS.map((step) => {
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;
                            return (
                                <div key={step.id} className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background transition-colors",
                                    isActive ? "border-accent text-accent" :
                                        isCompleted ? "border-accent bg-accent text-white" : "border-muted text-muted-foreground"
                                )}>
                                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : <span className="font-bold">{step.id}</span>}
                                </div>
                            )
                        })}
                    </div>
                    <div className="text-center mt-4">
                        <h3 className="font-bold text-lg text-foreground">{STEPS[currentStep - 1].title}</h3>
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1">
                    <Form {...form}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fade-in bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm">

                            {/* Step 1: Startup Details */}
                            {currentStep === 1 && (
                                <div className="space-y-6 animate-enter-right">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-1">Company Information</h2>
                                        <p className="text-muted-foreground text-sm">Tell us about what you're building.</p>
                                    </div>

                                    <div className="grid gap-6">
                                        <FormField
                                            control={form.control}
                                            name="startupName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Startup Name *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Zepto" {...field} />
                                                    </FormControl>
                                                    <FormDescription>Startup name must be at least 2 characters.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="tagline"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tagline *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="One line describing what you do" {...field} />
                                                    </FormControl>
                                                    <FormDescription>10-150 characters. Make it catchy.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email *</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="founder@yourstartup.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="website"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Website</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="https://yourstartup.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="logoUrl"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Logo URL</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="https://... (Optional)" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="foundedYear"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Founded Year *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="2023" {...field} maxLength={4} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="city"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>City *</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {cities.map((city: any) => (
                                                                    <SelectItem key={city.slug} value={city.name}>{city.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="category"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Category *</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {categories.map((cat: any) => (
                                                                    <SelectItem key={cat.slug} value={cat.name}>{cat.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="fundingStage"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Funding Stage *</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Bootstrapped">Bootstrapped</SelectItem>
                                                                <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                                                                <SelectItem value="Seed">Seed</SelectItem>
                                                                <SelectItem value="Series A">Series A</SelectItem>
                                                                <SelectItem value="Series B+">Series B+</SelectItem>
                                                                <SelectItem value="IPO">IPO</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Founder Details */}
                            {currentStep === 2 && (
                                <div className="space-y-6 animate-enter-right">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-1">Founder Information</h2>
                                        <p className="text-muted-foreground text-sm">Who is the driving force behind the vision?</p>
                                    </div>
                                    <div className="grid gap-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="founderName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Full Name *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="John Doe" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="founderRole"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Role *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Founder & CEO" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="linkedinUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>LinkedIn Profile</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="https://linkedin.com/in/..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="founderBio"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Short Bio</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Brief introduction about the founder..." className="min-h-[120px]" {...field} />
                                                    </FormControl>
                                                    <FormDescription>Tell us a bit about your background (min 50 chars).</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Story */}
                            {currentStep === 3 && (
                                <div className="space-y-6 animate-enter-right">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-1">The Journey</h2>
                                        <p className="text-muted-foreground text-sm">Share the challenges, milestones, and success.</p>
                                    </div>
                                    <div className="grid gap-6">
                                        <FormField
                                            control={form.control}
                                            name="storyTitle"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Story Title *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. How we scaled to 1M users in 6 months" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="storyContent"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Story Content *</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Write your story here..."
                                                            className="min-h-[300px] font-serif text-lg leading-relaxed"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Min 200 characters. Use this space to inspire others.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="coverImageUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cover Image URL (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="https://..." {...field} />
                                                    </FormControl>
                                                    <FormDescription>A high-quality image to engage readers.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between pt-6 border-t border-border mt-8">
                                {currentStep > 1 ? (
                                    <Button type="button" variant="outline" size="lg" onClick={handlePrev} className="gap-2">
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                ) : (
                                    <div /> /* Spacer */
                                )}

                                {currentStep < 3 ? (
                                    <Button type="button" variant="accent" size="lg" onClick={handleNext} className="gap-2">
                                        Next Step
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button type="submit" size="lg" variant="accent" disabled={isSubmitting} className="min-w-[150px] gap-2">
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Publishing...
                                            </>
                                        ) : (
                                            <>
                                                Submit Story
                                                <Rocket className="h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>

                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}
