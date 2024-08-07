// Results
export type Result<T, E = undefined> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: E;
    };

export type AsyncResult<T, E = undefined> = Promise<Result<T, E>>;

export const Ok = <T, E>(value: T): Result<T, E> => ({ ok: true, value });
export const Err = <T, E>(error: E): Result<T, E> => ({ ok: false, error });
