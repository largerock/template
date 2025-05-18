'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useConnectionsState } from '../states/useConnectionState';
import {
  // Client-side actions
  createReferral,
  acceptReferral,
  rejectReferral,
  deleteReferral,
  createConnection,
  acceptConnection,
  rejectConnection,
  deleteConnection,
} from '../server/apiClientActions';

import {
  // Server-side cached actions
  getUserReferralsServer,
  getReferralsByIdsServer,
  getPendingReferralsCountServer,
  getUserConnectionsServer,
  getPendingConnectionsServer,
  getAcceptedConnectionsServer,
  getPotentialMatchesServer,
  getSentConnectionsServer,
} from '../server/referralConnectionServerActions';

// Utility function to do a shallow comparison of arrays
const areArraysEqual = <T extends { id: string }>(arr1: T[], arr2: T[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => item.id === arr2[index].id);
};

// ----- Referral Hooks -----

/**
 * Hook to fetch a user's referrals
 */
export const useUserReferrals = (userId: string) => {
  const connectionsState = useConnectionsState();
  const cachedReferrals = connectionsState.referrals;

  const query = useQuery({
    queryKey: ['referrals', 'user', userId],
    queryFn: () => getUserReferralsServer(userId),
    enabled: !!userId,
  });

  useEffect(() => {
    if (query.data && query.isSuccess) {
      // Only update state if the data is actually different
      if (!areArraysEqual(query.data, cachedReferrals)) {
        connectionsState.setReferrals(query.data);
      }
    }
  }, [query.data, query.isSuccess, cachedReferrals, connectionsState]);

  return {
    ...query,
    referrals: cachedReferrals.length > 0 ? cachedReferrals : query.data || [],
  };
};

/**
 * Hook to fetch referrals by IDs
 */
export const useReferralsByIds = (ids: string[]) => {
  const connectionsState = useConnectionsState();

  const query = useQuery({
    queryKey: ['referrals', 'byIds', ids],
    queryFn: () => getReferralsByIdsServer(ids),
    enabled: ids.length > 0,
  });

  useEffect(() => {
    if (query.data && query.isSuccess) {
      // Update any fetched referrals in the state
      let hasUpdate = false;
      query.data.forEach(referral => {
        const existingReferral = connectionsState.referrals.find(r => r.id === referral.id);
        if (!existingReferral) {
          connectionsState.addReferral(referral);
          hasUpdate = true;
        } else if (JSON.stringify(existingReferral) !== JSON.stringify(referral)) {
          connectionsState.updateReferral(referral.id, referral);
          hasUpdate = true;
        }
      });

      // If no updates were needed, don't trigger state updates
      if (!hasUpdate) {
        return;
      }
    }
  }, [query.data, query.isSuccess, connectionsState, ids]);

  return query;
};

/**
 * Hook to get the count of pending referrals for a user
 */
export const usePendingReferralsCount = (userId: string) => {
  return useQuery({
    queryKey: ['referrals', 'pending', 'count', userId],
    queryFn: () => getPendingReferralsCountServer(userId),
    enabled: !!userId,
  });
};

/**
 * Hook to create a referral
 */
export const useCreateReferral = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const connectionsState = useConnectionsState();

  return useMutation({
    mutationFn: ({ toUserId, forUserId, type, message }: {
      toUserId: string;
      forUserId: string;
      type: string;
      message: string;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return createReferral(userId, toUserId, forUserId, type, message);
    },
    onSuccess: (newReferral) => {
      // Add to Zustand state - use type assertion to bypass type check
      // since we know the structure will be compatible
      connectionsState.addReferral(newReferral);

      // Invalidate relevant queries
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['referrals', 'user', userId] });
      }
    },
  });
};

/**
 * Hook to accept a referral
 */
export const useAcceptReferral = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const connectionsState = useConnectionsState();

  return useMutation({
    mutationFn: (referralId: string) => acceptReferral(referralId),
    onSuccess: (updatedReferral) => {
      // Update with real data - use type assertion to bypass type check
      connectionsState.updateReferral(updatedReferral.id, updatedReferral);

      // Invalidate relevant queries
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['referrals', 'user', userId] });
      }
    },
  });
};

/**
 * Hook to reject a referral
 */
export const useRejectReferral = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const connectionsState = useConnectionsState();

  return useMutation({
    mutationFn: (referralId: string) => rejectReferral(referralId),
    onSuccess: (updatedReferral) => {
      // Update with real data - use type assertion to bypass type check
      connectionsState.updateReferral(updatedReferral.id, updatedReferral);

      // Invalidate relevant queries
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['referrals', 'user', userId] });
      }
    },
  });
};

/**
 * Hook to delete a referral
 */
export const useDeleteReferral = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const connectionsState = useConnectionsState();

  return useMutation({
    mutationFn: (referralId: string) => deleteReferral(referralId),
    onSuccess: (response) => {
      // Remove from state
      if (response && response.id) {
        connectionsState.removeReferral(response.id);
      }

      // Invalidate relevant queries
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['referrals', 'user', userId] });
      }
    },
  });
};

// ----- Connection Hooks -----

/**
 * Hook to fetch a user's connections
 */
export const useUserConnections = (userId: string) => {
  return useQuery({
    queryKey: ['connections', 'user', userId],
    queryFn: () => getUserConnectionsServer(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

/**
 * Hook to fetch a user's pending connections
 */
export const usePendingConnections = (userId: string) => {
  const query = useQuery({
    queryKey: ['connections', 'pending', userId],
    queryFn: () => getPendingConnectionsServer(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  return {
    ...query,
    pendingConnections: query.data || []
  };
};

/**
 * Hook to fetch a user's accepted connections
 */
export const useAcceptedConnections = (userId: string) => {
  const query = useQuery({
    queryKey: ['connections', 'accepted', userId],
    queryFn: () => getAcceptedConnectionsServer(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  return {
    ...query,
    acceptedConnections: query.data || []
  };
};

/**
 * Hook to fetch connections sent by a user
 */
export const useSentConnections = (userId: string) => {
  const query = useQuery({
    queryKey: ['connections', 'sent', userId],
    queryFn: () => getSentConnectionsServer(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  return {
    ...query,
    sentConnections: query.data || []
  };
};

/**
 * Hook to fetch potential matches for a user
 */
export const usePotentialMatches = (userId: string, threshold?: number, limit?: number) => {
  const connectionsState = useConnectionsState();
  const cachedPotentialMatches = connectionsState.potentialMatches;

  const query = useQuery({
    queryKey: ['connections', 'potential-matches', userId, threshold, limit],
    queryFn: () => getPotentialMatchesServer(userId, threshold, limit),
    enabled: !!userId,
  });

  useEffect(() => {
    if (query.data && query.isSuccess) {
      // Only update if the data has changed
      const areEqual = cachedPotentialMatches.length === query.data.length &&
        cachedPotentialMatches.every((match, i) => match.clerkUserId === query.data[i].clerkUserId);

      if (!areEqual) {
        connectionsState.setPotentialMatches(query.data);
      }
    }
  }, [query.data, query.isSuccess, cachedPotentialMatches, connectionsState]);

  return {
    ...query,
    potentialMatches: cachedPotentialMatches.length > 0 ? cachedPotentialMatches : query.data || [],
  };
};

/**
 * Hook to create a connection
 */
export const useCreateConnection = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const connectionsState = useConnectionsState();

  return useMutation({
    mutationFn: ({ recipientId, notes }: { recipientId: string; notes?: string }) => {
      if (!userId) throw new Error('User not authenticated');
      // The userId is passed to the API action but will be sent via headers, not in the body
      return createConnection(userId, recipientId, notes);
    },
    onSuccess: (newConnection) => {
      // Add to connections list - use type assertion to bypass type check
      connectionsState.addConnection(newConnection);

      // Add to pending connections list
      connectionsState.addPendingConnection(newConnection);

      // Invalidate relevant queries
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['connections', 'user', userId] });
        queryClient.invalidateQueries({ queryKey: ['connections', 'pending', userId] });
      }
    },
  });
};

/**
 * Hook to accept a connection
 */
export const useAcceptConnection = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const connectionsState = useConnectionsState();

  return useMutation({
    mutationFn: (connectionId: string) => acceptConnection(connectionId),
    onSuccess: (updatedConnection) => {
      // Update connection in the main list
      connectionsState.updateConnection(updatedConnection.id, updatedConnection);

      // Make sure it's in accepted and not in pending
      connectionsState.removePendingConnection(updatedConnection.id);
      connectionsState.addAcceptedConnection(updatedConnection);

      // Invalidate relevant queries
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['connections', 'user', userId] });
        queryClient.invalidateQueries({ queryKey: ['connections', 'pending', userId] });
        queryClient.invalidateQueries({ queryKey: ['connections', 'accepted', userId] });
      }
    }
  });
};

/**
 * Hook to reject a connection
 */
export const useRejectConnection = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const connectionsState = useConnectionsState();

  return useMutation({
    mutationFn: (connectionId: string) => rejectConnection(connectionId),
    onSuccess: (updatedConnection) => {
      // Update connection in the main list
      connectionsState.updateConnection(updatedConnection.id, updatedConnection);

      // Remove from pending list
      connectionsState.removePendingConnection(updatedConnection.id);

      // Invalidate relevant queries
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['connections', 'user', userId] });
        queryClient.invalidateQueries({ queryKey: ['connections', 'pending', userId] });
      }
    }
  });
};

/**
 * Hook to delete a connection
 */
export const useDeleteConnection = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const connectionsState = useConnectionsState();

  return useMutation({
    mutationFn: (connectionId: string) => deleteConnection(connectionId),
    onSuccess: (response) => {
      // Remove from all state lists
      if (response && response.id) {
        const connectionId = response.id;
        connectionsState.removeConnection(connectionId);
        connectionsState.removePendingConnection(connectionId);
        connectionsState.removeAcceptedConnection(connectionId);
      }

      // Invalidate relevant queries
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['connections', 'user', userId] });
        queryClient.invalidateQueries({ queryKey: ['connections', 'accepted', userId] });
        queryClient.invalidateQueries({ queryKey: ['connections', 'pending', userId] });
      }
    }
  });
};