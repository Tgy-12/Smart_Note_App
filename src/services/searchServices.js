const Chunk = require('./../models/Chunk');
const embeddingService = require('./embeddingservice');

const cosineSimilarity = (vectorA, vectorB) => {
    let dotProduct = 0;

    for (let i=0; i < vectorA.length; i+=1) {
        dotProduct += vectorA[i] * vectorB[i];
    }
    return dotProduct;
};
const semanticSearch = async (queryText, topK = 5, userId) => {
  const queryEmbedding = await embeddingService.generateEmbedding(queryText);

  const allChunks = await Chunk.find({ embedding: { $ne: [] } })
    .populate('noteId', 'title tags isPinned isArchived isDeleted userId')
    .lean();

  const scoredChunks = allChunks
      .filter(
        (chunk) =>
          chunk.noteId &&
          chunk.noteId.isDeleted === false &&
          chunk.noteId.userId &&
          chunk.noteId.userId.toString() === userId.toString()
      )
    .map((chunk) =>({
        chunkId: chunk._id,
        text: chunk.text,
        chunkIndex: chunk.chunkIndex,
        note: {
            id: chunk.noteId._id,
            title: chunk.noteId.title,
            tags: chunk.noteId.tags,
        },
        score: cosineSimilarity(queryEmbedding,  chunk.embedding)
      }));

      scoredChunks.sort((a, b) => b.score - a.score);
      return scoredChunks.slice(0, topK);
};
module.exports = { semanticSearch, };
