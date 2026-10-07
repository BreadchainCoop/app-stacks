import { generateMetadata } from "@/utils/metadata";
import { LINKS } from "@/constants/links";
import {
  LegalList,
  LegalPage,
  LegalSection,
  LegalText,
} from "@/components/legal/legal-page";

export const metadata = generateMetadata({
  title: "Privacy Policy - Stacks",
  description: "What Stacks stores, what it doesn't, and who it talks to.",
  url: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="7 October 2026"
      intro="Stacks is built by the Bread Cooperative. This page describes what the app stores, what it deliberately does not, and which third parties it contacts."
    >
      <LegalSection heading="We do not ask who you are">
        <LegalText>
          There is no account to create. You are identified by the wallet you
          connect with — no name, email address, phone number or document is
          requested or required. Inside MiniPay your wallet connects
          automatically and you are identified by its address alone.
        </LegalText>
      </LegalSection>

      <LegalSection heading="What we store off-chain">
        <LegalText>
          Some information cannot live on a blockchain cheaply or legibly, so we
          keep it in our own database. That is limited to:
        </LegalText>
        <LegalList
          items={[
            "Your wallet address, and an identifier for the sign-in method you used.",
            "A username, if you choose to set one, so other members see a name instead of an address.",
            "The name of a stack and how many members it expects — chosen by whoever created it.",
            "Which stacks you belong to, and whether you asked for claims to be made automatically.",
            "Requests to join a stack, with the requesting wallet address and whether the organiser accepted or dismissed it.",
          ]}
        />
        <LegalText>
          We do not store private keys, recovery phrases, balances, or your
          transaction history — those are either in your wallet or on the public
          blockchain.
        </LegalText>
      </LegalSection>

      <LegalSection heading="What is public and permanent">
        <LegalText>
          Deposits, withdrawals, claims, stack membership and the amounts
          involved are recorded on a public blockchain. Anyone can read them,
          they are linked to your wallet address, and neither we nor you can
          delete or alter them. Please keep that in mind before you deposit:
          choosing to use a blockchain means accepting that this record is
          permanent and public.
        </LegalText>
        <LegalText>
          A stack name you choose is visible to the other members of that stack,
          and a username you set is visible to people who share a stack with
          you.
        </LegalText>
      </LegalSection>

      <LegalSection heading="No tracking or advertising">
        <LegalText>
          Stacks contains no analytics, advertising or session-recording
          software. We do not build profiles of you, and we do not sell or share
          your information for marketing. The app stores small amounts of data
          in your browser only to remember your own preferences, such as which
          tab you last opened.
        </LegalText>
      </LegalSection>

      <LegalSection heading="Who else is involved">
        <LegalText>
          Using Stacks necessarily contacts other services, each of which sees
          your network request and may log your IP address under its own policy:
        </LegalText>
        <LegalList
          items={[
            "Blockchain nodes, to read data and submit your transactions.",
            "Our database and hosting providers, which store what is listed above and serve the app.",
            "A wallet provider, when you sign in through a normal browser rather than MiniPay, which manages the wallet created for you.",
            "A link-shortening service, when you create an invite link to share.",
            "Block explorers and MiniPay's own top-up flow, when you follow one of those links.",
          ]}
        />
        <LegalText>
          We choose these services for function, not for data collection, and we
          send them no more than the request requires.
        </LegalText>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <LegalText>
          Off-chain records are kept while the stack they belong to is in use,
          so that members continue to see names rather than bare addresses. You
          can ask us to remove a username or a stack name you created. On-chain
          records cannot be removed by anyone.
        </LegalText>
      </LegalSection>

      <LegalSection heading="Your choices">
        <LegalList
          items={[
            "You can use Stacks without setting a username.",
            "You can ask us to correct or delete the off-chain information listed above.",
            "You can stop using the app at any time; the contracts remain accessible independently of it.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="Children">
        <LegalText>
          Stacks is not intended for people under the age at which they can
          lawfully agree to our terms where they live, and we do not knowingly
          collect information from them.
        </LegalText>
      </LegalSection>

      <LegalSection heading="Changes and contact">
        <LegalText>
          We will update this page as the app changes; the date above shows when
          this version was published. For a privacy question or a deletion
          request, reach us at{" "}
          <a
            href={LINKS.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary-blue underline"
          >
            Discord
          </a>
          .
        </LegalText>
      </LegalSection>
    </LegalPage>
  );
}
