import { VideoLearningClient } from "@/components/learning/VideoLearningClient";

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Learn with Video Lessons
        </h1>
        <p className="text-sm text-muted-foreground">
          Discover educational YouTube videos and watch them in a clean,
          distraction-free player.
        </p>
      </div>

      <VideoLearningClient />
    </div>
  );
}
