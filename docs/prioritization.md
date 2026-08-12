# Prioritization model

Each dimension is user-configurable on a 0–5 scale:

```text
priority = impact×3 + urgency×2.5 + dependency_unlock×2
           + staleness − risk×1.5 − effort
```

The dashboard displays the exact substituted equation for every top recommendation. Impact receives the largest weight; urgency and dependency unlock distinguish important work that is timely or frees other work. Staleness raises forgotten work modestly. Risk and effort subtract from near-term attractiveness without claiming the work is unimportant.

Verified and abandoned work is excluded from next-project ranking. Ties sort by project name, making results deterministic. These scores guide attention; they do not authorize action.
