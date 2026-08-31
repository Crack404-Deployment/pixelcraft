"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Sliders, 
  Sparkles, 
  Upload, 
  Download, 
  Trash2, 
  HardDrive,
  Smartphone,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [activeTool, setActiveTool] = useState<"compress" | "remove-bg">("compress");
  const [showPlaystorePopup, setShowPlaystorePopup] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedSize, setProcessedSize] = useState<number | null>(null);
  
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [targetWidth, setTargetWidth] = useState<string>("1920");
  const [targetHeight, setTargetHeight] = useState<string>("");
  const [targetFormat, setTargetFormat] = useState<"webp" | "jpeg" | "png">("jpeg");

  useEffect(() => {
    if (showPlaystorePopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showPlaystorePopup]);

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedUrl(null);
    setProcessedSize(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerDownload = (url: string, filename: string) => {
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = url;
    downloadAnchor.download = filename;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  const executeImageResize = async () => {
    if (!selectedFile || !previewUrl) return;
    setIsProcessing(true);
    setProgressText("Resizing image securely...");

    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const origWidth = img.width;
      const origHeight = img.height;
      
      let width = parseInt(targetWidth, 10);
      if (!width || isNaN(width) || width <= 0) {
        width = origWidth;
      }

      let height = parseInt(targetHeight, 10);
      if (!height || isNaN(height) || height <= 0) {
        height = Math.round((origHeight / origWidth) * width);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Could not initialize canvas context.");
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = targetFormat === "png" ? "image/png" : `image/${targetFormat}`;
      const qualityDecimal = 1.0; 

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsProcessing(false);
            return;
          }

          const outputUrl = URL.createObjectURL(blob);
          setProcessedUrl(outputUrl);
          setProcessedSize(blob.size);

          const ext = targetFormat === "jpeg" ? "jpg" : targetFormat;
          const originalName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf(".")) || "image";
          
          // Remove any existing dimensions like 512x512 from the original name and append the new exact ones
          const cleanName = originalName.replace(/[-_]?\d+x\d+/gi, '');
          
          triggerDownload(outputUrl, `${cleanName || 'image'}-${width}x${height}.${ext}`);

          setIsProcessing(false);
          setProgressText("");
        },
        mimeType,
        qualityDecimal
      );
    } catch (error) {
      console.error("Resize Error:", error);
      setIsProcessing(false);
      setProgressText("");
    }
  };

  const executeBackgroundRemoval = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProgressText("Removing background..."); 

    try {
      const imglyModule = await import("@imgly/background-removal") as any;
      const removeBackground = 
        imglyModule.removeBackground || 
        imglyModule.default?.default || 
        imglyModule.default;

      if (typeof removeBackground !== "function") {
        throw new Error("Could not resolve the removeBackground function from the module.");
      }
      
      // Changed to the "small" model to drastically improve speed for non-human subjects and general usage
      const resultBlob = await removeBackground(selectedFile, {
        model: "small" 
      });

      const outputUrl = URL.createObjectURL(resultBlob);
      setProcessedUrl(outputUrl);
      setProcessedSize(resultBlob.size);

    } catch (error: any) {
      console.error("Background Removal Error:", error);
      alert(`Background removal process error: ${error?.message || "Please check internet connection."}`);
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-orange-scroll::-webkit-scrollbar {
          width: 10px;
        }
        .custom-orange-scroll::-webkit-scrollbar-track {
          background: #FFD580; 
          border-radius: 5px;
        }
        .custom-orange-scroll::-webkit-scrollbar-thumb {
          background: #FF8C00; 
          border-radius: 5px;
          border: 2px solid #FFD580; 
        }
        .custom-orange-scroll::-webkit-scrollbar-thumb:hover {
          background: #E67E22; 
        }
      `}} />

      <div className="min-h-screen flex flex-col justify-between bg-[#090d16] text-slate-100 relative">
        <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-10 w-10 object-contain rounded-xl" 
              />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex-1 flex flex-col items-center z-10">
          
          <div className="text-center max-w-2xl mb-8 space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {activeTool === "compress" ? (
                <>Image <span className="text-sky-300">Resizer</span></>
              ) : (
                <>Background <span className="text-orange-300">Remover</span></>
              )}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              {activeTool === "compress" 
                ? "Change image dimensions while maintaining 100% maximum quality."
                : "Isolate subjects and erase backgrounds automatically with local AI vision models."
              }
            </p>
          </div>

          <div className="flex bg-slate-900/90 p-1.5 border border-slate-800 rounded-2xl mb-6 w-full max-w-md shadow-xl">
            <button
              onClick={() => {
                setActiveTool("compress");
                setProcessedUrl(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                activeTool === "compress"
                  ? "bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sliders className="h-4 w-4" />
              Resize Image
            </button>
            
            <button
              onClick={() => {
                setActiveTool("remove-bg");
                setProcessedUrl(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                activeTool === "remove-bg"
                  ? "bg-orange-500/15 text-orange-300 border border-orange-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Remove Background
            </button>
          </div>

          <Card className="w-full border-slate-800/90 bg-slate-900/40 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-6">
              
              {!selectedFile ? (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed transition-all duration-200 rounded-2xl p-8 sm:p-12 text-center bg-slate-950/50 flex flex-col items-center justify-center cursor-pointer min-h-[230px] ${
                    isDragging 
                      ? activeTool === "compress" ? "border-sky-400 bg-sky-500/10" : "border-orange-400 bg-orange-500/10"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden" 
                  />
                  
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                    activeTool === "compress" 
                      ? "bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20" 
                      : "bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/20"
                  }`}>
                    {activeTool === "compress" ? <Upload className="h-7 w-7" /> : <Sparkles className="h-7 w-7" />}
                  </div>

                  <p className="text-sm sm:text-base font-semibold text-slate-200">
                    Click to browse or drop image here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PNG, JPG, or WEBP up to 25MB
                  </p>
                </div>
              ) : (
                <div className="border border-slate-800 bg-slate-950/80 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {previewUrl && (
                      <img src={previewUrl} alt="Preview" className="h-14 w-14 object-cover rounded-lg border border-slate-800" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-200 truncate max-w-[200px] sm:max-w-[320px]">
                        {selectedFile.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                        <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                        <span>Original: {formatBytes(selectedFile.size)}</span>
                        {processedSize && activeTool === "compress" && (
                          <span className="text-emerald-400 font-semibold ml-2">
                            → Output: {formatBytes(processedSize)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearFile} className="text-slate-400 hover:text-rose-400">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {activeTool === "compress" ? (
                <div className="space-y-5 pt-2">
                  <div className="space-y-4 bg-slate-950/40 p-5 rounded-xl border border-slate-800/80">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[11px] text-slate-400 font-medium block mb-1">Target Width (px)</label>
                        <input 
                          type="number" 
                          value={targetWidth}
                          onChange={(e) => setTargetWidth(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-400"
                          placeholder="e.g. 1920"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 font-medium block mb-1">Target Height (px) - Optional</label>
                        <input 
                          type="number" 
                          value={targetHeight}
                          onChange={(e) => setTargetHeight(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-400"
                          placeholder="Auto"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 font-medium block mb-1">Export Format</label>
                        <select 
                          value={targetFormat}
                          onChange={(e) => setTargetFormat(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-400"
                        >
                          <option value="jpeg">JPG</option>
                          <option value="png">PNG</option>
                          <option value="webp">WEBP</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={executeImageResize} 
                    disabled={!selectedFile || isProcessing}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white py-6 rounded-xl font-semibold text-base"
                  >
                    {isProcessing ? progressText : "Resize & Download"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-5 pt-2">
                  <Button 
                    onClick={executeBackgroundRemoval} 
                    disabled={!selectedFile || isProcessing || processedUrl !== null}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-xl font-semibold text-base"
                  >
                    {isProcessing ? progressText : processedUrl ? "Background Removed!" : "Remove Background Automatically"}
                  </Button>
                  
                  {processedUrl && (
                    <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-center gap-4 justify-between mt-4">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm font-medium">Ready to download</span>
                      </div>
                      <Button 
                        onClick={() => triggerDownload(processedUrl, `${selectedFile?.name.split('.')[0] || 'image'}-nobg.png`)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto"
                      >
                        <Download className="h-4 w-4 mr-2" /> Download Transparent PNG
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-12 text-center w-full flex justify-center">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => setShowPlaystorePopup(true)}
              className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-6 rounded-full text-base sm:text-lg font-medium cursor-pointer shadow-lg hover:shadow-xl transition-all w-full max-w-sm"
            >
              <Smartphone className="h-5 w-5 mr-3" />
              Playstore Guide
            </Button>
          </div>

        </main>
        <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        &copy; 2026 <a href="https://crack404.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">Crack404</a> Pixel Craft. All rights reserved.
      </footer>
      </div>

      {showPlaystorePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0b101e] border border-slate-800 rounded-2xl w-full max-w-[500px] max-h-[85vh] flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            
            <div className="sticky top-0 bg-[#0b101e] z-10 px-6 py-5 border-b border-slate-800/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-indigo-300 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-indigo-400" />
                Playstore Asset Workflow
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto custom-orange-scroll space-y-6">
              
              <p className="text-slate-300 text-[15px] leading-relaxed">
                Prepare your app assets for Google Play Console. We process everything locally in your browser.
              </p>

              <div className="bg-[#121827] border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-1">What You Provide</h3>
                    <p className="text-slate-400 text-sm">Unformatted icons, artwork, and raw screenshots.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-1">What You Get</h3>
                    <p className="text-slate-400 text-sm">Resized, formatted PNG/JPEGs matching Google Play specs.</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#121827] border border-slate-800/80 rounded-xl p-5">
                <h3 className="text-white font-semibold text-sm mb-4">Steps Overview:</h3>
                <ul className="space-y-2.5">
                  {[
                    "Step 1: App Icon (512x512)",
                    "Step 2: Feature Graphic (1024x500)",
                    "Step 3: Phone Screenshots",
                    "Step 4: 7-inch Tablet Screenshots",
                    "Step 5: 10-inch Tablet Screenshots",
                    "Step 6: Export ZIP & return home"
                  ].map((step, i) => {
                    const [stepPrefix, ...rest] = step.split(': ');
                    return (
                      <li key={i} className="flex items-center gap-2.5 text-slate-400 text-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                        <span>
                          <strong className="text-slate-200">{stepPrefix}:</strong> {rest.join(': ')}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPlaystorePopup(false)}
                  className="w-1/3 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Cancel
                </Button>
                <Link href="/playstore" className="flex-1 block">
                  <Button 
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium"
                  >
                    Start Workflow
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}