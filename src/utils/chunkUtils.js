CHUNK_SIZE = 500;
CHUNK_OVERLAP = 50;

const estimateChunkSize = (text) => Math.ceil(text.length/4);

const chunkText = (text, chunk_size=CHUNK_SIZE, c_overlap=CHUNK_OVERLAP) =>{
    const cleanedText = text.trim();
    chunks = [];
    if (cleanedText.length <= chunk_size){
        return [
            {
                text: cleanedText,
                tokenCount: estimateChunkSize(cleanedText)
            },
        ];
    };

    let start = 0;
    while (start < cleanedText.length){
        const end = Math.min(start+chunk_size, cleanedText.length);
        const chunkPeice = cleanedText.slice(start, end).trim();

        if (chunkPeice.length > 0){
            chunks.push({
                text: chunkPeice,
                tokenCount: estimateChunkSize(chunkPeice)
            });
        };
        if (end === cleanedText.length) break;

        start = end - c_overlap;
    }
    return chunks;
}
module.exports = chunkText;
