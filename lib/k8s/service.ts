export enum Protocols {
  TCP = 'TCP',
  SCTP = 'SCTP',
  UDP = 'UDP',
}

// `V1ServicePort` from `@kubernetes/client-node` has `targetPort: object`, wtf
export const svcPort = (
  port: number,
  opts?: { targetPort?: number; protocol?: Protocols; name?: string }
) => {
  const defaults = { protocol: Protocols.TCP, name: 'http' };
  return {
    port,
    ...defaults,
    ...opts,
  };
};
