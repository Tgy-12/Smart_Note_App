const mongoose = require("mongoose");
const Chunk = require("./../models/Chunk");
const embeddingService = require("./embeddingservice");

/*const semanticSearch = async (queryText, topK = 5, userId) => {
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
};*/ //thiis was for the local mon go uri runing

const MIN_RELEVANCE_SCORE = 0.5;

const semanticSearch = async (queryText, topK = 5, userId) => {
  const queryEmbedding = await embeddingService.generateEmbedding(queryText);

  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: "autoembed_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: topK * 20,
        limit: topK,
        filter: {
          userId: new mongoose.Types.ObjectId(userId),
          isSearchable: true,
          //isDeleted: false,
        },
      },
    },
    {
      $lookup: {
        from: "notes",
        localField: "noteId",
        foreignField: "_id",
        as: "note",
      },
    },
    { $unwind: "$note" },
    {
      $project: {
        chunkId: "$_id",
        text: 1,
        chunkIndex: 1,
        note: { id: "$note._id", title: "$note.title", tags: "$note.tags" },
        score: { $meta: "vectorSearchScore" },
      },
    },
    {
      $match: {
        score: { $gte: MIN_RELEVANCE_SCORE },
      },
    },
  ]);

  return results;
};

module.exports = { semanticSearch };
