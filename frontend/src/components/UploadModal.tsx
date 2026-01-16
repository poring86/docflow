import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Progress
} from "@heroui/react";
import { useState, useRef } from "react";
import { api } from "../api";
import { FaCloudUploadAlt } from "react-icons/fa";

interface UploadModalProps {
  onUploadSuccess: () => void;
}

export const UploadModal = ({ onUploadSuccess }: UploadModalProps) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUploadSuccess();
      onClose();
      setFile(null);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Button
        onPress={onOpen}
        className="bg-neon-purple text-white font-black tracking-[0.2em] shadow-[0_0_20px_rgba(157,0,255,0.4)] animate-neon-pulse hover:shadow-[0_0_40px_rgba(157,0,255,0.8)] transition-all duration-500 rounded-xl px-8 h-12"
        startContent={<FaCloudUploadAlt className="text-xl" />}
      >
        UPLOAD_FILE
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        classNames={{
          base: "glass bg-[#0a0a0f]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-4",
          header: "border-b border-white/5 pb-4",
          body: "py-10",
          footer: "border-t border-white/5 pt-4",
          closeButton: "top-8 right-8 text-white/40 hover:text-white hover:bg-white/10 transition-all rounded-lg scale-110",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-white/95">
                <span className="text-neon-purple font-mono text-[10px] tracking-[0.3em] mb-1">DATA_TRANSFER_LINK</span>
                <p className="text-2xl font-black italic tracking-tighter">UPLOAD_DOCUMENT</p>
              </ModalHeader>
              <ModalBody>
                <div
                  className="glass group relative border-2 border-dashed border-white/5 rounded-[2rem] p-14 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-neon-purple/50 hover:bg-white/[0.02] transition-all duration-500 overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {/* Decorative background pulse in the upload area */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-neon-purple opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity" />

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="p-8 rounded-full bg-white/[0.03] group-hover:bg-neon-purple/20 transition-all duration-500 shadow-inner group-hover:shadow-[0_0_30px_rgba(157,0,255,0.2)]">
                    <FaCloudUploadAlt className="w-14 h-14 text-white/20 group-hover:text-neon-purple transition-all duration-500" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-white/80 font-bold tracking-tight text-lg">Select file for indexing</p>
                    <p className="text-white/20 text-[10px] font-mono tracking-widest uppercase">Protocol: Secure_Drop // Max_Cap: 50MB</p>
                  </div>

                  {file && (
                    <div className="bg-neon-purple/10 text-neon-purple px-6 py-3 rounded-2xl font-mono text-xs border border-neon-purple/30 mt-6 animate-neon-pulse backdrop-blur-md">
                      {file.name.toUpperCase()}
                    </div>
                  )}
                </div>

                {uploading && (
                  <div className="mt-8 px-4">
                    <Progress
                      size="sm"
                      isIndeterminate
                      aria-label="Uploading..."
                      classNames={{
                        indicator: "bg-neon-purple shadow-[0_0_10px_rgba(157,0,255,0.5)]",
                        track: "bg-white/[0.02]"
                      }}
                    />
                    <p className="text-center text-[10px] font-mono text-neon-purple mt-3 tracking-[0.4em] animate-pulse">UPLOADING_PACKETS...</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="gap-4">
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  isDisabled={uploading}
                  className="font-black text-[10px] tracking-widest text-white/40 hover:text-white/90"
                >
                  ABORT_SESSION
                </Button>
                <Button
                  onPress={handleUpload}
                  isLoading={uploading}
                  isDisabled={!file}
                  className="bg-neon-purple text-white font-black tracking-[0.2em] px-10 h-12 shadow-[0_0_20px_rgba(157,0,255,0.4)] hover:shadow-[0_0_30px_rgba(157,0,255,0.6)] transition-all"
                >
                  INITIALIZE
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
