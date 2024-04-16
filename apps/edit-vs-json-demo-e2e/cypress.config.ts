import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      webServerCommands: {
        default: 'nx run edit-vs-json-demo:serve',
        production: 'nx run edit-vs-json-demo:preview',
      },
      ciWebServerCommand: 'nx run edit-vs-json-demo:serve-static',
    }),
    baseUrl: 'http://localhost:4200',
  },
});
