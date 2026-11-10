const Groq = require("groq-sdk");
const env = require("./../config/env");
const logger = require("./../config/logger");
const ApiError = require("./../utils/ApiError");

const groqClient = new Groq({ apiKey: env.groqApiKey });

const buildContextBlock = (chunks) => {
  return chunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1} — from note "${chunk.note.title}"]\n${chunk.text}`,
    )
    .join("\n\n---\n\n");
};

const SYSTEM_PROMPT = `You are a helpful assistant that answers questions using the user's own notes as the primary source of truth.

Rules:
- Your answer must be anchored in the provided context — only bring in outside/general knowledge to clarify or complete something the context already mentions (e.g., if a note mentions a place, event, or term, you may add well-known factual context about it).
- Never introduce outside knowledge about something the context does NOT mention at all.
- You MUST clearly distinguish the two types of information in your answer, using this exact labeling style:
  - Prefix note-derived statements with "From your notes:"
  - Prefix any added general knowledge with "General knowledge:"
- If the context doesn't mention the subject of the question at all, say so plainly — do not answer from general knowledge alone.
- Keep answers concise and directly relevant to the question.`;

const generateAnswer = async (question, retrievedChunks) => {
  if (retrievedChunks.length === 0) {
    return {
      answer:
        "I couldn't find any relevant notes to answer that question from ur nores.",
      groundedInSources: false,
    };
  }

  const contextBlock = buildContextBlock(retrievedChunks);

  try {
    const completion = await groqClient.chat.completions.create({
      model: env.groqModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Context from my notes:\n\n${contextBlock}\n\nQuestion: ${question}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 500,
    });

    const answer = completion.choices[0].message.content;

    return {
      answer,
      groundedInSources: true,
    };
  } catch (error) {
    logger.error(`Groq generation failed: ${error.message}`);
    throw new ApiError(
      502,
      "Answer generation service is currently unavailable", //if the groq api fails, we return a 502 error to the client and to fix
    );
  }
};
//console.log("Groq model used:", env.groqModel);
module.exports = {
  generateAnswer,
};
