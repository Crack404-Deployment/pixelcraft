"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import JSZip from "jszip";
import { ArrowLeft, Download, CheckCircle, Package, AlertCircle } from "lucide-react";
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

export default function DownloadPage() {
  const [isZipping, setIsZipping] = useState(false);
  const [filesFound, setFilesFound] = useState({
    appIcon: false,
    featureGraphic: false,
    phoneScreen: false,
    tabletScreen: false,
    tablet10Screen: false
  });

  useEffect(() => {
    setFilesFound({
      appIcon: !!sessionStorage.getItem("appIcon"),
      featureGraphic: !!sessionStorage.getItem("featureGraphic"),
      phoneScreen: !!sessionStorage.getItem("phoneScreen"),
      tabletScreen: !!sessionStorage.getItem("tabletScreen"),
      tablet10Screen: !!sessionStorage.getItem("tablet10Screen")
    });
  }, []);

  const hasAnyImages = Object.values(filesFound).some(Boolean);
  const missingImages = Object.values(filesFound).some(found => !found);

  const generateAndDownloadZip = async () => {
    setIsZipping(true);
    const zip = new JSZip();

    const files = [
      { name: "app-icon-512x512.jpg", data: sessionStorage.getItem("appIcon") },
      { name: "feature-graphic-1024x500.jpg", data: sessionStorage.getItem("featureGraphic") },
      { name: "phone-screenshot-1080x1920.jpg", data: sessionStorage.getItem("phoneScreen") },
      { name: "7inch-tablet-screenshot-1080x1920.jpg", data: sessionStorage.getItem("tabletScreen") },
      { name: "10inch-tablet-screenshot-1440x2560.jpg", data: sessionStorage.getItem("tablet10Screen") }
    ];

    files.forEach(file => {
      if (file.data) {
        const base64Data = file.data.split(",")[1];
        zip.file(file.name, base64Data, { base64: true });
      }
    });

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "Playstore_Assets_5_Images.zip";
      a.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Failed to generate ZIP", error);
    }
    
    setIsZipping(false);
  };

  const clearStorage = () => {
    sessionStorage.clear();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/70 h-16 flex items-center px-6 gap-4">
        <Link href="/playstore/10-inch-tablet" className="text-slate-400 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="font-bold text-lg">Step 6: Download Package</span>
      </header>

      <StepProgressBar currentStep={6} />
      
      <main className="max-w-3xl mx-auto px-4 py-10 w-full flex-1">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-300">Ready to Publish</h1>
          <p className="text-slate-400 text-sm mt-2">Check your 5 assets below and download them as a ZIP file.</p>
        </div>
        
        <Card className="border-slate-800 bg-slate-900/40 p-8 text-center max-w-md mx-auto">
          <Package className="h-16 w-16 mx-auto text-indigo-400 mb-6" />
          
          <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800 mb-6 text-left space-y-3">
            <h3 className="font-semibold text-slate-200 mb-2 border-b border-slate-800 pb-2">Files Ready to ZIP (5 Total):</h3>
            <div className={`flex items-center gap-2 ${filesFound.appIcon ? "text-orange-400" : "text-slate-600"}`}>
              <CheckCircle className="h-5 w-5" /> App Icon (512x512)
            </div>
            <div className={`flex items-center gap-2 ${filesFound.featureGraphic ? "text-orange-400" : "text-slate-600"}`}>
              <CheckCircle className="h-5 w-5" /> Feature Graphic (1024x500)
            </div>
            <div className={`flex items-center gap-2 ${filesFound.phoneScreen ? "text-orange-400" : "text-slate-600"}`}>
              <CheckCircle className="h-5 w-5" /> Phone Screenshot (1080x1920)
            </div>
            <div className={`flex items-center gap-2 ${filesFound.tabletScreen ? "text-orange-400" : "text-slate-600"}`}>
              <CheckCircle className="h-5 w-5" /> 7-inch Tablet Screenshot (1080x1920)
            </div>
            <div className={`flex items-center gap-2 ${filesFound.tablet10Screen ? "text-orange-400" : "text-slate-600"}`}>
              <CheckCircle className="h-5 w-5" /> 10-inch Tablet Screenshot (1440x2560)
            </div>
          </div>

          {missingImages && (
            <div className="flex items-start gap-2 text-amber-400 bg-amber-500/10 p-4 rounded-xl mb-6 text-sm text-left">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p>Some images are missing! Go back and click <strong>"Format"</strong> on missing steps to store them in memory.</p>
            </div>
          )}
          
          {!hasAnyImages ? (
            <p className="text-rose-400 mb-6 font-medium">No formatted images found.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <Button 
                onClick={generateAndDownloadZip} 
                disabled={isZipping}
                className="w-full bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold h-12 rounded-xl text-md"
              >
                {isZipping ? "Creating ZIP..." : "Download All 5 Files as ZIP"}
                {!isZipping && <Download className="ml-2 h-5 w-5" />}
              </Button>
              
              <Link href="/" onClick={clearStorage}>
                <Button variant="outline" className="w-full border-slate-700 text-slate-500 hover:bg-slate-800 h-12 rounded-xl">
                  Return to Home <CheckCircle className="ml-2 h-4 w-4"/>
                </Button>
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