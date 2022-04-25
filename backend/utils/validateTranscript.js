const validateTranscript = ({ text, info, metadata }) => {

    if (metadata) return false;
    if (Object.keys(info).length > 5) return false;
    if (info.PDFFormatVersion !== "1.3") return false;
    if (info.Producer !== "FPDF 1.53") return false;
    if (!text) return false;
    if (!text.length) return false;

    return true;
};

module.exports = {
    validateTranscript
}