// Raiz de agregado: registra eventos; o caso de uso publica depois de salvar.
import type { DomainEvent } from "./domain-event.js";
import { Entity } from "./entity.js";

export abstract class AggregateRoot<Id extends string = string> extends Entity<Id> {
  private pending: DomainEvent[] = [];

  protected record(event: DomainEvent): void {
    this.pending.push(event);
  }

  pullEvents(): DomainEvent[] {
    const events = this.pending;
    this.pending = [];
    return events;
  }
}
