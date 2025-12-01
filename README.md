# Bernoulli RM - Front
Aplicação front-end construída com React + TS (e agora VITE), consumindo dados do TBC através do consultas sql e webservices.
Os arquivos buildados são estáticos, sem dependencia de Node para produção. Prontos para serem servidos por qualquer servidor web, sem backend.

## Arquitetura
React, Typescript, Vite, Redux para controlar estados, Router DOM para rotas, scss e bootrstrap para estilo, e Axios para comunicação com API interna.


### Ambiente desenvolvimento
npm install
npm run dev


### Build para producao
npm run build

Gera a pasta dist/
Essa pasta ja é auto-suficiente, não precisa mais de interpretador.


### Publicacao
