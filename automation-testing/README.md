# TryTestMe Functional Testing Practice Websites

Ten independent, deterministic Vite applications for manual testing and Selenium practice. Each app has its own entry point, branding, routes, validation, local persistence, test selectors, smoke test, and README.

| App | Folder | Target URL | Critical workflow |
|---|---|---|---|
| ShopTest | `shoptest` | https://shop.trytestme.online | Search, filter, cart, coupon, guest checkout |
| CarePoint | `carepoint` | https://care.trytestme.online | Doctor search, appointment booking, cancellation |
| FinFlow | `finflow` | https://money.trytestme.online | Transaction filtering, transfer, beneficiary, bill payment |
| TripNest | `tripnest` | https://travel.trytestme.online | Stay search, date validation, booking |
| SkillSpring | `skillspring` | https://learn.trytestme.online | Course search, enrolment, lesson progress, quiz |
| BiteDash | `bitedash` | https://food.trytestme.online | Restaurant search, menu/cart, coupon, delivery order |
| HomeScout | `homescout` | https://homes.trytestme.online | Property filters, favourites, enquiry/viewing |
| HirePath | `hirepath` | https://jobs.trytestme.online | Job search, bookmarks, resume validation, application |
| ConnectPlus | `connectplus` | https://connect.trytestme.online | Plan comparison, serviceability, connection request |
| CoverWise | `coverwise` | https://cover.trytestme.online | Quote calculator, plan comparison, claim simulation |

## Run locally

From this directory run `npm install`, then run `npm run dev -- --host 0.0.0.0` from any app folder. Example: `cd shoptest; npm run dev`.

Every app uses localStorage for isolated demo data. The reset button only clears that app's namespace. No real payments, medical records, financial transfers, applications, telecom changes, bookings, or insurance claims are processed.

Test-only mock login is available in every app. Demo credentials: `demo` / `test123`. Browsing and principal workflows do not require login.

## Firebase and deployment

The existing Firebase project is `automation-testing-48321` with web app `TryTestMe Platform`. Its Firestore rules remain restrictive and were not changed. These sites intentionally do not write Firebase because public unauthenticated CRUD would conflict with the existing least-privilege rules. If server persistence is added later, use Firebase Authentication and per-app owner-scoped collections; never store passwords in Firestore.

Each folder contains a `vercel.json` rewrite for direct navigation and a deployment README. Custom-domain DNS/verification is provider-owned and must be completed in the hosting account before the requested hostnames can be considered live.
