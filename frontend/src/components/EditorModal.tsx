import { Modal, ModalContent, ModalBody, ModalHeader, Spinner, Button, Tooltip } from "@heroui/react";
import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { type Document } from "../api";
import { useState } from "react";
import { AiAssistant } from "./AiAssistant";
import { RiRobot2Line, RiCloseLine } from "react-icons/ri";

interface EditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export const EditorModal = ({ isOpen, onClose, document: doc }: EditorModalProps) => {
  const [isAiOpen, setIsAiOpen] = useState(false);

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
      hideCloseButton={true}
      classNames={{
        base: "glass bg-[#050508]/95 backdrop-blur-3xl border border-white/10 h-[94vh] max-w-[96vw] rounded-t-[2.5rem] rounded-b-none overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)]",
        header: "border-b border-white/5 py-4 px-12 bg-black/40",
        body: "p-0 bg-transparent flex-1",
      }}
    >
      <ModalContent className="rounded-t-[2.5rem] rounded-b-none">
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between gap-4 h-24">
              <div className="flex items-center gap-5 min-w-0 pr-8">
                <div className="w-3 h-3 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_15px_rgba(0,255,255,0.7)] shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-white/95 font-black italic tracking-tighter text-3xl truncate block leading-none mb-1.5">
                    {doc.filename.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-[#00ff9f]/60 tracking-[0.4em] uppercase">
                      Protocol: Secure_Editor
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Tooltip
                  content="NEURAL_ASSISTANT"
                  closeDelay={0}
                  className="bg-[#050508] text-white border border-neon-purple/50 shadow-[0_0_20px_rgba(157,0,255,0.3)]"
                  classNames={{
                    content: "bg-[#050508] text-white px-3 py-1.5 rounded-md font-mono text-[10px] tracking-widest",
                  }}
                >
                  <Button
                    isIconOnly
                    onPress={() => setIsAiOpen(!isAiOpen)}
                    className={`
                      transition-all duration-300 rounded-xl w-12 h-12 border
                      ${isAiOpen
                        ? 'bg-neon-purple/20 border-neon-purple text-neon-purple shadow-[0_0_30px_rgba(157,0,255,0.4)]'
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    <RiRobot2Line size={24} />
                  </Button>
                </Tooltip>

                <div className="w-px h-8 bg-white/5 mx-2" />

                <Button
                  isIconOnly
                  variant="light"
                  onPress={onClose}
                  className="text-white/40 hover:text-white hover:bg-white/10 w-12 h-12 rounded-xl transition-all"
                >
                  <RiCloseLine size={32} />
                </Button>
              </div>
            </ModalHeader>
            <ModalBody className="relative overflow-hidden">
              <div className="w-full h-full relative flex">
                {/* Editor Container */}
                <div className="flex-1 relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-[#050508] z-0">
                    <div className="flex flex-col items-center gap-5">
                      <Spinner size="lg" color="secondary" className="scale-125" />
                      <span className="text-[10px] font-mono text-white/20 tracking-[0.6em] animate-pulse">INITIATING_CYBER_DECK...</span>
                    </div>
                  </div>

                  <div className="relative z-10 w-full h-full border-b border-white/5">
                    <DocumentEditor
                      id={editorId}
                      documentServerUrl="http://localhost:8080"
                      config={config}
                      events_onDocumentReady={() => console.log("Document Ready in Modal")}
                    />
                  </div>
                </div>

                {/* AI Assistant Sidebar Area */}
                <AiAssistant
                  documentId={doc.id}
                  isOpen={isAiOpen}
                  onClose={() => setIsAiOpen(false)}
                />
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
