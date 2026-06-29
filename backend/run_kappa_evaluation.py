"""
Script de coleta automatizada para protocolo Kappa + RAGAS do NeuroGuia.

Uso:
    NEUROGUIA_URL=https://seu-projeto.railway.app \
    NEUROGUIA_USER=admin \
    NEUROGUIA_PASS=senha \
    python run_kappa_evaluation.py
"""

import csv
import getpass
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

DELAY_BETWEEN_REQUESTS = 2


def login() -> str:
    username = os.getenv("NEUROGUIA_USER") or input("Usuário NeuroGuia: ")
    password = os.getenv("NEUROGUIA_PASS") or getpass.getpass("Senha: ")
    resp = requests.post(
        f"{BASE_URL}/auth/login",
        json={"username": username, "password": password},
        timeout=15,
    )
    if resp.status_code != 200:
        print(f"ERRO login: {resp.status_code} — {resp.text}")
        sys.exit(1)
    token = resp.json()["access_token"]
    print("Login OK\n")
    return token


def submit_question(pergunta: str, token: str) -> tuple[str, list[str]]:
    try:
        resp = requests.post(
            f"{BASE_URL}/chat",
            json={"message": pergunta, "history": []},
            headers={"Authorization": f"Bearer {token}"},
            stream=True,
            timeout=60,
        )
        resp.raise_for_status()

        resposta = ""
        contexts: list[str] = []

        for line in resp.iter_lines():
            if not line:
                continue
            decoded = line.decode("utf-8")
            if decoded.startswith("data:"):
                payload = decoded[5:].strip()
                if not payload or payload == "{}":
                    continue
                try:
                    data = json.loads(payload)
                    resposta = data.get("message", "")
                    contexts = data.get("contexts") or []
                except json.JSONDecodeError:
                    continue

        if not resposta:
            return "ERRO: resposta vazia", []
        return resposta, contexts

    except requests.exceptions.ConnectionError:
        return f"ERRO: servidor indisponivel em {BASE_URL}", []
    except requests.exceptions.Timeout:
        return "ERRO: timeout (60s)", []
    except Exception as e:
        return f"ERRO: {e}", []


def main():
    print(f"Servidor: {BASE_URL}")
    print(f"Input:    {CSV_INPUT}")
    print(f"Output:   {CSV_OUTPUT}\n")

    try:
        requests.get(BASE_URL, timeout=5)
    except Exception:
        print(f"ERRO: nao foi possivel conectar em {BASE_URL}")
        sys.exit(1)

    token = login()

    with open(CSV_INPUT, encoding="utf-8") as f:
        questions = list(csv.DictReader(f))

    print(f"{len(questions)} perguntas carregadas.\n")

    results = []
    errors = 0

    for i, q in enumerate(questions, 1):
        pergunta = q["Pergunta"]
        print(f"[{i:02d}/40] {q['ID']} — {pergunta[:70]}...")

        resposta, contexts = submit_question(pergunta, token)

        if resposta.startswith("ERRO"):
            print(f"         {resposta}")
            errors += 1
        else:
            print(f"         Resposta: {resposta[:80]}...")
            print(f"         Chunks:   {len(contexts)}")

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
        print(f"ATENCAO: {errors} perguntas com erro.")


if __name__ == "__main__":
    main()
