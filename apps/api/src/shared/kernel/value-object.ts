// Value object: imutável, sem identidade, igualdade por valor.
export abstract class ValueObject<P extends Record<string, unknown>> {
  protected readonly props: Readonly<P>;

  protected constructor(props: P) {
    this.props = Object.freeze({ ...props });
  }

  equals(other: ValueObject<P> | undefined): boolean {
    if (!other || other.constructor !== this.constructor) return false;
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
