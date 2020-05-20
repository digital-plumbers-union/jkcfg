import {
  KubernetesObject,
  objToNamedObj,
  objToNameValue,
} from '@dpu/jkcfg-k8s';
import { merge } from 'lodash-es';
import {
  ResourceDeclaration,
  ResourceDeclarations,
} from '../v1alpha1/resource';
import { resource } from './common';
import {
  Parameters,
  ParameterSpec,
  ParameterSpecs,
  ParameterValue,
} from './param';
import { Task, TaskOptions, taskRef, TaskRef, taskSpec } from './task';
import { WorkspacePipelineDeclaration, WorkspacePipelineDeclarations, WorkspacePipelineTaskBinding, WorkspacePipelineTaskBindings } from './workspace';

/**
 * Resource models
 */
export interface Pipeline extends KubernetesObject {
  spec: PipelineSpec;
}

export interface PipelineSpec {
  tasks: PipelineTaskSpec[];
  resources?: ResourceDeclaration[];
  params?: ParameterSpec[];
  workspaces?: WorkspacePipelineDeclaration[];
  results?: PipelineResult[];
}

export interface PipelineResult {
  name?: string;
  description?: string;
  value: string;
}

export interface PipelineResults {
  [prop: string]: PipelineResult;
}

/**
 * Pipeline Task Resources
 */
interface PipelineTaskResource {
  name: string;
  resource: string;
}

export interface PipelineTaskOutputResource extends PipelineTaskResource {}
export interface PipelineTaskInputResource extends PipelineTaskResource {
  // list of other pipeline tasks the resource has to come from
  from?: string[];
}

/**
 * Object format of PipelineTaskOutputResource[] for convenience
 */
export interface PipelineTaskOutputResources {
  [prop: string]: Omit<PipelineTaskOutputResource, 'name'>;
}

/**
 * Object format of PipelineTaskInputResource[] for convenience
 */
export interface PipelineTaskInputResources {
  [prop: string]: Omit<PipelineTaskInputResource, 'name'>;
}

export interface PipelineTaskConditionSpec {
  conditionRef: string;
  params?: ParameterValue[];
  resources?: PipelineTaskInputResource[];
}

/**
 * Object format of PipelineTaskConditionSpec for convenience
 */
export interface PipelineTaskConditions {
  [prop: string]: {
    params?: Parameters;
    resources?: PipelineTaskInputResources;
  };
}

export interface PipelineTaskSpec {
  name: string;
  taskRef?: TaskRef;
  taskSpec?: Task['spec'];
  resources?: {
    inputs?: PipelineTaskInputResource[];
    outputs?: PipelineTaskOutputResource[];
  };
  params?: ParameterValue[];
  conditions?: PipelineTaskConditionSpec[];
  retries?: number;
  runAfter?: string[];
  workspaces?: WorkspacePipelineTaskBinding[];
}

/**
 * Abstract internal representation of what goes into PipelineTask
 */
export interface PipelineTaskOptions {
  name: string;
  // simplify to string while keeping flexibility to use type for final interface
  taskRef?: string;
  taskSpec?: TaskOptions;
  resources?: {
    inputs?: PipelineTaskInputResources;
    outputs?: PipelineTaskOutputResources;
  };
  params?: Parameters;
  runAfter?: string[];
  retries?: number;
  conditions?: PipelineTaskConditions;
  workspaces?: WorkspacePipelineTaskBindings;
}

export interface PipelineOptions {
  tasks: PipelineTaskOptions[];
  /**
   * Technically these are not the same in Pipelines, but shrug:
   * https://github.com/tektoncd/pipeline/blob/release-v0.10.x/pkg/apis/pipeline/v1alpha2/pipeline_types.go#L170
   */
  resources?: ResourceDeclarations;
  params?: ParameterSpecs;
  workspaces?: WorkspacePipelineDeclarations;
  results?: PipelineResults;
}

/**
 * Resource creation functions
 */

/**
 * Creates PipelineTaskSpec from PipelineTaskOptions
 * @param opts
 */
export const pipelineTask = (opts: PipelineTaskOptions): PipelineTaskSpec => {
  const { name } = opts;
  const spec: PipelineTaskSpec = { name };

  if (opts.taskRef) spec.taskRef = taskRef(opts.taskRef);
  if (opts.taskSpec) spec.taskSpec = taskSpec(opts.taskSpec);
  if (opts.retries) spec.retries = opts.retries;
  if (opts.runAfter) spec.runAfter = opts.runAfter;

  spec.resources = merge(
    {},
    opts.resources?.inputs
      ? {
          inputs: objToNamedObj<PipelineTaskInputResource>(
            opts.resources.inputs
          ),
        }
      : {},
    opts.resources?.outputs
      ? {
          outputs: objToNamedObj<PipelineTaskOutputResource>(
            opts.resources.outputs
          ),
        }
      : {}
  );

  if (opts.params) {
    spec.params = objToNameValue(opts.params) as ParameterValue[];
  }

  if (opts.conditions) {
    spec.conditions = (objToNamedObj(
      opts.conditions
    ) as unknown) as PipelineTaskConditionSpec[];
  }

  return spec;
};

export const pipelineSpec = (opts: PipelineOptions): PipelineSpec => {
  const spec: PipelineSpec = {
    tasks: opts.tasks.map(t => pipelineTask(t)),
  };

  if (opts.resources) spec.resources = objToNamedObj(opts.resources);
  if (opts.workspaces) spec.workspaces = objToNamedObj(opts.workspaces);
  if (opts.params) spec.params = objToNamedObj(opts.params);
  if (opts.results) {
    spec.results = objToNameValue(opts.results) as PipelineResult[];
  }

  return spec;
};

/**
 * Creates Pipeline object
 * @param name
 * @param opts
 */
export const pipeline = (name: string, opts: PipelineOptions): Pipeline =>
  resource(name, 'Pipeline', pipelineSpec(opts));
