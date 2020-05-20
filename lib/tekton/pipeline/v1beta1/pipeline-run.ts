import {
  PipelineResourceBindings,
  PipelineResourceBinding,
} from '../v1alpha1/resource';
import { apiVersion } from './common';
import { objToNameValue, objToNamedObj, KubernetesObject, StringObject } from '@dpu/jkcfg-k8s';
import { core } from '@jkcfg/kubernetes/api';
import { Parameters, ParameterValue } from './param';
import { WorkspaceBinding, WorkspaceBindings } from './workspace';
import { PipelineSpec, PipelineOptions } from './pipeline';
import { pipelineSpec } from './pipeline';

/**
 * Models for PipelineRun objects
 */
export interface PipelineRun extends KubernetesObject {
  spec: PipelineRunSpec;
}

interface PipelineRunSpec {
  resources?: PipelineResourceBinding[];
  serviceAccountName?: string;
  serviceAccountNames?: TaskServiceAccount[];
  workspaces?: WorkspaceBinding[];
  pipelineRef?: PipelineRef;
  pipelineSpec?: PipelineSpec;
  params?: ParameterValue[];
  status?: any;
  timeout?: string;
  podTemplate?: core.v1.PodSpec;
  taskRunSpecs?: PipelineTaskRunSpec[];
}

interface PipelineRef {
  name: string;
}

interface TaskServiceAccount {
  taskName: string;
  serviceAccountName: string;
}

interface PipelineTaskRunSpec {
  pipelineTaskName?: string;
  taskServiceAccountName?: string;
  taskPodTemplate?: core.v1.PodSpec;
}

/**
 * Higher level abstractions to make it easier to build these PipelineRun
 * objects
 */

/**
 * Object representation of `InlineResource`
 */

interface PipelineRunOptions {
  resources?: PipelineResourceBindings;
  serviceAccountName?: string;
  serviceAccountNames?: StringObject;
  timeout?: string;
  podTemplate?: core.v1.PodSpec;
  pipelineRef?: string;
  pipelineSpec?: PipelineOptions;
  params?: Parameters;
  workspaces?: WorkspaceBindings;
  generateName?: boolean;
  taskRunSpecs?: PipelineTaskRunSpec[];
}

export const pipelineRun = (
  name: string,
  opts: PipelineRunOptions
): PipelineRun => {
  const {
    pipelineRef,
    params,
    workspaces,
    podTemplate,
    timeout,
    serviceAccountName,
    serviceAccountNames,
    resources,
    taskRunSpecs
  } = opts;

  const spec: PipelineRunSpec = {};
  if (pipelineRef) spec.pipelineRef = { name: pipelineRef };
  if (opts.pipelineSpec) spec.pipelineSpec = pipelineSpec(opts.pipelineSpec);
  if (workspaces) spec.workspaces = objToNamedObj(workspaces);
  if (resources) spec.resources = objToNamedObj(resources);
  if (params) spec.params = objToNameValue(params) as ParameterValue[];
  if (taskRunSpecs) spec.taskRunSpecs = taskRunSpecs;
  if (podTemplate) spec.podTemplate = podTemplate;
  if (timeout) spec.timeout = timeout;
  if (serviceAccountName) spec.serviceAccountName = serviceAccountName;
  if (serviceAccountNames) {
    spec.serviceAccountNames = Object.keys(serviceAccountNames).map(key => ({
      taskName: key,
      serviceAccountName: serviceAccountNames[key],
    }));
  }

  // default to false
  const generateName =
    opts.generateName === undefined ? false : opts.generateName;

  return {
    apiVersion,
    kind: 'PipelineRun',
    metadata: {
      generateName: generateName
        ? name.endsWith('-')
          ? name
          : `${name}-`
        : undefined,
      // this is equivalent to `generateName`, but allows for consistent UID,
      // in the case where there are other internal fields you need to be
      // self-referential
      name: generateName ? undefined : tmplRunName(name),
    },
    spec,
  };
};

/**
 * Creates template string for Pipeline Runs using correct Tekton template
 * vars.
 * @param name Pipeline name
 */
export const tmplRunName = (name: string) => `${name}-$(uid)`;
