import http from 'node:http';

import { isValidUrl } from '@myeyesid/core-kit';
import { conditional } from '@silverhand/essentials';
import chalk from 'chalk';
import type { CommandModule } from 'yargs';

import { consoleLog } from '../../utils.js';

import { type TunnelCommandArgs } from './types.js';
import {
  checkExperienceInput,
  createMyEyesIDResponseHandler,
  createProxy,
  createStaticFileProxy,
  isMyEyesIDRequestPath,
} from './utils.js';

const tunnel: CommandModule<unknown, TunnelCommandArgs> = {
  command: ['$0'],
  describe: 'Command for MyEyesID tunnel',
  builder: (yargs) =>
    yargs.options({
      'experience-uri': {
        alias: ['uri'],
        describe: 'The URI of your custom sign-in experience page.',
        type: 'string',
      },
      'experience-path': {
        alias: ['path'],
        describe: 'The local folder path of your custom sign-in experience assets.',
        type: 'string',
      },
      endpoint: {
        describe: `MyEyesID endpoint URI that points to your MyEyesID Cloud instance. E.g.: https://<tenant-id>.myeyesid.app/`,
        type: 'string',
      },
      port: {
        alias: 'p',
        describe: 'The port number where the tunnel service will be running on. Defaults to 9000.',
        type: 'number',
        default: 9000,
      },
      verbose: {
        describe: 'Show verbose output.',
        type: 'boolean',
        default: false,
      },
    }),
  handler: async ({ 'experience-uri': uri, 'experience-path': path, endpoint, port, verbose }) => {
    checkExperienceInput(uri, path);

    if (!endpoint || !isValidUrl(endpoint)) {
      consoleLog.fatal(
        'A valid MyEyesID endpoint URI must be provided. E.g. `--endpoint https://<tenant-id>.myeyesid.app/` or add `LOGTO_ENDPOINT` to your environment variables.'
      );
    }
    const myeyesidEndpointUrl = new URL(endpoint);

    const startServer = (port: number) => {
      const tunnelServiceUrl = new URL(`http://localhost:${port}`);

      const proxyMyEyesIDRequest = createProxy(
        myeyesidEndpointUrl.href,
        async (proxyResponse, request, response) =>
          createMyEyesIDResponseHandler({
            proxyResponse,
            request,
            response,
            myeyesidEndpointUrl,
            tunnelServiceUrl,
            verbose,
          })
      );
      const proxyExperienceServerRequest = conditional(uri && createProxy(uri));
      const proxyExperienceStaticFileRequest = conditional(path && createStaticFileProxy(path));

      const server = http.createServer((request, response) => {
        consoleLog.info(`[${chalk.green(request.method)}] ${request.url}`);

        // Tunneling the requests to MyEyesID endpoint
        if (isMyEyesIDRequestPath(request.url)) {
          void proxyMyEyesIDRequest(request, response);
          return;
        }

        if (proxyExperienceServerRequest) {
          void proxyExperienceServerRequest(request, response);
          return;
        }

        if (proxyExperienceStaticFileRequest) {
          void proxyExperienceStaticFileRequest(request, response);
        }
      });

      server.listen(port, () => {
        const serviceUrl = new URL(`http://localhost:${port}`);
        consoleLog.plain(`${chalk.green('✔')} 🎉 MyEyesID tunnel service is running!`);
        consoleLog.plain(`${chalk.green('➜')} Your custom sign-in UI is hosted on:`);
        consoleLog.plain(`  ${chalk.blue(chalk.bold(serviceUrl.href))}`);
        consoleLog.plain(`${chalk.green('➜')} Remember to update MyEyesID endpoint URI in your app:`);
        consoleLog.plain(`  ${chalk.gray('From:')} ${chalk.blue(chalk.bold(endpoint))}`);
        consoleLog.plain(`  ${chalk.gray('To:')}   ${chalk.blue(chalk.bold(serviceUrl.href))}`);
        consoleLog.plain(
          `${chalk.green(
            '➜'
          )} If you are using social sign-in, make sure the social redirect URI is also set to:`
        );
        consoleLog.plain(
          `  ${chalk.blue(chalk.bold(`${serviceUrl.href}callback/<connector-id>`))}\n`
        );
        consoleLog.plain(
          `${chalk.green('➜')} ${chalk.gray(
            `Press ${chalk.white('Ctrl+C')} to stop the tunnel service.`
          )}`
        );
        consoleLog.plain(
          `${chalk.green('➜')} ${chalk.gray(
            `Use ${chalk.white('--verbose')} to print verbose output.`
          )}`
        );
      });

      server.on('error', (error: Error) => {
        if ('code' in error && error.code === 'EADDRINUSE') {
          consoleLog.error(`Port ${port} is already in use, trying another one...`);
          startServer(port + 1);
          return;
        }
        consoleLog.fatal(`Tunnel service failed to start. ${error.message}`);
      });
    };

    startServer(port);
  },
};

export default tunnel;
