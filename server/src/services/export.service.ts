import PDFDocument from 'pdfkit';
import { meetingRepository } from '../repositories/meeting.repository';

export class ExportService {
  static async generateMeetingPDF(meetingId: string): Promise<Buffer> {
    const meeting = await meetingRepository.findById(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    return new Promise((resolve, reject) => {
      // Disable autoPageBreak to have full control, or just use a larger margin
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        bufferPages: true, // Required for page numbering
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // --- Compact Header ---
      doc.fillColor('#1e1b4b').fontSize(22).font('Helvetica-Bold').text(meeting.title, 50, 50);
      doc.fontSize(10).font('Helvetica').fillColor('#64748b').text(`${new Date(meeting.createdAt).toLocaleDateString()} • ${meeting.duration || 0}m Analysis`, 50, 75);
      doc.moveTo(50, 95).lineTo(545, 95).strokeColor('#e2e8f0').lineWidth(1).stroke();
      doc.moveDown(1.5);

      // 1. Meeting Summary
      if (meeting.summary) {
        this.writeHeader(doc, 'MEETING SUMMARY', '#6366f1');
        doc.fillColor('#1e293b').fontSize(11).font('Helvetica').text(meeting.summary.detailed, { align: 'justify' });
        doc.moveDown(1.5);
      }

      // 2. Action Items
      // @ts-ignore
      if (meeting.actionItems && meeting.actionItems.length > 0) {
        this.writeHeader(doc, 'TO-DO LIST', '#10b981');
        // @ts-ignore
        meeting.actionItems.forEach((item: any, i: number) => {
          this.ensureSpace(doc, 40);
          doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold').text(`${i + 1}. ${item.task}`);
          doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(`   Owner: ${item.owner || 'N/A'} | Priority: ${item.priority}`);
          doc.moveDown(0.5);
        });
        doc.moveDown(1);
      }

      // 3. Key Decisions
      // @ts-ignore
      if (meeting.decisions && meeting.decisions.length > 0) {
        this.writeHeader(doc, 'KEY DECISIONS', '#4f46e5');
        // @ts-ignore
        meeting.decisions.forEach((decision: any, i: number) => {
          this.ensureSpace(doc, 25);
          doc.fillColor('#334155').fontSize(11).font('Helvetica').text(`• ${decision.content}`);
          doc.moveDown(0.3);
        });
        doc.moveDown(1);
      }

      // 4. Potential Risks
      // @ts-ignore
      if (meeting.risks && meeting.risks.length > 0) {
        this.writeHeader(doc, 'POTENTIAL RISKS', '#ef4444');
        // @ts-ignore
        meeting.risks.forEach((risk: any) => {
          this.ensureSpace(doc, 35);
          doc.fillColor('#b91c1c').fontSize(11).font('Helvetica-Bold').text(`! ${risk.content}`);
          doc.fontSize(9).font('Helvetica').fillColor('#ef4444').text(`   Severity: ${risk.severity}`);
          doc.moveDown(0.5);
        });
      }

      // --- Page Numbers (ONLY if more than 1 page) ---
      const range = doc.bufferedPageRange();
      if (range.count > 1) {
        for (let i = range.start; i < range.start + range.count; i++) {
          doc.switchToPage(i);
          doc.fontSize(8).fillColor('#94a3b8').text(
            `Page ${i + 1} of ${range.count}`,
            50,
            doc.page.height - 40,
            { align: 'center' }
          );
        }
      }

      doc.end();
    });
  }

  private static writeHeader(doc: PDFKit.PDFDocument, text: string, color: string) {
    this.ensureSpace(doc, 40);
    doc.fillColor(color).fontSize(12).font('Helvetica-Bold').text(text);
    doc.moveDown(0.5);
  }

  private static ensureSpace(doc: PDFKit.PDFDocument, neededHeight: number) {
    const bottomMargin = 70;
    if (doc.y + neededHeight > doc.page.height - bottomMargin) {
      doc.addPage();
    }
  }
}
