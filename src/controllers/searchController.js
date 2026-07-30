const asyncHandler = require('./../utils/asyncHandler');
const searchServices = require('./../services/searchServices');

const ApiError =  require('./../utils/ApiError');

const semanticSearchV = async (req, res)=>{
    const {q, topK} = req.query;

    if (!q || q.trim().length === 0) {
        throw new ApiError(400, 'The query parameter is required!');
    };

    const parsedTopK = Math.min(Math.max(parseInt(topK, 10) ||5, 1), 20);

    const results =  await searchServices.semanticSearch(q, parsedTopK);

    res.status(200).json({
        status: true,
        message: 'Semantic search completed succefully',
        query: q,
        count: results.length,
        data: results,
    });
};

const semanticSearch = asyncHandler(semanticSearchV);
module.exports = { semanticSearch };
