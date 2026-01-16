import { Modal, ModalContent, ModalBody, ModalHeader, Spinner } from "@heroui/react";
import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { api, type Document } from "../api";

interface EditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export const EditorModal = ({ isOpen, onClose, document: doc }: EditorModalProps) => {
  if (!doc) return null;

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || "";
  };

  const getOnlyOfficeType = (ext: string) => {
    if (['docx', 'doc', 'odt', 'txt', 'rtf'].includes(ext)) return 'word';
    if (['xlsx', 'xls', 'ods', 'csv'].includes(ext)) return 'cell';
    if (['pptx', 'ppt', 'odp', 'ppsx', 'pps'].includes(ext)) return 'slide';
    return 'word';
  };

  const ext = getFileExtension(doc.filename);
  const documentType = getOnlyOfficeType(ext);
  const backendUrl = "http://backend:3000";

  const config = {
    document: {
      fileType: ext,
      key: `${doc.id}-${new Date(doc.updatedAt).getTime()}`,
      title: doc.filename,
      url: `${backendUrl}/documents/${doc.id}/download?t=${new Date(doc.updatedAt).getTime()}`,
    },
    documentType: documentType,
    editorConfig: {
      callbackUrl: `${backendUrl}/documents/${doc.id}/track`,
      customization: {
        autosave: true,
        forcesave: true,
        uiTheme: "theme-dark",
      },
      user: {
        id: "user-1",
        name: "Cyber Operator"
      }
    },
    height: "100%",
    width: "100%",
  };

  const editorId = `editor-${doc.id}-${new Date(doc.updatedAt).getTime()}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      hideCloseButton={false}
      classNames={{
        base: "glass bg-[#050508]/90 backdrop-blur-3xl border border-white/10 h-[94vh] max-w-[96vw] rounded-t-[2.5rem] rounded-b-none overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)]",
        header: "border-b border-white/5 py-6 px-12 bg-black/40",
        body: "p-0 bg-transparent flex-1",
        closeButton: "top-6 right-8 text-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all rounded-xl",
      }}
    >
      <ModalContent className="rounded-t-[2.5rem] rounded-b-none">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 items-start">
              <div className="flex items-center gap-5 w-full">
                <div className="w-3 h-3 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_15px_rgba(0,255,255,0.7)] shrink-0" />
                <div className="flex flex-col min-w-0 pr-16">
                  <span className="text-white/95 font-black italic tracking-tighter text-3xl truncate block leading-none mb-1.5">
                    {doc.filename.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-[#00ff9f]/60 tracking-[0.4em] uppercase">
                      Protocol: Secure_Editor
                    </span>
                    <span className="text-[10px] font-mono text-white/10 tracking-[0.4em] uppercase hidden md:inline">
                       // Sync: Active
                    </span>
                  </div>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="w-full h-full relative">
                <div className="absolute inset-0 flex items-center justify-center bg-[#050508] z-0">
                  <div className="flex flex-col items-center gap-5">
                    <Spinner size="lg" color="secondary" className="scale-125" />
                    <span className="text-[10px] font-mono text-white/20 tracking-[0.6em] animate-pulse">INITIATING_CYBER_DECK...</span>
                  </div>
                </div>

                {/* Adding a 1px border at the bottom to define the edge against the dark screen if needed, 
                    but rounded-none is the real fix for clipping */}
                <div className="relative z-10 w-full h-full border-b border-white/5">
                  <DocumentEditor
                    id={editorId}
                    documentServerUrl="http://localhost:8080"
                    config={config}
                    events_onDocumentReady={() => console.log("Document Ready in Modal")}
                  />
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
