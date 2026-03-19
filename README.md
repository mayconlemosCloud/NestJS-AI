# Sistema de Faturas com Apache Kafka e NestJS

Este projeto é uma base para uma arquitetura de microsserviços orientada a eventos para um sistema de gestão de faturas, utilizando **Apache Kafka**.

## Arquitetura (Fase 1)

1. **Broker**: Apache Kafka rodando via Docker Compose acompanhado pelo Zookeeper.
2. **Producer**: Um microsserviço independente construído em **NestJS** (porta 3001) que expõe uma API REST. Ao receber um POST de criação de fatura, ele formata o objeto e publica essa mensagem de forma assíncrona no tópico Kafka `faturas.criadas`.

## Como usar

### 1. Subir o ambiente Kafka
Certifique-se de que o **Docker Desktop** está rodando na sua máquina.

Abra o terminal na pasta raiz do projeto (`NestJS-AI`) e execute:
```bash
docker compose up -d
```
Isso irá subir o Kafka na porta `9092`.

### 2. Rodar o Microsserviço Produtor (Producer)
O microserviço Produtor (`invoice-producer`) é responsável por receber as chamadas HTTP e mandar para a fila do Kafka.

Entre na pasta do microsserviço:
```bash
cd invoice-producer
```

Instale as dependências:
```bash
npm install
```

Inicie o servidor de desenvolvimento:
```bash
npm run start:dev
```
A API NestJS subirá escutando na porta **3001**. *(Aviso: No seu ambiente de código atual o NestJS já está rodando em background)*.

### 3. Testar a criação de Faturas
Com Kafka e o Producer NestJS rodando, use o Powershell para criar uma nova fatura. Abra uma nova aba no terminal e rode:

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/invoices" -Method Post -ContentType "application/json" -Body '{"amount": 150.00, "description": "Servicos de Consultoria"}' | ConvertTo-Json
```

A API deve retornar algo como:
```json
{
  "success": true,
  "message": "Invoice submitted to Kafka",
  "invoice": { ...dados da fatura... }
}
```

### 4. Verificar se a Fatura chegou na Fila
Para ter a prova real de que o Apache Kafka armazenou a mensagem internamente no tópico `faturas.criadas`, você pode ler a fila em realtime executando:

```bash
docker exec -it nestjs-ai-kafka-1 kafka-console-consumer --bootstrap-server kafka:29092 --topic faturas.criadas --from-beginning
```

---

## Como foi feito (Resumo Técnico)

A engenharia da Etapa 1 consistiu nos seguintes passos:

1. **Infraestrutura**: Criamos o arquivo `docker-compose.yml` utilizando as imagens `confluentinc/cp-kafka` e `cp-zookeeper`. Foi ajustado o port binding `9092` pra acesso local (localhost) e a infra `29092` de rede interna Docker.
2. **Scaffolding**: Utilizamos o comando `npx @nestjs/cli new invoice-producer --strict` não-interativo para gerar toda a malha inicial do projeto NestJS.
3. **Drivers**: Instalamos os drivers Kafka nativos para comunicação de microsserviços através de `npm install @nestjs/microservices kafkajs`.
4. **Bootstrapping do Tópico (`app.module.ts`)**: Registramos o cliente via injeção de dependências nativa do Nest com `ClientsModule.register`, apontando explicitamente pra broker `localhost:9092` no modo `producerOnlyMode: true`.
5. **Configuração de Portas**: Modificamos o `main.ts` para que esse Worker do Produtor suba isoladamente na Porta 3001 ao ser chamado.
6. **Mapeamento Lógico (`app.controller.ts`)**: Foi aberta uma rota `@Post()` limpa para interceptar os pagamentos e enviar o payload para a classe de serviço.
7. **Integração do Evento (`app.service.ts`)**: A classe puxa a ref (`ClientKafka`) injetada via `@Inject`. Também implementamos a Lifecycle interop `OnModuleInit` e invocar `await this.kafkaClient.connect()`. Assim que a rota REST recebe os dados, o serviço adiciona data e serializa JSON por cima da função de push pra fila: `this.kafkaClient.emit('faturas.criadas', payload)`.