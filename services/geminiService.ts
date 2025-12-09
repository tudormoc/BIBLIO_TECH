import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBookPartDescription = async (part: string): Promise<{ title: string; description: string; historicalNote: string }> => {
  try {
    const prompt = `
      Provide a concise, educational description of the book part: "${part}" specifically in the context of a "Hardcover (Case Bound)" book.
      The style should be technical yet accessible, suitable for a "Book Anatomy" explorer.
      Also provide a brief interesting historical fact or technical detail about this specific part.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Formal name of the part" },
            description: { type: Type.STRING, description: "What it is and its function (max 2 sentences)" },
            historicalNote: { type: Type.STRING, description: "A fun fact or historical origin (max 1 sentence)" }
          },
          required: ["title", "description", "historicalNote"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      title: part,
      description: "Information currently unavailable for this component.",
      historicalNote: "Please check your API connection."
    };
  }
};