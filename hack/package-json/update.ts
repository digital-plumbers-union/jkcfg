import { die } from 'dpu_jkcfg/hack/lib';
import { outputJSON, readJSON } from 'fs-extra';
import { resolve } from 'path';
import signale from 'signale';

(async (workspacePkgPath: string = process.argv[2]) => {
  const basePkg = await readJSON(resolve(__dirname, 'base.json'));
  const workspace = await readJSON(workspacePkgPath);

  for (const key in basePkg) {
    signale.info(`updating ${key}`);
    workspace[key] = basePkg[key];
  }

  await outputJSON(workspacePkgPath, workspace, { spaces: 2 });
  signale.success(`package.json updated for ${workspace.name}`);
})().catch(die);
