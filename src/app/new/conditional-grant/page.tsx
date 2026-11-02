import { generateMetadata } from "@/utils/metadata";
import { ConditionalGrantsGate } from "@/components/conditional-grants-gate";
import ConditionalGrantFormContainer from "./_components/form-container";

export const metadata = generateMetadata({
  title: "New Conditional Grant - Bread Cooperative",
  description:
    "Advance money with no interest and reward paying it back with an escrowed grant.",
  url: "/new/conditional-grant",
});

export default function Page() {
  return (
    <ConditionalGrantsGate>
      <ConditionalGrantFormContainer />
    </ConditionalGrantsGate>
  );
}
