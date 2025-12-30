# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e6]:
          - link "arrow_back" [ref=e7]:
            - /url: /home
            - generic [ref=e8]: arrow_back
          - heading "Comunicados" [level=1] [ref=e9]
        - generic [ref=e10]:
          - button "Todas" [ref=e11] [cursor=pointer]
          - button "Avisos" [ref=e12] [cursor=pointer]
          - button "Manutenção" [ref=e13] [cursor=pointer]
          - button "Financeiro" [ref=e14] [cursor=pointer]
          - button "Assembleia" [ref=e15] [cursor=pointer]
          - button "Segurança" [ref=e16] [cursor=pointer]
    - main [ref=e17]:
      - generic [ref=e18]:
        - generic [ref=e19]: campaign
        - heading "Nenhum comunicado" [level=3] [ref=e20]
        - paragraph [ref=e21]: Não há comunicados publicados no momento
  - region "Notifications alt+T"
  - alert [ref=e22]
```