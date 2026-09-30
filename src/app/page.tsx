"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Sliders, 
  Sparkles, 
  Palette,
  Upload, 
  Download, 
  Trash2, 
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  PaintBucket,
  Plus,
  BookOpen,
  Smartphone,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ToolType = "compress" | "remove-bg" | "bg-editor";

const PRESET_COLORS = [
  "#ffffff", "#000000", "#3b82f6", "#ef4444", 
  "#10b981", "#eab308", "#a855f7", "#f97316",
];

const PRESET_IMAGES = [
  "bg1.jpg",
  "bg2.jpg",
  "bg3.jpg",
  "bg4.jpg",
  "bg5.jpg",
  "bg6.jpg"
];

export default function Home() {
  const [activeTool, setActiveTool] = useState<ToolType>("compress");
  const [pendingTool, setPendingTool] = useState<ToolType | null>(null);
  
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showPlaystoreModal, setShowPlaystoreModal] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedSize, setProcessedSize] = useState<number | null>(null);
  
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  // Resize settings state
  const [targetWidth, setTargetWidth] = useState<string>("1920");
  const [targetHeight, setTargetHeight] = useState<string>("");
  const [targetFormat, setTargetFormat] = useState<"webp" | "jpeg" | "png">("jpeg");

  // Background Editor state
  const [bgMode, setBgMode] = useState<"color" | "image">("color");
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [bgImage, setBgImage] = useState<string>(PRESET_IMAGES[0]);
  const [bgExportFormat, setBgExportFormat] = useState<"jpeg" | "png" | "webp">("jpeg");

  const isWorking = selectedFile !== null || isProcessing;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isWorking) {
        e.preventDefault();
        e.returnValue = ""; 
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isWorking]);

  useEffect(() => {
    if (showDiscardModal || showPlaystoreModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showDiscardModal, showPlaystoreModal]);

  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const handleFileSelect = useCallback((file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setProcessedUrl(null);
    setProcessedSize(null);
  }, []);

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setBgImage(url); 
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file && file.type.startsWith("image/")) {
          if (isWorking && !confirm("Replace existing work with pasted image?")) return;
          handleFileSelect(file);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFileSelect, isWorking]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedUrl(null);
    setProcessedSize(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleToolSwitchAttempt = (targetTool: ToolType) => {
    if (activeTool === targetTool || isProcessing) return;
    if (isWorking) {
      setPendingTool(targetTool);
      setShowDiscardModal(true);
    } else {
      setActiveTool(targetTool);
    }
  };

  const confirmDiscardWork = () => {
    clearFile();
    if (pendingTool) setActiveTool(pendingTool);
    setPendingTool(null);
    setShowDiscardModal(false);
  };

  const triggerDownload = useCallback((url: string, filename: string) => {
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = url;
    downloadAnchor.download = filename;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  }, []);

  // AUTOMATIC TRANSFER TO BG EDITOR
  const handleEditBackground = async () => {
    if (!processedUrl || !selectedFile) return;

    setIsProcessing(true);
    setProgressText("Transferring to BG Editor...");

    try {
      const res = await fetch(processedUrl);
      const blob = await res.blob();

      const newFileName = selectedFile.name.replace(/\.[^/.]+$/, "") + "-nobg.png";
      const newFile = new File([blob], newFileName, { type: "image/png" });

      setSelectedFile(newFile);
      setPreviewUrl(processedUrl);
      setProcessedUrl(null);
      setProcessedSize(null);

      setActiveTool("bg-editor");
    } catch (err) {
      alert("Failed to transfer image to editor.");
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  // FAST RESIZE IMPLEMENTATION
  const executeImageResize = async () => {
    if (!selectedFile || !previewUrl) return;
    setIsProcessing(true);
    setProgressText("Resizing...");

    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

      let width = parseInt(targetWidth, 10);
      if (!width || isNaN(width) || width <= 0) width = img.width;

      let height = parseInt(targetHeight, 10);
      if (!height || isNaN(height) || height <= 0) {
        height = Math.round((img.height / img.width) * width);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize canvas.");
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = targetFormat === "png" ? "image/png" : `image/${targetFormat}`;
      canvas.toBlob((blob) => {
          if (!blob) return setIsProcessing(false);
          const outputUrl = URL.createObjectURL(blob);
          setProcessedUrl(outputUrl);
          setProcessedSize(blob.size);
          const ext = targetFormat === "jpeg" ? "jpg" : targetFormat;
          triggerDownload(outputUrl, `${selectedFile.name.split('.')[0]}-${width}x${height}.${ext}`);
          setIsProcessing(false);
          setProgressText("");
        },
        mimeType,
        0.92
      );
    } catch (error) {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  // BACKGROUND REMOVAL — USE A CONTINUOUS LOADING STATE UNTIL THE REAL RESULT IS READY
  const executeBackgroundRemoval = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgressText("Loading...");


    try {
      const imglyModule = await import("@imgly/background-removal") as any;
      const removeBg =
        imglyModule.removeBackground ||
        imglyModule.default?.default ||
        imglyModule.default;

      const resultBlob = await removeBg(selectedFile, {
        progress: () => {
          // Intentionally do not expose the library's percentage.
          // The UI remains in a continuous loading animation instead.
        },
      });

      if (!resultBlob) {
        throw new Error("Background removal returned no result.");
      }

      const outputUrl = URL.createObjectURL(resultBlob);
      setProcessedUrl(outputUrl);
      setProcessedSize(resultBlob.size);
    } catch (err) {
      alert("Background removal error. Please check your connection.");
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  // FAST BG EDITOR WITH SMOOTH EDGE DEFRINGING & BLENDING
  const executeBackgroundEdit = async () => {
    if (!selectedFile || !previewUrl) return;
    setIsProcessing(true);
    setProgressText("Applying background...");

    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Context failed.");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (bgMode === "image") {
        const bgImgObj = new Image();
        bgImgObj.src = bgImage.startsWith("blob:") ? bgImage : `/${bgImage}`;
        await new Promise((res, rej) => { bgImgObj.onload = res; bgImgObj.onerror = rej; });
        
        const scale = Math.max(canvas.width / bgImgObj.width, canvas.height / bgImgObj.height);
        const scaledWidth = bgImgObj.width * scale;
        const scaledHeight = bgImgObj.height * scale;
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;
        
        ctx.drawImage(bgImgObj, x, y, scaledWidth, scaledHeight);
      }

      const fgCanvas = document.createElement("canvas");
      fgCanvas.width = canvas.width;
      fgCanvas.height = canvas.height;
      const fgCtx = fgCanvas.getContext("2d");

      if (fgCtx) {
        fgCtx.imageSmoothingEnabled = true;
        fgCtx.imageSmoothingQuality = "high";
        fgCtx.drawImage(img, 0, 0, canvas.width, canvas.height);

        ctx.drawImage(fgCanvas, 0, 0);

        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 0.25;
        ctx.filter = "blur(1px)";
        ctx.drawImage(fgCanvas, 0, 0);
        ctx.restore();
      } else {
        ctx.drawImage(img, 0, 0);
      }

      const exportType = bgExportFormat === "jpeg" ? "image/jpeg" : `image/${bgExportFormat}`;
      canvas.toBlob((blob) => {
          if (blob) {
            const outputUrl = URL.createObjectURL(blob);
            setProcessedUrl(outputUrl);
            const ext = bgExportFormat === "jpeg" ? "jpg" : bgExportFormat;
            triggerDownload(outputUrl, `${selectedFile.name.split('.')[0]}-bg.${ext}`);
          }
          setIsProcessing(false);
          setProgressText("");
        },
        exportType,
        0.95
      );
    } catch (error) {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  const activeBgImageStyle = bgImage.startsWith("blob:") ? `url(${bgImage})` : `url(/${bgImage})`;

  return (
    <>
      {/* CUSTOM ORANGE SCROLLBAR STYLING */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #090d16;
        }
        ::-webkit-scrollbar-thumb {
          background: #f97316;
          border-radius: 9999px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #ea580c;
        }
        * {
          scrollbar-color: #f97316 #090d16;
          scrollbar-width: thin;
        }
      `}</style>

      <div className="min-h-screen flex flex-col justify-between bg-[#090d16] text-slate-100 relative overflow-hidden">
        
        {/* NAVBAR WITH PLAYSTORE GUIDE MODAL TRIGGER */}
        <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Pixel Craft Logo" className="h-8 w-auto object-contain" />
            </div>
            <div className="flex items-center">
              <Button 
                onClick={() => setShowPlaystoreModal(true)} 
                variant="outline" 
                className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 bg-transparent flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Playstore Guide</span>
                <span className="sm:hidden">Guide</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex-1 flex flex-col items-center z-10">
          <div className="flex bg-slate-900/90 p-1.5 border border-slate-800 rounded-2xl mb-6 w-full max-w-lg shadow-xl backdrop-blur-sm">
            <button onClick={() => handleToolSwitchAttempt("compress")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs sm:text-sm ${activeTool === "compress" ? "bg-sky-500/15 text-sky-400 border border-sky-500/30" : "text-slate-400"}`}><Sliders className="h-4 w-4" /> Resize</button>
            <button onClick={() => handleToolSwitchAttempt("remove-bg")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs sm:text-sm ${activeTool === "remove-bg" ? "bg-orange-500/15 text-orange-400 border border-orange-500/30" : "text-slate-400"}`}><Sparkles className="h-4 w-4" /> Remove BG</button>
            <button onClick={() => handleToolSwitchAttempt("bg-editor")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs sm:text-sm ${activeTool === "bg-editor" ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-slate-400"}`}><Palette className="h-4 w-4" /> BG Changer</button>
          </div>

          <Card className="w-full border-slate-800/90 bg-slate-900/40 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden relative">
            <CardContent className="p-6 sm:p-8 space-y-6">
              
              {!selectedFile ? (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed transition-all duration-300 rounded-2xl p-8 sm:p-12 text-center bg-slate-950/50 flex flex-col items-center justify-center cursor-pointer min-h-[230px] group ${isDragging ? "border-sky-400 bg-sky-500/10 scale-[1.01]" : "border-slate-700 hover:border-slate-500"}`}
                >
                  <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files?.[0])} accept="image/*" className="hidden" />
                  <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4 bg-indigo-500/10 text-indigo-400"><Upload className="h-7 w-7" /></div>
                  <p className="text-sm font-semibold">Click, drop, or paste</p>
                </div>
              ) : (
                <div className="border border-slate-700/60 bg-slate-950/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    {previewUrl && (
                      <div 
                        className="h-14 w-14 rounded-lg border border-slate-700/50 overflow-hidden flex items-center justify-center bg-cover bg-center"
                        style={{ 
                          backgroundColor: activeTool === "bg-editor" && bgMode === "color" ? bgColor : "transparent",
                          backgroundImage: activeTool === "bg-editor" && bgMode === "image" ? activeBgImageStyle : "none"
                        }}
                      >
                        <img src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-200">{selectedFile.name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-1">Original: {formatBytes(selectedFile.size)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowDiscardModal(true)} disabled={isProcessing} className="text-slate-500 hover:text-rose-400">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Resize Tool UI */}
              {activeTool === "compress" && (
                <div className="space-y-5">
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/40 p-5 rounded-xl border border-slate-800/80">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1.5 uppercase">Target Width</label>
                        <input type="number" value={targetWidth} onChange={(e) => setTargetWidth(e.target.value)} disabled={isProcessing} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500" placeholder="e.g. 1920" />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1.5 uppercase">Target Height (Auto)</label>
                        <input type="number" value={targetHeight} onChange={(e) => setTargetHeight(e.target.value)} disabled={isProcessing} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500" placeholder="Auto" />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1.5 uppercase">Format</label>
                        <select value={targetFormat} onChange={(e) => setTargetFormat(e.target.value as any)} disabled={isProcessing} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500">
                          <option value="jpeg">JPG</option>
                          <option value="png">PNG</option>
                          <option value="webp">WEBP</option>
                        </select>
                      </div>
                   </div>
                   <Button onClick={executeImageResize} disabled={!selectedFile || isProcessing} className="w-full bg-sky-500 hover:bg-sky-400 py-6 text-white font-semibold text-base">{isProcessing ? progressText : "Resize & Download"}</Button>
                </div>
              )}

              {/* Remove BG Tool UI */}
              {activeTool === "remove-bg" && (
                <div className="space-y-5">
                  <Button onClick={executeBackgroundRemoval} disabled={!selectedFile || isProcessing || processedUrl !== null} className="w-full bg-orange-500 hover:bg-orange-400 py-6 text-white font-semibold text-base">
                    {isProcessing ? (
                      <span className="inline-flex items-center justify-center gap-3">
                        <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
                        <span>Loading<span className="inline-block min-w-[18px] text-left animate-pulse" aria-hidden="true">...</span></span>
                      </span>
                    ) : processedUrl ? "Background Removed!" : "Remove Background AI"}
                  </Button>
                  {isProcessing && (
                    <div className="flex items-center justify-center gap-3 py-2 text-sm text-slate-400" aria-live="polite">
                      <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" aria-hidden="true" />
                      <span>Processing locally in your browser</span>
                    </div>
                  )}
                  {processedUrl && !isProcessing && (
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 mt-4">
                      <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <Button
                          onClick={handleEditBackground}
                          variant="outline"
                          className="flex-1 min-h-14 border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 text-base font-semibold rounded-xl"
                        >
                          <Palette className="h-5 w-5 mr-2" /> Edit Background
                        </Button>
                        <Button
                          onClick={() => triggerDownload(processedUrl, `${selectedFile?.name.split('.')[0]}-nobg.png`)}
                          className="flex-1 min-h-14 bg-emerald-500 hover:bg-emerald-400 text-white text-base font-semibold rounded-xl"
                        >
                          <Download className="h-5 w-5 mr-2" /> Download
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Background Editor UI */}
              {activeTool === "bg-editor" && (
                <div className="space-y-5 pt-2">
                  <div className="space-y-5 bg-slate-950/40 p-5 rounded-xl border border-slate-800/80">
                    
                    <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-lg max-w-[240px]">
                      <button onClick={() => setBgMode("color")} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium ${bgMode === "color" ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400"}`}><PaintBucket className="h-3.5 w-3.5" /> Solid Color</button>
                      <button onClick={() => setBgMode("image")} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium ${bgMode === "image" ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400"}`}><ImageIcon className="h-3.5 w-3.5" /> BG Image</button>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 font-medium block uppercase tracking-wider mb-3">
                        {bgMode === "color" ? "Choose Solid Color" : "Choose Background Texture"}
                      </label>
                      
                      {bgMode === "color" ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {PRESET_COLORS.map((color) => (
                            <button key={color} onClick={() => setBgColor(color)} className={`h-9 w-9 rounded-lg border ${bgColor.toLowerCase() === color.toLowerCase() ? "ring-2 ring-indigo-400 border-white" : "border-slate-700"}`} style={{ backgroundColor: color }} />
                          ))}
                          <div className="relative flex items-center ml-2">
                            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-11 bg-transparent cursor-pointer rounded" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Device Upload Button */}
                          <button
                            type="button"
                            onClick={() => bgFileInputRef.current?.click()}
                            className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl border border-dashed border-slate-600 hover:border-indigo-400 hover:bg-indigo-500/10 transition-all flex flex-col items-center justify-center text-slate-400 hover:text-indigo-400 cursor-pointer"
                          >
                            <Smartphone className="h-5 w-5 mb-0.5" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Device</span>
                          </button>
                          <input type="file" ref={bgFileInputRef} onChange={handleCustomBgUpload} accept="image/*" className="hidden" />

                          
                          {PRESET_IMAGES.map((imgName) => (
                            <button
                              key={imgName} onClick={() => setBgImage(imgName)}
                              className={`h-14 w-14 sm:h-16 sm:w-16 rounded-xl border bg-cover bg-center ${bgImage === imgName ? "ring-2 ring-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]" : "border-slate-700"}`}
                              style={{ backgroundImage: `url(/${imgName})` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/60">
                      <label className="text-[11px] text-slate-400 block mb-1.5 uppercase">Export Format</label>
                      <select value={bgExportFormat} onChange={(e) => setBgExportFormat(e.target.value as any)} disabled={isProcessing} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                        <option value="jpeg">JPG (Recommended for Filled Backgrounds)</option>
                        <option value="png">PNG</option>
                      </select>
                    </div>
                  </div>

                  <Button onClick={executeBackgroundEdit} disabled={!selectedFile || isProcessing} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-xl font-semibold text-base">{isProcessing ? progressText : `Apply Background & Download`}</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* DISCARD WORK MODAL */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#0b101e] border border-slate-800 rounded-2xl w-full max-w-md p-6 text-center space-y-5">
            <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto"><AlertTriangle /></div>
            <h3 className="text-lg font-bold">Discard Active Work?</h3>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDiscardModal(false)} className="flex-1">Cancel</Button>
              <Button onClick={confirmDiscardWork} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white">Discard</Button>
            </div>
          </div>
        </div>
      )}

      {/* PLAYSTORE ASSET WORKFLOW POPUP (MATCHES DESIGN EXACTLY) */}
      {showPlaystoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#0b0e17] border border-slate-800/80 rounded-2xl w-full max-w-[480px] p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="h-6 w-6 text-indigo-400" />
              <h2 className="text-xl font-bold text-slate-100 tracking-wide">Playstore Asset Workflow</h2>
            </div>

            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Prepare your app assets for Google Play Console. We process everything locally in your browser.
            </p>

            {/* Section 1: What You Provide / What You Get */}
            <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-4 mb-4 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">What You Provide</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Unformatted icons, artwork, and raw screenshots.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">What You Get</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Resized, formatted PNG/JPEGs matching Google Play specs.</p>
                </div>
              </div>
            </div>

            {/* Section 2: Steps Overview */}
            <div className="bg-[#0f1422] border border-slate-800/80 rounded-xl p-4 mb-6">
              <h4 className="text-sm font-bold text-slate-100 mb-3">Steps Overview:</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                  <span><strong className="text-slate-100 font-semibold">Step 1:</strong> App Icon (512×512)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                  <span><strong className="text-slate-100 font-semibold">Step 2:</strong> Feature Graphic (1024×500)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                  <span><strong className="text-slate-100 font-semibold">Step 3:</strong> Phone Screenshots</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                  <span><strong className="text-slate-100 font-semibold">Step 4:</strong> 7-inch Tablet Screenshots</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                  <span><strong className="text-slate-100 font-semibold">Step 5:</strong> 10-inch Tablet Screenshots</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                  <span><strong className="text-slate-100 font-semibold">Step 6:</strong> Export ZIP & return home</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowPlaystoreModal(false)}
                className="flex-1 border-slate-700/80 bg-slate-900/50 hover:bg-slate-800 text-slate-300 py-5 rounded-xl font-medium text-sm"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => { window.location.href = "/playstore"; }}
                className="flex-1 bg-[#5b51f5] hover:bg-[#4b41e5] text-white py-5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20"
              >
                Start Workflow
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}