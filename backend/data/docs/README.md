# Documentos para indexação RAG

Adicionar os PDFs aqui antes de rodar `scripts/indexar_docs.py`:

- LBI_13146_2015.pdf — Lei Brasileira de Inclusão
- Decreto_12686_2025.pdf — Política Nacional de Educação Especial Inclusiva  
- Portaria_MEC_3284_2003.pdf — Acessibilidade no ensino superior
- Normas_UPE_PPGEC.pdf — Regimento e diretrizes da PPGEC

Após adicionar os PDFs, executar:

```bash
cd backend
PYTHONPATH=. venv/Scripts/python scripts/indexar_docs.py
```
