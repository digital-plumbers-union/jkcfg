import { readJSON } from 'fs-extra';
import { join } from 'path';

export const isBzlRun = process.env.BUILD_WORKSPACE_DIRECTORY ? true : false;

/**
 * If running via Bazel run, use the `BUILD_WORKSPACE_DIRECTORY` environment variable, otherwise we try to resolve the root path relatively.
 */
export const workspaceDir = (): string =>
  isBzlRun
    ? process.env.BUILD_WORKSPACE_DIRECTORY!
    : join(__dirname, '..', '..');

export const rootPkg = async () => readJSON(`${workspaceDir()}/package.json`);
export const commonPkg = async () =>
  readJSON(`${workspaceDir()}/hack/package-common.json`);

/**
 * Makes scripts intended to be used as tests exit with a 1 and print the error
 */
export const die = (e: Error) => {
  console.log(e);
  process.exit(1);
};
