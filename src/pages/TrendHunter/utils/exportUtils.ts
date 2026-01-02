
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import { uploadFileToDrive } from '../../../services/integrations/googleDrive';
import { TrendResultStructured } from '../types';

export const handleDownloadTxt = (result: TrendResultStructured, query: string, city: string) => {
    const textContent = generateReportText(result, query, city);
    // Add BOM for proper UTF-8 handling in Excel/Windows
    const blob = new Blob(['\uFEFF' + textContent], { type: 'text/plain;charset=utf-8' });
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

export const handleSaveToDrive = async (result: TrendResultStructured, query: string, city: string): Promise<void> => {
    const textContent = generateReportText(result, query, city);

    // Add BOM for proper UTF-8 handling
    const blob = new Blob(['\uFEFF' + textContent], { type: 'text/plain;charset=utf-8' });
    const safeQuery = query.trim().replace(/\s+/g, '-') || 'trend-report';

    await uploadFileToDrive(blob, `TrendReport-${safeQuery}.txt`, 'text/plain');
};

export const handleExportPDF = async (elementId: string, query: string): Promise<void> => {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Elemento do relatório não encontrado.');

    const canvas = await html2canvas(element, {
        scale: 4, // Increased scale for high-quality printing/viewing (High DPI)
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

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST'); // 'FAST' can help with performance, or leave undefined for default
    // Note: To further improve quality, we could split long content into pages, but scale 4 gives crisp image.
    pdf.save(`TrendHunter-${query.replace(/\s+/g, '-')}.pdf`);
};

export const handleExportPNG = async (elementId: string, query: string): Promise<void> => {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Elemento do relatório não encontrado.');

    const canvas = await html2canvas(element, {
        scale: 4, // 4x scale for high quality PNG (Nano Banana Standard)
        useCORS: true,
        backgroundColor: '#111827', // Preserving dark mode bg or customize as needed
        onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.getElementById(elementId);
            if (clonedElement) {
                // Adjust styles for export if necessary (e.g. remove shadows to safely transparent if needed, or keep as is)
                clonedElement.style.padding = '20px';
            }
        }
    });

    const link = document.createElement('a');
    link.download = `TrendHunter-${query.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png', 1.0); // 1.0 quality
    link.click();
};

export const handleExportPPT = (result: TrendResultStructured, query: string) => {
    const pres = new PptxGenJS();
    const safeQuery = query.trim() || 'Tendência';

    // Slide 1: Capa
    // Slide 1: Capa (Design melhorado)
    let slide = pres.addSlide();
    slide.background = { color: '111827' };

    // Adicionar um elemento de design "Neon" (Faixa colorida)
    slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.15, fill: { color: '00E5FF' } });

    slide.addText(`Relatório de Tendência: ${safeQuery}`, {
        x: 0.5, y: 2.5, w: '90%', fontSize: 44, color: 'FFFFFF', bold: true, align: 'center', fontFace: 'Arial'
    });
    slide.addText(`VitrineX AI - Intelligence Report`, {
        x: 0.5, y: 3.5, w: '90%', fontSize: 24, color: '00E5FF', align: 'center'
    });
    slide.addText(`Gerado em: ${new Date().toLocaleDateString()}`, {
        x: 0.5, y: 5.0, fontSize: 14, color: '6B7280', align: 'center'
    });

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
