import { die } from 'dpu_jkcfg/hack/lib';
import { readJSON } from 'fs-extra';
import { resolve } from 'path';

const checkPkgShape = (expected: any, actual: any) => {
  for (const key in expected) {
    if (actual[key] !== expected[key]) {
      throw new Error(
        `${key} field mismatch: ${expected[key]} expected, got ${actual[key]}`
      );
    }
  }
};

(async (workspacePkgPath: string = process.argv[2]) => {
  const basePkg = await readJSON(resolve(__dirname, 'base.json'));
  const workspace = await readJSON(workspacePkgPath);
  checkPkgShape(basePkg, workspace);
})().catch(die);
