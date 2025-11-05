
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this project, we assume it's set in the environment.
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateRideNotes = async (keywords: string): Promise<string> => {
    if (!API_KEY) return "AI service is unavailable.";
    try {
        const prompt = `Based on the following keywords for a taxi ride, write a short, polite, and clear note for the driver. Keywords: "${keywords}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating ride notes:", error);
        return "Could not generate notes at this time.";
    }
};

export const generateDriverReply = async (context: string): Promise<string> => {
    if (!API_KEY) return "AI service is unavailable.";
    try {
        const prompt = `As a taxi driver, write a short, professional, and friendly reply based on this context: "${context}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating driver reply:", error);
        return "Could not generate a reply at this time.";
    }
};

export const getRouteInfo = async (origin: { lat: number, lng: number }, destination: string): Promise<string> => {
    if (!API_KEY) return "AI service is unavailable.";
    try {
        const prompt = `What is the estimated travel time by car from the current location to the address "${destination}"? Provide only the estimated time in a short, human-readable format, for example, "approx. 15 minutes". Do not add any other text.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleMaps: {}}],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: origin.lat,
                            longitude: origin.lng,
                        }
                    }
                }
            },
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Error getting route info:", error);
        return "Could not calculate ETA.";
    }
};
