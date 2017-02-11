const noop = () => { };

export const createObservable = <T>(subscription: (subscription: { complete: () => void; next: (v: T) => void; error: (e: any) => void; }) => void) => {
  return {
    subscribe: (onNext: (v: T) => void, onError?: (e: any) => void, onComplete?: () => void) => {
      subscription({
        next: onNext,
        error: onError || noop,
        complete: onComplete || noop
      });
    }
  };
};
