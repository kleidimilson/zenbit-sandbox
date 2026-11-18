// test-presence: ignore só tipos (interface sem comportamento)
// Evento de domínio: fato no passado, imutável.
export interface DomainEvent {
  readonly name: string;
  readonly aggregateId: string;
  readonly occurredAt: Date;
}
