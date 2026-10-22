export const languages = {
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'en';

export const ui = {
  en: {
    'site.title': 'Diogo Martins | Quality Enablement Engineer',
    'site.description':
      'Diogo Martins, Quality Enablement Engineer: test automation, quality engineering and AI-driven testing.',
    'nav.label': 'Main',
    'nav.skip': 'Skip to content',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.experience': 'Experience',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact',
    'footer.builtWith':
      'Built with Astro and shipped only when every test passes. See the source on GitHub.',
    'home.greeting': "Hi, I'm Diogo Martins.",
    'home.intro':
      'I help teams ship with confidence by building the tests, quality gates and AI tooling they rely on.',
    'home.ctaContact': 'Get in touch',
    'home.ctaExperience': 'See my experience',
    'home.ctaCv': 'Download CV (PDF)',
    'home.proof':
      'This site is built like a product: every change passes linting, type checks, unit, end-to-end and accessibility tests before it goes live.',
    'about.title': 'About',
    'about.p1':
      "I'm a Quality Enablement Engineer. I build test automation, help teams treat quality as a shared practice, and use AI to make testing faster and smarter.",
    'about.p2':
      'Before software, I worked in quality control and logistics, which is where I learned that quality is a process, not a final check. I taught myself software testing through online courses, and my first QA role was testing genomic data pipelines for a pharmaceutical company.',
    'about.p3':
      "Since then I've moved teams from manual to AI-assisted testing, found security vulnerabilities published as CVEs, and coached developers to catch defects earlier.",
    'about.certifications': 'Certifications',
    'about.languages': 'Languages',
    'about.languagesList': 'Portuguese (native), English (full professional)',
    'experience.title': 'Experience',
    'experience.for': 'for',
    'experience.earlier': 'Earlier',
    'projects.title': 'Projects',
    'projects.intro':
      "Most of my work lives in private company codebases. This is what I can show in public, and it's growing.",
    'projects.site.title': 'This website',
    'projects.site.description':
      'A personal site built and tested like a product: Astro and TypeScript, unit tests with an 80% coverage gate, Playwright end-to-end and accessibility tests, and deploys to GitHub Pages only from a green build, followed by a smoke test on the live site.',
    'projects.site.source': 'Source code',
    'projects.site.testPlan': 'Test plan',
    'contact.title': 'Contact',
    'contact.intro':
      "I'm happy to talk about QA roles, quality engineering or AI in testing. Email is the fastest way to reach me.",
    'cv.profile': 'Profile',
    'cv.summary':
      'QA engineer who builds test automation, helps teams treat quality as a shared practice, and uses AI to make testing faster and smarter. Moved a team from manual to AI-assisted testing, found security vulnerabilities published as CVEs, and coaches developers to catch defects earlier.',
    'cv.earlier': 'Earlier career',
    'cv.download': 'Download my CV (PDF)',
    'notFound.title': 'Page not found',
    'notFound.message': "This page doesn't exist, or it moved. That one escaped the test suite.",
    'notFound.back': 'Back to the home page',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)[typeof defaultLang];
