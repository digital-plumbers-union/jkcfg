import { Parameters, ParameterValue } from './param';
import { PipelineResourceBinding } from '../v1alpha1/resource';
import { Task, TaskRef, TaskOptions } from './task';
import { taskRef, taskSpec } from './task';
import { Workspace, Workspaces } from './workspace';
import { core } from '@jkcfg/kubernetes/api';
import { KubernetesObject, objToNamedObj, objToNameValue } from '@dpu/jkcfg-k8s';
import { apiVersion } from './common';
import { merge } from 'lodash-es';

/**
 * Resource models
 */

/**
 * Define Tekton spec for TaskRun objects
 */
export interface TaskRun extends KubernetesObject {
  spec: {
    resources?: {
      inputs?: TaskResourceBinding[];
      outputs?: TaskResourceBinding[];
    };
    params?: ParameterValue[];
    taskRef?: TaskRef;
    taskSpec?: Task['spec'];
    serviceAccountName?: string;
    // TODO: add specific types for this
    // https://github.com/tektoncd/pipeline/blob/v0.10.1/pkg/apis/pipeline/v1alpha1/taskrun_types.go#L24
    status?: any;
    timeout?: string;
    podTemplate?: core.v1.PodSpec;
    workspaces?: Workspace[];
  };
}


export interface TaskResourceBinding extends PipelineResourceBinding {
  paths?: string[];
}

export interface TaskResourceBindings {
  [prop: string]: TaskResourceBinding;
}

/**
 * Simplified internal representation of what goes into a TaskRun, leaning on
 * Objects over Arrays
 */
export interface TaskRunOptions {
  resources?: {
    inputs?: TaskResourceBindings;
    outputs?: TaskResourceBindings;
  };
  params?: Parameters;
  serviceAccount?: string;
  taskRef?: string;
  taskSpec?: TaskOptions;
  timeout?: string;
  podTemplate?: core.v1.PodSpec;
  workspaces?: Workspaces;
}

/**
 * Resource creation functions
 */

export const taskRun = (name: string, opts: TaskRunOptions): TaskRun => {
  const spec: TaskRun['spec'] = {};
  if (opts.podTemplate) spec.podTemplate = opts.podTemplate;
  if (opts.serviceAccount) spec.serviceAccountName = opts.serviceAccount;
  if (opts.taskRef) spec.taskRef = taskRef(opts.taskRef);
  if (opts.taskSpec) spec.taskSpec = taskSpec(opts.taskSpec);
  if (opts.timeout) spec.timeout = opts.timeout;
  if (opts.workspaces) spec.workspaces = objToNamedObj(opts.workspaces);

  if (opts.params) {
    spec.params = objToNameValue(opts.params) as ParameterValue[];
  }

  spec.resources = merge({},
    opts.resources?.inputs ? { inputs: objToNamedObj(opts.resources.inputs) } : {},
    opts.resources?.outputs ? { outputs: objToNamedObj(opts.resources.outputs) } : {})

  return {
    apiVersion,
    kind: 'TaskRun',
    metadata: { generateName: name.endsWith('-') ? name : `${name}-` },
    spec,
  };
};
{}
