import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { apiRequest, endpoints } from '@/lib/api-client';
import type { UploadUrlResponse } from '@/types';

interface UploadZoneProps {
  fieldId: string;
  onUploaded: (fileKey: string) => void;
}

export const UploadZone = ({ fieldId, onUploaded }: UploadZoneProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>();

  const uploadToStorage = async (file: File) => {
    const presign = await apiRequest<UploadUrlResponse>({
      url: `${endpoints.uploads}?fieldId=${fieldId}`,
      method: 'POST',
      data: {
        filename: file.name,
        contentType: file.type,
      },
    });

    if (presign.formData) {
      const body = new FormData();
      Object.entries(presign.formData).forEach(([key, value]) => body.append(key, value));
      body.append('file', file);
      await fetch(presign.uploadUrl, {
        method: 'POST',
        body,
      });
    } else {
      await fetch(presign.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });
    }

    return presign.fileKey;
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(undefined);
      const [file] = acceptedFiles;
      if (!file) return;

      setIsUploading(true);
      try {
        const key = await uploadToStorage(file);
        onUploaded(key);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setIsUploading(false);
      }
    },
    [onUploaded],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/tiff': ['.tif', '.tiff'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
  });

  return (
    <div
      {...getRootProps({
        className:
          'rounded-2xl border border-dashed border-emerald-500 bg-slate-900/40 px-6 py-10 text-center transition hover:border-emerald-300 hover:bg-slate-900/70',
      })}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-10 w-10 text-emerald-400" />
      <p className="mt-4 text-lg font-medium">Drop GeoTIFF or drone tiles</p>
      <p className="text-sm text-slate-400">Sentinel + drone NDVI ready formats: TIFF, PNG, JPEG</p>
      {isUploading && <p className="mt-4 animate-pulse text-sm text-emerald-300">Uploading…</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {isDragActive && <p className="mt-4 text-sm text-emerald-300">Release to upload</p>}
    </div>
  );
};
