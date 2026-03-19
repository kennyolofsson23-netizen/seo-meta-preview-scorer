# SEO Meta Preview & Scorer

Pixel-perfect SEO preview generator and scoring tool for content creators, bloggers, and SEO professionals. See exactly how your pages appear in Google SERP, Bing, and social media previews — all in real-time with zero API calls.

## Features

### Preview Engines

- **Google SERP Preview**: Pixel-perfect rendering of Google search results
- **Bing Preview**: Bing-specific snippet formatting
- **Social Card Preview**: OG image placeholder + meta tag visualization
- **Mobile Preview**: Responsive truncation warnings

### SEO Scoring

- **Title Length Score**: Green (30-60 chars) / Yellow (60-70) / Red (>70)
- **Meta Description CTR Rating**: Optimal length scoring (155-160 chars for desktop)
- **Keyword Presence Check**: Detect if primary keyword appears in title/description
- **Mobile Truncation Warning**: Alert when content gets cut off on mobile
- **Performance Score**: Character count analysis and optimization tips

### Additional Capabilities

- **Screenshot Export**: Download preview as PNG/JPG
- **Widget Mode**: Embeddable preview widget for SEO/marketing blogs
- **Shareable Links**: Generate shareable preview URLs
- **Real-time Scoring**: Instant feedback as you type
- **No API Required**: 100% client-side computation

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (React 19 with App Router)
- **Language**: [TypeScript 6.0](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: React Server Components + Client Components
- **Testing**: [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)
- **Export**: [html2canvas](https://html2canvas.hertzen.com/) for screenshot generation

## Getting Started

### Prerequisites

- Node.js 22 LTS or higher
- npm 10+

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables (optional)
cp .env.example .env.local
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
seo-meta-preview-scorer/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   ├── globals.css           # Global styles
│   │   └── api/                  # API routes (if needed)
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── previews/             # Preview renderers
│   │   │   ├── GooglePreview.tsx
│   │   │   ├── BingPreview.tsx
│   │   │   └── SocialCardPreview.tsx
│   │   ├── scorers/              # Scoring logic components
│   │   │   ├── TitleScorer.tsx
│   │   │   ├── DescriptionScorer.tsx
│   │   │   └── KeywordChecker.tsx
│   │   ├── forms/                # Form components
│   │   └── layout/               # Layout components
│   ├── lib/                      # Utility functions
│   │   ├── scoring.ts            # Scoring algorithms
│   │   ├── preview.ts            # Preview rendering logic
│   │   ├── validation.ts         # Input validation
│   │   └── utils.ts              # General utilities
│   └── types/                    # TypeScript type definitions
├── public/                       # Static assets
├── __tests__/                    # Tests
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # E2E tests
├── .eslintrc.json                # ESLint config
├── next.config.ts                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
├── vitest.config.ts              # Vitest config
├── playwright.config.ts          # Playwright config
├── package.json
└── README.md
```

## Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checker

# Testing
npm test                 # Run unit/integration tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
npm run e2e              # Run E2E tests
npm run e2e:ui           # Run E2E tests with UI
```

## Environment Variables

See `.env.example` for all available environment variables. Create a `.env.local` file in the project root to override defaults.

```bash
# Copy example to local
cp .env.example .env.local
```

## Security & Performance

- **Strict TypeScript Mode**: All type safety flags enabled
- **Partial Prerendering**: Instant static shell + dynamic content streaming
- **Zero API Calls**: 100% client-side preview rendering
- **Bundle Optimization**: Tree-shaking, dynamic imports, and code splitting
- **Image Optimization**: WebP/AVIF support, lazy loading
- **WCAG 2.2 Compliance**: Built-in accessibility features

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)

## Monetization (Future)

- Ahrefs/Semrush/SurferSEO affiliate partnerships
- Embeddable widget with backlink generation
- Premium features (API access, batch scoring, integrations)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Built with ❤️ for content creators and SEO professionals.
