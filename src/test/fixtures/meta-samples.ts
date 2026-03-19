/**
 * Test fixtures for meta-data samples
 * Used across unit and component tests
 */

export const SAMPLE_TITLES = {
  empty: '',
  tooShort: 'Hi',
  optimal: 'The Ultimate Guide to SEO Optimization | My Blog',
  slightlyLong: 'The Ultimate Guide to SEO Optimization for Small Business Websites 2024',
  tooLong:
    'This is an extremely long title that will definitely be truncated by Google in its search engine results pages because it exceeds the maximum recommended character limit',
  withKeyword: 'Best SEO Tips and Tricks for 2024 | Complete Guide',
  boundary30: 'A'.repeat(30),
  boundary60: 'A'.repeat(60),
  boundary61: 'A'.repeat(61),
  boundary70: 'A'.repeat(70),
  boundary71: 'A'.repeat(71),
}

export const SAMPLE_DESCRIPTIONS = {
  empty: '',
  tooShort: 'Too short.',
  nearOptimal: 'A'.repeat(119),
  optimal: 'A'.repeat(155),
  slightlyLong: 'A'.repeat(170),
  tooLong: 'A'.repeat(250),
  withKeyword:
    'Learn the best SEO tips and strategies to optimize your website and improve your search engine rankings in 2024.',
  boundary120: 'A'.repeat(120),
  boundary160: 'A'.repeat(160),
  boundary161: 'A'.repeat(161),
  boundary200: 'A'.repeat(200),
  boundary201: 'A'.repeat(201),
}

export const SAMPLE_URLS = {
  empty: '',
  valid: 'https://example.com/sample-page',
  validHttp: 'http://example.com/page',
  validWithPath: 'https://myblog.com/seo/guide-to-optimization',
  invalid: 'not-a-url',
  invalidNoProtocol: 'example.com/page',
}

export const SAMPLE_KEYWORDS = {
  empty: '',
  present: 'SEO tips',
  notPresent: 'blockchain',
  partial: 'SEO',
}

export const COMPLETE_METADATA_SAMPLES = {
  perfect: {
    title: 'Best SEO Tips for 2024 | Complete Guide',
    description:
      'Discover the most effective SEO tips and strategies to improve your search rankings in 2024. Our comprehensive guide covers everything from keyword research to technical optimization.',
    url: 'https://myblog.com/seo/best-tips-2024',
    keyword: 'SEO tips',
  },
  allEmpty: {
    title: '',
    description: '',
    url: '',
    keyword: '',
  },
  needsWork: {
    title: 'Hi',
    description: 'Short desc',
    url: 'https://example.com',
    keyword: 'blockchain',
  },
  googleDesktopTruncated: {
    title: 'This title is definitely going to be truncated by Google desktop SERP results page',
    description:
      'This description is quite long and will definitely be truncated in the Google search results preview because it exceeds the maximum recommended character limit for meta descriptions.',
    url: 'https://example.com/page',
    keyword: '',
  },
  mobileTruncated: {
    title: 'This title will be truncated on mobile devices search',
    description:
      'This description will be truncated on mobile search results because it exceeds the mobile character limit.',
    url: 'https://example.com',
    keyword: '',
  },
}
