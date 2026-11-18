---
name: threat-model
description: Threat model STRIDE leve para um spec novo, gerando requisitos de segurança que viram critérios de aceite.
---
1. Leia specs/<feature>/spec.md e plan.md.
2. Liste ativos (dados, ações), atores (anônimo, usuário, admin, outro tenant)
   e fronteiras de confiança (cliente → API → banco → terceiros).
3. Para cada fronteira, avalie STRIDE: Spoofing, Tampering, Repudiation,
   Information disclosure, Denial of service, Elevation of privilege.
4. Para cada ameaça relevante: probabilidade, impacto, mitigação.
5. Grave docs/threat-models/<feature>.md.
6. Converta cada mitigação em critério Given/When/Then e acrescente na task
   correspondente do tasks.md (ex. "Given usuário do tenant A, When pede a
   fatura do tenant B, Then recebe 404"). Esses critérios viram testes de aceite.
