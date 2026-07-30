'use client';
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  Image as ImageIcon,
  File,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Upload,
} from 'lucide-react';
import {
  validateFile,
  sanitizeFilename,
  MAX_FILE_SIZE_MB,
  ALLOWED_MIME_TYPES,
} from '@/lib/security';
import { formatBytes, cn } from '@/utils';

export interface TicketAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'validating' | 'valid' | 'invalid' | 'uploading' | 'uploaded';
  error?: string;
  progress?: number;
}

interface TicketAttachmentUploadProps {
  attachments: TicketAttachment[];
  onChange: (attachments: TicketAttachment[]) => void;
  maxFiles?: number;
  className?: string;
}

const ALLOWED_EXTENSIONS_DISPLAY = '.jpg, .png, .gif, .webp, .pdf, .txt, .doc, .docx';

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return ImageIcon;
  if (type === 'application/pdf') return FileText;
  return File;
}

export function TicketAttachmentUpload({
  attachments,
  onChange,
  maxFiles = 5,
  className,
}: TicketAttachmentUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = useCallback(
    (id: string) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        onChange(
          attachments.map((a) =>
            a.id === id
              ? { ...a, status: progress >= 100 ? 'uploaded' : 'uploading', progress }
              : a,
          ),
        );
        if (progress >= 100) clearInterval(interval);
      }, 200);
    },
    [attachments, onChange],
  );

  const processFiles = useCallback(
    async (fileList: FileList) => {
      const files = Array.from(fileList).slice(0, maxFiles - attachments.length);
      if (files.length === 0) return;

      // Add as "validating" immediately for instant feedback
      const pending: TicketAttachment[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        name: sanitizeFilename(file.name),
        size: file.size,
        type: file.type,
        status: 'validating',
      }));
      onChange([...attachments, ...pending]);

      // Validate each file
      const results = await Promise.all(
        pending.map(async (att) => {
          const result = await validateFile(att.file);
          return {
            ...att,
            status: result.valid ? ('valid' as const) : ('invalid' as const),
            error: result.error,
          };
        }),
      );

      onChange([...attachments, ...results]);

      // Simulate upload for valid files
      results.filter((r) => r.status === 'valid').forEach((att) => simulateUpload(att.id));
    },
    [attachments, onChange, maxFiles, simulateUpload],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id));
  };

  const canAddMore = attachments.length < maxFiles;

  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium">
        Attachments{' '}
        <span className="font-normal text-muted-foreground">(optional, max {maxFiles} files)</span>
      </label>

      {canAddMore && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors',
            dragActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30',
          )}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="Upload attachment. Drag and drop or click to browse."
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={Array.from(ALLOWED_MIME_TYPES).join(',')}
            onChange={(e) => e.target.files && processFiles(e.target.files)}
            className="sr-only"
            aria-label="Choose files to attach"
          />
          <Upload className="mb-2 h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs font-medium">
            <span className="text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {ALLOWED_EXTENSIONS_DISPLAY} — max {MAX_FILE_SIZE_MB}MB each
          </p>
        </div>
      )}

      {/* Attachment list */}
      {attachments.length > 0 && (
        <ul className="mt-3 space-y-2" aria-label="Selected attachments">
          <AnimatePresence>
            {attachments.map((att) => {
              const Icon = getFileIcon(att.type);
              return (
                <motion.li
                  key={att.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3',
                    att.status === 'invalid' && 'border-destructive/40 bg-destructive/5',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                      att.status === 'invalid' ? 'bg-destructive/10' : 'bg-muted',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        att.status === 'invalid' ? 'text-destructive' : 'text-muted-foreground',
                      )}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{att.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(att.size)}</p>
                    {att.status === 'uploading' && (
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all duration-200"
                          style={{ width: `${att.progress ?? 0}%` }}
                        />
                      </div>
                    )}
                    {att.status === 'invalid' && (
                      <p
                        role="alert"
                        className="mt-0.5 flex items-center gap-1 text-xs text-destructive"
                      >
                        <AlertTriangle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />{' '}
                        {att.error}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {att.status === 'validating' && (
                      <Loader2
                        className="h-4 w-4 animate-spin text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    {att.status === 'uploaded' && (
                      <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                    )}
                    {att.status === 'invalid' && (
                      <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(att.id)}
                    className="flex-shrink-0 rounded text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Remove ${att.name}`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
