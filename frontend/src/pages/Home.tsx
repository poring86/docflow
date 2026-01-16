import { useEffect, useState } from "react";
import { api, type Document } from "../api";
import { FileCard } from "../components/FileCard";
import { UploadModal } from "../components/UploadModal";
import { EditorModal } from "../components/EditorModal";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Spinner, Button, useDisclosure } from "@heroui/react";
import { FaThLarge, FaList } from "react-icons/fa";

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = async (file: Document) => {
    // Refresh document list to get the latest updatedAt before opening
    await fetchDocuments();
    setSelectedDoc(file);
    onOpen();
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] glow-blob glow-pink opacity-[0.08] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] glow-blob glow-cyan opacity-[0.08] pointer-events-none" />
      <div className="fixed top-[30%] left-[20%] w-[400px] h-[400px] glow-blob glow-purple opacity-[0.05] pointer-events-none" />

      <Navbar
        isBordered
        className="glass bg-transparent border-b border-white/5"
        maxWidth="full"
      >
        <NavbarBrand>
          <div className="flex items-center gap-3 group cursor-pointer transition-all">
            <div className="w-10 h-10 rounded-xl bg-neon-gradient animate-pulse shadow-[0_0_20px_rgba(255,0,255,0.4)] group-hover:rotate-12 transition-transform duration-500" />
            <p className="font-black text-3xl tracking-[-0.05em] text-white italic">
              DOC<span className="text-neon-cyan drop-shadow-[0_0_10px_rgba(0,255,255,0.4)] transition-all group-hover:text-white">FLOW</span>
            </p>
          </div>
        </NavbarBrand>
        <NavbarContent justify="end">
          <NavbarItem>
            <UploadModal onUploadSuccess={fetchDocuments} />
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <main className="container mx-auto px-10 py-20 relative z-10">
        <div className="flex justify-between items-end mb-20">
          <div className="space-y-2">
            <h2 className="text-6xl font-black italic tracking-tighter text-white/95 uppercase">
              My <span className="text-neon-cyan drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]">Library</span>
            </h2>
            <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.4em] text-[#00ff9f]">
              <div className="w-2 h-2 rounded-full bg-[#00ff9f] animate-ping" />
              DATACENTER_ACTIVE // SESSION_SECURE
            </div>
          </div>
          <div className="flex gap-4">
            <Button size="md" isIconOnly className="glass bg-white/[0.03] hover:bg-white/[0.08] text-white/40 hover:text-white/90 hover:scale-110 transition-all duration-300 rounded-[1.2rem]">
              <FaThLarge className="text-xl" />
            </Button>
            <Button size="md" isIconOnly className="glass bg-white/[0.03] hover:bg-white/[0.08] text-white/40 hover:text-white/90 hover:scale-110 transition-all duration-300 rounded-[1.2rem]">
              <FaList className="text-xl" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center mt-40">
            <div className="relative group">
              <Spinner size="lg" color="secondary" className="scale-150" />
              <div className="absolute inset-x-0 -bottom-12 text-center text-[10px] font-mono text-neon-cyan tracking-[0.5em] animate-pulse">
                DECRYPTING_PACKETS...
              </div>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center mt-32 py-32 glass border-dashed border-2 border-white/5 rounded-[3rem] group transition-all duration-700 hover:border-neon-purple/20 hover:bg-white/[0.01]">
            <div className="w-24 h-24 mx-auto rounded-[2rem] bg-white/[0.03] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
              <div className="w-12 h-12 border-2 border-white/10 rounded-xl flex items-center justify-center italic font-black text-white/10 group-hover:text-white/20 transition-colors">!</div>
            </div>
            <p className="text-4xl font-black italic text-white/20 tracking-tighter group-hover:text-white/30 transition-colors">NO_RECORDS_STORED</p>
            <p className="text-white/10 font-mono text-[10px] mt-4 tracking-[0.5em] uppercase">Initialize 'UPLOAD_FILE' to populate local instance</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-12">
            {documents.map((doc) => (
              <FileCard key={doc.id} file={doc} onPress={handleFileClick} />
            ))}
          </div>
        )}
      </main>

      <EditorModal
        isOpen={isOpen}
        onClose={onClose}
        document={selectedDoc}
      />
    </div>
  );
}
