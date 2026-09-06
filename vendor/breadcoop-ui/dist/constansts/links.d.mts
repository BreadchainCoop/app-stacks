declare const LINKS: {
    readonly bluesky: "https://bsky.app/profile/breadcoop.bsky.social";
    readonly contributorForm: "https://docs.google.com/forms/d/e/1FAIpQLSfOWubPChHH14LpV4GwgXrrot0Smqd1rmypN4MEULdw7n1o4g/viewform";
    readonly dashboard: "https://dune.com/bread_cooperative/solidarity";
    readonly discord: "https://discord.com/invite/zmNqsHRHDa";
    readonly docs: "https://docs.bread.coop";
    readonly docsBreadToken: "https://docs.bread.coop/bread-token/";
    readonly docsManifesto: "https://docs.bread.coop/manifesto";
    readonly docsHowToBecomeAMemberProject: "https://docs.bread.coop/how-to-become-a-member-project";
    readonly docsVotingPower: "https://docs.bread.coop/voting-power";
    readonly farcaster: "https://farcaster.xyz/~/channel/cryptoleft";
    readonly giveth: "https://giveth.io/project/breadchain-cooperative";
    readonly github: "http://github.com/BreadchainCoop";
    readonly linkedin: "https://www.linkedin.com/company/bread-cooperative//";
    readonly newsletter: "http://paragraph.com/@breadcoop";
    readonly openCollective: "https://opencollective.com/bread-cooperative";
    readonly postCapitalistIdea: "https://form.typeform.com/to/opwqWG8j";
    readonly projectApplicationForm: "https://forms.gle/DeTETFxCxZbKRCzS7";
    readonly solidarityFund: "https://fund.bread.coop";
    readonly sourdoughSystems: "https://www.sourdough.systems/";
    readonly stacks: "https://stacks.bread.coop";
    readonly twitter: "https://x.com/breadcoop";
    readonly youtube: "https://www.youtube.com/@BreadCooperative/";
};
type LinkKey = keyof typeof LINKS;

export { LINKS, type LinkKey };
