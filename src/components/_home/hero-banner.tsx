import LocalButton from "@/components/button";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

const HeroBanner = () => {
  return (
    <section
      className="relative mb-12 overflow-hidden bg-cover bg-center md:min-h-95"
      style={{ backgroundImage: "url('/hands.jpg')" }}
    >
      {/* Branded blue wash over the photo (see Figma 4055:26607) */}
      <div className="absolute inset-0 bg-primary-blue opacity-60 mix-blend-color" />
      <div className="absolute inset-0 bg-primary-blue/30" />

      <div className="relative flex max-w-4xl flex-col gap-6 px-8 py-14 md:px-14 md:py-16">
        <h1 className="font-breadDisplay text-5xl font-black uppercase leading-[0.95] tracking-tight text-paper-2 md:text-7xl lg:text-[5.5rem]">
          Save money
          <br />
          together faster
        </h1>
        <p className="text-xl font-bold text-paper-2 md:text-2xl">
          Invite friends deposit, get payed out.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <LocalButton
            as={Link}
            href="/new"
            className="font-bold sm:w-auto"
            leftIcon={<PlusIcon />}
          >
            Create new Stack
          </LocalButton>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
