# University Success Analysis

A Power BI project exploring what drives university success across the world's leading ranking systems. The analysis blends three major rankings — Times Higher Education, Shanghai Ranking, and the Center for World University Rankings (CWUR) — with institution-level data on enrolment, staff ratios, internationalisation, and gender composition to surface the factors that consistently separate top-performing universities from the rest.

## Project Overview

Different ranking bodies weigh different things. THE rewards teaching quality, research volume, and citations; Shanghai leans heavily on research output and Nobel/Fields alumni; CWUR emphasizes quality of education and alumni employment. This project asks:

- Which universities rank consistently well across all three systems, and which are specialists in one?
- How much do country, size, and student-staff ratio actually correlate with rank?
- How have rankings shifted over time, and which institutions are rising or falling?
- How do internationalisation and female student share relate to ranking outcomes?

The final deliverable is a fully interactive Power BI dashboard that lets the viewer drill from a global summary down to a single institution across the full time series.

## Dataset

The project uses a six-table relational dataset covering global university rankings from 2011 onward.

| File | What it contains |
|---|---|
| `country.csv` | Country reference table (id, country_name) |
| `university.csv` | Universities keyed to a country (id, country_id, university_name) |
| `ranking_system.csv` | The three ranking bodies: Times Higher Education, Shanghai, CWUR |
| `ranking_criteria.csv` | 21 criteria across the three systems (Teaching, Research, Citations, Alumni, HiCi, Quality of Education, etc.) |
| `university_year.csv` | Year-by-year institution facts: student count, student-staff ratio, % international students, % female students |
| `university_ranking_year.csv` | The fact table — score per university × criterion × year |

The data model is a classic star-ish schema: `university_ranking_year` is the fact table, linked to dimension tables for university, criterion, year, and (transitively) country and ranking system.

## Key Dashboard Features

- **Global Overview** — World map shading countries by the number of top-ranked institutions they host, with year slider to watch leadership shift over time.
- **Ranking System Comparison** — Side-by-side view of where the same university places under THE vs. Shanghai vs. CWUR, making each system's "bias" visible.
- **Criterion Deep-Dive** — Drill into a specific criterion (e.g. Citations, Alumni Employment) to see the leaders, year-over-year movement, and gaps between peer institutions.
- **Country Enhanced View** — Country-level aggregates: average rank, number of ranked universities, share of global top 100, internationalisation metrics.
- **Institution Profile** — Single-university view showing full criterion-by-criterion scores across all three systems, enrolment and staff trends, and position over time.
- **Fully Interactive Filters** — Filter by country, ranking system, year range, and institution size; every visual on the page responds.

## Tech Stack

- **Platform:** Microsoft Power BI Desktop
- **Visuals:** Mix of native Power BI visuals and five custom `.pbiviz` visuals iterated across versions (Basic, Light, Light v2, Country-Enhanced v4, Fully-Interactive v5)
- **Modelling:** Star-schema relational model inside Power BI, with DAX measures for rolling year-over-year comparisons, cross-system rank averaging, and country aggregations
- **Data format:** CSV source files

## Project Structure

```
Universioty Sucess Analysis/
├── country.csv                                   # Country dimension
├── university.csv                                # University dimension
├── ranking_system.csv                            # Ranking bodies
├── ranking_criteria.csv                          # Criteria per ranking body
├── university_year.csv                           # Yearly institution facts
├── university_ranking_year.csv                   # Fact table (scores)
│
├── UniversitySucessAnalysis.pbix                 # Main Power BI report
│
├── UniversitySuccessAnalysis.pbiviz              # Custom visual — original
├── UniversitySuccessAnalysis_Light.pbiviz        # Custom visual — light theme
├── UniversitySuccess_Light_v2.pbiviz             # Custom visual — light v2
├── UniversitySuccess_v4_Country_Enhanced.pbiviz  # Custom visual — country-enhanced
├── UniversitySuccess_v5_FullyInteractive.pbiviz  # Custom visual — final interactive
│
└── UniversitySuccess_Dashboard_Documentation.docx # Written documentation
```

## How to Open

1. Install [Microsoft Power BI Desktop](https://powerbi.microsoft.com/en-us/desktop/) (free).
2. Open `UniversitySucessAnalysis.pbix`.
3. If prompted, refresh the data connection so the CSVs load from the folder.
4. To use the custom visuals: in Power BI, go to **Visualizations → ... → Import a visual from a file** and load any of the `.pbiviz` files you want to try. The `v5_FullyInteractive` is the recommended final version.
5. Read `UniversitySuccess_Dashboard_Documentation.docx` for the full design walkthrough, measure definitions, and intended analytical questions.

## Key Insights

A few patterns the dashboard surfaces:

- **Anglo-American dominance at the very top.** US and UK institutions occupy most of the global top-20 slots across all three ranking systems, but the composition of that top-20 differs meaningfully between Shanghai and CWUR vs. THE.
- **Ranking system bias is real and measurable.** Several universities sit 30+ positions higher in one system than another — a strong signal that methodology, not absolute quality, is driving a meaningful chunk of any single ranking.
- **Student-staff ratio correlates with rank, but with diminishing returns.** Very high ratios consistently hurt ranking outcomes, but once a university is below a certain threshold, further reductions buy very little additional rank.
- **Internationalisation is a differentiator at the top.** Top-50 universities skew markedly more international in their student body than the 50–200 band, even within the same country.

## About

Part of my broader [Data Analysis Portfolio](https://github.com/anushkabhattarai/Data-Analysis-Portfolio). I'm a data & business analyst focused on turning relational datasets into clear, decision-ready dashboards — across Power BI, SQL, Python, and web-based visualization.

- **Email:** anushkabhattarai@gmail.com
- **LinkedIn:** https://www.linkedin.com/in/anushka-bhattarai-789aa5238/
- **Portfolio website:** https://anneushka.my.canva.site/data-analyst-portfolio
