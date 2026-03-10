export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceData {
  issuerName: string;
  issuerNif: string;
  issuerAddress: string;
  issuerEmail: string;
  issuerPhone: string;
  
  clientName: string;
  clientNif: string;
  clientAddress: string;
  clientEmail: string;
  
  invoiceNumber: string;
  invoiceSeries: string;
  invoiceDate: string;
  
  items: InvoiceItem[];
  
  ivaRate: number;
  irpfRate: number;
  
  paymentMethod: string;
  notes: string;
}

export const DEFAULT_INVOICE: InvoiceData = {
  issuerName: '',
  issuerNif: '',
  issuerAddress: '',
  issuerEmail: '',
  issuerPhone: '',
  
  clientName: '',
  clientNif: '',
  clientAddress: '',
  clientEmail: '',
  
  invoiceNumber: '001',
  invoiceSeries: new Date().getFullYear().toString(),
  invoiceDate: new Date().toISOString().split('T')[0],
  
  items: [
    { id: '1', description: 'Servicios profesionales', quantity: 1, unitPrice: 0 }
  ],
  
  ivaRate: 21,
  irpfRate: 15,
  
  paymentMethod: 'Transferencia bancaria',
  notes: ''
};
