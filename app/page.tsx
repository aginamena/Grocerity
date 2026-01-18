"use client";
import React, { useState } from "react";

export default function Home() {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [design, setDesign] = useState<string>("");

  // Function to compress image
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 1200;
          const maxHeight = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob!], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            "image/jpeg",
            0.7, // 70% quality
          );
        };
      };
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedImages.length + files.length > 10) {
      setError("You can upload a maximum of 10 images.");
      return;
    }

    // Compress all images before adding
    const compressedFiles = await Promise.all(files.map(compressImage));
    const newImages = [...selectedImages, ...compressedFiles];
    setSelectedImages(newImages);
    setImagePreviews(newImages.map((f) => URL.createObjectURL(f)));
    setError(null);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newImages.map((f) => URL.createObjectURL(f)));
  };

  async function generateDesign() {
    if (selectedImages.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    setLoading(true);
    setError(null);
    setDesign("");

    try {
      // Step 1: Upload images to Supabase
      const uploadFormData = new FormData();
      selectedImages.forEach((img) => {
        uploadFormData.append("images", img);
      });

      const uploadRes = await fetch("/api/upload_images", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload images to storage");
      }

      const uploadData = await uploadRes.json();
      const imageUrls = uploadData.imageUrls;

      // Step 2: Send image URLs to design API
      const designRes = await fetch(
        "/api/generate_social_media_content_design",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrls }),
        },
      );

      if (!designRes.ok) {
        throw new Error("Failed to generate design");
      }

      const designData = await designRes.json();
      setDesign(designData.design);
      console.log(designData.design);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1>Video Generation with Multiple Product Images</h1>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        disabled={loading}
      />

      {imagePreviews.length > 0 && (
        <div
          style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}
        >
          {imagePreviews.map((src, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img
                src={src}
                style={{ width: 120, height: 120, objectFit: "cover" }}
              />
              <button
                onClick={() => removeImage(i)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  border: "none",
                  width: 24,
                  height: 24,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={generateDesign}
        disabled={loading || selectedImages.length === 0}
        style={{ marginTop: 20 }}
      >
        {loading ? "Generating…" : "Generate Video Design"}
      </button>

      {design && (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            marginTop: 24,
            background: "#111",
            color: "#0f0",
            padding: 16,
          }}
        >
          {design}
        </pre>
      )}
    </div>
  );
}
