import React, { useState } from "react";
import { Camera, Upload, Image, X, Check } from "lucide-react";
import axiosInstance from "../utils/axios";

export default function RaspiCam() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsUploaded(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setIsUploaded(false);
    const formData = new FormData();
    formData.append("image", selectedFile);
    try {
      const response = await axiosInstance.post(
        "/sensors/detect-white-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Upload successful:", response.data);
      setIsUploaded(true);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsUploaded(false);
    // Clear the input
    const input = document.querySelector('input[type="file"]');
    if (input) input.value = "";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Camera className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Alternative for Raspberry Pi Camera
            </h2>
            <p className="text-sm text-gray-600">Image capture and upload</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* File Upload Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Image
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-purple-50 transition-colors">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Image className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Choose an image file
                  </p>
                  <p className="text-sm text-gray-500">
                    Click to browse or drag and drop
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* File Info */}
        {selectedFile && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Image className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClearImage}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Image Preview */}
        {previewUrl && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Preview</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <img
                src={previewUrl}
                alt="Preview"
                className="rounded-lg shadow-sm max-w-full max-h-80 object-contain mx-auto block"
              />
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading || isUploaded}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              !selectedFile || isUploading || isUploaded
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </>
            ) : isUploaded ? (
              <>
                <Check className="w-5 h-5" />
                <span>Uploaded Successfully</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload Image</span>
              </>
            )}
          </button>

          {selectedFile && (
            <button
              onClick={handleClearImage}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Upload Status */}
        {isUploaded && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Image uploaded successfully!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
