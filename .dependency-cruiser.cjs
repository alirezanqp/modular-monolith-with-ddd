/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-no-infrastructure',
      severity: 'error',
      comment: 'Domain layer must not depend on infrastructure',
      from: { path: 'src/modules/[^/]+/src/domain' },
      to: { path: 'src/(modules/[^/]+/src/infrastructure|building-blocks/infrastructure)' },
    },
    {
      name: 'no-cross-module-internals',
      severity: 'error',
      comment: 'Modules may only import other modules via integration-events or public index',
      from: { path: 'src/modules/([^/]+)/src/(?!integration-events)' },
      to: {
        path: 'src/modules/(?!\\1)([^/]+)/src/(domain|application|infrastructure)',
      },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
  },
};
