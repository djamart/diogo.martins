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
  'nav.menu': 'Menu',
  'nav.open': 'Open menu',
  'nav.close': 'Close menu',
  'nav.home': 'Home',
  'nav.about': 'About',
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
    'Built with Astro and published only when every test passes. See the source on GitHub.',
  'home.greeting': "Hi, I'm Diogo Martins.",
  'home.headline': "I break things on purpose so your users don't by accident.",
  'home.intro':
    'I started out in quality control and logistics, then taught myself to test software. Now I help teams catch bugs early, automate the tests worth automating, and hand the repetitive parts of testing to AI.',
  'home.ctaContact': 'Get in touch',
  'home.ctaExperience': 'See my experience',
  'home.ctaCv': 'Download CV (PDF)',
  'home.pillarsTitle': 'What I work on',
  'home.projectTitle': 'Featured project',
  'home.project.title': 'This website',
  'home.project.description':
    'Built and tested like a product. Every change goes through lint, type checks, unit tests, Playwright tests in three browsers and two phones, accessibility and Lighthouse checks before it goes live, and a smoke test runs on the live site after each deploy.',
  'home.project.quality': "How it's tested",
  'home.project.source': 'Source code',
  'home.project.testPlan': 'Test plan',
  'about.title': 'About',
  'about.p1':
    'I work in QA, but finding bugs is only part of it. I write test automation, show developers how to test their own changes, and use AI for the repetitive parts of testing, so problems get caught earlier and by more people than just me.',
  'about.p2':
    "Before software, I worked in quality control and logistics. That's where I learned that a problem is cheaper to fix early than at the final check. I taught myself software testing through online courses, and my first QA job was testing genomic data pipelines for a pharmaceutical company.",
  'about.p3':
    "Since then I've helped teams move from manual to AI-assisted testing, found security bugs that were published as CVEs, and spent a lot of time with developers on catching problems before they reach QA.",
  'about.certifications': 'Certifications',
  'about.languages': 'Languages',
  'about.languagesList': 'Portuguese (native), English (full professional)',
  'experience.title': 'Experience',
  'experience.for': 'for',
  'experience.present': 'present',
  'quality.title': 'Quality',
  'quality.intro':
    'This site is built and tested like a product. These are the checks every change passes before it goes live, the results from the build you are looking at, and how AI agents help write and maintain the tests.',
  'quality.gates.title': 'The pipeline',
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
  'quality.gate.visual.name': 'Visual changes',
  'quality.gate.visual.description':
    'Takes a screenshot of every page in light and dark themes, on a desktop and on a phone, and fails if it differs from the approved one. A change in the look comes with new screenshots, reviewed in the pull request.',
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
  'quality.results.title': 'Latest build',
  'quality.results.intro':
    'The numbers below come from the CI run that built and deployed this page.',
  'quality.results.commit': 'Commit',
  'quality.results.run': 'See the full CI run',
  'quality.results.lines': 'lines',
  'quality.results.branches': 'branches',
  'quality.results.functions': 'functions',
  'quality.results.statements': 'statements',
  'quality.results.performance': 'performance',
  'quality.results.accessibility': 'accessibility',
  'quality.results.bestPractices': 'best practices',
  'quality.results.seo': 'SEO',
  'quality.results.unavailable':
    'This copy of the site was built without test results, for example locally or for a pull request. The live site shows the results of the run that deployed it.',
  'quality.results.history': 'Every CI run on GitHub Actions',
  'quality.history.title': 'Last deploys',
  'quality.history.intro': 'How the numbers moved over the last {count} deploys to the live site.',
  'quality.history.first': 'The trend starts with this deploy and shows here from the next one.',
  'quality.history.tests': 'Tests passed',
  'quality.history.testsCaption': 'From {first} to {last} tests.',
  'quality.history.scores': 'Coverage and Lighthouse',
  'quality.history.coverage': 'Lowest coverage',
  'quality.history.lighthouse': 'Lowest Lighthouse score',
  'quality.history.scoresCaption':
    'Lowest coverage {coverage} and lowest Lighthouse score {lighthouse} on the latest deploy.',
  'quality.history.table': 'See the numbers',
  'quality.history.date': 'Date',
  'quality.history.commit': 'Commit',
  'quality.history.colTests': 'Tests',
  'quality.history.colCoverage': 'Coverage',
  'quality.history.colLighthouse': 'Lighthouse',
  'quality.pipeline.start': 'Pull request',
  'quality.pipeline.parallel': 'In parallel',
  'quality.summary.unit': 'unit tests passing',
  'quality.summary.browserRuns': 'browser test runs passing, in {browsers} browsers and phones',
  'quality.summary.coverage': 'lowest coverage ({metric})',
  'quality.summary.failures': 'failures in this build',
  'quality.pyramid.title': 'Test pyramid',
  'quality.pyramid.smoke': 'after every deploy',
  'quality.pyramid.e2e': '{count} in each browser',
  'quality.pyramid.caption':
    'Many fast unit tests at the base, fewer and slower browser tests above them, and a check of the live site at the top.',
  'quality.browsers.title': 'Browsers and phones',
  'quality.browsers.browser': 'Browser',
  'quality.browsers.passed': 'Passed',
  'quality.browsers.failed': 'Failed',
  'quality.browsers.flaky': 'Passed on retry',
  'quality.browsers.passRate': 'Pass rate',
  'quality.coverage.title': 'Code coverage',
  'quality.coverage.minimum': 'The build fails below {minimum}%',
  'quality.lighthouse.title': 'Lighthouse',
  'quality.lighthouse.caption':
    'Lowest score on any of the {pages} pages audited. The mark on each ring is the {minimum} minimum.',
  'quality.links.summary': '{checked} links checked, {broken} broken',
  'quality.ai.title': 'AI-driven testing',
  'quality.ai.p1':
    "The tests on this site are written and maintained with AI agents. So they don't have to guess, a CLAUDE.md file in the repository gives them the context (the quality gates, the testing conventions and the content rules), and skills give them step-by-step procedures for recurring work.",
  'quality.ai.p2':
    'The result is tests that follow the same conventions whoever writes them, and quality gates no agent is allowed to weaken to get a green build.',
  'quality.ai.claudeMd': 'Read CLAUDE.md',
  'quality.ai.skills': 'Skills in the repository',
  'quality.testPlan': 'Read the test plan',
  'blog.title': 'Blog',
  'blog.intro':
    'Notes on test automation, quality engineering and AI-driven testing, from my day job and from building this site.',
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
    "I'm happy to talk about QA roles, quality engineering or AI in testing. Send me a message here, or use one of the links below.",
  'contact.form.title': 'Send a message',
  'contact.form.name': 'Name',
  'contact.form.email': 'Email',
  'contact.form.message': 'Message',
  'contact.form.submit': 'Send message',
  'contact.form.sending': 'Sending your message…',
  'contact.form.success': "Thanks, your message arrived. I'll reply to the email you gave.",
  'contact.form.failure':
    "Your message didn't go through. Try again in a moment, or email me instead:",
  'contact.form.privacy':
    'Messages reach my inbox through Web3Forms. I only use your email to reply.',
  'contact.error.nameMissing': 'Add your name.',
  'contact.error.emailMissing': 'Add your email, so I can reply.',
  'contact.error.emailInvalid':
    "That doesn't look like an email address. It should be like name@example.com.",
  'contact.error.messageMissing': 'Write a message before sending.',
  'contact.error.messageTooLong': 'Keep the message under 5000 characters.',
  'contact.direct': 'Or reach me directly',
  'cv.profile': 'Profile',
  'cv.summary':
    'QA engineer who writes test automation in Playwright, Cypress and Selenium, coaches developers to test their own work, and uses AI agents to plan, write and run tests. Moved a team from mostly manual to AI-assisted testing and found two security vulnerabilities published as CVEs.',
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
  'nav.menu': 'Menu',
  'nav.open': 'Abrir menu',
  'nav.close': 'Fechar menu',
  'nav.home': 'Início',
  'nav.about': 'Sobre',
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
  'home.headline':
    'Parto coisas de propósito para que os seus utilizadores não as partam sem querer.',
  'home.intro':
    'Comecei no controlo de qualidade e na logística e depois aprendi sozinho a testar software. Hoje ajudo equipas a apanhar bugs cedo, a automatizar os testes que vale a pena automatizar e a passar para a IA a parte repetitiva dos testes.',
  'home.ctaContact': 'Entrar em contacto',
  'home.ctaExperience': 'Ver a minha experiência',
  'home.ctaCv': 'Descarregar CV (PDF, em inglês)',
  'home.pillarsTitle': 'Em que trabalho',
  'home.projectTitle': 'Projecto em destaque',
  'home.project.title': 'Este site',
  'home.project.description':
    'Construído e testado como um produto. Cada alteração passa por lint, verificação de tipos, testes unitários, testes Playwright em três browsers e dois telemóveis, e verificações de acessibilidade e Lighthouse antes de ir para produção, e um smoke test corre no site em produção depois de cada publicação.',
  'home.project.quality': 'Como é testado',
  'home.project.source': 'Código-fonte',
  'home.project.testPlan': 'Plano de testes',
  'about.title': 'Sobre',
  'about.p1':
    'Trabalho em QA, mas encontrar bugs é só uma parte. Escrevo automação de testes, mostro aos programadores como testar as próprias alterações e uso IA na parte repetitiva dos testes, para os problemas serem apanhados mais cedo e por mais pessoas do que só eu.',
  'about.p2':
    'Antes do software, trabalhei em controlo de qualidade e logística. Foi aí que aprendi que um problema sai mais barato se for corrigido cedo do que na verificação final. Aprendi testes de software sozinho, com cursos online, e o meu primeiro trabalho em QA foi testar pipelines de dados genómicos para uma farmacêutica.',
  'about.p3':
    'Desde então, ajudei equipas a passar dos testes manuais para os testes assistidos por IA, encontrei falhas de segurança que foram publicadas como CVE e passei muito tempo com programadores a apanhar problemas antes de chegarem ao QA.',
  'about.certifications': 'Certificações',
  'about.languages': 'Línguas',
  'about.languagesList': 'Português (nativo), inglês (proficiência profissional plena)',
  'experience.title': 'Experiência',
  'experience.for': 'para a',
  'experience.present': 'presente',
  'quality.title': 'Qualidade',
  'quality.intro':
    'Este site é construído e testado como um produto. Estas são as verificações por que passa cada alteração antes de ir para produção, os resultados do build que está a ver e a forma como agentes de IA ajudam a escrever e a manter os testes.',
  'quality.gates.title': 'O pipeline',
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
  'quality.gate.visual.name': 'Mudanças visuais',
  'quality.gate.visual.description':
    'Tira uma captura de ecrã de cada página nos temas claro e escuro, num computador e num telemóvel, e falha se for diferente da aprovada. Uma mudança no aspeto vem com novas capturas, revistas no pull request.',
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
  'quality.results.title': 'Último build',
  'quality.results.intro':
    'Os números abaixo vêm da execução de CI que construiu e publicou esta página.',
  'quality.results.commit': 'Commit',
  'quality.results.run': 'Ver a execução de CI completa',
  'quality.results.lines': 'linhas',
  'quality.results.branches': 'ramos',
  'quality.results.functions': 'funções',
  'quality.results.statements': 'instruções',
  'quality.results.performance': 'desempenho',
  'quality.results.accessibility': 'acessibilidade',
  'quality.results.bestPractices': 'boas práticas',
  'quality.results.seo': 'SEO',
  'quality.results.unavailable':
    'Esta cópia do site foi construída sem resultados de testes, por exemplo localmente ou para um pull request. O site em produção mostra os resultados da execução que o publicou.',
  'quality.results.history': 'Todas as execuções de CI no GitHub Actions',
  'quality.history.title': 'Últimos deploys',
  'quality.history.intro':
    'Como os números evoluíram nos últimos {count} deploys para o site em produção.',
  'quality.history.first': 'A tendência começa neste deploy e aparece aqui a partir do próximo.',
  'quality.history.tests': 'Testes que passaram',
  'quality.history.testsCaption': 'De {first} para {last} testes.',
  'quality.history.scores': 'Cobertura e Lighthouse',
  'quality.history.coverage': 'Cobertura mais baixa',
  'quality.history.lighthouse': 'Pontuação Lighthouse mais baixa',
  'quality.history.scoresCaption':
    'Cobertura mais baixa de {coverage} e pontuação Lighthouse mais baixa de {lighthouse} no último deploy.',
  'quality.history.table': 'Ver os números',
  'quality.history.date': 'Data',
  'quality.history.commit': 'Commit',
  'quality.history.colTests': 'Testes',
  'quality.history.colCoverage': 'Cobertura',
  'quality.history.colLighthouse': 'Lighthouse',
  'quality.pipeline.start': 'Pull request',
  'quality.pipeline.parallel': 'Em paralelo',
  'quality.summary.unit': 'testes unitários a passar',
  'quality.summary.browserRuns':
    'execuções de testes em browser a passar, em {browsers} browsers e telemóveis',
  'quality.summary.coverage': 'cobertura mais baixa ({metric})',
  'quality.summary.failures': 'falhas neste build',
  'quality.pyramid.title': 'Pirâmide de testes',
  'quality.pyramid.smoke': 'depois de cada publicação',
  'quality.pyramid.e2e': '{count} em cada browser',
  'quality.pyramid.caption':
    'Muitos testes unitários rápidos na base, menos testes de browser, mais lentos, por cima, e uma verificação do site em produção no topo.',
  'quality.browsers.title': 'Browsers e telemóveis',
  'quality.browsers.browser': 'Browser',
  'quality.browsers.passed': 'Passaram',
  'quality.browsers.failed': 'Falharam',
  'quality.browsers.flaky': 'Passaram à segunda',
  'quality.browsers.passRate': 'Taxa de sucesso',
  'quality.coverage.title': 'Cobertura de código',
  'quality.coverage.minimum': 'O build falha abaixo de {minimum}%',
  'quality.lighthouse.title': 'Lighthouse',
  'quality.lighthouse.caption':
    'Pontuação mais baixa entre as {pages} páginas auditadas. A marca em cada anel é o mínimo de {minimum}.',
  'quality.links.summary': '{checked} links verificados, {broken} partidos',
  'quality.ai.title': 'Testes com IA',
  'quality.ai.p1':
    'Os testes deste site são escritos e mantidos com agentes de IA. Para não terem de adivinhar, um ficheiro CLAUDE.md no repositório dá-lhes o contexto (os quality gates, as convenções de testes e as regras de conteúdo), e as skills dão-lhes procedimentos passo a passo para o trabalho recorrente.',
  'quality.ai.p2':
    'O resultado são testes que seguem as mesmas convenções, seja quem for que os escreva, e quality gates que nenhum agente pode enfraquecer para conseguir um build verde.',
  'quality.ai.claudeMd': 'Ler o CLAUDE.md',
  'quality.ai.skills': 'Skills no repositório',
  'quality.testPlan': 'Ler o plano de testes',
  'blog.title': 'Blog',
  'blog.intro':
    'Notas sobre automação de testes, engenharia de qualidade e testes com IA, a partir do meu trabalho e da construção deste site.',
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
    'Tenho todo o gosto em falar sobre funções de QA, engenharia de qualidade ou IA nos testes. Pode deixar-me uma mensagem aqui, ou usar um dos contactos abaixo.',
  'contact.form.title': 'Enviar uma mensagem',
  'contact.form.name': 'Nome',
  'contact.form.email': 'Email',
  'contact.form.message': 'Mensagem',
  'contact.form.submit': 'Enviar mensagem',
  'contact.form.sending': 'A enviar a mensagem…',
  'contact.form.success': 'Obrigado, a mensagem chegou. Respondo para o email que indicou.',
  'contact.form.failure':
    'A mensagem não foi enviada. Tente de novo daqui a pouco, ou envie-me um email:',
  'contact.form.privacy':
    'As mensagens chegam à minha caixa de correio através do Web3Forms. Só uso o seu email para responder.',
  'contact.error.nameMissing': 'Falta o nome.',
  'contact.error.emailMissing': 'Falta o email, para eu poder responder.',
  'contact.error.emailInvalid': 'Este email não parece válido. Deve ser algo como nome@exemplo.pt.',
  'contact.error.messageMissing': 'Escreva uma mensagem antes de enviar.',
  'contact.error.messageTooLong': 'A mensagem tem de ter menos de 5000 caracteres.',
  'contact.direct': 'Ou fale comigo diretamente',
  'cv.profile': 'Perfil',
  'cv.summary':
    'Engenheiro de QA que escreve automação de testes em Playwright, Cypress e Selenium, orienta os programadores a testarem o próprio trabalho e usa agentes de IA para planear, escrever e executar testes. Levou uma equipa de testes sobretudo manuais para testes assistidos por IA e encontrou duas vulnerabilidades de segurança publicadas como CVE.',
  'cv.earlier': 'Percurso anterior',
  'cv.download': 'Descarregar o meu CV (PDF, em inglês)',
  'notFound.title': 'Página não encontrada',
  'notFound.message': 'Esta página não existe, ou mudou de sítio. Esta escapou aos testes.',
  'notFound.back': 'Voltar à página inicial',
};

export const ui = { en, pt } as const satisfies Record<Lang, Record<UiKey, string>>;
