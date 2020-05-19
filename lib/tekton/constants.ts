export enum Annotations {
  gitHost = 'tekton.dev/git-0',
  dockerHost = 'tekton.dev/docker-0',
}

export enum Labels {
  eventListener = 'tekton.dev/eventlistener',
  trigger = 'tekton.dev/trigger',
  eventId = 'tekton.dev/triggers-eventid',
  pipeline = 'tekton.dev/pipeline',
  pipelineRun = 'tekton.dev/pipelineRun',
  pipelineTask = 'tekton.dev/pipelineTask',
  task = 'tekton.dev/task',
}

export enum EventTypes {
  unknown = 'dev.tekton.event.task.unknown.v1',
  successful = 'dev.tekton.event.task.successful.v1',
  failed = 'dev.tekton.event.task.failed.v1',
}

/**
 * Enum for ClusterRoles created by the Openshift Pipelines operator
 * WARNING: These might not be consistent with off-the-shelf Tekton.
 */
export enum TektonClusterRoles {
  // note: incomplete list, add them as you need them
  edit = 'tekton-aggregate-edit',
}