# DocFusion — Roadmap de Produto e Desenvolvimento

> **Produto:** DocFusion  
> **Propósito:** transformar PDFs e textos em documentos organizados, editáveis e bem diagramados.  
> **Documento:** `roadmap.md`  
> **Estado:** planejamento vivo, sujeito a revisões conforme aprendizado técnico e testes.  
> **Última revisão do planejamento:** 02/11/2026.  
> **Versão inicial de referência:** V1.0 (protótipo entregue; validação funcional completa pendente).

---

## 1. Visão do produto

O **DocFusion** começa como uma aplicação web para reunir, visualizar, reorganizar e exportar PDFs. A visão de longo prazo é evoluir para um **estúdio de documentos**, combinando:

1. **Organização de PDFs:** upload, pré-visualização, mesclagem, ordenação e manipulação de páginas.
2. **Composição de documentos:** capas, textos, imagens, anexos e modelos reutilizáveis.
3. **Editor de texto:** criação e edição de documentos com estilos de parágrafos, títulos, fontes e layout de página.
4. **Importação e exportação:** PDF e DOCX, com indicação clara das limitações de fidelidade e editabilidade.
5. **SmartLayout — Diagramador Automático:** texto bruto + modelo → documento estruturado, formatado e revisável.
6. **Inteligência documental:** reconhecimento semântico e, futuramente, otimização baseada em modelos de IA e machine learning.

### 1.1 Problema que queremos resolver

Organizar diversos arquivos, produzir documentos padronizados e manter sua formatação costuma exigir várias ferramentas e conhecimento prévio de editoração. O DocFusion pretende reduzir essas etapas, sem esconder do usuário as limitações técnicas de cada conversão.

### 1.2 Princípios de produto

- **Simplicidade primeiro:** funcionalidades claras e fluxo intuitivo, sem excesso de controles.
- **Evolução incremental:** cada versão deve gerar valor utilizável e poder ser testada isoladamente.
- **Conteúdo preservado:** formatação automática não pode alterar silenciosamente o texto original.
- **Controle do usuário:** visualização, desfazer/refazer, comparação e aprovação das sugestões automáticas.
- **Privacidade por padrão:** operações locais quando possível; qualquer processamento remoto deve ser informado.
- **Editabilidade honesta:** um PDF importado não se torna automaticamente um DOCX perfeitamente editável.
- **Arquitetura modular:** editor, PDF, exportadores e SmartLayout com responsabilidades separadas.
- **Qualidade antes de complexidade:** nenhuma funcionalidade de IA deve substituir validação, testes e critérios objetivos.

---

## 2. Escopo geral e limites

| Área | Objetivo | Observação |
| --- | --- | --- |
| PDFs | Mesclar, ordenar, girar, excluir, duplicar e visualizar páginas | Prioridade inicial |
| Capas | Criar, editar e posicionar capas em qualquer ponto | Preservar dados da capa para reedição |
| Editor | Criar documentos estruturados com estilos e ferramentas de texto | Implantação progressiva |
| DOCX | Exportar **documentos nativos editáveis** e importar arquivos | Requer mapeamento de estilos/elementos |
| PDF → DOCX | Converter conteúdo importado com melhor esforço | Pode perder layout; PDFs digitalizados exigem OCR |
| SmartLayout | Aplicar layouts e estilos automaticamente | Começar com regras, depois IA |
| IA/ML | Classificar blocos e propor melhorias de diagramação | Só expandir com avaliações e salvaguardas |

**Não é uma promessa de compatibilidade integral com o Microsoft Word.** O objetivo é entregar operações confiáveis, com avisos quando houver limites de importação/exportação, recursos não suportados ou alterações inevitáveis na paginação.

---

## 3. Convenções deste roadmap

- **[x]** Implementado no protótipo informado, mas não necessariamente homologado.
- **[ ]** Pendente, planejado ou ainda precisa de validação.
- **Status de versão:** `Protótipo`, `Planejado`, `Em desenvolvimento`, `Em validação`, `Concluído`.
- **Critério de aceite:** resultado observável que precisa ser comprovado antes de considerar a versão concluída.
- **Dependência:** versão ou componente necessário para realizar a entrega com segurança.

> **Nota sobre V1.0:** foi disponibilizada uma implementação inicial com interface, upload, pré-visualização, organização de páginas, capas e exportação de PDF. Houve testes iniciais de interface (incluindo criar/editar/duplicar/excluir), mas **não há evidência de validação de ponta a ponta de todos os casos de mesclagem e exportação**. Por isso, a V1.0 permanece como **Protótipo** neste roadmap.

---

## 4. Roadmap por versão

### V1.0 — Mesclador e organizador de PDFs

**Status:** Protótipo entregue; homologação pendente.  
**Objetivo:** permitir que o usuário componha um PDF final a partir de vários documentos e capas.

**Escopo do protótipo**

- [x] Interface web responsiva para gerenciamento de documentos.
- [x] Seleção/upload de múltiplos arquivos PDF.
- [x] Pré-visualização de páginas e navegação.
- [x] Organização por arrastar e soltar.
- [x] Operações de exclusão, duplicação e rotação de páginas.
- [x] Criador de capas personalizáveis com modelos iniciais.
- [x] Inserção de capas na composição do documento.
- [x] Fluxo de geração e download de PDF.
- [ ] Confirmar mesclagem e exportação de ponta a ponta em diferentes navegadores.
- [ ] Validar páginas com dimensões e orientações distintas.
- [ ] Testar PDFs corrompidos, protegidos, vazios, extensos e com nomes especiais.
- [ ] Revisar acessibilidade básica, responsividade e mensagens de erro.

**Critérios de aceite**

1. Importar ao menos três PDFs válidos, exibir suas páginas e reorganizá-las.
2. Inserir uma capa entre páginas, alterar sua posição e visualizar o resultado.
3. Exportar um PDF que abra corretamente, com a ordem de páginas esperada.
4. Exibir mensagem clara quando um arquivo não puder ser lido ou exportado.

**Dependências técnicas candidatas:** PDF.js para visualização e pdf-lib para manipulação.

### V1.1 — Estabilidade, persistência e base modular

**Status:** Planejado.  
**Objetivo:** transformar o protótipo em uma base sustentável para as próximas versões.

- [ ] Corrigir problemas identificados na validação da V1.0.
- [ ] Organizar código por módulos (arquivos, páginas, prévia, capas, exportação e interface).
- [ ] Definir um modelo de dados versionado para o projeto.
- [ ] Implementar **desfazer/refazer** das principais ações.
- [ ] Salvar e reabrir projetos localmente (avaliar IndexedDB para arquivos e metadados).
- [ ] Preservar vínculos com PDFs originais e dados editáveis de capas.
- [ ] Validar tipo, tamanho, páginas e estados de erro antes do processamento.
- [ ] Adicionar testes automatizados para composição e reordenação de páginas.
- [ ] Documentar estrutura, instruções de execução e limitações.

**Critérios de aceite:** reabrir um projeto mantendo arquivos, ordem, rotações e capas; desfazer uma alteração sem corromper a composição; testes essenciais executados com sucesso.

**Dependência:** V1.0 validada.

### V2.0 — Editor de texto: fundamentos

**Status:** Planejado.  
**Objetivo:** criar e editar conteúdo textual nativo dentro do DocFusion.

- [ ] Integrar um editor rico modular (candidato: **Tiptap**).
- [ ] Criar barra de formatação com negrito, itálico e sublinhado.
- [ ] Selecionar família, tamanho, cor e destaque da fonte.
- [ ] Aplicar alinhamento à esquerda, centralizado, à direita e justificado.
- [ ] Configurar espaçamento entre linhas e listas simples.
- [ ] Definir estilos semânticos: **Normal**, **Título 1**, **Título 2** e **Título 3**.
- [ ] Implementar desfazer/refazer e atalhos básicos de edição.
- [ ] Salvar e reabrir documentos nativos preservando a estrutura do editor.

**Critérios de aceite:** criar um relatório com títulos, parágrafos e listas; salvar/reabrir; aplicar um estilo sem perder a estrutura semântica do documento.

**Dependência:** modelo de projeto e persistência da V1.1.

### V2.1 — Gerenciador de estilos e layout de página

**Status:** Planejado.  
**Objetivo:** padronizar formatação e preparar a base do SmartLayout.

- [ ] Criar editor de estilos globais (fontes, tamanhos, pesos, espaçamentos, recuos e alinhamento).
- [ ] Atualizar automaticamente todos os blocos vinculados a um estilo modificado.
- [ ] Configurar formato A4, margens, orientação e recuos.
- [ ] Oferecer perfis de estilos acadêmico, empresarial e minimalista.
- [ ] Permitir criar, aplicar, editar, duplicar e restaurar conjuntos de estilos.
- [ ] Pré-visualizar mudanças antes de confirmá-las.

**Critérios de aceite:** alterar o estilo `Título 1` e ver a atualização consistente de todos os títulos desse tipo; salvar/reabrir o conjunto de estilos sem perda de informação.

**Dependência:** V2.0.

### V2.2 — Conteúdo enriquecido e estrutura de documentos

**Status:** Planejado.  
**Objetivo:** oferecer recursos suficientes para produzir documentos completos.

- [ ] Inserir imagens e ajustar dimensões e alinhamento.
- [ ] Criar e editar tabelas simples.
- [ ] Adicionar links, listas ordenadas e não ordenadas.
- [ ] Implementar quebras manuais de página.
- [ ] Planejar numeração de páginas e cabeçalhos/rodapés, conforme viabilidade técnica.
- [ ] Revisar comportamento em documentos longos e em diferentes larguras de tela.

**Critérios de aceite:** criar um documento com título, texto, tabela, imagem e quebra de página; salvar/reabrir sem perder a estrutura; gerar uma prévia utilizável.

**Dependências:** V2.0–V2.1.

### V3.0 — Exportação de documentos nativos

**Status:** Planejado.  
**Objetivo:** exportar documentos criados no editor para PDF e DOCX.

- [ ] Definir mapeamento de blocos e estilos do editor para DOCX (candidato: biblioteca `docx`).
- [ ] Implementar exportação PDF com texto selecionável e fontes compatíveis.
- [ ] Preservar títulos, parágrafos, listas, imagens e tabelas suportadas.
- [ ] Criar testes de regressão visual e estrutural para exportações.
- [ ] Informar recursos que não podem ser exportados fielmente.

**Critérios de aceite:** DOCX abre em editor compatível com títulos e parágrafos editáveis; PDF pode ser aberto e pesquisado; diferenças relevantes entre prévia e arquivos são conhecidas e documentadas.

**Dependências:** V2.x e estratégia de renderização/paginação.

### V3.1 — Integração entre editor e organizador

**Status:** Planejado.  
**Objetivo:** reunir documentos nativos, capas e PDFs importados em uma só composição.

- [ ] Inserir documentos nativos no organizador de páginas.
- [ ] Combinar conteúdo criado no editor com PDFs externos.
- [ ] Preservar separadamente a versão **nativa editável** e a **composição final em PDF**.
- [ ] Permitir reposicionar capas e anexos na sequência final.
- [ ] Sinalizar limitações do DOCX ao incluir páginas de PDFs externos.

**Critérios de aceite:** criar um relatório nativo, anexar PDFs e exportar uma composição PDF correta; manter os textos nativos reeditáveis no projeto.

**Dependências:** V1.x e V3.0.

### V3.2 — SmartLayout: motor determinístico

**Status:** Planejado.  
**Objetivo:** diagramar automaticamente **documentos já estruturados** a partir de regras editáveis.

- [ ] Definir um formato de template com tokens de estilos, margens e regras de paginação.
- [ ] Aplicar estilos por tipo de bloco (título, parágrafo, lista, citação, legenda).
- [ ] Definir regras para espaçamento, recuos, quebras e hierarquia de títulos.
- [ ] Pré-visualizar antes/depois com opção de confirmar ou desfazer.
- [ ] Preservar texto e vínculos de estilos durante a diagramação.
- [ ] Implementar validações para evitar cortes, sobreposições e inconsistências.

**Critérios de aceite:** aplicar um preset ao mesmo documento estruturado produz um resultado consistente; trocar de preset não modifica o texto; é possível reverter a operação.

**Dependências:** V2.1 e V3.0; paginação minimamente confiável.

### V3.3 — Biblioteca de modelos e diagramação em um clique

**Status:** Planejado.  
**Objetivo:** oferecer modelos reutilizáveis para cenários reais.

- [ ] Modelos acadêmicos configuráveis (inclusive opções inspiradas em regras ABNT).
- [ ] Modelos para relatórios, propostas comerciais, manuais e documentos simples.
- [ ] Gerenciar capa, cabeçalhos, rodapés e numeração quando suportados.
- [ ] Gerar sumário a partir de títulos semânticos, com atualização após mudanças.
- [ ] Permitir perfis e modelos personalizados do usuário.
- [ ] Documentar quais regras cada modelo aplica.

**Critérios de aceite:** escolher um modelo, visualizar suas regras e gerar documento consistente; editar o preset sem modificar o conteúdo original; nenhum modelo é apresentado como garantia universal de conformidade normativa.

**Dependência:** V3.2.

### V4.0 — Importação e conversão avançadas

**Status:** Planejado.  
**Objetivo:** ampliar a entrada de documentos e experimentar conversão com revisão de qualidade.

- [ ] Importar DOCX com preservação dos elementos suportados.
- [ ] Avaliar conversão de PDFs digitais para conteúdo estruturado/DOCX.
- [ ] Identificar PDFs digitalizados e oferecer fluxo opcional de OCR.
- [ ] Comparar resultado convertido com o original, indicando limitações.
- [ ] Avaliar backend e processamento remoto somente onde houver necessidade real.
- [ ] Estabelecer política de tratamento e eliminação de arquivos temporários.

**Critérios de aceite:** converter e importar documentos de teste representativos; registrar perdas conhecidas; nunca prometer equivalência perfeita de texto, layout ou tabelas.

**Dependências:** V3.0; infraestrutura e segurança, se houver processamento remoto.

### V4.1 — SmartLayout: reconhecimento semântico assistido por IA

**Status:** Planejado.  
**Objetivo:** identificar a estrutura provável de um texto pouco formatado.

- [ ] Segmentar entrada em blocos com identificadores estáveis.
- [ ] Classificar blocos como título, subtítulo, parágrafo, lista, citação ou legenda.
- [ ] Usar regras locais primeiro; recorrer a modelo pré-treinado quando trouxer benefício mensurável.
- [ ] Produzir sugestões estruturadas e validá-las contra um esquema.
- [ ] Exibir indicação de confiança/incerteza e solicitar revisão para casos ambíguos.
- [ ] Manter histórico do texto original e das decisões aprovadas.
- [ ] Medir precisão de classificação em documentos de avaliação.

**Critérios de aceite:** o sistema sugere uma hierarquia sem alterar silenciosamente o texto; alterações incertas exigem confirmação; métricas por tipo de bloco são registradas.

**Dependências:** V3.2–V3.3 e modelo de dados estruturado.

### V4.2 — SmartLayout: diagramação assistida por IA

**Status:** Planejado.  
**Objetivo:** usar sugestões semânticas para escolher e ajustar layouts.

- [ ] Sugerir presets a partir da estrutura e da finalidade do documento.
- [ ] Detectar títulos inconsistentes, blocos sem estilo e problemas de hierarquia.
- [ ] Comparar propostas de formatação antes de aplicar.
- [ ] Permitir aceitar/rejeitar sugestões individualmente ou em grupo.
- [ ] Registrar alterações para comparação, desfazer e auditoria.
- [ ] Definir limites para acesso a documentos por APIs externas e exigir consentimento.

**Critérios de aceite:** aplicar sugestões aprovadas sem alterar palavras do texto; reverter alterações; registrar de forma clara que partes tiveram apoio de IA.

**Dependência:** V4.1.

### V5.0 — SmartLayout Engine: otimização avançada

**Status:** Visão futura / pesquisa.  
**Objetivo:** melhorar a qualidade visual e estrutural da paginação por meio de otimização e, se justificado, machine learning.

- [ ] Definir métricas: integridade do conteúdo, consistência visual, legibilidade, espaço em branco e estabilidade da paginação.
- [ ] Detectar títulos órfãos, cortes, transbordamentos e páginas excessivamente vazias.
- [ ] Gerar e comparar composições alternativas respeitando regras do modelo.
- [ ] Avaliar classificadores ou rankers de layout a partir de exemplos anotados.
- [ ] Criar conjunto de testes com documentos variados e revisão humana.
- [ ] Implementar limites para impedir alterações incompatíveis com requisitos normativos.
- [ ] Investigar treinamento especializado **somente** se modelos/regras existentes não atenderem às métricas.

**Critérios de aceite:** demonstrar melhorias mensuráveis em casos de teste, sem degradação inaceitável de legibilidade, editabilidade, consistência ou desempenho.

**Dependências:** V3.x–V4.x, dados de avaliação, métricas e governança.

### Após V5.0 — Ideias para pesquisa (não comprometidas)

- [ ] Experiência de revisão colaborativa e comentários.
- [ ] Perfis de equipe e bibliotecas compartilhadas de modelos.
- [ ] Integração opcional com armazenamento em nuvem.
- [ ] Acessibilidade assistida e auditoria de documentos.
- [ ] Fluxos especializados por profissão e tipo de documento.

---

## 5. Arquitetura de referência

A arquitetura evolui por módulos, evitando que a interface de edição dependa diretamente de bibliotecas de PDF ou de um provedor de IA.

```text
DocFusion
├── Aplicação Web
│   ├── Organizador de PDFs
│   ├── Editor de documentos
│   ├── Criador de capas
│   ├── Biblioteca de modelos
│   └── Pré-visualização e revisão
├── Núcleo de documentos
│   ├── Modelo estruturado (blocos + IDs)
│   ├── Estilos e tokens de layout
│   ├── Composição e ordem de páginas
│   └── Histórico de alterações
├── Serviços de documento
│   ├── Importação PDF/DOCX
│   ├── Exportação PDF/DOCX
│   ├── Renderização e paginação
│   └── Salvamento local
└── SmartLayout
    ├── Motor de regras e templates
    ├── Analisador estrutural
    ├── Assistente de IA (opcional)
    ├── Otimizador de layout (futuro)
    └── Validador e métricas
```

### 5.1 Modelo de dados: requisito transversal

- Todo documento nativo deve ser representado por **blocos semânticos** (parágrafos, títulos, listas, tabelas etc.), não apenas por HTML visual.
- Cada bloco deve ter **identificador estável**, conteúdo e referência ao estilo aplicável.
- Templates devem armazenar **regras** e **tokens de design** independentemente do texto.
- PDFs importados devem permanecer como **fontes/anexos** até passarem por uma conversão explícita.
- A composição final é uma sequência de itens: páginas importadas, capas e documentos renderizados.
- O projeto deve registrar **versão de esquema** para migrações futuras.

### 5.2 Tecnologias candidatas (sujeitas a prova de conceito)

| Responsabilidade | Candidatas | Observações |
| --- | --- | --- |
| Interface inicial | HTML, CSS, JavaScript; Vite na modularização | Evitar introduzir framework sem necessidade |
| Prévia PDF | PDF.js | Renderização e miniaturas |
| Composição PDF | pdf-lib | Copiar, organizar e transformar páginas |
| Ordenação de páginas | SortableJS ou solução equivalente | Testar desktop, toque e acessibilidade |
| Editor de texto | Tiptap | Avaliar funcionalidades e condições de licenciamento de extensões |
| Geração DOCX | Biblioteca `docx` | Exige mapeamento dos blocos do editor |
| Paginação | CSS de impressão, Paged.js ou outro motor | Realizar prova de conceito com documentos longos |
| Composição avançada | Typst (pesquisa) | Avaliar integração ao editor visual e PDF/DOCX |
| Armazenamento local | IndexedDB | Limites de quota, recuperação e migração |
| Backend futuro | Node.js ou Python | Só onde cliente não atender a requisitos |
| Análise documental | Regras, NLP, OCR e ferramentas como Docling | Avaliar qualidade, custo, privacidade e licença |
| IA/ML | Modelos existentes antes de treinamento próprio | Validar saídas, incerteza e uso de dados |

**Regra de decisão:** a escolha definitiva de uma biblioteca exige teste de integração, desempenho, manutenção e licença — não apenas uma demonstração isolada.

---

## 6. Dependências e ordem crítica

```text
Validação V1.0
      ↓
Persistência e arquitetura V1.1
      ↓
Editor estruturado V2.0
      ↓
Estilos globais V2.1 ──→ Conteúdo rico V2.2
      ↓                         ↓
Exportação confiável V3.0 ←─────┘
      ↓
Integração de documentos V3.1
      ↓
SmartLayout por regras V3.2
      ↓
Modelos V3.3
      ↓
Importação/conversão V4.0 (pode evoluir em paralelo)
      ↓
Reconhecimento semântico V4.1
      ↓
Diagramação assistida V4.2
      ↓
Otimização + eventual ML V5.0
```

**Observação:** algumas frentes podem ocorrer em paralelo. O requisito indispensável para o SmartLayout é possuir uma representação estruturada, um mecanismo de estilos e uma forma confiável de revisar os resultados.

---

## 7. Qualidade, segurança e critérios de evolução

### 7.1 Testes essenciais

- [ ] Testes unitários para ordenação, cópia e transformação de páginas.
- [ ] Testes de persistência, migração e recuperação de projetos.
- [ ] Testes de integração dos fluxos importar → editar/organizar → exportar.
- [ ] Testes de regressão visual do PDF e do documento paginado.
- [ ] Testes de round-trip para conteúdo nativo salvo e reaberto.
- [ ] Testes de acessibilidade: teclado, foco, rótulos e feedback de estado.
- [ ] Testes com PDFs de orientações, tamanhos e características variadas.
- [ ] Medição de desempenho e consumo de memória em arquivos grandes.

### 7.2 Segurança e privacidade

- [ ] Validar conteúdo de arquivos e tratar PDFs inválidos, protegidos ou malformados.
- [ ] Estabelecer limites de tamanho, páginas e tempo de processamento.
- [ ] Evitar uploads remotos quando a tarefa puder ser processada no navegador.
- [ ] Obter consentimento explícito antes de enviar conteúdos a serviços de IA ou conversão.
- [ ] Definir retenção e descarte seguro de documentos processados no servidor.
- [ ] Aplicar isolamento/sandbox em processadores externos quando necessário.
- [ ] Revisar licenças de bibliotecas, modelos e serviços antes do uso comercial.

### 7.3 Métricas para o SmartLayout

| Métrica | Pergunta de avaliação |
| --- | --- |
| Precisão estrutural | Quantos blocos foram classificados corretamente? |
| Integridade textual | Alguma palavra ou informação foi omitida/alterada? |
| Consistência visual | Estilos e espaçamentos foram aplicados uniformemente? |
| Paginação | Há sobreposições, cortes, títulos órfãos ou espaços excessivos? |
| Fidelidade de exportação | O PDF e o DOCX preservam o que foi prometido? |
| Revisabilidade | O usuário consegue ver, aceitar, desfazer e corrigir mudanças? |
| Desempenho | O tempo de resposta é aceitável para o tamanho do documento? |

**Machine learning só entra como solução de produto** quando houver conjunto de avaliação, métrica de referência e ganho comprovável em relação a regras ou modelos já disponíveis.

---

## 8. Riscos e mitigação

| Risco | Impacto | Estratégia |
| --- | --- | --- |
| PDF → DOCX perde formatação | Alto | Avisos claros, comparação visual e amostras de teste |
| Diferença entre prévia, PDF e Word | Alto | Definir fontes, paginação, limites de fidelidade e regressão visual |
| Código da V1 pouco modular | Médio/alto | Refatoração antes de adicionar o editor |
| Arquivos grandes consomem memória | Alto | Limites, processamento incremental e testes de desempenho |
| Perda de arquivos no armazenamento local | Alto | Informar limites, permitir exportar/importar projeto e backup |
| Modelos de IA interpretam títulos incorretamente | Alto | Confiança, revisão humana e preservação do original |
| Exposição de documentos confidenciais | Alto | Processamento local preferencial e consentimento informado |
| Custos e licenças de editores/conversores | Médio/alto | Prova de conceito e auditoria das dependências |
| Escopo excessivo antes de validar o MVP | Alto | Entregas pequenas, critérios de aceite e backlog priorizado |

---

## 9. Backlog e priorização

### P0 — Bloqueadores da próxima fase

- [ ] Homologar a V1.0 com PDFs reais de teste.
- [ ] Corrigir erros de exportação/ordenação antes de ampliar o escopo.
- [ ] Definir formato de projeto e plano de persistência.
- [ ] Especificar os tipos de blocos e estilos do editor.

### P1 — Próxima entrega funcional

- [ ] Modularizar a base existente.
- [ ] Salvar/reabrir projetos e implementar histórico de ações.
- [ ] Criar prova de conceito de editor rico com estilos semânticos.

### P2 — Evolução de produto

- [ ] Exportação DOCX nativa e paginação de documentos.
- [ ] Integração editor + organizador de PDF.
- [ ] Templates e diagramação determinística.

### P3 — Pesquisa avançada

- [ ] Conversão de arquivos complexos e OCR.
- [ ] Identificação semântica de estrutura via IA.
- [ ] Experimentação com modelos de classificação e otimização de layout.

---

## 10. Próximos passos recomendados

1. **Validar V1.0:** montar uma matriz de testes com diferentes PDFs e registrar bugs reproduzíveis.
2. **Abrir issues no GitHub:** um item por funcionalidade e um item por defeito, com critérios de conclusão.
3. **Implementar V1.1:** modularização, persistência, desfazer/refazer e testes básicos.
4. **Prototipar o editor da V2.0 isoladamente:** texto, títulos e estilos; não misturar com a mesclagem antes de estabilizar.
5. **Definir o contrato de dados do SmartLayout desde cedo:** texto/estrutura, estilos e template desacoplados.
6. **Validar exportação antes de IA:** o produto deve produzir documentos corretos mesmo sem qualquer modelo inteligente.

---

## 11. Registro de decisões

| Decisão | Justificativa |
| --- | --- |
| **DocFusion** é o nome do produto | Identidade unificada de organização e edição de documentos |
| **SmartLayout** é o nome de trabalho do diagramador | Diferencia o módulo de formatação automática |
| Priorizar processamento local | Privacidade e simplicidade operacional |
| Iniciar SmartLayout por regras | Previsibilidade, custo e capacidade de testes |
| Adicionar IA apenas como assistente revisável | Evitar alterações silenciosas e erros de interpretação |
| Adiar treinamento de ML próprio | Exige dados, avaliações e benefício comprovado |
| Manter documentos nativos separados de PDFs importados | Preservar editabilidade e evitar promessas incompatíveis |
| Não fixar datas agora | Estimar somente após dimensionamento e validação técnica |

---

## 12. Como manter o roadmap

Ao concluir uma versão:

1. Atualizar seu **status** e marcar apenas itens efetivamente verificados.
2. Registrar a versão liberada em uma tag/release no GitHub.
3. Vincular issues, testes e eventuais limitações conhecidas.
4. Ajustar prioridades seguintes com base em problemas reais e feedback de uso.
5. Nunca considerar um recurso finalizado apenas porque seu botão aparece na interface.

**Foco atual:** confirmar a estabilidade da **V1.0**, então preparar a **V1.1**. A ambição de longo prazo é o SmartLayout, mas a confiança no produto começa com a integridade dos documentos.
