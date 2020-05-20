import * as k8s from '@jkcfg/kubernetes/api';

/**
 * Taken from:
 * https://github.com/tektoncd/pipeline/blob/v0.12.1/pkg/apis/pipeline/v1beta1/workspace_types.go
 */

/**
 * Basic WorkspaceDeclaration declaration shape.
 *
 * readOnly defaults to false if not provided.
 */
export interface WorkspaceDeclaration {
  name?: string;
  description?: string;
  mountPath?: string;
  readOnly?: boolean;
}

/**
 * Object representation of WorkspaceDeclaration Array
 */
export interface WorkspaceDeclarations {
  [prop: string]: WorkspaceDeclaration;
}

/**
 * WorkspaceBinding maps a Task's declared workspace to a Volume.
 */
export interface WorkspaceBinding {
  name: string;
  subPath?: string;
  volumeClaimTemplate?: k8s.core.v1.PersistentVolumeClaim;
  persistentVolumeClaim?: k8s.core.v1.PersistentVolumeClaimVolumeSource;
  emptyDir?: k8s.core.v1.EmptyDirVolumeSource;
  configMap?: k8s.core.v1.ConfigMapVolumeSource;
  secret?: k8s.core.v1.SecretVolumeSource;
}

export interface WorkspaceBindings {
  [prop: string]: WorkspaceBinding;
}

/**
 * Creates a named slot in a Pipelien that a PipelineRun is expected to populate
 * with a workspace binding
 */
export interface WorkspacePipelineDeclaration {
  name: string;
  description?: string;
}

export interface WorkspacePipelineDeclarations {
  [prop: string]: WorkspacePipelineDeclaration;
}

/**
 * Describes how a workspace passed into the pipeline should be mapped to a
 * task's declared workspace.
 */
export interface WorkspacePipelineTaskBinding {
  name: string;
  workspace: string;
  subPath?: string;
}

export interface WorkspacePipelineTaskBindings {
  [prop: string]: WorkspacePipelineTaskBinding;
}
