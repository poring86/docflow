import { Card, CardBody, CardFooter } from "@heroui/react";
import type { Document } from "../api";
import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt, FaFileExcel, FaFilePowerpoint } from "react-icons/fa";


interface FileCardProps {
  file: Document;
  onPress: (file: Document) => void;
}

export const FileCard = ({ file, onPress }: FileCardProps) => {


  const getIcon = () => {
    const ext = file.filename.split('.').pop()?.toLowerCase() || "";

    if (ext === 'pdf') return <FaFilePdf className="w-12 h-12 text-red-500" />;
    if (['docx', 'doc', 'odt', 'rtf'].includes(ext)) return <FaFileWord className="w-12 h-12 text-blue-500" />;
    if (['xlsx', 'xls', 'ods', 'csv'].includes(ext)) return <FaFileExcel className="w-12 h-12 text-green-600" />;
    if (['pptx', 'ppt', 'odp'].includes(ext)) return <FaFilePowerpoint className="w-12 h-12 text-orange-500" />;
    if (file.mimeType.includes('image')) return <FaFileImage className="w-12 h-12 text-purple-500" />;

    return <FaFileAlt className="w-12 h-12 text-gray-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card
      isPressable
      onPress={() => onPress(file)}
      className="glass glass-hover border-none max-w-[200px] overflow-hidden group"
      shadow="none"
    >
      <CardBody className="flex items-center justify-center p-8 relative overflow-hidden">
        {/* Animated background glow for the icon */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 transition-transform group-hover:scale-110 duration-300">
          {getIcon()}
        </div>
      </CardBody>
      <CardFooter className="flex flex-col items-start gap-1 p-4 bg-black/20 backdrop-blur-md border-t border-white/5">
        <b className="truncate w-full text-white/90 font-semibold group-hover:text-neon-cyan transition-colors">
          {file.filename}
        </b>
        <p className="text-white/40 text-xs font-mono">
          {formatSize(file.size)}
        </p>
      </CardFooter>
    </Card>
  );
};
