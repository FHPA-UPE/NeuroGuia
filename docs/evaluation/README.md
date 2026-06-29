# Dados de Avaliação — NeuroGuia

Artefatos de avaliação do artigo **"NeuroGuia: Um Chatbot para Auxiliar Estudantes Neurodivergentes"**, submetido ao SBQS 2026 (Trilha Relatos de Experiência).

## Arquivos

### `questionario_avaliacao_respostas_anonimizado.csv`
Respostas anonimizadas do questionário de avaliação com usuários (n=7).

- **Participantes:** 7 mestrandos do PPGEC/UPE, recrutados por conveniência
- **Período:** 21–26 de junho de 2026
- **Instrumento:** 5 dimensões × 4 itens Likert (1–5) + 2 perguntas abertas
- **Anonimização:** e-mails e timestamps completos removidos; respondentes identificados como R1–R7

| Prefixo | Dimensão |
|---|---|
| C1–C4 | Comunicação |
| P1–P4 | Presença |
| T1–T4 | Confiança |
| E1–E4 | Engajamento |
| A1–A4 | Adoção |
| Q1–Q2 | Perguntas abertas |

Itens reversos (score = 6 − valor original): C2, P4, T4, E2, A2.

---

### `kappa_dataset_40questoes.csv`
Dataset de 40 perguntas submetidas ao NeuroGuia para avaliação de qualidade das respostas (Kappa de Cohen + RAGAS).

- **Estratificação:** 10 perguntas por documento-fonte (Regimento PPGEC, Normativas UPE, Norma Horas Complementares, Documentação Estágio Docência)
- **Colunas:** ID, Documento, Pergunta, Pontos_chave_resposta, Fonte, Resposta_NeuroGuia, Contextos_RAG
- **Retrieval:** BM25-only (limitação: produção usa EnsembleRetriever BM25+ChromaDB; embeddings bloqueados por quota na coleta)
- **LLM:** Gemini 2.5 Flash via LiteLLM

---

### `ragas_scores.csv`
Scores RAGAS v0.4.3 por amostra (n=40).

- **Métricas:** Faithfulness + Answer Relevancy
- **LLM juiz:** Llama 3.3 70B via Groq (strictness=1, limitação da API Groq ao parâmetro n=1)
- **Embeddings:** all-MiniLM-L6-v2 (local, HuggingFace)
- **Resultados agregados:** Faithfulness = 0,883 · Answer Relevancy = 0,708

| Coluna | Descrição |
|---|---|
| ID | Identificador da amostra (ex: R01, U05) |
| user_input | Pergunta enviada ao chatbot |
| retrieved_contexts | Chunks recuperados pelo BM25 |
| response | Resposta gerada pelo NeuroGuia |
| answer_relevancy | Score RAGAS Answer Relevancy (0–1) |
| faithfulness | Score RAGAS Faithfulness (0–1) |

## Licença

MIT — veja [LICENSE](../../LICENSE) na raiz do repositório.
