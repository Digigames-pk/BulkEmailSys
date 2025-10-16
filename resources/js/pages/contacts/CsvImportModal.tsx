import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface CsvImportModalProps {
    open: boolean;
    onClose: () => void;
    onImport: (file: File) => void;
    processing?: boolean;
}

export default function CsvImportModal({ open, onClose, onImport, processing = false }: CsvImportModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
    };

    const handleImport = () => {
        if (selectedFile) {
            onImport(selectedFile);
            setSelectedFile(null);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        Import Contacts from CSV
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                        Upload any file to import contacts. The file should have columns: name, email, mobile, gender
                    </div>

                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                            }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        {selectedFile ? (
                            <div className="space-y-2">
                                <FileText className="w-8 h-8 mx-auto text-primary" />
                                <div className="font-medium">{selectedFile.name}</div>
                                <div className="text-sm text-muted-foreground">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                                <div className="font-medium">Drop your file here</div>
                                <div className="text-sm text-muted-foreground">or click to browse</div>
                            </div>
                        )}
                    </div>

                    <Input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="csv-file-input"
                    />

                    <Button
                        variant="outline"
                        onClick={() => document.getElementById('csv-file-input')?.click()}
                        className="w-full"
                    >
                        Choose File
                    </Button>

                    <div className="bg-muted p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div className="text-sm text-muted-foreground">
                                <div className="font-medium mb-1">File Format Requirements:</div>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>Any file format accepted</li>
                                    <li>First row should contain headers: name, email, mobile, gender</li>
                                    <li>Email column is required, others are optional</li>
                                    <li>No file size restrictions</li>
                                    <li>Duplicate emails will be skipped</li>
                                    <li>Empty rows and extra columns are handled automatically</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button onClick={handleImport} disabled={!selectedFile || processing}>
                        {processing ? 'Importing...' : 'Import Contacts'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
