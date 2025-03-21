import { createSelector as untypedCreateSelector } from 'reselect';

import type { RootState } from '.';

export const createSelector = untypedCreateSelector.withTypes<RootState>();
