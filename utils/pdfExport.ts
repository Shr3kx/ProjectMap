import jsPDF from "jspdf";
import { Message } from "@/types/chat";

interface ExportOptions {
  title?: string;
  includeTimestamps?: boolean;
  includeMetadata?: boolean;
}

/**
 * Exports a single message to PDF
 */
export function exportMessageToPDF(
  message: Message,
  options: ExportOptions = {}
) {
  const {
    title = "Chat Export",
    includeTimestamps = true,
    includeMetadata = true,
  } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Add title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, yPosition);
  yPosition += 15;

  // Add metadata
  if (includeMetadata) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const date = new Date().toLocaleString();
    doc.text(`Exported: ${date}`, margin, yPosition);
    yPosition += 10;
  }

  // Add separator
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Add message role
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  const roleText = message.role === "user" ? "You" : "AI Assistant";
  doc.text(roleText, margin, yPosition);
  yPosition += 8;

  // Add timestamp
  if (includeTimestamps) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    const timestamp = new Date(message.timestamp).toLocaleString();
    doc.text(timestamp, margin, yPosition);
    yPosition += 10;
  }

  // Add message content
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  if (message.content) {
    const lines = doc.splitTextToSize(message.content, maxWidth);

    for (let i = 0; i < lines.length; i++) {
      // Check if we need a new page
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(lines[i], margin, yPosition);
      yPosition += 6;
    }
  }

  // Save the PDF
  const filename = `message-${message.id}-${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Exports multiple messages (entire conversation) to PDF
 */
export function exportConversationToPDF(
  messages: Message[],
  options: ExportOptions = {}
) {
  const {
    title = "Chat Conversation",
    includeTimestamps = true,
    includeMetadata = true,
  } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to check and add new page if needed
  const checkNewPage = (requiredSpace: number = 20) => {
    if (yPosition > pageHeight - margin - requiredSpace) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Add title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, yPosition);
  yPosition += 15;

  // Add metadata
  if (includeMetadata) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const date = new Date().toLocaleString();
    doc.text(`Exported: ${date}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Messages: ${messages.length}`, margin, yPosition);
    yPosition += 10;
  }

  // Add separator
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Process each message
  messages.forEach((message, index) => {
    checkNewPage(30);

    // Add message number and role
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");

    if (message.role === "user") {
      doc.setTextColor(59, 130, 246); // Blue for user
    } else {
      doc.setTextColor(16, 185, 129); // Green for AI
    }

    const roleText = message.role === "user" ? "You" : "AI Assistant";
    doc.text(`${index + 1}. ${roleText}`, margin, yPosition);
    yPosition += 7;

    // Add timestamp
    if (includeTimestamps) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      const timestamp = new Date(message.timestamp).toLocaleString();
      doc.text(timestamp, margin, yPosition);
      yPosition += 8;
    }

    // Add message content
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);

    if (message.content) {
      // Strip markdown for PDF (basic cleanup)
      let cleanContent = message.content
        .replace(/#{1,6}\s/g, "") // Remove headers
        .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
        .replace(/\*(.*?)\*/g, "$1") // Remove italic
        .replace(/`{3}[\s\S]*?`{3}/g, "[Code Block]") // Replace code blocks
        .replace(/`(.*?)`/g, "$1") // Remove inline code
        .replace(/\[(.*?)\]\(.*?\)/g, "$1"); // Remove links but keep text

      const lines = doc.splitTextToSize(cleanContent, maxWidth);

      for (let i = 0; i < lines.length; i++) {
        checkNewPage();
        doc.text(lines[i], margin, yPosition);
        yPosition += 5;
      }
    }

    // Add attachments info if present
    if (message.attachments && message.attachments.length > 0) {
      checkNewPage(15);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "italic");
      const attachmentText = `[${message.attachments.length} attachment(s): ${message.attachments.map(a => a.name).join(", ")}]`;
      const attachmentLines = doc.splitTextToSize(attachmentText, maxWidth);
      attachmentLines.forEach((line: string) => {
        checkNewPage();
        doc.text(line, margin, yPosition);
        yPosition += 5;
      });
    }

    // Add spacing between messages
    yPosition += 10;

    // Add separator line between messages (except last)
    if (index < messages.length - 1) {
      checkNewPage(10);
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
    }
  });

  // Add footer on last page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Save the PDF
  const filename = `conversation-${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Exports messages starting from a specific message to PDF
 */
export function exportFromMessageToPDF(
  messages: Message[],
  messageId: string,
  options: ExportOptions = {}
) {
  // Find the index of the target message
  const messageIndex = messages.findIndex((m) => m.id === messageId);

  if (messageIndex === -1) {
    console.error("Message not found");
    return;
  }

  // Export all messages from start to this message
  const messagesToExport = messages.slice(0, messageIndex + 1);
  exportConversationToPDF(messagesToExport, {
    ...options,
    title: options.title || "Chat Export",
  });
}
