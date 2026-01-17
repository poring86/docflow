import { useState, useRef, useEffect } from "react";
import { Button, Input, ScrollShadow, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import {
  RiSendPlane2Fill,
  RiCloseLine,
  RiTerminalBoxLine,
  RiInformationLine,
  RiOpenaiFill,
  RiGoogleFill,
  RiSettings4Line,
  RiFlashlightFill
} from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AiAssistantProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI (GPT-4)', icon: <RiOpenaiFill className="text-emerald-400" /> },
  { id: 'gemini', name: 'Google (Gemini)', icon: <RiGoogleFill className="text-blue-400" /> },
  { id: 'groq', name: 'Groq Cloud (Llama)', icon: <RiFlashlightFill className="text-orange-400" /> },
];

export const AiAssistant = ({ documentId, isOpen, onClose }: AiAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "NEURAL_LINK_ESTABLISHED. Estou pronto para analisar este documento. O que você deseja saber?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS.find(p => p.id === 'groq') || PROVIDERS[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post(`/ai/${documentId}/ask`, {
        question: input,
        provider: selectedProvider.id
      });

      const assistantMsg: Message = {
        role: 'assistant',
        content: response.data.answer || "Desculpe, tive um erro no meu link neural.",
        timestamp: new Date()
      };

      if (response.data.context && response.data.similarity > 0.75) {
        assistantMsg.content += `\n\n**CONHECIMENTO_EXTRAÍDO:**\n${response.data.context.substring(0, 300)}...`;
      }

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "ERRO_DE_CONEXÃO: Falha ao acessar o datacenter de IA. Verifique suas API_KEYS.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 bottom-0 w-[400px] z-50 glass bg-black/80 backdrop-blur-2xl border-l border-white/10 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neon-purple/20 text-neon-purple animate-pulse">
                {selectedProvider.icon}
              </div>
              <div>
                <h3 className="text-white font-black tracking-tighter text-lg leading-tight uppercase">Neural_{selectedProvider.id}</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase">DirectLink_ACTIVE</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Dropdown className="bg-[#0a0a0f] border border-white/10 text-white shadow-2xl">
                <DropdownTrigger>
                  <Button isIconOnly variant="light" size="sm" className="text-white/40 hover:text-white hover:bg-white/10">
                    <RiSettings4Line size={20} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Model Selection"
                  onAction={(key) => {
                    const provider = PROVIDERS.find(p => p.id === key);
                    if (provider) setSelectedProvider(provider);
                  }}
                >
                  {PROVIDERS.map(p => (
                    <DropdownItem key={p.id} startContent={p.icon} className="text-white/80">
                      {p.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              <Button
                isIconOnly
                variant="light"
                onPress={onClose}
                className="text-white/40 hover:text-white hover:bg-white/10"
              >
                <RiCloseLine size={24} />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollShadow ref={scrollRef} className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`
                  max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-neon-purple/20 border border-neon-purple/30 text-white rounded-tr-none shadow-[0_0_20px_rgba(157,0,255,0.1)]'
                    : 'bg-white/[0.03] border border-white/5 text-white/80 rounded-tl-none font-mono text-xs'}
                `}>
                  {msg.content.split('\n').map((line, idx) => (
                    <p key={idx} className={idx > 0 ? "mt-2" : ""}>{line}</p>
                  ))}
                </div>
                <span className="text-[9px] font-mono text-white/20 mt-2 uppercase">
                  [{msg.role}] // {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {loading && (
              <div className="flex flex-col items-start">
                <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-neon-purple rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-neon-purple rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-neon-purple rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">ProcessingChunks...</span>
                </div>
              </div>
            )}
          </ScrollShadow>

          {/* Footer Input */}
          <div className="p-6 border-t border-white/5 bg-black/40">
            <div className="flex gap-2">
              <Input
                placeholder="Ask your document..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
                classNames={{
                  inputWrapper: "bg-white/[0.03] border-white/10 group-data-[focus=true]:border-neon-purple/50 transition-colors h-12 rounded-xl",
                  input: "text-white placeholder:text-white/20 font-mono text-xs",
                }}
                startContent={<RiTerminalBoxLine className="text-white/20" />}
              />
              <Button
                isIconOnly
                onPress={handleSend}
                disabled={!input.trim() || loading}
                className="bg-neon-purple text-white shadow-[0_0_15px_rgba(157,0,255,0.3)] hover:shadow-[0_0_25px_rgba(157,0,255,0.5)] transition-all h-12 w-12 rounded-xl"
              >
                <RiSendPlane2Fill size={20} />
              </Button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-white/10">
              <RiInformationLine size={12} />
              <p className="text-[9px] font-mono uppercase tracking-[0.2em]">Contextual_Intelligence_V1.0</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
