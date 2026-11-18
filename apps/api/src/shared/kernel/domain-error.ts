// Erro de domínio: esperado, tem código estável e mensagem para o usuário.
export abstract class DomainError {
  abstract readonly code: string;
  constructor(readonly message: string) {}
}
