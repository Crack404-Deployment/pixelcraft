"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Upload, Download, Trash2, HardDrive, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const StepProgressBar = ({ currentStep }: { currentStep: number }) => {
  const steps = [1, 2, 3, 4, 5, 6];

  return (
    <div className="w-full border-b border-slate-800/80 bg-slate-950/70">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {steps.map((stepNumber, index) => {
            const isActive = currentStep === stepNumber;
            const isComplete = currentStep > stepNumber;

            return (
              <div key={stepNumber} className="flex items-center flex-1 last:flex-none">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? "bg-indigo-500 text-white ring-4 ring-indigo-500/20"
                      : isComplete
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isComplete ? "✓" : stepNumber}
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-all ${
                      currentStep > stepNumber ? "bg-emerald-500" : "bg-slate-800"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function PlaystoreImageCreator() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedSize, setProcessedSize] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const targetWidth = 512;
  const targetHeight = 512;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setProcessedUrl(null);
    setProcessedSize(null);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedUrl(null);
    setProcessedSize(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const executeImageResize = async () => {
    if (!selectedFile || !previewUrl) return;
    setIsProcessing(true);
    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize canvas context.");
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Save to sessionStorage for ZIP export
      sessionStorage.setItem("appIcon", canvas.toDataURL("image/jpeg", 0.9));

      canvas.toBlob((blob) => {
        if (!blob) return setIsProcessing(false);
        setProcessedUrl(URL.createObjectURL(blob));
        setProcessedSize(blob.size);
        setIsProcessing(false);
      }, "image/png", 1.0);
    } catch (error) {
      console.error("Resize Error:", error);
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!processedUrl || !selectedFile) return;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = processedUrl;
    const originalName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf(".")) || "icon";
    downloadAnchor.download = `${originalName}-512x512.png`;
    downloadAnchor.click();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#090d16] text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-bold text-lg">Step 1: App Icon</span>
        </div>
      </header>

      <StepProgressBar currentStep={1} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full flex-1 flex flex-col items-center">
        <div className="text-center max-w-2xl mb-8 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-indigo-300">App icon</h1>
          <p className="text-slate-400 text-sm">Must be PNG/JPEG, up to 1 MB, exactly 512x512 px.</p>
        </div>

        <Card className="w-full border-slate-800/90 bg-slate-900/40 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {!selectedFile ? (
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files?.[0]); }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed transition-all duration-200 rounded-2xl p-8 sm:p-12 text-center bg-slate-950/50 flex flex-col items-center justify-center cursor-pointer min-h-[230px] ${isDragging ? "border-indigo-400 bg-indigo-500/10" : "border-slate-800 hover:border-slate-700"}`}
              >
                <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files?.[0])} accept="image/png, image/jpeg" className="hidden" />
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-3 bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20"><Upload className="h-7 w-7" /></div>
                <p className="text-sm font-semibold text-slate-200">Click to browse or drop app icon</p>
              </div>
            ) : (
              <div className="border border-slate-800 bg-slate-950/80 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {previewUrl && <img src={previewUrl} alt="Preview" className="h-14 w-14 object-cover rounded-lg border border-slate-800" />}
                  <div>
                    <p className="text-sm font-medium text-slate-200 truncate max-w-[200px] sm:max-w-[320px]">{selectedFile.name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>Original: {formatBytes(selectedFile.size)}</span>
                      {processedSize && <span className={`font-semibold ml-2 ${processedSize > 1048576 ? "text-rose-400" : "text-orange-400"}`}>→ Output: {formatBytes(processedSize)}</span>}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={clearFile} className="text-slate-400 hover:text-rose-400"><Trash2 className="h-4 w-4" /></Button>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              {!processedUrl ? (
                <Button onClick={executeImageResize} disabled={!selectedFile || isProcessing} className="w-full bg-indigo-500 hover:bg-indigo-400 text-slate-50 font-bold h-11 rounded-xl">
                  {isProcessing ? "Formatting..." : "Format to 512x512"}
                </Button>
              ) : (
                <>
                  <Button onClick={triggerDownload} className="w-full bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold h-11 rounded-xl gap-2">
                    <Download className="h-4 w-4" /> Download Playstore Icon
                  </Button>
                  <Link href="/playstore/feature-graphic" className="w-full">
                    <Button className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold h-11 rounded-xl gap-2 mt-2">
                      Proceed to Feature Graphic <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        &copy; 2026 <a href="https://crack404.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">Crack404</a> Pixel Craft. All rights reserved.
      </footer>
    </div>
  );
}