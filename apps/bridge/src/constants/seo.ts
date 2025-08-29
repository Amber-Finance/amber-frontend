import { APP_DOMAIN, APP_PROTOCOL } from "./api";

export const metadata = {
  name: "Amber Finance - Bridge",
  shortName: "Amber",
  description: "Bridge your liquid staking tokens and earn maximum yield. Deposit supported assets to earn real yield.",
  domain: APP_DOMAIN,
  email: "support@skip.build",
  images: [{ url: `${APP_PROTOCOL}://${APP_DOMAIN}/favicon-96x96.png` }],
  url: `${APP_PROTOCOL}://${APP_DOMAIN}`,
  github: {
    username: "skip-mev",
    url: "https://github.com/skip-mev/skip-go-app",
  },
  twitter: {
    username: "@SkipProtocol",
    url: "https://twitter.com/SkipProtocol",
  },
  themeColor: "##ff86ff",
};
