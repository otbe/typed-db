const noop = () => { };

export interface Subscriber<T> {
  complete: () => void;
  next: (v: T) => void;
  error: (e: any) => void;
}

export interface Observable<T> {
  subscribe: (onNext: (v: T) => void, onError?: (e: any) => void, onComplete?: () => void) => void;
}

export const createObservable = <T>(subscribe: (subscriber: Subscriber<T>) => void): Observable<T> => {
  return {
    subscribe: (onNext: (v: T) => void, onError?: (e: any) => void, onComplete?: () => void) => {
      subscribe({
        next: onNext,
        error: onError || noop,
        complete: onComplete || noop
      });
    }
  };
};
