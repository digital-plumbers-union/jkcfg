/**
 * Basic Workspace declaration shape.
 *
 * readOnly defaults to false if not provided.
 */
export interface Workspace {
  name?: string;
  description?: string;
  mountPath?: string;
  readOnly?: boolean;
}

/**
 * Object representation of Workspace Array
 */
export interface Workspaces {
  [prop: string]: Workspace;
}
