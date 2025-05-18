'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getAllInterestsServer,
} from '../server/taxonomyActions';
import { useEffect } from 'react';
import { useInterestsState } from '../states/useInterestsState';

// Query keys for React Query
export const taxonomyKeys = {
  all: ['taxonomy'] as const,
  interests: () => [...taxonomyKeys.all, 'interests'] as const,
};

// Interests hooks
export const useAllInterests = (options = {}) => {
  const { setInterests } = useInterestsState();
  const query = useQuery({
    queryKey: taxonomyKeys.interests(),
    queryFn: () => getAllInterestsServer(),
    staleTime: 1000 * 60 * 60, // 1 hour
    ...options,
  });

  useEffect(() => {
    if (query.data) {
      setInterests(query.data);
    }
  }, [query.data, setInterests]);

  return query;
};
