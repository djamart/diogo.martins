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
    'nav.quality': 'Quality',
    'nav.contact': 'Contact',
    'theme.label': 'Theme',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
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
    'quality.title': 'Quality',
    'quality.intro':
      'This site is built and tested like a product. These are the checks every change passes before it goes live, the results from the build you are looking at, and how AI agents help write and maintain the tests.',
    'quality.gates.title': 'Quality gates',
    'quality.gates.pullRequest': 'On every pull request',
    'quality.gates.deploy': 'On the way to production',
    'quality.gate.static.name': 'Static analysis',
    'quality.gate.static.description':
      'Catches bugs, type errors and inconsistent formatting before any code runs.',
    'quality.gate.unit.name': 'Unit tests',
    'quality.gate.unit.description':
      'Check the logic behind the pages and the CV, with at least 80% of lines, branches, functions and statements covered.',
    'quality.gate.e2e.name': 'End-to-end tests',
    'quality.gate.e2e.description':
      'Use every page the way a visitor would, from the menu and links to the CV download and the keyboard, in Chromium, Firefox and WebKit.',
    'quality.gate.a11y.name': 'Accessibility',
    'quality.gate.a11y.description':
      'Scans every page against WCAG 2.1 AA in light and dark themes, and fails on any serious or critical violation.',
    'quality.gate.deploy.name': 'Deploy from a green build only',
    'quality.gate.deploy.description':
      'A change reaches the live site only after every check above has passed on main.',
    'quality.gate.smoke.name': 'Live smoke test',
    'quality.gate.smoke.description':
      'Runs the end-to-end suite against the live site straight after each deploy.',
    'quality.results.title': 'Results from this build',
    'quality.results.intro':
      'The numbers below come from the CI run that built and deployed this page.',
    'quality.results.commit': 'Commit',
    'quality.results.run': 'See the full CI run',
    'quality.results.unit': 'Unit tests',
    'quality.results.coverage': 'Coverage',
    'quality.results.e2e': 'End-to-end and accessibility tests',
    'quality.results.passed': 'passed',
    'quality.results.failed': 'failed',
    'quality.results.flaky': 'passed on retry',
    'quality.results.lines': 'lines',
    'quality.results.branches': 'branches',
    'quality.results.functions': 'functions',
    'quality.results.statements': 'statements',
    'quality.results.unavailable':
      'This copy of the site was built without test results, for example locally or for a pull request. The live site shows the results of the run that deployed it.',
    'quality.results.history': 'Every CI run on GitHub Actions',
    'quality.ai.title': 'AI-driven testing',
    'quality.ai.p1':
      'The tests on this site are written and maintained with AI agents. The agents do not guess: a CLAUDE.md file in the repository gives them the context (the quality gates, the testing conventions and the content rules), and skills give them step-by-step procedures for recurring work.',
    'quality.ai.p2':
      'The result is tests that follow the same conventions whoever writes them, and quality gates no agent is allowed to weaken to get a green build.',
    'quality.ai.claudeMd': 'Read CLAUDE.md',
    'quality.ai.skills': 'Skills in the repository',
    'quality.testPlan': 'Read the test plan',
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
