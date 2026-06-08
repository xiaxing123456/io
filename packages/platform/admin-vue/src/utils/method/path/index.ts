import { pathUtils } from '@io-platform/core-common';

export const getCurrentRouterQuery = () => {
  const hash = globalThis?.location?.hash;
  return pathUtils.getPathQueryForHref(hash) as Record<string, string>;
};
