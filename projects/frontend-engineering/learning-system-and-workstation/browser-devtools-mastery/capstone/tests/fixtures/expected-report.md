# Performance triage report

Checked: har, trace, lighthouse. Budget failures: 10.

## Ranked findings

1. **FAIL** [har, recorded] Request got no response, about 5000 ms
   GET https://metrics.example/collect never answered; it was blocked for 5000 ms.
2. **FAIL** [lighthouse, simulated] Largest Contentful Paint over budget, about 1600 ms
   Largest Contentful Paint is 4100 ms (budget 2500 ms).
3. **FAIL** [har, recorded] Slow server response, about 650 ms
   GET https://shop.example/api/cart waited 1450 ms for the first byte (budget 800 ms).
4. **FAIL** [trace, recorded] Long task, about 270 ms
   A task at 300 ms ran 320 ms (budget 200 ms).
5. **FAIL** [lighthouse, simulated] Total Blocking Time over budget, about 220 ms
   Total Blocking Time is 520 ms (budget 300 ms).
6. **FAIL** [trace, recorded] Main thread blocked too long, about 100 ms
   Long tasks blocked the main thread for 400 ms (budget 300 ms).
7. **FAIL** [har, recorded] Page is too heavy
   The page transferred 1654000 bytes (budget 1500000).
8. **FAIL** [lighthouse, simulated] Cumulative Layout Shift over budget
   Cumulative Layout Shift is 0.120 (budget 0.1).
9. **FAIL** [lighthouse, simulated] Performance score too low
   The score is 0.62 (minimum 0.9).
10. **FAIL** [trace, recorded] Layout shifts
   Layout shift score is 0.120 (budget 0.1).
11. **INFO** [lighthouse, simulated] Efficiently encode images, about 800 ms
   Lighthouse estimates 800 ms saved.
12. **INFO** [lighthouse, simulated] Eliminate render-blocking resources, about 300 ms
   Lighthouse estimates 300 ms saved.
13. **INFO** [trace, recorded] Tasks over 50 ms
   2 more tasks ran over 50 ms but within the budget.
