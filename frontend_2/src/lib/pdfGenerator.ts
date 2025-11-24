import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface IdeaEvaluationData {
  problem: string;
  solution: string;
  features?: string[];
  techStack?: string[];
  results: {
    overall: number;
    scores: {
      innovation: number;
      feasibility: number;
      impact: number;
      scalability: number;
      clarity: number;
    };
    feedback: string;
    improvements: string[];
  };
}

interface RepoEvaluationData {
  repoUrl: string;
  results: {
    repoInfo: {
      name: string;
      stars: number;
      language: string;
      contributors: number;
    };
    overall: number;
    scores: any;
    strengths: string[];
    improvements: string[];
  };
}

interface ReportData {
  roomId: string;
  projectName: string;
  date: string;
  teamMembers: string[];
  ideaScore: number;
  codeScore: number;
  repoScore: number;
  finalScore: number;
  ideaBreakdown: any;
  codeBreakdown: any;
  repoBreakdown: any;
  judgeComments: string[];
}

export const generateIdeaEvaluationPDF = (data: IdeaEvaluationData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Idea Evaluation Report', pageWidth / 2, 20, { align: 'center' });
  
  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });
  
  let yPos = 40;
  
  // Overall Score Box
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(pageWidth / 2 - 30, yPos, 60, 25, 5, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.results.overall}`, pageWidth / 2, yPos + 12, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Overall Score', pageWidth / 2, yPos + 20, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  yPos += 35;
  
  // Problem Statement
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Problem Statement:', 14, yPos);
  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const problemLines = doc.splitTextToSize(data.problem, pageWidth - 28);
  doc.text(problemLines, 14, yPos);
  yPos += problemLines.length * 5 + 5;
  
  // Solution
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Solution:', 14, yPos);
  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const solutionLines = doc.splitTextToSize(data.solution, pageWidth - 28);
  doc.text(solutionLines, 14, yPos);
  yPos += solutionLines.length * 5 + 10;
  
  // Detailed Scores Table
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Scores', 14, yPos);
  yPos += 8;
  
  const scoresData = [
    ['Innovation', data.results.scores.innovation.toString()],
    ['Feasibility', data.results.scores.feasibility.toString()],
    ['Impact', data.results.scores.impact.toString()],
    ['Scalability', data.results.scores.scalability.toString()],
    ['Clarity', data.results.scores.clarity.toString()],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Criterion', 'Score']],
    body: scoresData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // AI Feedback
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Feedback', 14, yPos);
  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const feedbackLines = doc.splitTextToSize(data.results.feedback, pageWidth - 28);
  doc.text(feedbackLines, 14, yPos);
  yPos += feedbackLines.length * 5 + 10;
  
  // Improvements
  if (data.results.improvements.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Suggestions for Improvement', 14, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    data.results.improvements.forEach((improvement, index) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      const lines = doc.splitTextToSize(`${index + 1}. ${improvement}`, pageWidth - 28);
      doc.text(lines, 14, yPos);
      yPos += lines.length * 5 + 3;
    });
  }
  
  // Save PDF
  doc.save(`Idea_Evaluation_${Date.now()}.pdf`);
};

export const generateRepoEvaluationPDF = (data: RepoEvaluationData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Repository Analysis Report', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });
  
  let yPos = 40;
  
  // Overall Score Box
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(pageWidth / 2 - 30, yPos, 60, 25, 5, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.results.overall}`, pageWidth / 2, yPos + 12, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Overall Score', pageWidth / 2, yPos + 20, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  yPos += 35;
  
  // Repository Info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Repository Information', 14, yPos);
  yPos += 8;
  
  const repoInfoData = [
    ['Name', data.results.repoInfo.name],
    ['Language', data.results.repoInfo.language],
    ['Stars', data.results.repoInfo.stars.toString()],
    ['Contributors', data.results.repoInfo.contributors.toString()],
    ['URL', data.repoUrl],
  ];
  
  autoTable(doc, {
    startY: yPos,
    body: repoInfoData,
    theme: 'plain',
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
    },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Detailed Scores
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Analysis', 14, yPos);
  yPos += 8;
  
  const scoresArray = Object.entries(data.results.scores).map(([key, value]) => [
    key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    value.toString()
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Criterion', 'Score']],
    body: scoresArray,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Strengths
  if (data.results.strengths.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94); // Green color for strengths
    doc.text('Strengths', 14, yPos);
    doc.setTextColor(0, 0, 0); // Reset to black
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    data.results.strengths.forEach((strength, index) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      const lines = doc.splitTextToSize(`✓ ${strength}`, pageWidth - 28);
      doc.setFillColor(240, 253, 244); // Light green background
      doc.roundedRect(14, yPos - 4, pageWidth - 28, lines.length * 5 + 4, 2, 2, 'F');
      doc.setTextColor(22, 163, 74); // Dark green text
      doc.text(lines, 16, yPos);
      doc.setTextColor(0, 0, 0); // Reset to black
      yPos += lines.length * 5 + 6;
    });
    yPos += 5;
  }
  
  // Improvements
  if (data.results.improvements.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(234, 88, 12); // Orange color for improvements
    doc.text('Areas for Improvement', 14, yPos);
    doc.setTextColor(0, 0, 0); // Reset to black
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    data.results.improvements.forEach((improvement, index) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      const lines = doc.splitTextToSize(`• ${improvement}`, pageWidth - 28);
      doc.setFillColor(255, 247, 237); // Light orange background
      doc.roundedRect(14, yPos - 4, pageWidth - 28, lines.length * 5 + 4, 2, 2, 'F');
      doc.setTextColor(194, 65, 12); // Dark orange text
      doc.text(lines, 16, yPos);
      doc.setTextColor(0, 0, 0); // Reset to black
      yPos += lines.length * 5 + 6;
    });
  }
  
  doc.save(`Repository_Analysis_${Date.now()}.pdf`);
};

export const generateFinalReportPDF = (data: ReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Title Page
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Hackathon Evaluation Report', pageWidth / 2, 40, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(data.projectName, pageWidth / 2, 55, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Room ID: ${data.roomId}`, pageWidth / 2, 70, { align: 'center' });
  doc.text(`Generated: ${data.date}`, pageWidth / 2, 78, { align: 'center' });
  
  // Final Score Box
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(pageWidth / 2 - 40, 95, 80, 35, 5, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.finalScore}`, pageWidth / 2, 110, { align: 'center' });
  doc.setFontSize(12);
  doc.text('Final Combined Score', pageWidth / 2, 122, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  // Team Members
  let yPos = 145;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Team Members:', 14, yPos);
  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.teamMembers.join(', '), 14, yPos);
  
  // New page for scores
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Score Summary', 14, yPos);
  yPos += 10;
  
  const summaryData = [
    ['Idea Evaluation', data.ideaScore.toString()],
    ['Code Quality', data.codeScore.toString()],
    ['Repository Analysis', data.repoScore.toString()],
    ['Final Score', data.finalScore.toString()],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Category', 'Score']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    columnStyles: {
      1: { halign: 'center', fontStyle: 'bold' },
    },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Idea Breakdown
  if (Object.keys(data.ideaBreakdown).length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Idea Evaluation Breakdown', 14, yPos);
    yPos += 8;
    
    const ideaData = Object.entries(data.ideaBreakdown).map(([key, value]) => [
      key.charAt(0).toUpperCase() + key.slice(1),
      value.toString()
    ]);
    
    autoTable(doc, {
      startY: yPos,
      body: ideaData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Code Breakdown
  if (Object.keys(data.codeBreakdown).length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Code Quality Breakdown', 14, yPos);
    yPos += 8;
    
    const codeData = Object.entries(data.codeBreakdown).map(([key, value]) => [
      key.charAt(0).toUpperCase() + key.slice(1),
      value.toString()
    ]);
    
    autoTable(doc, {
      startY: yPos,
      body: codeData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Repo Breakdown
  if (Object.keys(data.repoBreakdown).length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Repository Analysis Breakdown', 14, yPos);
    yPos += 8;
    
    const repoData = Object.entries(data.repoBreakdown).map(([key, value]) => [
      key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      value.toString()
    ]);
    
    autoTable(doc, {
      startY: yPos,
      body: repoData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Judge Comments
  if (data.judgeComments.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("Judge's Comments", 14, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    data.judgeComments.forEach((comment, index) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      const lines = doc.splitTextToSize(`• ${comment}`, pageWidth - 28);
      doc.text(lines, 14, yPos);
      yPos += lines.length * 5 + 5;
    });
  }
  
  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | Generated by HackSim - Powered by Llama 3.2`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`Hackathon_Report_${data.roomId}_${Date.now()}.pdf`);
};
