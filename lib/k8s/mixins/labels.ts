import produce from 'immer';

export default produce((draft, labels: { [prop: string]: string }) => {
  draft.metadata
    ? (draft.metadata.labels = {
        ...draft.metadata.labels,
        ...labels,
      })
    : (draft.metadata = { labels });
});
