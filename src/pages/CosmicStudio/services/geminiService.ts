
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export const generateImageFromAI = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

export const editImageWithAI = async (base64Image: string, prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    // Strip data prefix if present
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/png'
            }
          },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error editing image:", error);
    return null;
  }
};

/**
 * Edits an image using a mask and prompt (Inpainting).
 */
export const editImageWithMask = async (base64Image: string, base64Mask: string, prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    const cleanMask = base64Mask.split(',')[1] || base64Mask;

    // Using gemini-2.0-flash-exp if available for better multimodal understanding, or standard model
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: {
        parts: [
          { text: "Edit the first image based on the mask provided in the second image. The white area of the mask indicates where to apply the changes. " + prompt },
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/png'
            }
          },
          {
            inlineData: {
              data: cleanMask,
              mimeType: 'image/png'
            }
          }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error editing with mask:", error);
    return editImageWithAI(base64Image, prompt);
  }
};

export const editImageWithReference = async (
  targetBase64: string,
  referenceBase64: string | null,
  instruction: string,
  preservation: string
): Promise<string | null> => {
  try {
    const ai = getAI();
    const cleanTarget = targetBase64.split(',')[1] || targetBase64;

    const parts: any[] = [
      { text: `You are an expert image editor. modifying the FIRST image provided. task: ${instruction}. Constraints: ${preservation}. Maintain the composition and core elements unless asked to change.` },
      {
        inlineData: {
          data: cleanTarget,
          mimeType: 'image/png'
        }
      }
    ];

    if (referenceBase64) {
      const cleanRef = referenceBase64.split(',')[1] || referenceBase64;
      parts.push({ text: "Use the following image as a visual reference/style guide for the changes:" });
      parts.push({
        inlineData: {
          data: cleanRef,
          mimeType: 'image/png'
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Using experimental for better multimodal editing
      contents: { parts }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;

  } catch (error) {
    console.error("Error editing with reference:", error);
    return null;
  }

};

export const editImageAdvanced = async (
  targetBase64: string,
  maskBase64: string | null,
  referenceBase64: string | null,
  instruction: string,
  preservation: string
): Promise<string | null> => {
  try {
    const ai = getAI();
    const cleanTarget = targetBase64.split(',')[1] || targetBase64;

    const parts: any[] = [
      { text: `You are an expert image editor. Task: ${instruction}. Constraints: ${preservation}.` },
    ];

    // 1. Target Image
    parts.push({
      text: "Below is the target image to edit:"
    });
    parts.push({
      inlineData: {
        data: cleanTarget,
        mimeType: 'image/png'
      }
    });

    // 2. Mask (Optional)
    if (maskBase64) {
      const cleanMask = maskBase64.split(',')[1] || maskBase64;
      parts.push({ text: "Below is a mask indicating the specific area to edit (white pixels = edit area, black pixels = keep unchanged). STRICTLY adhere to this mask." });
      parts.push({
        inlineData: {
          data: cleanMask,
          mimeType: 'image/png'
        }
      });
    }

    // 3. Reference (Optional)
    if (referenceBase64) {
      const cleanRef = referenceBase64.split(',')[1] || referenceBase64;
      parts.push({ text: "Use the following image as a visual reference for style, object appearance, or composition:" });
      parts.push({
        inlineData: {
          data: cleanRef,
          mimeType: 'image/png'
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: { parts }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;

  } catch (error) {
    console.error("Error in advanced editing:", error);
    return null;
  }
};
