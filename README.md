# CaseCellShop - API

API para CaseCellShop, loja virtual simples e objetiva para vendas de capinhas de celular.

## Tecnologias

<p>
  <img src='https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white' alt="Node"/>
  
  <img src='https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white' alt="Express" />
  
  <img src='https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white' alt="TypeScript" />
    
  <img src='https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white' alt='Jest' />

</p>

## Como rodar o projeto

1. Clone o repositório

```
git clone git@github.com:acolima/case-cell-back.git
```

2. Vá até a pasta do projeto

```
cd case-cell-back
```

3. Instale as dependências

```
npm install
```

4. Crie um arquivo `.env` na raiz do projeto (veja `.env.example`) com as variáveis de ambiente

```
PORT=
```

5. Inicie o servidor com

```
npm run dev
```

6. Rodar os testes

```
npm run test
```
## Decisões Técnicas
- Arquitetura em Camadas: código estruturado separando rotas, regras de negócio e definições de tipo.
- Dados em Memória: afim de agilizar a fase inicial de desenvolvimento e focar nas regras de negócio, o dados são salvos em memória utilizando Arrays e Maps.
- Controle de Idempotência: implementado no ordersService para garantir que um pedido não seja cobrado duas vezes.
- Testes Unitários: testes cobrindo as regras mais críticas do sistema, utilizando Mocks para isolar os serviços testados.
- Reserva de Carrinho com TTL: implementação de uma estrutura com TTL (Time-to-Live) para os itens no carrinho, garantindo que dois usuários reservem o mesmo produto. Além disso, garante que produtos não fiquem "presos" nas reservas e retornem ao estoque se a compra não for concluída.

## Limitações Atuais
- Volatilidade dos Dados: como os dados são persistidos em memória, todo o catálogo, histórico de pedidos e estado dos carrinhos são resetados sempre que o servidor é reiniciado.
- Simulação de ERP/Gateway: a comunicação com o sistema externo de pagamento ou ERP é apenas simulada, não efetuando transações reais.
- Autenticação: o sistema de clientes baseia-se em um clientId gerado pelo front-end.

## Próximos Passos
[ ] Integrar um banco de dados relacional (PostgreSQL) utilizando o Prisma ORM para persistência definitiva.

[ ] Criar documentação interativa das rotas da API utilizando Swagger/OpenAPI.

[ ] Implementar autenticação de usuários (JWT) para proteger a rota de histórico de pedidos.

## Sobre mim

<img src='https://avatars.githubusercontent.com/acolima' width='150px'/>

<p>
  <a href='https://www.linkedin.com/in/ana-caroline-oliveira-lima/'>
    <img src='https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white' alt='LinkedIn' />
  </a>
  <a href='mailto:acolima@gmail.com'>
    <img src='https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white' alt='Gmail' />
  </a>
</p>
