import dTree from 'dependency-tree';
import { outputJSON } from 'fs-extra';
import { merge, uniq } from 'lodash';
import { dirname } from 'path';
import readPkgUp from 'read-pkg-up';
import signale from 'signale';
import workspacesRun from 'workspaces-run';
import repoPkg from '../package.json';
import paths from './paths';

const scope = '@dpu/';
const main = 'dist/index.js';
const repository = 'github:digital-plumbers-union/jkcfg';
const license = 'MIT';

(async () => {
  await workspacesRun({ cwd: paths.root }, async (workspace, allWorkspaces) => {
    const outPath = `${workspace.dir}/package.json`;
    const pkg = workspace.config;

    if (!pkg.name.startsWith(scope)) {
      signale.warn(`${scope} not found in ${workspace.name}`);
      // assume that there isnt a scope
      pkg.name = `${scope}${pkg.name}`;
    }

    pkg.version = repoPkg.version;

    const pkgDeps = await deps(workspace.dir, workspace.name);
    signale.info(workspace.name, pkgDeps);

    merge(pkg.dependencies, pkgDepsWithVersions(repoPkg.dependencies, pkgDeps));

    // explicitly set all `@dpu/` deps to repoPkg.version
    for (const key in pkg.dependencies) {
      if (key.includes(scope)) pkg.dependencies[key] = repoPkg.version;
    }

    signale.info(workspace.name, pkg.dependencies);

    const outputPkg = {
      ...pkg,
      types: 'types/index.d.ts',
      files: ['dist/', 'types/'],
      type: 'module',
      module: main,
      publishConfig: {
        access: 'public',
      },
      repository,
      license,
    };

    delete (outputPkg as any).main;

    signale.info(`writing package.json for ${workspace.name} to ${outPath}`);
    await outputJSON(outPath, outputPkg, { spaces: 2 });
  });
})();

const deps = async (workspaceDir: string, workspaceName: string) => {
  const list = dTree.toList({
    filename: `${workspaceDir}/${main}`,
    directory: paths.root,
  });

  return uniq(
    (await Promise.all(list.map(i => readPkgUp({ cwd: dirname(i) })))).map(
      p => p!.packageJson.name
    )
  ).filter(i => i !== workspaceName);
};

const pkgDepsWithVersions = (repoDeps: any, pkgDeps: any) => {
  const result: { [prop: string]: string } = {};
  for (const dep of pkgDeps) {
    result[dep] = repoDeps[dep];
  }
  return result;
};
