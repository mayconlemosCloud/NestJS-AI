import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
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
    }
  }

  async getInvoices() {
    return this.invoiceRepository.find({ order: { createdAt: 'DESC' } });
  }
}
