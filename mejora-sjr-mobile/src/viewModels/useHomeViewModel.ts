export function useHomeViewModel(onReturnToLogin: () => void) {
  return { returnToLogin: onReturnToLogin };
}
