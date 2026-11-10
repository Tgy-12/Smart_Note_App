const asyncHandler = require("./../utils/asyncHandler");
const searchServices = require("./../services/searchServices");
const generationService = require("./../services/generationService");
const ApiError = require("./../utils/ApiError");

const semanticSearchV = async (req, res) => {
  const { q, topK } = req.query;

  if (!q || q.trim().length === 0) {
    throw new ApiError(400, 'The query parameter "q" is required!');
  }

  const parsedTopK = Math.min(Math.max(parseInt(topK, 10) || 5, 1), 20);

  const results = await searchServices.semanticSearch(
    q,
    parsedTopK,
    req.user.id,
  );

  if (results.length === 0) {
    res.status(200).json({
      status: true,
      message: "No relevant results found for the query.",
      query: q,
      count: results.length,
      data: results,
    });
  } else {
    res.status(200).json({
      status: true,
      message: "Semantic search completed successfully",
      query: q,
      count: results.length,
      data: results,
    });
  }
};

const askV = async (req, res) => {
  const { q, topK } = req.query;

  if (!q || q.trim().length === 0) {
    throw new ApiError(400, 'Query parameter "q" is required');
  }

  const parsedTopK = Math.min(Math.max(parseInt(topK, 10) || 5, 1), 10);

  const retrievedChunks = await searchServices.semanticSearch(
    q,
    parsedTopK,
    req.user.id,
  );
  const result = await generationService.generateAnswer(q, retrievedChunks);

  res.status(200).json({
    status: true,
    message: "Answer generated successfully",
    query: q,
    data: {
      answer: result.answer,
      groundedInSources: result.groundedInSources,
      sources: retrievedChunks,
    },
  });
};

const ask = asyncHandler(askV);
const semanticSearch = asyncHandler(semanticSearchV);

module.exports = { semanticSearch, ask };
