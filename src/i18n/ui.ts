export const languages = {
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'en';

export const ui = {
  en: {
    'site.title': 'Diogo Martins | QA Engineer',
    'site.description':
      'Personal website of Diogo Martins, QA engineer. Built and tested like a product.',
    'home.greeting': "Hi, I'm Diogo Martins.",
    'home.role': 'QA Engineer',
    'home.intro':
      'I help teams ship software they can trust. This site is under construction, and every change to it goes through the same quality gates I would set up for a real product.',
    'home.links': 'Find me on',
    'notFound.title': 'Page not found',
    'notFound.message': "This page doesn't exist, or it moved. That one escaped the test suite.",
    'notFound.back': 'Back to the home page',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)[typeof defaultLang];
