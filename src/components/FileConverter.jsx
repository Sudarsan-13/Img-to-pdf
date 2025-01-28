import { useState } from "react";
import { PDFDocument} from "pdf-lib";

const ImagesToPDF = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleFileUpload = (e) => {
    const selectedFiles = e.target.files;
    setFiles(selectedFiles);
    setError("");
    setSuccess("");
    setPdfUrl(null);
  };

  const handleRemoveFile = () => {
    setFiles([]);
    setError("");
    setSuccess("");
    setPdfUrl(null);
  };

  const handleConvertToPDF = async () => {
    if (files.length === 0) {
      setError("Please upload at least one image file.");
      return;
    }

    setLoading(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 20;

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const imageType = file.type;

        let image;
        if (imageType === "image/jpeg" || imageType === "image/jpg") {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (imageType === "image/png") {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          throw new Error(
            "Unsupported file type. Please upload JPG or PNG images."
          );
        }

        const { width: imgWidth, height: imgHeight } = image;

        const scale = Math.min(
          (pageWidth - 2 * margin) / imgWidth,
          (pageHeight - 2 * margin) / imgHeight
        );
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        page.drawImage(image, {
          x: (pageWidth - scaledWidth) / 2,
          y: (pageHeight - scaledHeight) / 2,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(blob);

      setPdfUrl(pdfUrl);
      setSuccess(
        "PDF created successfully! You can preview and download it below."
      );
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Failed to create the PDF.");
    } finally {
      setLoading(false);
    }
  };

  const truncateFileName = (fileName) => {
    return fileName.length > 15 ? fileName.slice(0, 15) + "..." : fileName;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-10">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          Images to PDF Converter
        </h1>

        <div className="mb-6">
          <label
            htmlFor="fileUpload"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Upload Images:
          </label>
          <div className="flex items-center space-x-3">
            {files.length > 0 ? (
              <div className="flex items-center border border-gray-300 rounded-lg p-3 w-full">
                <span className="text-sm text-gray-700 truncate w-full">
                  {files.length > 1
                    ? `${truncateFileName(files[0].name)} and ${
                        files.length - 1
                      } more`
                    : truncateFileName(files[0].name)}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <input
                id="fileUpload"
                type="file"
                accept="image/*"
                multiple
                className="block w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleFileUpload}
              />
            )}
          </div>
        </div>

        <button
          onClick={handleConvertToPDF}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 flex justify-center items-center"
        >
          {loading ? "Processing..." : "Convert to PDF"}
        </button>
        {error && (
          <p className="text-red-500 mt-4 text-sm text-center">{error}</p>
        )}
        {success && (
          <p className="text-green-500 mt-4 text-sm text-center">{success}</p>
        )}

        {pdfUrl && (
          <div className="mt-8">
            <h2 className="text-xl font-medium text-gray-700 mb-6 text-center">
              PDF Preview
            </h2>
            <div className="flex justify-center mb-6">
              <iframe
                src={pdfUrl}
                title="PDF Preview"
                className="w-full max-w-3xl h-96 border-4 border-gray-300 rounded-lg"
                type="application/pdf"
              ></iframe>
            </div>
            <div className="flex justify-center">
              <a
                href={pdfUrl}
                download="ImagesToPDF.pdf"
                className="bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600"
              >
                Download PDF
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagesToPDF;
