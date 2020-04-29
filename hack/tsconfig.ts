import { outputJSON } from 'fs-extra';
import signale from 'signale';
import workspacesRun from 'workspaces-run';
import paths from './paths';

const tsconfig = {
  extends: '../../tsconfig.json',
  compilerOptions: { outDir: 'dist/', declarationDir: 'types/' },
  exclude: ['dist/', 'node_modules/', 'types/'],
  include: ['**/*.ts'],
};

(async () => {
  await workspacesRun({ cwd: paths.root }, async (workspace, allWorkspaces) => {
    const outPath = `${workspace.dir}/tsconfig.json`;
    signale.info(`writing tsconfig for ${workspace.name} to ${outPath}`);
    await outputJSON(outPath, tsconfig, { spaces: 2 });
  });
})();
