import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async saveInvoice(data: any) {
    let invoiceData = data;
    if (data && data.value) invoiceData = data.value;
    else if (typeof data === 'string') {
        try { invoiceData = JSON.parse(data); } catch(e){}
    }

    // Insert only if id is present (basic check)
    if (invoiceData && invoiceData.id) {
      const invoice = this.invoiceRepository.create(invoiceData as Partial<Invoice>);
      await this.invoiceRepository.save(invoice);
      console.log('✅ Fatura persistida de forma definitiva no SQLite! ID:', invoice.id);
      
      // Emit event to notify that invoice is saved and ready for next step (Consumer 2)
      this.kafkaClient.emit('faturas.salvas', JSON.stringify(invoice));
    }
  }

  async getInvoices() {
    return this.invoiceRepository.find({ order: { createdAt: 'DESC' } });
  }
}
