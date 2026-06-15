import { getGalleries } from "@/lib/galleries";
import { Hero } from "@/components/home/Hero";
import { PortfolioGrid } from "@/components/home/PortfolioGrid";
import { LocationSection } from "@/components/home/LocationSection";

export const revalidate = 60;

export default async function HomePage() {
  const galleries = await getGalleries();
  return (
    <>
      <Hero />
      <PortfolioGrid galleries={galleries} />
      <LocationSection />
    </>
  );
}
