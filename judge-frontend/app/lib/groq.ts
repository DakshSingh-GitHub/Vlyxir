import "server-only";
import Groq from "groq-sdk";

function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("Missing GROQ_API_KEY. Set it in judge-frontend/.env.local and restart Next.js.");
    }

    return new Groq({ apiKey });
}

export async function getGroqChatCompletions() {
    const groq = getGroqClient();

    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: "Hi Model",
            },
        ],
        model: "openai/gpt-oss-20b"
    });
}