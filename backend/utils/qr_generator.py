import os
import qrcode
import io
from azure.storage.blob import BlobServiceClient, ContentSettings
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from dotenv import load_dotenv
from datetime import datetime, timedelta
from datetime import datetime, timedelta
from utils.storage import upload_to_blob

load_dotenv()



def generate_office_qr_assets(office_id: str, office_name: str, location_id: str):
    # The URL that the QR code points to
    qr_url = f"https://facilitydesk.bayer.in/raise?loc={location_id}"
    
    # 1. Generate QR Code Image
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(qr_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_bytes = img_byte_arr.getvalue()
    
    qr_image_url = upload_to_blob(img_bytes, f"{location_id}_qr.png", "image/png", "qr-codes")
    
    # 2. Generate PDF using reportlab
    pdf_buffer = io.BytesIO()
    c = canvas.Canvas(pdf_buffer, pagesize=A4)
    width, height = A4
    
    # Draw logo at top
    logo_path = os.path.join(os.path.dirname(__file__), '../../app/public/Bayer-Logo.wine.png')
    if os.path.exists(logo_path):
        logo_reader = ImageReader(logo_path)
        img_w, img_h = logo_reader.getSize()
        aspect = img_w / float(img_h)
        logo_width = 150
        logo_height = logo_width / aspect
        # Use mask='auto' to respect PNG transparency
        c.drawImage(logo_reader, (width - logo_width) / 2, height - 60 - logo_height, width=logo_width, height=logo_height, mask='auto')
    
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(width/2, height - 260, "FacilityDesk")
    
    c.setFont("Helvetica-Bold", 28)
    office_display = office_name if "office" in office_name.lower() else f"{office_name} Office"
    c.drawCentredString(width/2, height - 310, office_display)
    
    # Draw QR code in PDF
    img_reader = ImageReader(io.BytesIO(img_bytes))
    qr_size = 400
    qr_x = (width - qr_size) / 2
    qr_y = height - 730
    c.drawImage(img_reader, qr_x, qr_y, width=qr_size, height=qr_size)
    
    c.setFont("Courier", 20)
    c.drawCentredString(width/2, qr_y - 40, location_id)
    
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width/2, qr_y - 80, f"facilitydesk.bayer.in/r/{office_id}")
    
    c.setFont("Helvetica", 16)
    c.drawCentredString(width/2, qr_y - 140, "Scan this QR code to report facility issues")
    
    c.showPage()
    c.save()
    
    pdf_bytes = pdf_buffer.getvalue()
    qr_pdf_url = upload_to_blob(pdf_bytes, f"{location_id}_qr.pdf", "application/pdf", "qr-codes")
    
    return qr_image_url, qr_pdf_url
