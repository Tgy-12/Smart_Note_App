const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');
const ApiError = require('./ApiError');

const extractText = async (file) => {
  const { buffer, mimetype, originalname } = file;

  try {
    if (mimetype === 'application/pdf') {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      return result.text;
    }

    if (mimetype === 'text/plain') {
      return buffer.toString('utf-8');
    }

    if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    throw new ApiError(400, `No text extractor available for: ${mimetype}`);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(422, `Failed to extract text from "${originalname}": ${error.message}`);
  }
};

module.exports = extractText;
