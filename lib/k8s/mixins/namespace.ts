import produce from 'immer';

export default (namespace: string) =>
  produce(draft => {
    draft.metadata
      ? (draft.metadata.namespace = namespace)
      : (draft.metadata = { namespace });
  });
