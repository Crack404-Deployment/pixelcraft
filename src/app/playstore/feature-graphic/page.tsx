"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Upload, Download, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

export default function FeatureGraphic() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const targetWidth = 1024;
  const targetHeight = 500;

  const handleFileSelect = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setProcessedUrl(null);
  };

  const executeImageResize = async () => {
    if (!selectedFile || !previewUrl) return;
    const img = new Image();
    img.src = previewUrl;
    await new Promise((resolve) => { img.onload = resolve; });
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      // Save to sessionStorage for ZIP export
      sessionStorage.setItem("featureGraphic", canvas.toDataURL("image/jpeg", 0.9));

      canvas.toBlob((blob) => {
        if (!blob) return;
        setProcessedUrl(URL.createObjectURL(blob));
      }, "image/png", 1.0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/70 h-16 flex items-center px-6 gap-4">
        <Link href="/playstore" className="text-slate-400 hover:text-white"><ArrowLeft className="h-5 w-5" /></Link>
        <span className="font-bold text-lg">Step 2: Feature Graphic</span>
      </header>
      <StepProgressBar currentStep={2} />
      <main className="max-w-3xl mx-auto px-4 py-10 w-full flex-1">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-300">Feature Graphic</h1>
          <p className="text-slate-400 text-sm mt-2">Must be PNG/JPEG, up to 15 MB, exactly 1024x500 px.</p>
        </div>
        <Card className="border-slate-800 bg-slate-900/40 p-8">
            {!selectedFile ? (
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-700 p-12 text-center rounded-xl cursor-pointer hover:border-indigo-400">
                <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files?.[0])} accept="image/png, image/jpeg" className="hidden" />
                <Upload className="h-8 w-8 mx-auto text-indigo-400 mb-2" />
                Upload Feature Graphic
              </div>
            ) : (
              <div className="border border-slate-700 p-4 rounded-xl flex justify-between items-center mb-4">
                <span className="truncate max-w-[250px]">{selectedFile.name}</span>
                <Button variant="ghost" onClick={() => setSelectedFile(null)}><Trash2 className="h-4 w-4 text-rose-400" /></Button>
              </div>
            )}
            
            {!processedUrl ? (
              <Button onClick={executeImageResize} disabled={!selectedFile} className="w-full bg-indigo-500 mt-4 font-bold h-11 rounded-xl">Format to 1024x500</Button>
            ) : (
              <div className="flex flex-col gap-2 mt-4">
                <Button onClick={() => {
                  const a = document.createElement("a");
                  a.href = processedUrl; a.download = "feature-graphic-1024x500.png"; a.click();
                }} className="w-full bg-orange-500 text-slate-950 font-bold h-11 rounded-xl gap-2">
                  <Download className="h-4 w-4"/> Download Feature Graphic
                </Button>
                <Link href="/playstore/phone-screenshots">
                  <Button className="w-full bg-slate-100 text-slate-900 font-bold h-11 rounded-xl mt-2 gap-2">Proceed to Phone Screenshots <ArrowRight className="h-4 w-4"/></Button>
                </Link>
              </div>
            )}
        </Card>
      </main>
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        &copy; 2026 <a href="https://crack404.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">Crack404</a> Pixel Craft. All rights reserved.
      </footer>
    </div>
  );
}