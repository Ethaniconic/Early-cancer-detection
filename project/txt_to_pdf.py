from fpdf import FPDF
import os

class MedicalReportPDF(FPDF):
    def header(self):
        # Header background
        self.set_fill_color(30, 41, 59) # Slate 800
        self.rect(0, 0, 210, 40, 'F')
        
        # Title
        self.set_font('helvetica', 'B', 20)
        self.set_text_color(255, 255, 255)
        self.cell(0, 15, 'CLINICAL ONCOLOGY REPORT', ln=True, align='C')
        
        # Sub-header
        self.set_font('helvetica', 'I', 10)
        self.cell(0, 5, 'CarePortal Cancer Detection & Risk Assessment Engine', ln=True, align='C')
        self.ln(10)

    def footer(self):
        self.set_y(-25)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 10, 'CONFIDENTIAL MEDICAL RECORD - CarePortal AI Engineering', align='C')
        self.set_y(-15)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')

def create_pdf(txt_path, pdf_path):
    pdf = MedicalReportPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    with open(txt_path, 'r') as f:
        lines = f.readlines()

    pdf.set_text_color(0, 0, 0)
    
    for line in lines:
        line = line.strip()
        if not line:
            pdf.ln(5)
            continue
            
        # Section headers
        if line.startswith('---') or line.isupper():
            pdf.ln(2)
            pdf.set_font('helvetica', 'B', 12)
            pdf.set_fill_color(241, 245, 249) # Slate 100
            pdf.cell(0, 10, line, ln=True, fill=True)
            pdf.set_font('helvetica', '', 11)
            pdf.ln(2)
        # Critical findings highlighting
        elif '[CRITICAL' in line or '[HIGH' in line or '[LOW' in line:
            pdf.set_text_color(220, 38, 38) # Red 600
            pdf.set_font('helvetica', 'B', 11)
            pdf.cell(0, 8, line, ln=True)
            pdf.set_text_color(0, 0, 0)
            pdf.set_font('helvetica', '', 11)
        else:
            pdf.set_font('helvetica', '', 11)
            pdf.cell(0, 7, line, ln=True)

    pdf.output(pdf_path)

if __name__ == "__main__":
    src = r"c:\Users\Lenovo\Documents\Early-cancer-detection\mock_reports\critical_risk_report.txt"
    dest = r"c:\Users\Lenovo\Documents\Early-cancer-detection\mock_reports\critical_risk_report.pdf"
    create_pdf(src, dest)
    print(f"Successfully converted {src} to {dest}")
