export const LINKS = {
  contributorForm:
    "https://docs.google.com/forms/d/e/1FAIpQLSdiHclxYr3niJ7LW7hfR16K1dD0SSmpgCgzV3NzLMh1MJJygw/viewform",
  dashboard: "https://dune.com/bread_cooperative/solidarity",
  discord: "https://discord.com/invite/zmNqsHRHDa",
  docs: "https://docs.bread.coop",
  docsBreadToken: "https://docs.bread.coop/bread-token/",
  docsManifesto: "https://docs.bread.coop/manifesto",
  docsHowToBecomeAMemberProject:
    "https://docs.bread.coop/how-to-become-a-member-project",
  docsVotingPower: "https://docs.bread.coop/voting-power",
  farcaster: "https://farcaster.xyz/~/channel/cryptoleft",
  giveth: "https://giveth.io/project/breadchain-cooperative",
  github: "http://github.com/BreadchainCoop",
  linkedin: "https://www.linkedin.com/company/breadchain-cooperative/",
  newsletter: "http://paragraph.com/@breadcoop",
  openCollective: "https://opencollective.com/breadchain-cooperative",
  postCapitalistIdea: "https://form.typeform.com/to/opwqWG8j",
  // Required by MiniPay's listing rules, which want all three reachable from
  // inside the Mini App. Terms and Privacy are app routes rather than external
  // URLs so they stay in-app inside MiniPay's browser. Support has no page —
  // it needs a real contact channel; <LegalLinks/> hides it while it is empty.
  privacyPolicy: "/privacy",
  support: "",
  termsOfService: "/terms",
  projectApplicationForm: "https://forms.gle/DeTETFxCxZbKRCzS7",
  solidarityFund: "https://app.breadchain.xyz",
  sourdoughSystems: "https://www.sourdough.systems/",
  twitter: "https://x.com/breadcoop",
  youtube: "https://www.youtube.com/@BreadchainCooperative/",
} as const;

export type LinkKey = keyof typeof LINKS;
