import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedWork } from "@/components/home/FeaturedWork";
import { LatestPosts } from "@/components/home/LatestPosts";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedWork />
      <LatestPosts />
    </>
  );
}