// HU-05 only exercises navigation. Authentication will use an injected service contract.
export function useLoginViewModel(onContinue: () => void) {
  return { continueToHome: onContinue };
}
