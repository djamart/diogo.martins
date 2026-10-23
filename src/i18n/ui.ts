/** Each language by its URL prefix, named in that language for the language switcher. */
export const languages = {
  en: 'English',
  pt: 'Português',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'en';

/** The BCP 47 tag of each language, for `lang` and `hreflang`: European Portuguese, not Brazilian. */
export const languageTags: Record<Lang, string> = {
  en: 'en',
  pt: 'pt-PT',
};

const en = {
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
  'nav.blog': 'Blog',
  'nav.contact': 'Contact',
  'theme.label': 'Theme',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.system': 'System',
  'language.label': 'Language',
  'footer.contactTitle': 'Want to talk?',
  'footer.cv': 'CV (PDF)',
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
  'experience.present': 'present',
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
  'quality.gate.mobile.name': 'Phone screens',
  'quality.gate.mobile.description':
    'Runs the end-to-end and accessibility tests again on an emulated Pixel 7 and iPhone 15, with touch, and checks that every page fits 320 pixels wide and its controls are large enough to tap.',
  'quality.gate.lighthouse.name': 'Performance and SEO',
  'quality.gate.lighthouse.description':
    'Audits every page with Lighthouse and fails if performance, accessibility, best practices or SEO scores below 95.',
  'quality.gate.links.name': 'Broken links',
  'quality.gate.links.description':
    'Follows every link on the site, from the pages and anchors to the CV and external sites, and fails on any that does not resolve.',
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
  'quality.results.lighthouse': 'Lighthouse',
  'quality.results.performance': 'performance',
  'quality.results.accessibility': 'accessibility',
  'quality.results.bestPractices': 'best practices',
  'quality.results.seo': 'SEO',
  'quality.results.lowestScore': 'lowest score on any page',
  'quality.results.links': 'Links',
  'quality.results.checked': 'checked',
  'quality.results.broken': 'broken',
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
  'blog.title': 'Blog',
  'blog.intro':
    'Notes on test automation, quality engineering and AI-driven testing, from the work behind this site and beyond.',
  'blog.empty': 'No posts yet. The first one is on its way.',
  'blog.feed': 'Follow with RSS',
  'blog.feedTitle': 'Diogo Martins: blog',
  'blog.readingTime': '{minutes} min read',
  'blog.updated': 'Updated',
  'blog.back': 'All posts',
  'blog.inLang.en': 'in English',
  'blog.inLang.pt': 'in Portuguese',
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
} as const;

export type UiKey = keyof typeof en;

// Typed against the English keys, so a missing or misspelled translation fails `astro check`.
const pt: Record<UiKey, string> = {
  'site.title': 'Diogo Martins | Quality Enablement Engineer',
  'site.description':
    'Diogo Martins, Quality Enablement Engineer: automação de testes, engenharia de qualidade e testes com IA.',
  'nav.label': 'Principal',
  'nav.skip': 'Saltar para o conteúdo',
  'nav.home': 'Início',
  'nav.about': 'Sobre',
  'nav.experience': 'Experiência',
  'nav.projects': 'Projectos',
  'nav.quality': 'Qualidade',
  'nav.blog': 'Blog',
  'nav.contact': 'Contacto',
  'theme.label': 'Tema',
  'theme.light': 'Claro',
  'theme.dark': 'Escuro',
  'theme.system': 'Sistema',
  'language.label': 'Idioma',
  'footer.contactTitle': 'Vamos conversar?',
  'footer.cv': 'CV (PDF, em inglês)',
  'footer.builtWith':
    'Feito com Astro e publicado apenas quando todos os testes passam. Veja o código-fonte no GitHub.',
  'home.greeting': 'Olá, sou o Diogo Martins.',
  'home.intro':
    'Ajudo equipas a entregar software com confiança, construindo os testes, os quality gates e as ferramentas de IA de que dependem.',
  'home.ctaContact': 'Entrar em contacto',
  'home.ctaExperience': 'Ver a minha experiência',
  'home.ctaCv': 'Descarregar CV (PDF, em inglês)',
  'home.proof':
    'Este site é construído como um produto: cada alteração passa por linting, verificação de tipos e testes unitários, end-to-end e de acessibilidade antes de ir para produção.',
  'about.title': 'Sobre',
  'about.p1':
    'Sou Quality Enablement Engineer. Construo automação de testes, ajudo as equipas a tratar a qualidade como uma prática partilhada e uso IA para tornar os testes mais rápidos e inteligentes.',
  'about.p2':
    'Antes do software, trabalhei em controlo de qualidade e logística, onde aprendi que a qualidade é um processo e não uma verificação final. Aprendi testes de software por conta própria, com cursos online, e o meu primeiro trabalho em QA foi testar pipelines de dados genómicos para uma farmacêutica.',
  'about.p3':
    'Desde então, levei equipas dos testes manuais para os testes assistidos por IA, encontrei vulnerabilidades de segurança publicadas como CVE e orientei programadores para detetarem defeitos mais cedo.',
  'about.certifications': 'Certificações',
  'about.languages': 'Línguas',
  'about.languagesList': 'Português (nativo), inglês (proficiência profissional plena)',
  'experience.title': 'Experiência',
  'experience.for': 'para a',
  'experience.earlier': 'Percurso anterior',
  'experience.present': 'presente',
  'projects.title': 'Projectos',
  'projects.intro':
    'A maior parte do meu trabalho está em código privado das empresas onde trabalhei. Isto é o que posso mostrar publicamente, e vai crescer.',
  'projects.site.title': 'Este site',
  'projects.site.description':
    'Um site pessoal construído e testado como um produto: Astro e TypeScript, testes unitários com um mínimo de 80% de cobertura, testes end-to-end e de acessibilidade com Playwright, e publicação no GitHub Pages apenas a partir de um build verde, seguida de um smoke test ao site em produção.',
  'projects.site.source': 'Código-fonte',
  'projects.site.testPlan': 'Plano de testes',
  'quality.title': 'Qualidade',
  'quality.intro':
    'Este site é construído e testado como um produto. Estas são as verificações por que passa cada alteração antes de ir para produção, os resultados do build que está a ver e a forma como agentes de IA ajudam a escrever e a manter os testes.',
  'quality.gates.title': 'Quality gates',
  'quality.gates.pullRequest': 'Em cada pull request',
  'quality.gates.deploy': 'A caminho de produção',
  'quality.gate.static.name': 'Análise estática',
  'quality.gate.static.description':
    'Apanha bugs, erros de tipos e formatação inconsistente antes de qualquer código ser executado.',
  'quality.gate.unit.name': 'Testes unitários',
  'quality.gate.unit.description':
    'Verificam a lógica por trás das páginas e do CV, com pelo menos 80% de cobertura de linhas, ramos, funções e instruções.',
  'quality.gate.e2e.name': 'Testes end-to-end',
  'quality.gate.e2e.description':
    'Usam cada página como um visitante, do menu e dos links ao download do CV e ao teclado, em Chromium, Firefox e WebKit.',
  'quality.gate.a11y.name': 'Acessibilidade',
  'quality.gate.a11y.description':
    'Analisa cada página segundo as WCAG 2.1 AA, nos temas claro e escuro, e falha perante qualquer violação grave ou crítica.',
  'quality.gate.mobile.name': 'Ecrãs de telemóvel',
  'quality.gate.mobile.description':
    'Repete os testes end-to-end e de acessibilidade num Pixel 7 e num iPhone 15 emulados, com toque, e verifica que cada página cabe em 320 píxeis de largura e que os controlos são grandes o suficiente para tocar.',
  'quality.gate.lighthouse.name': 'Desempenho e SEO',
  'quality.gate.lighthouse.description':
    'Audita cada página com o Lighthouse e falha se o desempenho, a acessibilidade, as boas práticas ou o SEO ficarem abaixo de 95.',
  'quality.gate.links.name': 'Links quebrados',
  'quality.gate.links.description':
    'Segue todos os links do site, das páginas e âncoras ao CV e a sites externos, e falha se algum não funcionar.',
  'quality.gate.deploy.name': 'Publicação só a partir de um build verde',
  'quality.gate.deploy.description':
    'Uma alteração só chega ao site em produção depois de todas as verificações acima passarem na main.',
  'quality.gate.smoke.name': 'Smoke test em produção',
  'quality.gate.smoke.description':
    'Corre os testes end-to-end contra o site em produção logo após cada publicação.',
  'quality.results.title': 'Resultados deste build',
  'quality.results.intro':
    'Os números abaixo vêm da execução de CI que construiu e publicou esta página.',
  'quality.results.commit': 'Commit',
  'quality.results.run': 'Ver a execução de CI completa',
  'quality.results.unit': 'Testes unitários',
  'quality.results.coverage': 'Cobertura',
  'quality.results.e2e': 'Testes end-to-end e de acessibilidade',
  'quality.results.passed': 'passaram',
  'quality.results.failed': 'falharam',
  'quality.results.flaky': 'passaram à segunda tentativa',
  'quality.results.lines': 'linhas',
  'quality.results.branches': 'ramos',
  'quality.results.functions': 'funções',
  'quality.results.statements': 'instruções',
  'quality.results.lighthouse': 'Lighthouse',
  'quality.results.performance': 'desempenho',
  'quality.results.accessibility': 'acessibilidade',
  'quality.results.bestPractices': 'boas práticas',
  'quality.results.seo': 'SEO',
  'quality.results.lowestScore': 'pontuação mais baixa entre todas as páginas',
  'quality.results.links': 'Links',
  'quality.results.checked': 'verificados',
  'quality.results.broken': 'quebrados',
  'quality.results.unavailable':
    'Esta cópia do site foi construída sem resultados de testes, por exemplo localmente ou para um pull request. O site em produção mostra os resultados da execução que o publicou.',
  'quality.results.history': 'Todas as execuções de CI no GitHub Actions',
  'quality.ai.title': 'Testes com IA',
  'quality.ai.p1':
    'Os testes deste site são escritos e mantidos com agentes de IA. Os agentes não adivinham: um ficheiro CLAUDE.md no repositório dá-lhes o contexto (os quality gates, as convenções de testes e as regras de conteúdo), e as skills dão-lhes procedimentos passo a passo para o trabalho recorrente.',
  'quality.ai.p2':
    'O resultado são testes que seguem as mesmas convenções, seja quem for que os escreva, e quality gates que nenhum agente pode enfraquecer para conseguir um build verde.',
  'quality.ai.claudeMd': 'Ler o CLAUDE.md',
  'quality.ai.skills': 'Skills no repositório',
  'quality.testPlan': 'Ler o plano de testes',
  'blog.title': 'Blog',
  'blog.intro':
    'Notas sobre automação de testes, engenharia de qualidade e testes com IA, a partir do trabalho por trás deste site e não só.',
  'blog.empty': 'Ainda não há artigos. O primeiro está a caminho.',
  'blog.feed': 'Seguir por RSS',
  'blog.feedTitle': 'Diogo Martins: blog',
  'blog.readingTime': '{minutes} min de leitura',
  'blog.updated': 'Atualizado',
  'blog.back': 'Todos os artigos',
  'blog.inLang.en': 'em inglês',
  'blog.inLang.pt': 'em português',
  'contact.title': 'Contacto',
  'contact.intro':
    'Tenho todo o gosto em falar sobre funções de QA, engenharia de qualidade ou IA nos testes. O email é a forma mais rápida de me contactar.',
  'cv.profile': 'Perfil',
  'cv.summary':
    'Engenheiro de QA que constrói automação de testes, ajuda as equipas a tratar a qualidade como uma prática partilhada e usa IA para tornar os testes mais rápidos e inteligentes. Levou uma equipa dos testes manuais para os testes assistidos por IA, encontrou vulnerabilidades de segurança publicadas como CVE e orienta programadores para detetarem defeitos mais cedo.',
  'cv.earlier': 'Percurso anterior',
  'cv.download': 'Descarregar o meu CV (PDF, em inglês)',
  'notFound.title': 'Página não encontrada',
  'notFound.message': 'Esta página não existe, ou mudou de sítio. Esta escapou aos testes.',
  'notFound.back': 'Voltar à página inicial',
};

export const ui = { en, pt } as const satisfies Record<Lang, Record<UiKey, string>>;
