interface PrintInvoiceOptions {
  type: "sales" | "purchase";
  id: number;
  date: string;
  supplier?: string;
  items: { productName: string; quantity: number; price?: number; cost?: number }[];
  discount?: number;
  total: number;
  paid: number;
  paymentMethod: string;
}

export function printInvoice(opts: PrintInvoiceOptions) {
  const remaining = opts.total - opts.paid;
  const itemRows = opts.items
    .map(
      (it) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #e5e0d8">${it.productName}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e0d8;text-align:center">${it.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e0d8;text-align:center">${it.price ?? it.cost}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e0d8;text-align:center">${it.quantity * (it.price ?? it.cost ?? 0)}</td>
        </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>فاتورة #${opts.id}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Cairo',sans-serif; padding:20px; color:#3a2a1a; background:#fff; }
    .header { text-align:center; margin-bottom:24px; border-bottom:3px solid #c8a84e; padding-bottom:16px; }
    .header h1 { font-size:28px; color:#5C3D2E; margin-bottom:4px; }
    .header p { font-size:13px; color:#8b7355; }
    .info { display:flex; justify-content:space-between; margin-bottom:16px; font-size:14px; }
    .info div { line-height:1.8; }
    table { width:100%; border-collapse:collapse; margin-bottom:16px; }
    thead { background:#f5f0eb; }
    th { padding:10px 8px; text-align:right; font-weight:600; border-bottom:2px solid #c8a84e; font-size:14px; }
    .totals { text-align:left; font-size:15px; line-height:2; }
    .totals .total { font-size:18px; font-weight:700; color:#5C3D2E; }
    .footer { margin-top:32px; text-align:center; font-size:12px; color:#8b7355; border-top:1px solid #e5e0d8; padding-top:12px; }
    @media print { body { padding:0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>معرض البركة</h1>
    <p>القبابات - اطفيح - الجيزة - بجوار مسجد الشوربجي</p>
    <p>هاتف: +20 11 40796253 | الإدارة: المهندس أحمد محسن</p>
  </div>

  <div class="info">
    <div>
      <strong>${opts.type === "sales" ? "فاتورة مبيعات" : "فاتورة شراء"}</strong><br/>
      رقم الفاتورة: #${opts.id}<br/>
      التاريخ: ${opts.date}
    </div>
    <div>
      ${opts.supplier ? `المورد: ${opts.supplier}<br/>` : ""}
      طريقة الدفع: ${opts.paymentMethod}
    </div>
  </div>

  <table>
    <thead><tr><th>المنتج</th><th style="text-align:center">الكمية</th><th style="text-align:center">السعر</th><th style="text-align:center">المجموع</th></tr></thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="totals">
    ${opts.discount ? `<div>الخصم: ${opts.discount} ج.م</div>` : ""}
    <div class="total">الإجمالي: ${opts.total} ج.م</div>
    <div>المدفوع: ${opts.paid} ج.م</div>
    ${remaining > 0 ? `<div style="color:#dc2626">المتبقي: ${remaining} ج.م</div>` : ""}
  </div>

  <div class="footer">
    <p>معرض البركة - نظام إدارة المعرض</p>
  </div>

  <script>window.onload=()=>{window.print();}</script>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
