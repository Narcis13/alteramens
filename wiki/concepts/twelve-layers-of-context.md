---
title: "Twelve Layers of Context"
type: concept
category: mental-model
sources: []
entities: [personal-context-agent-project]
related: [identity-first-storage, declared-vs-observed-gap, context-decay-heuristics, authority-decay-compounding, frame-problem-retrieval, context-aware-interrupt, context-graph-as-meme, product-marketing-context, brain-ram-leverage]
maturity: seed
confidence: medium
contradictions: []
applications: []
---

# Twelve Layers of Context

Personal context isn't a single field — it's a stratified ontology. Synthesis-ul [[personal-context-agent-project|Personal Context Agent]] identifică douăsprezece straturi ortogonale, fiecare răspunzând unei alte întrebări despre „ce aduce o persoană într-un moment de decizie."

Lista nu e dogmă — e ipoteză de lucru pe care se sprijină schema produsului.

## The 12 layers

| # | Layer | Anchor question | Examples |
|---|---|---|---|
| 1 | **Identity** | Cine sunt? | Roluri, valori, traits, narativa de sine |
| 2 | **Temporal** | Când sunt? | Acum, recent, ciclic, anticipat |
| 3 | **Spatial / mediu** | Unde sunt? | Fizic, digital, social |
| 4 | **Goals** | Ce încerc să fac? | Long / mid / short timeframes |
| 5 | **Knowledge** | Ce știu / nu știu? | Expertise, skills, gaps, mental models, surse de încredere |
| 6 | **Relational** | Cine contează? | Familie, colegi, clienți, mentori, audiență |
| 7 | **Resources** | Ce am? | Timp, bani, energie, atenție, tools |
| 8 | **Constraints** | Ce nu pot / nu vreau? | Legale, etice, cognitive, taboo-uri |
| 9 | **State** | Cum sunt acum? | Mood, energie, stres, workload |
| 10 | **History** | Ce s-a întâmplat? | Decizii + outcomes, lecții, pattern-uri |
| 11 | **Aesthetic** | Ce-mi pare bun? | Style, quality bar, voice, register |
| 12 | **Epistemic stance** | Cum cred că știu? | Ce evidence accept, cum update beliefs |

## Three under-the-radar observations

1. **Layer 11 (aesthetic) is chronically underestimated.** Diferența dintre două răspunsuri *bune* e *gustul*. Codificat = leverage masiv pentru output care simte „ca tine".
2. **Layer 9 (state) is the most volatile but the most action-changing.** „Sunt obosit acum" schimbă tipul de răspuns mai mult decât „sunt admin de spital".
3. **Layer 12 (epistemic stance) is rarely captured but defining.** Un om care vrea evidence vs unul care vrea convingere e operațional altă persoană. Faber are deja `narcis-stances.md`; aici devine prim-clasă.

## Cross-layer interference

Straturile nu sunt independente — o stare de oboseală (9) restrânge resursele (7), schimbă goal-urile urmărite (4), poate slăbi stance-urile epistemice (12). Un sistem de context personal trebuie să modeleze și *interferențele*, nu doar straturile individuale. Conflatarea („totul despre tine într-o singură rubrică") face sistemul fragil — fapte stale dintr-un strat strică retrieval-ul peste tot.

## What Faber already captures

Faber's `wiki/self/*.md` acoperă parțial layer 1 (identity prin pillars), layer 5 (knowledge prin voice rules), layer 11 (aesthetic prin voice/register), layer 12 (epistemic stances). Layers 2, 3, 4, 6, 7, 8, 9, 10 sunt fie implicit, ad-hoc capturate în log, fie absent. [[personal-context-agent-project|Personal Context Agent]] extinde la toate cele 12 și le expune out-of-vault prin MCP.

## Why orthogonality matters

Each layer has its own:
- **Volatility** — identitatea slow, mood fast → cadență de refresh diferită
- **Capture mechanism** — declared vs observed vs inferred (vezi [[declared-vs-observed-gap]])
- **Decay profile** — vezi [[context-decay-heuristics]]
- **Retrieval relevance** — vezi [[frame-problem-retrieval]]

Asta înseamnă că schema de stocare nu poate fi „un singur user profile" cu câmpuri plate. Trebuie să fie entity types tipizate, cu axe meta separate, cu view-uri diferite per strat.

## Related primitives

- [[identity-first-storage]] — de ce layer 1 (Identity) e cetățean de prim rang, nu derivat din note
- [[authority-decay-compounding]] — cum proprietățile cross-cutting (authority + decay) fac sistemul să compound-eze, nu să devină noise
- [[context-aware-interrupt]] — context-ul aplicat la design de intervenții UX (popup, paywall) e versiunea reducta a aceluiași principiu
- [[context-graph-as-meme]] — context-ul ca topologie navigabilă, nu listă plată
- [[product-marketing-context]] — versiunea „context-pentru-marketing": positioning persistent, un singur document, citit de toate skill-urile
- [[brain-ram-leverage]] — implicație practică: agent-ul trebuie să primească subset filtrat per strat, nu full-dump (altfel costă RAM-ul cognitiv al operatorului)
