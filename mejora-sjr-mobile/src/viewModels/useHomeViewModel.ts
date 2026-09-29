export function useHomeViewModel(onSignOut: () => Promise<void>) {
  return { signOut: onSignOut };
}
