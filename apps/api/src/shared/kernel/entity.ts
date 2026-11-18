// Entidade: identidade estável; igualdade por ID.
export abstract class Entity<Id extends string = string> {
  protected constructor(readonly id: Id) {}

  equals(other: Entity<Id> | undefined): boolean {
    return !!other && other.constructor === this.constructor && other.id === this.id;
  }
}
