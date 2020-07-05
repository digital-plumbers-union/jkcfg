import { rootPkg } from 'dpu_jkcfg/hack/lib';
import { readJSON } from 'fs-extra';

async (workspacePkgPath: string = process.argv[2]) => {
  const source = await rootPkg();
  const workspace = await readJSON(workspacePkgPath);

  checkPkgDeps(source.dependencies, workspace.dependencies);
};

const checkPkgDeps = (repoDeps: any, pkgDeps: any) => {
  for (const dep of pkgDeps) {
    if (repoDeps[dep] !== pkgDeps[dep]) {
      throw new Error(
        `${dep} version mismatch: ${repoDeps[dep]} expected, got ${pkgDeps[dep]}`
      );
    }
  }
};
