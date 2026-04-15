---
title: "Extractable Content — Passage-First Writing"
type: concept
category: pattern
sources: [seo-skills-suite]
entities: []
related: [answer-engine-optimization, machine-readable-structure, third-party-signal, encoded-judgment, deliver-dont-promise]
maturity: developing
confidence: high
contradictions: []
applications: []
---

# Extractable Content

AI și search engines **extrag pasaje, nu pagini**. Conținutul care se citează bine este scris ca o colecție de blocuri auto-suficiente, fiecare putând fi extras și folosit standalone. Este un pattern fundamental de scriere care se aplică la blog posts, pagini de produs, documentație, tabelе de comparație și FAQs.

## Principiul

Când un AI (ChatGPT, Perplexity, Claude, AI Overviews) răspunde unei întrebări, nu citește întreaga pagină și o parafrazează — identifică **pasajul** care răspunde direct și îl extrage. Același mecanism se aplică pentru rich snippets Google, featured snippets, și passage indexing.

Concluzie: **unitatea de optimizare este pasajul, nu pagina**.

## Regulile de scriere passage-first

Din [[seo-skills-suite|ai-seo]] și [[seo-skills-suite|seo-audit]]:

1. **Lead cu răspuns direct** — nu îngropa concluzia în al treilea paragraf. Deschide cu ceea ce utilizatorul caută.
2. **Blocuri de 40-60 cuvinte** — lungimea optimă pentru snippet extraction. Suficient pentru context, scurt pentru selectare integrală.
3. **Fiecare secțiune standalone** — cineva care citește DOAR secțiunea asta trebuie să înțeleagă completul. Evită "așa cum am menționat mai sus".
4. **H2/H3 care imită întrebări reale** — nu "Caracteristici" ci "Ce face [produs] diferit de [competitor]?"
5. **Un idee per paragraf** — mai ușor de extras, mai ușor de citit.

## Tipuri de blocuri extractabile

| Tip bloc | Tipul de query | Format |
|---|---|---|
| **Definition block** | "Ce este X?" | Propoziție clară + elaborare scurtă |
| **Step-by-step block** | "Cum să X?" | Lista numerotată, un pas per item |
| **Comparison table** | "X vs Y" | Tabel structurat, coloane paralele |
| **Pros/cons block** | "E bun X?" | Două liste paralele |
| **FAQ block** | Întrebări scurte recurente | Q+A cu FAQ schema |
| **Statistic block** | "Câte/cât X?" | Număr specific + sursă citată |

## Anti-pattern-uri

- **Burst context**: un paragraf dens care amestecă definiție, exemplu, exceptie, contraexemplu. AI-ul nu știe ce să extragă.
- **Tangent paragraphs**: "Apropo, și X e interesant..." — diluează pasajul principal.
- **Marketing fluff**: "Produsul nostru revoluționar..." — AI-ul penalizează biased/promotional language în citări.
- **Gated content**: conținut după paywall — AI-ul nu poate accesa, deci nu citează.
- **PDF-only**: harder to parse, penalizat.

## Cum se măsoară

**Extractability Check** (din ai-seo):
- Clear definition în primul paragraf? ✓/✗
- Self-contained answer blocks? ✓/✗
- Statistici cu surse? ✓/✗
- Comparison tables pentru "vs" queries? ✓/✗
- FAQ section cu întrebări naturale? ✓/✗
- Schema markup (FAQ, HowTo, Article)? ✓/✗
- Updated recently (< 6 luni)? ✓/✗
- Heading structure imită pattern-urile de query? ✓/✗

Dacă scorezi < 5/8 pe pagina importantă, ai lucru de făcut înainte de alte optimizări.

## Relația cu SEO tradițional

Passage-first nu înlocuiește SEO tradițional — îl îmbunătățește. Pagini bine structurate rank-uiesc mai bine ȘI sunt extrase mai des. Princeton GEO research arată că "Fluency + Statistics" e combinația cu efectul maxim, iar site-urile low-ranking beneficiază și mai mult (+115% vizibilitate cu citații adăugate).

## Aplicație la Alteramens

Pentru orice content pe care îl publici (Faber wiki pages, blog posts, documentație proiecte):

- **FABER pages deja urmează pattern-ul**: concepts sunt blocuri standalone, syntheses sunt passage-rich. Wiki-ul e deja designed pentru extractability.
- **Pentru content public (blog, landing pages)**: aplică regulile explicit. Nu presupune că cititorul citește de la început la sfârșit.
- **Pentru documentație tehnică**: fiecare secțiune ar trebui să poată fi copy-paste dintr-un StackOverflow answer către utilizator.

## Legătura cu [[encoded-judgment]]

Blocurile extractabile încorporează judgment în formă citabilă. Un bloc "X vs Y" care conține concluzia ta expert + evidență + context e [[encoded-judgment]] în formă machine-readable. Când AI-ul îl citează, judgment-ul tău ajunge în mii de conversații.

Asta e [[distribution-over-product]] aplicat la content: scrii o dată, AI-ul distribuie la scală, dar doar dacă conținutul e extractable.

## Legătura cu alte concepte

- **[[answer-engine-optimization]]**: AEO este practica de optimizare; extractable content este tehnica fundamentală
- **[[machine-readable-structure]]**: passage-first + schema markup = paginile care se citează cel mai bine
- **[[third-party-signal]]**: chiar dacă scrii extractable, AI-ul citează deseori unde apare brand-ul tău în Wikipedia/Reddit. Extractable content e necesar, nu suficient.
- **[[deliver-dont-promise]]**: blocurile de rezultate concrete (statistici, case studies) sunt livrare, nu promisiune
