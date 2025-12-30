# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - link "arrow_back" [ref=e7]:
            - /url: /home
            - generic [ref=e8]: arrow_back
          - heading "Minhas Ocorrências" [level=1] [ref=e9]
        - button "add Nova" [ref=e10] [cursor=pointer]:
          - generic [ref=e11]: add
          - text: Nova
    - main [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]: report
        - heading "Nenhuma ocorrência" [level=3] [ref=e15]
        - paragraph [ref=e16]: Registre problemas para o síndico resolver
        - button "Registrar Ocorrência" [ref=e17] [cursor=pointer]
  - region "Notifications alt+T"
  - alert [ref=e18]
```