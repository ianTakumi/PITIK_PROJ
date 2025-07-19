import React, { useState } from "react";

export default function RaspiCam() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Raspberry Pi Camera Upload</h2>

      <div className="flex flex-col items-start space-y-4">
        <label className="text-gray-300 text-sm">
          Select Image:
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block mt-1 text-sm text-white"
          />
        </label>

        {previewUrl && (
          <div className="w-full">
            <p className="text-gray-400 text-sm mb-1">Preview:</p>
            <img
              src={previewUrl}
              alt="Preview"
              className="rounded-lg shadow max-w-full max-h-64 object-contain"
            />
          </div>
        )}

        <button
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
        >
          Upload Image
        </button>
      </div>
    </div>
  );
}
