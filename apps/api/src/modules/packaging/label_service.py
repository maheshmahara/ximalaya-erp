import io
from typing import List, Dict, Any, Optional
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import qrcode

PAGE_WIDTH, PAGE_HEIGHT = A4
COLS = 3
ROWS = 8
LABELS_PER_PAGE = COLS * ROWS

MARGIN_LEFT = 7.0 * mm
MARGIN_RIGHT = 7.0 * mm
MARGIN_TOP = 12.0 * mm
MARGIN_BOTTOM = 12.0 * mm

LABEL_WIDTH = 63.5 * mm
LABEL_HEIGHT = 33.9 * mm
HORIZ_GAP = 2.5 * mm
VERT_GAP = 0.0 * mm


def _create_qr_buffer(url: str) -> io.BytesIO:
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=1,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


def _draw_label(pdf: canvas.Canvas, x: float, y: float, w: float, h: float, lot: dict, base_url: str):
    # Die-cut guideline border
    pdf.setStrokeColor(colors.HexColor("#D1D5DB"))
    pdf.setLineWidth(0.4)
    pdf.roundRect(x, y, w, h, 2 * mm, stroke=1, fill=0)

    # Accent header bar
    pdf.setFillColor(colors.HexColor("#0F172A"))
    pdf.roundRect(x + 1.5 * mm, y + h - 5.5 * mm, w - 3 * mm, 4 * mm, 1 * mm, stroke=0, fill=1)

    pdf.setFillColor(colors.white)
    pdf.setFont("Helvetica-Bold", 6.5)
    pdf.drawString(x + 3.0 * mm, y + h - 4.3 * mm, "XIMALAYA SPECIALTY COFFEE")

    pdf.setFillColor(colors.HexColor("#10B981"))
    pdf.setFont("Helvetica-Bold", 5.5)
    pdf.drawRightString(x + w - 3.0 * mm, y + h - 4.3 * mm, "EUDR VERIFIED")

    # QR Code
    qr_url = f"{base_url.rstrip('/')}/{lot['pack_lot_code']}"
    qr_buf = _create_qr_buffer(qr_url)
    qr_img = ImageReader(qr_buf)

    qr_size = 21 * mm
    qr_x = x + 2.5 * mm
    qr_y = y + 2.5 * mm
    pdf.drawImage(qr_img, qr_x, qr_y, width=qr_size, height=qr_size)

    pdf.setFillColor(colors.HexColor("#64748B"))
    pdf.setFont("Helvetica-Bold", 4.5)
    pdf.drawCentredString(qr_x + (qr_size / 2.0), y + 1.2 * mm, "SCAN FOR ORIGIN MAP")

    # Typography / Metadata
    text_x = qr_x + qr_size + 2.5 * mm

    pdf.setFillColor(colors.HexColor("#0F172A"))
    pdf.setFont("Helvetica-Bold", 8.0)
    pdf.drawString(text_x, y + h - 8.5 * mm, lot["pack_lot_code"])

    pdf.setFont("Helvetica", 6.0)
    pdf.setFillColor(colors.HexColor("#334155"))
    sku = (lot.get("sku_name") or "Specialty Roast")[:28]
    pdf.drawString(text_x, y + h - 11.5 * mm, sku)

    pdf.setFont("Helvetica", 5.5)
    pdf.setFillColor(colors.HexColor("#475569"))
    farmer = lot.get("farmer_name") or "Himalayan Smallholder"
    pdf.drawString(text_x, y + h - 14.5 * mm, f"Farmer: {farmer[:20]}")

    parcel = lot.get("cadastral_parcel_number") or "NEP-PLOT-001"
    pdf.drawString(text_x, y + h - 17.5 * mm, f"Parcel: {parcel}")

    sca_score = lot.get("total_sca_score")
    if sca_score:
        pdf.setFillColor(colors.HexColor("#F59E0B"))
        pdf.roundRect(text_x, y + h - 22.5 * mm, 16 * mm, 3.8 * mm, 0.8 * mm, stroke=0, fill=1)
        pdf.setFillColor(colors.black)
        pdf.setFont("Helvetica-Bold", 5.5)
        pdf.drawCentredString(text_x + 8 * mm, y + h - 21.3 * mm, f"SCA {float(sca_score):.1f} PTS")

    bb_date = str(lot.get("best_before_date") or "N/A")
    pdf.setFillColor(colors.HexColor("#64748B"))
    pdf.setFont("Helvetica", 5.5)
    pdf.drawString(text_x, y + 2.5 * mm, f"BBD: {bb_date}")


class LabelSheetGenerator:
    @staticmethod
    def generate_pdf_buffer(lots: List[Dict[str, Any]], base_url: str) -> io.BytesIO:
        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        pdf.setTitle("Ximalaya Traceability Labels - A4 Sheet")

        total_lots = len(lots)
        current_idx = 0

        while current_idx < total_lots:
            for row in range(ROWS):
                for col in range(COLS):
                    if current_idx >= total_lots:
                        break
                    lot = lots[current_idx]
                    x = MARGIN_LEFT + col * (LABEL_WIDTH + HORIZ_GAP)
                    y = PAGE_HEIGHT - MARGIN_TOP - (row + 1) * LABEL_HEIGHT - row * VERT_GAP
                    _draw_label(pdf, x, y, LABEL_WIDTH, LABEL_HEIGHT, lot, base_url)
                    current_idx += 1
                if current_idx >= total_lots:
                    break
            pdf.showPage()

        pdf.save()
        buffer.seek(0)
        return buffer
