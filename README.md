This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

frontend/
├── components/
│   ├── common/
│   │   ├── Header.js
│   │   ├── Sidebar.js
│   │   └── Layout.js
│   ├── cases/
│   │   ├── CaseForm.js      # Form to add cases
│   │   └── CaseList.js      # List of cases
│   ├── dashboard/
│   │   ├── StatsCard.js     # Summary statistics
│   │   ├── RevenueChart.js  # Revenue charts
│   │   └── CaseTypeChart.js # Case type distribution
│   └── reports/
│       ├── DateFilter.js    # Date range selector
│       └── ReportViewer.js  # Report display
├── pages/
│   ├── index.js             # Dashboard
│   ├── cases/
│   │   ├── index.js         # Case list view
│   │   └── add.js           # Add case form
│   ├── reports/
│   │   └── index.js         # Reports view
│   └── api/
│       └── hello.js         # Example API route (if needed)
├── styles/
│   ├── globals.css          # Global styles
│   ├── components/
│   │   ├── Header.module.css
│   │   └── StatsCard.module.css
│   └── pages/
│       ├── dashboard.module.css
│       └── cases.module.css
├── hooks/
│   ├── useCases.js          # Custom hook for case operations
│   └── useReports.js        # Custom hook for report data
├── utils/
│   ├── api.js               # API call functions
│   └── formatters.js        # Data formatting functions
└── package.json
