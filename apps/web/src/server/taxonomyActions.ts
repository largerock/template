'use server';

import {
  Interest
} from '@template/core-types';
import { cache } from 'react';
import { serverRequest } from './serverRequest';

export const getAllInterestsServer = cache(
  async (): Promise<Interest[]> => {
    return serverRequest<Interest[]>('api/interests/all');
  }
);

