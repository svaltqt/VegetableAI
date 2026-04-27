import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/auth.store"
import { usersService } from "@/services/users.service"

const PROFILE_KEY = ["me"]

/**
 * Reads the current user profile. Enabled only when a session exists, and
 * keyed by the session user id so logging in as a different account triggers
 * a fresh fetch automatically.
 */
export function useProfile() {
  const session = useAuthStore((s) => s.session)
  return useQuery({
    queryKey: [...PROFILE_KEY, session?.user?.id ?? null],
    queryFn: () => usersService.me(),
    enabled: Boolean(session?.user?.id),
    staleTime: 60 * 1000,
  })
}

/**
 * Updates the current user profile. The cache is updated optimistically with
 * the server response so consumers re-render without a refetch.
 */
export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => usersService.update(payload),
    onSuccess: (updated) => {
      qc.setQueriesData({ queryKey: PROFILE_KEY }, updated)
    },
  })
}

/** Removes any cached profile data. Used during sign-out. */
export function clearProfileCache(qc) {
  qc.removeQueries({ queryKey: PROFILE_KEY })
}

/**
 * Wraps the auth-store sign-out so callers also get the react-query profile
 * cache cleared in a single call.
 */
export function useSignOut() {
  const qc = useQueryClient()
  const signOut = useAuthStore((s) => s.signOut)
  return async () => {
    await signOut()
    clearProfileCache(qc)
  }
}
