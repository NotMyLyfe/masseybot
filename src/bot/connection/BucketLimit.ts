export default class BucketLimit {
  public name: string;
  public limit: number;
  public remaining: number;
  private _reset: Date;
  public resetAfter: number;
  public isFetching: boolean;

  constructor(
    name: string,
    limit = 0,
    remaining = 0,
    reset = new Date(8640000000000000),
    resetAfter = Number.MAX_SAFE_INTEGER,
    isFetching = false
  ) {
    this.name = name;
    this.limit = limit;
    this.remaining = remaining;
    this._reset = reset;
    this.resetAfter = resetAfter;
    this.isFetching = isFetching;
  }

  public get reset(): Date {
    return this._reset;
  }

  public set reset(reset: Date | number) {
    if (reset instanceof Date) {
      this._reset = reset;
    } else {
      this._reset = new Date(reset);
    }
  }
}
