import { Body, Caption } from "@breadcoop/ui";
// dist/ssr: context-free icons usable in server components
import { HandHeartIcon } from "@phosphor-icons/react/dist/ssr";
import SectionHeader from "./section-header";

const SolidarityFundSection = () => (
  <section className="flex flex-col gap-6">
    <SectionHeader
      I={HandHeartIcon}
      iconColor="text-[#EA5817]"
      title="Solidarity Fund"
      subtitle="Fund post-capitalism together"
    />
    <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-paper-2 bg-paper-0 p-10 text-center">
      <Caption className="font-bold text-[#EA5817]">Coming soon</Caption>
      <Body className="text-surface-grey">
        Your Solidarity Fund activity will appear here.
      </Body>
    </div>
  </section>
);

export default SolidarityFundSection;
