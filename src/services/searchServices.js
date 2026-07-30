const chunk = require('./../models/Chunk');
const embeddingService = require('./embeddingservice');

let dotProduct = 0;

const cosineSimilarity = async(vectorA, vectorB) => {
    for (let i=0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i];
    }
    return dotProduct;
};

const semanticSearch = async(queryText, topK = 5)=> {
    const queryEmbbeding = await embeddingService.generateEmbedding(queryText);

    const allChunks = await Chunk.find( {embedding: { $ne: []} })
    .populate('noteId', 'title tags idPinned isarchived isDeleted')
    .lean();

    const scoredChunks = allChunks.filter((chunk) => chunk.noteId && chunk.noteId.isDeleted === false)
    .map((chunk)=>({
        chunkId: chunk._id,
        text: chunk.text,
        chunkIndex: chunk.chunkIndex,
        note: {
            id: chunk.chunkId._id,
            title: chunk.noteId.title,
            tags: chunk.noteId.tags,
        },
        score: cosineSimilarity(queryEmbbeding,  chunk.embedding)
      }));

      scoredChunks.sort((a, b) => b.score - a.score);
      return scoredChunks.slice(0, topK);
};
module.exports = { semanticSearch, };
