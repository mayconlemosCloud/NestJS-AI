import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { ClientKafka } from '@nestjs/microservices';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY não foi encontrada nas variáveis de ambiente!');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'OFFLINE');
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async processInvoice(data: any) {
    let invoiceData = data;
    if (data && data.value) invoiceData = data.value;
    else if (typeof data === 'string') {
      try { invoiceData = JSON.parse(data); } catch (e) { }
    }

    if (!invoiceData || !invoiceData.id) return;

    this.logger.log(`🔍 Iniciando análise de IA para Fatura: ${invoiceData.id}`);

    try {
      // Prompt para o Gemini analisar a fatura
      const prompt = `Analise esta transação financeira para detecção de fraude. 
      Valor: R$ ${invoiceData.amount}
      Descrição: "${invoiceData.description}"
      
      Responda APENAS um JSON no formato: 
      { "isFraud": boolean, "score": number, "reason": "string em português" }
      Onde score é de 0 a 100 (risco).`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Limpeza básica do JSON caso a IA envie markdown
      const jsonStr = text.replace(/```json|```/g, '').trim();
      const aiResult = JSON.parse(jsonStr);

      this.logger.log(`🤖 Resultado IA: Score ${aiResult.score} - ${aiResult.reason}`);

      // Atualiza no Banco de Dados
      const invoice = await this.invoiceRepository.findOne({ where: { id: invoiceData.id } });
      if (invoice) {
        invoice.status = aiResult.isFraud ? 'FRAUD_DETECTED' : 'PROCESSADA';
        // Adicionamos o motivo da IA no status ou em um campo novo se quisermos, 
        // mas para manter simples vamos usar o status
        await this.invoiceRepository.save(invoice);

        // Emite o evento final
        const finalPayload = {
          ...invoiceData,
          status: invoice.status,
          aiAnalysis: aiResult
        };
        this.kafkaClient.emit('faturas.processadas', JSON.stringify(finalPayload));
        this.logger.log(`✅ Fatura ${invoiceData.id} finalizada como ${invoice.status}`);
      }
    } catch (error) {
      this.logger.error('Erro na análise de IA:', error.message);
      // Fallback em caso de erro na API de IA (ex: quota exceeded)
      this.kafkaClient.emit('faturas.processadas', JSON.stringify({ 
          ...invoiceData, 
          status: 'PROCESSADA', 
          aiOffline: true,
          error: error.message 
      }));
    }
  }
}
