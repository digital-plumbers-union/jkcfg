import { execSync } from 'child_process';
import workspacesRun from 'workspaces-run';
import paths from './paths';

(async () => {
  await workspacesRun({ cwd: paths.root }, async (workspace, allWorkspaces) => {
    execSync(`yarn tsc -p ${workspace.dir}`, { stdio: 'inherit' });
  });
})();
