/**
 * Boilerplate reducer for label selector specs, spread the result of this into
 * a spec or other top-level object field.
 *
 * const deployment = new k8s.apps.v1.Deployment(name, {
 *  spec: {
 *     ...selector(labels, true),
 *     replicas: replicas || 1,
 *     template: {
 *       ...metaLabels(labels),
 *    },
 *   },
 * });
 *
 * @param labels
 * @param matchLabels Nests matchLabels field in selector object
 */
export const selector = (
  labels: { [prop: string]: string },
  matchLabels?: boolean
) => ({
  selector: matchLabels ? { matchLabels: labels } : labels,
});

/**
 * Returns fully formed metadata object with
 * appropriate labels.  Can be used when you need to wire up
 * `template` objects to meet set-based requirements without
 * writing a full metadata object
 *
 * const deployment = new k8s.apps.v1.Deployment(name, {
 *  spec: {
 *     ...selector(labels, true),
 *     replicas: replicas || 1,
 *     template: {
 *       ...metaLabels(labels),
 *    },
 *   },
 * });
 *
 * @param labels
 */
export const metaLabels = (labels: { [prop: string]: string }) => ({
  metadata: { labels },
});
