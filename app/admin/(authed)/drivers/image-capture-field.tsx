"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function fileFromCanvas(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not capture image"));
          return;
        }
        resolve(new File([blob], name, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9,
    );
  });
}

export function ImageCaptureField({
  label,
  hint,
  required,
  acceptPdf,
  file,
  previewUrl,
  error,
  onChange,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  acceptPdf?: boolean;
  file: File | null;
  previewUrl: string | null;
  error?: string;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraOpen(false);
  }, [stream]);

  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(media);
      setCameraOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = media;
          void videoRef.current.play();
        }
      });
    } catch {
      setCameraError("Camera access denied or unavailable. Use file upload instead.");
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const captured = await fileFromCanvas(canvas, `capture-${Date.now()}.jpg`);
    onChange(captured);
    stopCamera();
  };

  const accept = acceptPdf ? ".jpg,.jpeg,.png,.pdf,image/*,application/pdf" : ".jpg,.jpeg,.png,image/*";
  const displayUrl = previewUrl ?? (file ? URL.createObjectURL(file) : null);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </p>
        {hint ? <p className="text-[10px] text-muted-foreground">{hint}</p> : null}
      </div>

      {displayUrl && !file?.type.includes("pdf") ? (
        <div className="mt-2 flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt=""
            className="h-20 w-20 rounded-lg border border-border object-cover"
          />
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-medium text-primary">Uploaded</p>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              Remove
            </button>
          </div>
        </div>
      ) : file ? (
        <p className="mt-2 text-xs font-medium text-primary">{file.name}</p>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium hover:bg-surface"
        >
          Upload from computer
        </button>
        <button
          type="button"
          onClick={() => void startCamera()}
          className="inline-flex h-9 items-center rounded-lg border border-primary/30 bg-primary/5 px-3 text-xs font-medium text-primary hover:bg-primary/10"
        >
          Use camera
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          onChange(f);
          e.target.value = "";
        }}
      />

      {error ? <p className="mt-1 text-[11px] font-medium text-red-600">{error}</p> : null}
      {cameraError ? (
        <p className="mt-1 text-[11px] font-medium text-amber-700">{cameraError}</p>
      ) : null}

      {cameraOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-4 shadow-2xl">
            <p className="text-sm font-semibold text-foreground">Take a photo</p>
            <video
              ref={videoRef}
              className="mt-3 aspect-video w-full rounded-xl bg-black object-cover"
              playsInline
              muted
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={stopCamera}
                className="h-9 rounded-lg border border-border px-4 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void capturePhoto()}
                className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground"
              >
                Capture
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
