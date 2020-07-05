import { rootPkg } from 'dpu_jkcfg/hack/lib';
import { outputJSON, readJSON } from 'fs-extra';
import signale from 'signale';

async (workspacePkgPath: string = process.argv[2]) => {
  const source = await rootPkg();
  const workspace = await readJSON(workspacePkgPath);

  signale.info(
    `current dependencies for ${workspace.name}`,
    workspace.dependencies
  );
  workspace.dependencies = pkgDepsWithVersions(
    source.dependencies,
    workspace.dependencies
  );
  signale.info(
    `updated dependencies for ${workspace.name}`,
    workspace.dependencies
  );

  await outputJSON(workspacePkgPath, workspace);
  signale.success(`dependencies updated for ${workspace.name}`);
};

const pkgDepsWithVersions = (repoDeps: any, pkgDeps: any) => {
  const result: { [prop: string]: string } = {};
  for (const dep of pkgDeps) {
    result[dep] = repoDeps[dep];
  }
  return result;
};
