import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  FileText, 
  User, 
  Building2, 
  Calendar, 
  Hash, 
  Euro, 
  Info,
  CheckCircle2,
  Printer,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { InvoiceData, InvoiceItem, DEFAULT_INVOICE } from './types';

export default function App() {
  const [data, setData] = useState<InvoiceData>(DEFAULT_INVOICE);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Calculations
  const totals = useMemo(() => {
    const baseImponible = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const ivaAmount = baseImponible * (data.ivaRate / 100);
    const irpfAmount = baseImponible * (data.irpfRate / 100);
    const total = baseImponible + ivaAmount - irpfAmount;

    return {
      baseImponible,
      ivaAmount,
      irpfAmount,
      total
    };
  }, [data.items, data.ivaRate, data.irpfRate]);

  // QR Code URL (Veri*factu placeholder)
  const qrUrl = useMemo(() => {
    const baseUrl = "https://www2.agenciatributaria.gob.es/wlpl/SIVA-ITBA/VerificarFactura";
    const params = new URLSearchParams({
      nif: data.issuerNif,
      numfactura: `${data.invoiceSeries}-${data.invoiceNumber}`,
      fecha: data.invoiceDate,
      importe: totals.total.toFixed(2)
    });
    return `${baseUrl}?${params.toString()}`;
  }, [data.issuerNif, data.invoiceNumber, data.invoiceSeries, data.invoiceDate, totals.total]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addItem = () => {
    setData(prev => ({
      ...prev,
      items: [...prev.items, { id: Math.random().toString(36).substr(2, 9), description: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const removeItem = (id: string) => {
    if (data.items.length > 1) {
      setData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }));
    }
  };

  const exportPDF = async () => {
    if (!invoiceRef.current) return;
    
    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Factura_${data.invoiceSeries}_${data.invoiceNumber}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Form Section */}
        <div className="space-y-6">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Factura Autonomo Pro</h1>
              <p className="text-slate-500 mt-1">Generador de facturas con normativa Veri*factu</p>
            </div>
            <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <CheckCircle2 size={16} />
              Normativa 2025
            </div>
          </header>

          {/* Issuer Data */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
              <User size={20} className="text-indigo-600" />
              <h2>Mis Datos (Emisor)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre / Razón Social</label>
                <input 
                  type="text" name="issuerName" value={data.issuerName} onChange={handleInputChange}
                  placeholder="Tu nombre completo"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">NIF / CIF</label>
                <input 
                  type="text" name="issuerNif" value={data.issuerNif} onChange={handleInputChange}
                  placeholder="12345678X"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dirección Fiscal</label>
                <input 
                  type="text" name="issuerAddress" value={data.issuerAddress} onChange={handleInputChange}
                  placeholder="Calle, Número, CP, Ciudad"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Client Data */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
              <Building2 size={20} className="text-indigo-600" />
              <h2>Datos del Cliente (Receptor)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre Cliente</label>
                <input 
                  type="text" name="clientName" value={data.clientName} onChange={handleInputChange}
                  placeholder="Nombre de la empresa o cliente"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">NIF / CIF Cliente</label>
                <input 
                  type="text" name="clientNif" value={data.clientNif} onChange={handleInputChange}
                  placeholder="B12345678"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dirección Cliente</label>
                <input 
                  type="text" name="clientAddress" value={data.clientAddress} onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Invoice Details */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
              <FileText size={20} className="text-indigo-600" />
              <h2>Detalles de la Factura</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Serie</label>
                <input 
                  type="text" name="invoiceSeries" value={data.invoiceSeries} onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Número</label>
                <input 
                  type="text" name="invoiceNumber" value={data.invoiceNumber} onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</label>
                <input 
                  type="date" name="invoiceDate" value={data.invoiceDate} onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Items */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Hash size={20} className="text-indigo-600" />
                <h2>Conceptos</h2>
              </div>
              <button 
                onClick={addItem}
                className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
              >
                <Plus size={16} /> Añadir
              </button>
            </div>
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {data.items.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="grid grid-cols-12 gap-3 items-end"
                  >
                    <div className="col-span-6 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Descripción</label>
                      <input 
                        type="text" value={item.description} 
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        placeholder="Ej: Consultoría web"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Cant.</label>
                      <input 
                        type="number" value={item.quantity} 
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Precio</label>
                      <input 
                        type="number" value={item.unitPrice} 
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      />
                    </div>
                    <div className="col-span-1 pb-1">
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Taxes & Payment */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
              <Euro size={20} className="text-indigo-600" />
              <h2>Impuestos y Pago</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">IVA (%)</label>
                  <select 
                    name="ivaRate" value={data.ivaRate} onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option value={21}>21% (General)</option>
                    <option value={10}>10% (Reducido)</option>
                    <option value={4}>4% (Superreducido)</option>
                    <option value={0}>0% (Exento)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">IRPF (%)</label>
                  <select 
                    name="irpfRate" value={data.irpfRate} onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option value={15}>15% (General)</option>
                    <option value={7}>7% (Nuevos autónomos)</option>
                    <option value={0}>0% (No aplica)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Método de Pago</label>
                  <input 
                    type="text" name="paymentMethod" value={data.paymentMethod} onChange={handleInputChange}
                    placeholder="Ej: Transferencia ES12 3456..."
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notas / Observaciones</label>
                  <textarea 
                    name="notes" value={data.notes} onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Preview Section */}
        <div className="lg:sticky lg:top-8 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <Printer size={20} /> Vista Previa
            </h2>
            <button 
              onClick={exportPDF}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              <Download size={18} /> Descargar PDF
            </button>
          </div>

          {/* Invoice Document */}
          <div 
            ref={invoiceRef}
            className="bg-white shadow-2xl rounded-sm aspect-[1/1.414] w-full p-12 text-slate-800 flex flex-col overflow-hidden"
            style={{ minHeight: '842px' }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
              <div className="space-y-1">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mb-4">
                  <FileText size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Factura</h3>
                <p className="text-slate-500 font-medium">#{data.invoiceSeries}/{data.invoiceNumber}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Fecha de Emisión</p>
                <p className="font-semibold">{format(new Date(data.invoiceDate), 'dd MMMM yyyy', { locale: es })}</p>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-2 gap-12 mb-12">
              <div className="space-y-3">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Emisor</p>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">{data.issuerName || 'Tu Nombre'}</p>
                  <p className="text-sm text-slate-600 flex items-center gap-1.5"><Info size={14} /> {data.issuerNif || 'NIF'}</p>
                  <p className="text-sm text-slate-600 flex items-start gap-1.5"><MapPin size={14} className="mt-0.5 shrink-0" /> {data.issuerAddress || 'Tu Dirección'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Cliente</p>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">{data.clientName || 'Nombre del Cliente'}</p>
                  <p className="text-sm text-slate-600 flex items-center gap-1.5"><Info size={14} /> {data.clientNif || 'NIF Cliente'}</p>
                  <p className="text-sm text-slate-600 flex items-start gap-1.5"><MapPin size={14} className="mt-0.5 shrink-0" /> {data.clientAddress || 'Dirección Cliente'}</p>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="flex-grow">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Descripción</th>
                    <th className="py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Cant.</th>
                    <th className="py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Precio</th>
                    <th className="py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4 text-sm font-medium text-slate-700">{item.description || 'Sin descripción'}</td>
                      <td className="py-4 text-sm text-slate-600 text-center">{item.quantity}</td>
                      <td className="py-4 text-sm text-slate-600 text-right">{item.unitPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td>
                      <td className="py-4 text-sm font-bold text-slate-900 text-right">{(item.quantity * item.unitPrice).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer / Totals */}
            <div className="mt-12 pt-8 border-t-2 border-slate-100 flex justify-between items-end">
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Método de Pago</p>
                  <p className="text-sm font-medium text-slate-700">{data.paymentMethod}</p>
                </div>
                {data.notes && (
                  <div className="max-w-xs">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Notas</p>
                    <p className="text-xs text-slate-500 leading-relaxed italic">"{data.notes}"</p>
                  </div>
                )}
                {/* Veri*factu QR & Text */}
                <div className="flex items-center gap-4 mt-8">
                  <div className="p-1 bg-white border border-slate-200 rounded">
                    <QRCodeSVG value={qrUrl} size={64} level="M" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium leading-tight uppercase">
                    Factura verificable en la sede<br />electrónica de la AEAT<br />
                    <span className="text-slate-600 font-bold">VERI*FACTU</span>
                  </div>
                </div>
              </div>

              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Base Imponible</span>
                  <span className="font-medium">{totals.baseImponible.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">IVA ({data.ivaRate}%)</span>
                  <span className="font-medium">{totals.ivaAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                </div>
                {data.irpfRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Retención IRPF ({data.irpfRate}%)</span>
                    <span className="font-medium text-rose-600">-{totals.irpfAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="text-lg font-bold text-slate-900 uppercase tracking-tight">Total</span>
                  <span className="text-2xl font-black text-indigo-600">{totals.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
