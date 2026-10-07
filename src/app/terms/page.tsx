import { generateMetadata } from "@/utils/metadata";
import { LINKS } from "@/constants/links";
import {
  LegalList,
  LegalPage,
  LegalSection,
  LegalText,
} from "@/components/legal/legal-page";

export const metadata = generateMetadata({
  title: "Terms of Service - Stacks",
  description: "The terms that apply when you use Stacks.",
  url: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="7 October 2026"
      intro="These terms apply when you use Stacks, a savings app built by the Bread Cooperative. Please read them before you join or create a stack."
    >
      <LegalSection heading="Who we are">
        <LegalText>
          Stacks is built and operated by the Bread Cooperative. It is not
          operated by, affiliated with, or endorsed by MiniPay, Opera, Celo, or
          Gnosis, even when you reach it through one of their products.
        </LegalText>
      </LegalSection>

      <LegalSection heading="What Stacks does">
        <LegalText>
          Stacks is an interface to savings-circle smart contracts deployed on
          public blockchains. Two kinds of stack exist: rotating savings
          circles, where members deposit each round and one member receives the
          pot in turn, and shared goals, where members contribute toward a
          target amount by a deadline.
        </LegalText>
        <LegalText>
          The rules of each stack — deposit amounts, rounds, deadlines, who may
          withdraw and when — are enforced by those contracts, not by us. We
          provide a way to read and interact with them.
        </LegalText>
      </LegalSection>

      <LegalSection heading="We never hold your money">
        <LegalText>
          Stacks is non-custodial. Your funds move directly between your wallet
          and the smart contracts. We cannot access, freeze, move, or recover
          them, and we hold no deposits on your behalf at any point.
        </LegalText>
        <LegalText>
          You are solely responsible for your wallet and its keys or recovery
          method. If you lose access to your wallet, we cannot restore it or
          return funds associated with it.
        </LegalText>
      </LegalSection>

      <LegalSection heading="Transactions are final">
        <LegalText>
          Blockchain transactions cannot be reversed, cancelled, or refunded
          once confirmed — not by us and not by anyone else. Before you confirm
          anything, check the amount, the recipient and the network.
        </LegalText>
        <LegalText>
          Network fees are set by the network, not by us. A transaction can fail
          or take longer than expected for reasons outside our control, and a
          failed transaction may still cost a fee.
        </LegalText>
      </LegalSection>

      <LegalSection heading="Your responsibilities">
        <LegalList
          items={[
            "You must be legally able to enter these terms where you live, and using Stacks must be lawful there.",
            "You are responsible for the accuracy of what you submit — including addresses you invite, amounts you enter and names you give a stack.",
            "You are responsible for any tax arising from your use of Stacks.",
            "Do not use Stacks for unlawful purposes, and do not attempt to disrupt, attack or gain unauthorised access to it.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="Saving together carries risk">
        <LegalText>
          A stack depends on the people in it. Other members may not deposit on
          time, or at all, and we cannot compel them to. Smart contracts can
          contain defects despite review. The tokens you deposit may change in
          value, and a token described as holding a stable value may not do so.
        </LegalText>
        <LegalText>
          Nothing in Stacks is financial, investment, legal or tax advice. Only
          commit what you can afford to lose.
        </LegalText>
      </LegalSection>

      <LegalSection heading="Availability">
        <LegalText>
          We may change, suspend or discontinue any part of the interface at any
          time, including to fix defects or respond to a security issue. The
          underlying contracts exist independently of this interface. Stacks is
          provided &ldquo;as is&rdquo;, without warranties of any kind, and to
          the fullest extent permitted by law we are not liable for losses
          arising from your use of it.
        </LegalText>
      </LegalSection>

      <LegalSection heading="Changes to these terms">
        <LegalText>
          We may update these terms as Stacks changes. The date above shows when
          this version was published, and continuing to use Stacks after a
          change means you accept the updated terms.
        </LegalText>
      </LegalSection>

      <LegalSection heading="Contact">
        <LegalText>
          Questions about these terms, or about a problem with a stack, can go
          to our community at{" "}
          <a
            href={LINKS.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary-blue underline"
          >
            Discord
          </a>
          . Technical documentation lives at{" "}
          <a
            href={LINKS.docs}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary-blue underline"
          >
            docs.bread.coop
          </a>
          .
        </LegalText>
      </LegalSection>
    </LegalPage>
  );
}
