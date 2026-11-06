type MatchResult<T> = ({
  matched: false;
} | {
  matched: true;
  output: T;
});

export class MatchBuilder<T> {

  private readonly value: T;

  public constructor(value: T) {
    this.value = value;
  }

  public when<R>(condition: (val: T) => boolean, cb: (val: T) => R): Match<T, R> {
    return new Match<T, R>(this.value).when(condition, cb);
  }

  public eq<T1 extends T, R>(value: T1, cb: (val: T1) => R): Match<Exclude<T, T1>, R> {
    return new Match<T, R>(this.value).eq(value, cb);
  }

  public oneOf<T1 extends T, R>(values: T1[], cb: (val: T1, idx: number) => R): Match<Exclude<T, T1>, R> {
    return new Match<T, R>(this.value).oneOf(values, cb);
  }

}

export class Match<T, R> {

  private readonly value: T;

  private result: MatchResult<R> = { matched: false };

  public constructor(value: T) {
    this.value = value;
  }

  private check<T1 extends T>(condition: (val: T) => boolean, cb: (val: T1) => R): boolean {
    if (!this.result.matched && condition(this.value)) {
      this.result = {
        matched: true,
        output: cb(this.value as T1),
      };
      return true;
    }
    return false;
  }

  private exclusive<T1 extends T>(condition: (val: T) => boolean, cb: (val: T1) => R): Match<Exclude<T, T1>, R> {
    this.check(condition, cb);
    return this as Match<Exclude<T, T1>, R>;
  }

  public when(condition: (val: T) => boolean, cb: (val: T) => R): Match<T, R> {
    this.check(condition, cb);
    return this as Match<T, R>;
  }

  public eq<T1 extends T>(value: T1, cb: (val: T1) => R): Match<Exclude<T, T1>, R> {
    return this.exclusive(v => v === value, cb);
  }

  public oneOf<T1 extends T>(values: T1[], cb: (val: T1, idx: number) => R): Match<Exclude<T, T1>, R> {
    if (!this.result.matched) {
      for (let i = 0; i < values.length; i++) {
        if (values[i] === this.value) {
          this.result = {
            matched: true,
            output: cb(this.value as T1, i),
          };
        }
      }
    }
    return this as Match<Exclude<T, T1>, R>;
  }

  public otherwise(cb: (val: T) => R): Match<T, R> {
    return this.when(() => true, cb);
  }
  
  public take(): R {
    if (!this.result.matched) {
      throw new Error("No match found");
    }
    const { output } = this.result;
    this.result = { matched: false };
    return output;
  }

}

export const match = function match<T>(value: T): MatchBuilder<T> {
  return new MatchBuilder(value);
}
