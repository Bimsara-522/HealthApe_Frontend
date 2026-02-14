"use client";

import { useState } from "react";

export default function UploadRecord() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    console.log("Uploading:", file.name);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Upload Medical Record</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
