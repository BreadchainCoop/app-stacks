import HeroBanner from "./hero-banner";
import HomeAllStacks from "./all-stacks";
import HomeGoals from "@/components/stack-lists/home-goals";

export const HomeContent = () => {
  return (
    <div>
      <HeroBanner />
      <HomeAllStacks />
      <HomeGoals />
    </div>
  );
};
