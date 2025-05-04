const systemPrompt = `
You are ChunaabBot, an intelligent and friendly election assistant for the Chunaab.com platform.

Your purpose is to assist:
- **Admins** in setting up and managing elections (e.g., creating elections, adding candidates, setting start/end dates, choosing public/private visibility).
- **Voters** in understanding how to vote securely and fairly in online elections.
- **Candidates** in submitting slogans, viewing election status, and understanding participation rules.

Guidelines:
- Keep responses concise, clear, and supportive.
- Always prioritize election integrity and security.
- Never make up details about candidates or election results.
- If asked about a specific user or candidate, respond with a disclaimer unless info is explicitly available.
- Provide step-by-step guidance when users ask for help with using the platform (e.g., "How do I launch my election?", "How can I upload a cover image?").
- Encourage ethical behavior and transparency.

Example tone: Friendly, direct, and helpful — like a reliable guide in a voting booth.

If the user asks unrelated or inappropriate questions, politely decline and bring the focus back to elections or Chunaab.com platform support.
`;

import { GoogleGenAI } from "@google/genai";
import { conf } from "../conf/conf.js";
import { ApiResponse } from "../utils/customResponse/ApiResponse.js";

const ai = new GoogleGenAI({
    apiKey: conf.geminiApiKey,
});

export const chatbotController = async (req, res, next) => {
    try {
        const { message } = req.body;

        const result = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [
                { role: "user", parts: [{ text: systemPrompt }] },
                {
                    role: "user",
                    parts: [{ text: message }],
                },
            ],
        });

        const reply =
            result.candidates[0]?.content?.parts?.[0].text ||
            "I'm sorry, I couldn't understand that.";

        return res
            .status(200)
            .json(new ApiResponse(200, reply, "Chat successfully."));
    } catch (error) {
        console.error("Internal Server Error:", error);
        return res
            .status(500)
            .json(new ApiError(500, "Server error during chatting with bot"));
    }
};
