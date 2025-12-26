
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import { uploadFileToDrive } from '../../../services/integrations/googleDrive';
import { TrendResultStructured } from '../types';

export const handleDownloadTxt = (result: TrendResultStructured, query: string, city: string) => {
    const textContent = generateReportText(result, query, city);
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeQuery = query.trim().replace(/\s+/g, '-') || 'trend-report';
    a.download = `trend-${safeQuery}.txt`;
    a.click();
    URL.revokeObjectURL(url);
};

export const handleCopyReport = (result: TrendResultStructured, query: string, city: string) => {
    const textContent = generateReportText(result, query, city);
    navigator.clipboard.writeText(textContent);
};

export const handleSaveToDrive = async (result: TrendResultStructured, query: string): Promise<void> => {
    const textContent = `
RELATÓRIO DE TENDÊNCIA VITRINEX AI
Data: ${new Date().toLocaleDateString()}
Palavra-chave: ${query}
Score: ${result.score}/100

== RESUMO ==
${result.resumo}

== CONCLUSÃO ==
Avaliação: ${result.conclusao.avaliacao}
Melhor Estratégia: ${result.conclusao.melhorEstrategia}
  `.trim();

    const blob = new Blob([textContent], { type: 'text/plain' });
    const safeQuery = query.trim().replace(/\s+/g, '-') || 'trend-report';

    await uploadFileToDrive(blob, `TrendReport-${safeQuery}.txt`, 'text/plain');
};

export const handleExportPDF = async (elementId: string, query: string): Promise<void> => {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Elemento do relatório não encontrado.');

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.getElementById(elementId);
            if (clonedElement) {
                clonedElement.style.backgroundColor = '#ffffff';
                clonedElement.style.color = '#000000';
                clonedElement.style.padding = '20px';

                // Force text formatting for print
                const allElements = clonedElement.querySelectorAll('*');
                allElements.forEach((el: any) => {
                    if (window.getComputedStyle(el).color === 'rgb(255, 255, 255)' || el.className.includes('text-white') || el.className.includes('text-gray')) {
                        el.style.color = '#000000';
                    }
                    if (el.className.includes('bg-surface') || el.className.includes('bg-gray-800')) {
                        el.style.backgroundColor = '#f3f4f6';
                        el.style.borderColor = '#d1d5db';
                    }
                });
            }
        }
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`TrendHunter-${query.replace(/\s+/g, '-')}.pdf`);
};

export const handleExportPPT = (result: TrendResultStructured, query: string) => {
    const pres = new PptxGenJS();
    const safeQuery = query.trim() || 'Tendência';

    // Slide 1: Capa
    let slide = pres.addSlide();
    slide.background = { color: '111827' };
    slide.addText(`Relatório de Tendência: ${safeQuery}`, { x: 1, y: 1.5, w: '80%', fontSize: 36, color: 'FFFFFF', bold: true });
    slide.addText(`VitrineX AI - Data: ${new Date().toLocaleDateString()}`, { x: 1, y: 3, fontSize: 18, color: 'AAAAAA' });

    // Slide 2: Resumo
    slide = pres.addSlide();
    slide.background = { color: '111827' };
    slide.addText('Resumo Executivo', { x: 0.5, y: 0.5, fontSize: 24, color: '00E5FF', bold: true });
    slide.addText(result.resumo, { x: 0.5, y: 1.5, w: '90%', fontSize: 14, color: 'FFFFFF' });

    // Slide 3: Detalhes Estratégicos
    slide = pres.addSlide();
    slide.background = { color: '111827' };
    slide.addText('Estratégia & Ação', { x: 0.5, y: 0.5, fontSize: 24, color: '00E5FF', bold: true });

    slide.addText('Motivadores:', { x: 0.5, y: 1.2, fontSize: 16, color: 'FFFFFF', bold: true });
    result.motivadores.forEach((m, i) => {
        slide.addText(`• ${m}`, { x: 0.5, y: 1.6 + (i * 0.4), fontSize: 14, color: 'CCCCCC' });
    });

    slide.addText('Sugestão de Conteúdo:', { x: 5, y: 1.2, fontSize: 16, color: 'FFFFFF', bold: true });
    slide.addText(result.sugestaoConteudo.oque, { x: 5, y: 1.6, w: '45%', fontSize: 12, color: 'CCCCCC' });

    slide.addText('Cenário:', { x: 0.5, y: 4.5, fontSize: 16, color: 'FFFFFF', bold: true });
    slide.addText(result.leituraCenario, { x: 0.5, y: 5.0, w: '90%', fontSize: 12, color: 'CCCCCC' });

    pres.writeFile({ fileName: `TrendHunter-${safeQuery}.pptx` });
};

const generateReportText = (result: TrendResultStructured, query: string, city: string): string => {
    return `
RELATÓRIO DE TENDÊNCIA VITRINEX AI
Data: ${new Date().toLocaleDateString()}
Palavra-chave: ${query}
Localização: ${city || 'Brasil'}
Score: ${result.score}/100

== RESUMO ==
${result.resumo}

== MOTIVADORES ==
${result.motivadores.map(m => `- ${m}`).join('\n')}

== LEITURA DE CENÁRIO ==
${result.leituraCenario}

== SUGESTÃO DE CONTEÚDO ==
O que: ${result.sugestaoConteudo.oque}
Formato: ${result.sugestaoConteudo.formato}

== SUGESTÃO DE PRODUTO ==
Tipo: ${result.sugestaoProduto.tipo}
Temas: ${result.sugestaoProduto.temas.join(', ')}

== SUGESTÃO DE CAMPANHA ==
Estratégia: ${result.sugestaoCampanha.estrategia}
CTA: "${result.sugestaoCampanha.cta}"

== CONCLUSÃO ==
Avaliação: ${result.conclusao.avaliacao}
Melhor Estratégia: ${result.conclusao.melhorEstrategia}
  `.trim();
};
