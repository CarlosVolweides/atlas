import { Skeleton } from "@/components/ui/skeleton";

export default function MarkdownSkeleton() {
    return (
        <div className="space-y-6 w-full animate-in fade-in duration-500">
            {/* Title Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-3/4 bg-white/10" />
            </div>

            {/* Paragraph 1 */}
            <div className="space-y-3">
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-4 w-[95%] bg-white/10" />
                <Skeleton className="h-4 w-[98%] bg-white/10" />
                <Skeleton className="h-4 w-[90%] bg-white/10" />
            </div>

            {/* Subtitle / Header */}
            <div className="pt-2">
                <Skeleton className="h-6 w-1/2 bg-white/10" />
            </div>

            {/* List items */}
            <div className="space-y-3 pl-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-2 w-2 rounded-full bg-white/20" />
                    <Skeleton className="h-4 w-[85%] bg-white/10" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-2 w-2 rounded-full bg-white/20" />
                    <Skeleton className="h-4 w-[80%] bg-white/10" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-2 w-2 rounded-full bg-white/20" />
                    <Skeleton className="h-4 w-[88%] bg-white/10" />
                </div>
            </div>

            {/* Paragraph 2 */}
            <div className="space-y-3 pt-2">
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-4 w-[92%] bg-white/10" />
                <Skeleton className="h-4 w-[96%] bg-white/10" />
            </div>

            {/* Code Block Skeleton */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                <Skeleton className="h-4 w-[40%] bg-white/10" />
                <Skeleton className="h-4 w-[60%] bg-white/10" />
                <Skeleton className="h-4 w-[50%] bg-white/10" />
            </div>
        </div>
    );
}
