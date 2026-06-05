# Spec: Chapéu de Formatura Marinho — OllieAvatar

**Data:** 2026-05-25  
**Arquivo alvo:** `src/components/OllieAvatar/OllieAvatar.tsx`

## Objetivo

Tornar o chapéu de formatura do Ollie visualmente distinto do corpo, usando azul-marinho acadêmico com detalhes dourados. Nenhuma geometria SVG muda — apenas valores de cor.

## Decisões

| Elemento | Atual | Novo |
|---|---|---|
| `ollieHatGrad` stop 0% | `#EAB028` | `#2A3F7E` |
| `ollieHatGrad` stop 55% | `#C27C14` | `#1A2B5C` |
| `ollieHatGrad` stop 100% | `#8A5005` | `#0D1A3A` |
| Stroke coroa/aba | `#3D2000` | `#0A1020` |
| Faixa (band) fill | `#F5F0E5` | `#E8B020` |
| Faixa (band) stroke | `#D8C890` | `#C27A00` |
| Brim shadow fill | `#3D2000` | `#0A1020` |
| Tassel fio (line stroke) | `#6A3400` | `#E8B020` |
| Tassel bola ext (r=9) | `#6A3400` | `#D4900A` |
| Tassel bola int (r=5) | `#9A4E06` | `#F0C040` |

## Rationale de acessibilidade (neurodivergentes)

- Azul-marinho profundo tem contraste alto com o âmbar do corpo (sem sobrecarga sensorial)
- Dourado da borla é familiar ao contexto acadêmico e consistente com os pés/bico do Ollie
- Duas cores novas apenas (marinho + dourado) — não sobrecarrega a leitura visual
- Sem vermelho/verde puro — seguro para daltonismo

## Fora do escopo

- Geometria SVG (coordenadas, formas) — não muda
- Expressões/animações — não afetadas
- Outros componentes
