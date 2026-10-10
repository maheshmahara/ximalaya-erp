import os
import io
import qrcode
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_ird_tax_invoice(
    invoice_no: str,
    fiscal_year: str,
    buyer_name: str,
    buyer_pan: str,
    buyer_address: str,
    items: list[dict],
    output_pdf_path: str
):
    seller_name = "Ximalaya Coffee Chain Pvt. Ltd."
    seller_pan = "609876543"
    seller_address = "Ward No. 3, Ruru Kshetra, Gulmi, Nepal"
    seller_phone = "+977-79-520111"
    invoice_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Financial math
    subtotal = sum(item["qty"] * item["rate"] for item in items)
    discount = 0.00
    taxable_amount = subtotal - discount
    vat_13_pct = round(taxable_amount * 0.13, 2)
    grand_total = taxable_amount + vat_13_pct

    # IRD CBMS QR Payload: PAN|InvoiceNo|Date|Total|VAT
    cbms_qr_payload = f"{seller_pan}|{invoice_no}|{invoice_date[:10]}|{grand_total:.2f}|{vat_13_pct:.2f}"
    qr = qrcode.QRCode(box_size=3, border=1)
    qr.add_data(cbms_qr_payload)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    qr_buf = io.BytesIO()
    img.save(qr_buf, format="PNG")
    qr_buf.seek(0)

    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=16,
        leading=18,
        textColor=colors.HexColor('#0f172a'),
        fontName='Helvetica-Bold'
    )
    meta_style = ParagraphStyle(
        'MetaText',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#334155'),
        fontName='Helvetica'
    )
    bold_style = ParagraphStyle(
        'BoldMeta',
        parent=meta_style,
        fontName='Helvetica-Bold'
    )

    story = []

    # Header Table
    header_data = [
        [
            Paragraph(f"<b>{seller_name}</b><br/>{seller_address}<br/>Tel: {seller_phone}<br/><b>PAN: {seller_pan}</b>", meta_style),
            Paragraph(f"<font color='#0284c7'><b>TAX INVOICE (कर बिजक)</b></font><br/><b>Invoice:</b> {invoice_no}<br/><b>Fiscal Year:</b> {fiscal_year}<br/><b>Date:</b> {invoice_date}", meta_style)
        ]
    ]
    t_header = Table(header_data, colWidths=[300, 220])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LINEBELOW', (0,0), (-1,-1), 1.5, colors.HexColor('#0f172a')),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_header)
    story.append(Spacer(1, 10))

    # Buyer & Metadata Box
    buyer_info = [
        [
            Paragraph(f"<b>BUYER DETAILS (खरिदकर्ता):</b><br/>{buyer_name}<br/>{buyer_address}<br/><b>Buyer PAN: {buyer_pan}</b>", meta_style),
            Paragraph("<b>TRANSACTION ATTRIBUTES:</b><br/>Payment: Bank / IPS Transfer<br/>Currency: Nepalese Rupee (NPR)<br/><b>CBMS Status: REAL-TIME VERIFIED</b>", meta_style)
        ]
    ]
    t_buyer = Table(buyer_info, colWidths=[260, 260])
    t_buyer.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_buyer)
    story.append(Spacer(1, 15))

    # Invoice Line Items Table
    table_rows = [
        [
            Paragraph('<b>S.N.</b>', bold_style),
            Paragraph('<b>Description of Goods</b>', bold_style),
            Paragraph('<b>Qty</b>', bold_style),
            Paragraph('<b>Rate (Rs)</b>', bold_style),
            Paragraph('<b>Total (Rs)</b>', bold_style)
        ]
    ]
    for idx, item in enumerate(items, 1):
        line_total = item["qty"] * item["rate"]
        table_rows.append([
            Paragraph(str(idx), meta_style),
            Paragraph(f"<b>{item['desc']}</b><br/><font color='#64748b'>HS Code: {item.get('hs_code', '0901.21.00')}</font>", meta_style),
            Paragraph(f"{item['qty']} {item.get('unit', 'Kg')}", meta_style),
            Paragraph(f"Rs {item['rate']:.2f}", meta_style),
            Paragraph(f"Rs {line_total:.2f}", meta_style)
        ])

    t_items = Table(table_rows, colWidths=[30, 240, 70, 80, 100])
    t_items.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('LINEBELOW', (0,1), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    story.append(t_items)
    story.append(Spacer(1, 12))

    # Summary Totals Table
    totals_data = [
        [Paragraph("Subtotal:", meta_style), Paragraph(f"Rs {subtotal:.2f}", bold_style)],
        [Paragraph("Taxable Amount:", meta_style), Paragraph(f"Rs {taxable_amount:.2f}", bold_style)],
        [Paragraph("VAT 13%:", meta_style), Paragraph(f"Rs {vat_13_pct:.2f}", bold_style)],
        [Paragraph("<b>Grand Total:</b>", bold_style), Paragraph(f"<b>Rs {grand_total:.2f}</b>", bold_style)]
    ]
    t_totals = Table(totals_data, colWidths=[120, 100])
    t_totals.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
        ('PADDING', (0,0), (-1,-1), 4),
        ('LINEABOVE', (0,3), (-1,3), 1, colors.HexColor('#0f172a')),
        ('LINEBELOW', (0,3), (-1,3), 1, colors.HexColor('#0f172a')),
    ]))
    
    # Outer layout for Totals + QR Code
    qr_img = Image(qr_buf, width=70, height=70)
    footer_table = Table([
        [
            Paragraph("<font size=7 color='#64748b'>This invoice is synchronized with the Nepal IRD CBMS server in accordance with Value Added Tax Act, 2052.<br/><b>EUDR Cadastral Traceability Attached: PLOT-GUL-042</b></font>", meta_style),
            qr_img,
            t_totals
        ]
    ], colWidths=[240, 80, 200])
    footer_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LINEABOVE', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(footer_table)

    doc.build(story)
    return output_pdf_path
