import PDFDocument from 'pdfkit';
import { meetingRepository } from '../repositories/meeting.repository';

export class ExportService {
  static async generateMeetingPDF(meetingId: string): Promise<Buffer> {
    const meeting = await meetingRepository.findById(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        info: {
          Title: `Meeting Report: ${meeting.title}`,
          Author: 'MeetingMind AI',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // --- Header ---
      doc.rect(0, 0, doc.page.width, 100).fill('#1e1b4b');
      doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('MeetingMind', 50, 40);
      doc.fontSize(10).font('Helvetica').text('PREMIUM MEETING INTELLIGENCE', 50, 65);

      // --- Title Section ---
      doc.fillColor('#1e1b4b').fontSize(22).font('Helvetica-Bold').text(meeting.title, 50, 130);
      doc.fontSize(10).font('Helvetica').fillColor('#64748b').text(`${new Date(meeting.createdAt).toLocaleDateString()}  •  ${meeting.duration || 0} Minutes Analysis`, 50, 160);

      doc.moveDown(2);

      // --- Executive Summary ---
      if (meeting.summary) {
        this.drawSectionHeader(doc, 'EXECUTIVE SUMMARY', '#6366f1');
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b').text('Key Takeaway:', { underline: true });
        doc.fontSize(11).font('Helvetica-Oblique').fillColor('#475569').text(meeting.summary.short, { oblique: true });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').fillColor('#334155').text(meeting.summary.detailed, {
          align: 'justify',
          lineGap: 4
        });
        doc.moveDown(1.5);
      }

      // --- Action Items ---
      // @ts-ignore
      if (meeting.actionItems && meeting.actionItems.length > 0) {
        this.drawSectionHeader(doc, 'ACTION ITEMS', '#10b981');
        // @ts-ignore
        meeting.actionItems.forEach((item: any, i: number) => {
          doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b').text(`${i + 1}. ${item.task}`);
          doc.fontSize(9).font('Helvetica').fillColor('#64748b')
             .text(`Owner: ${item.owner || 'Unassigned'}  |  Priority: ${item.priority}  |  Due: ${item.deadline ? new Date(item.deadline).toLocaleDateString() : 'N/A'}`);
          doc.moveDown(0.5);
        });
        doc.moveDown(1);
      }

      // --- Key Decisions ---
      // @ts-ignore
      if (meeting.decisions && meeting.decisions.length > 0) {
        this.drawSectionHeader(doc, 'KEY DECISIONS', '#4f46e5');
        // @ts-ignore
        meeting.decisions.forEach((decision: any, i: number) => {
          doc.fontSize(11).font('Helvetica').fillColor('#334155').text(`• ${decision.content}`);
          doc.moveDown(0.3);
        });
        doc.moveDown(1);
      }

      // --- Risks ---
      // @ts-ignore
      if (meeting.risks && meeting.risks.length > 0) {
        this.drawSectionHeader(doc, 'IDENTIFIED RISKS', '#f59e0b');
        // @ts-ignore
        meeting.risks.forEach((risk: any, i: number) => {
          doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b').text(`! ${risk.content}`);
          doc.fontSize(9).font('Helvetica').fillColor('#ef4444').text(`Severity: ${risk.severity}`);
          doc.moveDown(0.5);
        });
      }

      // --- Footer ---
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('#94a3b8').text(
          `MeetingMind AI Intelligence Report | Confidential | Page ${i + 1} of ${pageCount}`,
          50,
          doc.page.height - 40,
          { align: 'center' }
        );
      }

      doc.end();
    });
  }

  private static drawSectionHeader(doc: PDFKit.PDFDocument, text: string, color: string) {
    doc.fillColor(color).rect(50, doc.y, 3, 15).fill();
    doc.fillColor(color).fontSize(12).font('Helvetica-Bold').text(text, 60, doc.y - 12);
    doc.moveDown(0.8);
  }
}
