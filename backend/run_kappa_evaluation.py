"""
Script de coleta automatizada para protocolo Kappa + RAGAS do NeuroGuia.

Uso:
    # Servidor local (default):
    python run_kappa_evaluation.py

    # Servidor Railway:
    NEUROGUIA_URL=https://seu-projeto.railway.app python run_kappa_evaluation.py

Pré-requisito: servidor NeuroGuia rodando e acessível no BASE_URL.
"""

import csv
import json
import os
import sys
import time

import requests

BASE_URL = os.getenv("NEUROGUIA_URL", "http://localhost:8000").rstrip("/")

CSV_INPUT = os.getenv(
    "CSV_INPUT",
    r"C:\Users\FHPA\AppData\Local\Temp\claude\C--WINDOWS-System32\944a0bbf-7a86-4fd5-a721-c21fa6f8fca8\scratchpad\neuroguia_kappa_ragas_questionnaire.csv",
)

CSV_OUTPUT = os.path.join(
    os.path.dirname(CSV_INPUT),
    "neuroguia_kappa_ragas_results.csv",
)

DELAY_BETWEEN_REQUESTS = 2  # segundos — evita rate limit


def parse_sse(response: requests.Response) -> dict | None:
    for line in response.iter_lines():
        if not line:
            continue
        decoded = line.decode("utf-8")
        if decoded.startswith("data: "):
            try:
                return json.loads(decoded[6:])
            except json.JSONDecodeError:
                continue
    return None


def submit_question(pergunta: str) -> tuple[str, list[str]]:
    try:
        resp = requests.post(
            f"{BASE_URL}/chat",
            json={"message": pergunta, "history": []},
            stream=True,
            timeout=60,
        )
        resp.raise_for_status()
        data = parse_sse(resp)
        if data is None:
            return "ERRO: resposta SSE vazia", []
        return data.get("message", ""), data.get("contexts") or []
    except requests.exceptions.ConnectionError:
        return f"ERRO: servidor indisponivel em {BASE_URL}", []
    except requests.exceptions.Timeout:
        return "ERRO: timeout (60s)", []
    except Exception as e:
        return f"ERRO: {e}", []


def main():
    print(f"Servidor: {BASE_URL}")
    print(f"Input:    {CSV_INPUT}")
    print(f"Output:   {CSV_OUTPUT}")
    print()

    # Verificar conectividade antes de começar
    try:
        requests.get(BASE_URL, timeout=5)
    except Exception:
        print(f"ERRO: nao foi possivel conectar em {BASE_URL}")
        print("Inicie o servidor com: uvicorn app.main:app --port 8000")
        sys.exit(1)

    # Ler perguntas
    with open(CSV_INPUT, encoding="utf-8") as f:
        questions = list(csv.DictReader(f))

    print(f"{len(questions)} perguntas carregadas.\n")

    results = []
    errors = 0

    for i, q in enumerate(questions, 1):
        pergunta = q["Pergunta"]
        print(f"[{i:02d}/40] {q['ID']} — {pergunta[:70]}...")

        resposta, contexts = submit_question(pergunta)

        if resposta.startswith("ERRO"):
            print(f"       {resposta}")
            errors += 1
        else:
            print(f"       Resposta: {resposta[:80]}...")
            print(f"       Chunks:   {len(contexts)}")

        results.append({
            **q,
            "Resposta_NeuroGuia": resposta,
            "Contextos_RAG": json.dumps(contexts, ensure_ascii=False),
            "D1_Avaliador1": "",
            "D1_Avaliador2": "",
            "D2_Avaliador1": "",
            "D2_Avaliador2": "",
        })

        if i < len(questions):
            time.sleep(DELAY_BETWEEN_REQUESTS)

    # Gravar CSV de saída
    fieldnames = (
        list(questions[0].keys())
        + ["Resposta_NeuroGuia", "Contextos_RAG",
           "D1_Avaliador1", "D1_Avaliador2",
           "D2_Avaliador1", "D2_Avaliador2"]
    )

    with open(CSV_OUTPUT, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)

    print(f"\n{'='*60}")
    print(f"Concluido: {len(results)} perguntas | {errors} erros")
    print(f"Arquivo salvo: {CSV_OUTPUT}")
    if errors:
        print(f"ATENCAO: {errors} perguntas retornaram erro — verifique o servidor.")


if __name__ == "__main__":
    main()
