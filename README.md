# 🏦 Deep Finance - Kafka + Gemini AI + NestJS

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Kafka](https://img.shields.io/badge/Apache_Kafka-231F20?style=for-the-badge&logo=apache-kafka&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

Um ecossistema financeiro de alto desempenho focado em **Análise de Fraude em Tempo Real** utilizando Inteligência Artificial Generativa e arquitetura orientada a eventos.

## 📺 Demonstração em Tempo Real
Veja o sistema em ação processando faturas e detectando fraudes com o Gemini 2.0:

![Demonstração do Sistema](./demo.webp)

## 📐 Arquitetura do Sistema
O projeto utiliza um fluxo de 3 agentes independentes que se comunicam via Kafka:

```mermaid
graph LR
    A[Frontend UI<br/>Nginx] -->|1. POST| B(Producer API<br/>& WS Gateway)
    B -->|2. Event: Criada| K{Kafka<br/>Broker}
    K -->|3. Consume| C(Bank Agent<br/>Persistence)
    C -->|4. Save| S[(SQLite DB)]
    C -->|5. Event: Salva| K
    K -->|6. Consume| D(AI Agent<br/>Gemini 2.0)
    D -->|7. Analysis| G((Google AI))
    D -->|8. Update| S
    D -->|9. Event: Finalizado| K
    K -->|10. Bridge| B
    B -->|11. Real-time Push| A
```

## 🚀 Componentes
1. **`invoice-producer`**: Gateway de entrada e ponte WebSocket (Socket.io) para o Frontend.
2. **`invoice-consumer`**: Agente Bancário responsável por persistir as faturas no banco de dados.
3. **`invoice-updater`**: Agente de IA que utiliza o **Google Gemini** para detectar fraudes e atualizar o status final.
4. **`invoice-frontend`**: Interface premium que acompanha todo o processo visualmente.

## ⚙️ Como Rodar

1. Clone o repositório.
2. Configure sua `GEMINI_API_KEY` no arquivo `.env`.
3. Suba o ambiente completo:
   ```bash
   docker-compose up --build
   ```
4. Acesse: **[http://localhost:8080](http://localhost:8080)**

## 🛡️ Segurança
As chaves de API e configurações sensíveis são gerenciadas via variáveis de ambiente (`.env`) e nunca são expostas no código fonte ou imagens Docker.