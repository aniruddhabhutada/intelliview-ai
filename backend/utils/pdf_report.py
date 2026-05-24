import os
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from typing import Dict, Any, List

class PDFReportGenerator:
    @staticmethod
    def generate_report(session: Dict[str, Any], user: Dict[str, Any], evaluation: Dict[str, Any]) -> BytesIO:
        """Generates a professional PDF interview report."""
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )
        
        styles = getSampleStyleSheet()
        
        # Define Custom Color Palette (Modern Dark Purple / Slate theme compatible with PDF viewing)
        PRIMARY_COLOR = colors.HexColor("#4c1d95")  # Dark violet
        SECONDARY_COLOR = colors.HexColor("#7c3aed") # Accent purple
        TEXT_DARK = colors.HexColor("#1e293b")      # Dark slate text
        BG_LIGHT = colors.HexColor("#f8fafc")       # Light grey background
        LINE_COLOR = colors.HexColor("#cbd5e1")     # Border color
        SUCCESS_COLOR = colors.HexColor("#16a34a")  # Green
        
        # Custom Typography Styles
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=24,
            leading=28,
            textColor=PRIMARY_COLOR,
            spaceAfter=15
        )
        
        h1_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=20,
            textColor=PRIMARY_COLOR,
            spaceBefore=15,
            spaceAfter=10,
            keepWithNext=True
        )

        h2_style = ParagraphStyle(
            'SubsectionHeader',
            parent=styles['Heading3'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=SECONDARY_COLOR,
            spaceBefore=10,
            spaceAfter=5,
            keepWithNext=True
        )
        
        body_style = ParagraphStyle(
            'ReportBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=TEXT_DARK,
            spaceAfter=8
        )
        
        bold_body_style = ParagraphStyle(
            'ReportBoldBody',
            parent=body_style,
            fontName='Helvetica-Bold'
        )

        code_style = ParagraphStyle(
            'ReportCode',
            parent=styles['Code'],
            fontName='Courier',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#0f172a"),
            backColor=colors.HexColor("#f1f5f9"),
            borderColor=colors.HexColor("#e2e8f0"),
            borderWidth=1,
            borderPadding=6,
            spaceAfter=8
        )

        story = []
        
        # --- HEADER / HERO SECTION ---
        story.append(Paragraph("INTELLIVIEW AI", title_style))
        story.append(Paragraph(f"<b>Performance Evaluation Report</b>", h2_style))
        story.append(Spacer(1, 10))
        
        # --- METADATA BOARD TABLE ---
        created_date = session.get("created_at", "")
        if created_date:
            try:
                # Parse date format e.g., '2026-05-23T00:14:13'
                parsed_dt = datetime.fromisoformat(created_date.split(".")[0])
                date_str = parsed_dt.strftime("%B %d, %Y - %I:%M %p")
            except Exception:
                date_str = created_date
        else:
            date_str = datetime.now().strftime("%B %d, %Y")

        meta_data = [
            [Paragraph("<b>Candidate Name:</b>", bold_body_style), Paragraph(user.get("name", "N/A"), body_style),
             Paragraph("<b>Date Conducted:</b>", bold_body_style), Paragraph(date_str, body_style)],
            [Paragraph("<b>Session Focus:</b>", bold_body_style), Paragraph(session.get("category", "N/A"), body_style),
             Paragraph("<b>Difficulty Level:</b>", bold_body_style), Paragraph(session.get("difficulty", "N/A"), body_style)],
            [Paragraph("<b>Overall Score:</b>", bold_body_style), Paragraph(f"<b>{evaluation.get('overall_score', 0.0):.1f} / 10.0</b>", bold_body_style),
             Paragraph("<b>Status:</b>", bold_body_style), Paragraph("Completed", body_style)]
        ]
        
        meta_table = Table(meta_data, colWidths=[100, 160, 100, 160])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-1), 0.5, LINE_COLOR),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ]))
        
        story.append(meta_table)
        story.append(Spacer(1, 20))
        
        # --- EXECUTIVE SUMMARY ---
        story.append(Paragraph("Executive Summary", h1_style))
        story.append(Paragraph(evaluation.get("feedback_summary", "No summary provided."), body_style))
        story.append(Spacer(1, 15))
        
        # --- CAREER ROADMAP & NEXT STEPS ---
        story.append(Paragraph("Actionable Career Roadmap", h1_style))
        roadmap = evaluation.get("roadmap", [])
        if roadmap:
            for step in roadmap:
                story.append(Paragraph(f"• {step}", body_style))
        else:
            story.append(Paragraph("No roadmap suggestions generated for this session.", body_style))
            
        story.append(Spacer(1, 20))
        story.append(PageBreak())  # Push question breakdowns to the next page for clean printing

        # --- DETAILED QUESTION-BY-QUESTION BREAKDOWN ---
        story.append(Paragraph("Detailed Question Breakdown", h1_style))
        
        details = evaluation.get("details", [])
        for i, item in enumerate(details):
            q_num = i + 1
            story.append(Paragraph(f"Question {q_num}: {item.get('question_text', '')}", h2_style))
            story.append(Paragraph(f"<b>Category:</b> {item.get('category', 'Technical')} | <b>Score:</b> {item.get('score', 0.0):.1f}/10.0", bold_body_style))
            story.append(Spacer(1, 4))
            
            # Answer quote
            ans_text = item.get("user_answer", "").strip()
            if not ans_text:
                ans_text = "[No Answer Provided]"
            story.append(Paragraph("<b>Your Answer:</b>", body_style))
            story.append(Paragraph(ans_text, code_style))
            
            # Feedback Details
            feedback_item = item.get("feedback", {})
            
            # Strengths
            strengths_list = feedback_item.get("strengths", [])
            if strengths_list:
                story.append(Paragraph("<b>Strengths:</b>", bold_body_style))
                for s in strengths_list:
                    story.append(Paragraph(f"✓ {s}", body_style))
            
            # Improvements
            improvements_list = feedback_item.get("improvements", [])
            if improvements_list:
                story.append(Paragraph("<b>Suggested Improvements:</b>", bold_body_style))
                for imp in improvements_list:
                    story.append(Paragraph(f"⚠ {imp}", body_style))

            # Technical details
            tech_acc = feedback_item.get("technical_accuracy", "")
            if tech_acc:
                story.append(Paragraph(f"<b>Technical Critique:</b> {tech_acc}", body_style))

            # Clarity details
            clarity = feedback_item.get("clarity", "")
            if clarity:
                story.append(Paragraph(f"<b>Communication & Clarity:</b> {clarity}", body_style))

            story.append(Spacer(1, 10))
            story.append(Paragraph("<hr color='#cbd5e1' width='100%'/>", body_style))
            story.append(Spacer(1, 10))

        # Build PDF Document
        doc.build(story)
        buffer.seek(0)
        return buffer
