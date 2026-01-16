import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, type Document } from "../api";
import { Spinner } from "@heroui/react";

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await api.get(`/documents/${id}`);
        setDoc(res.data);
      } catch (error) {
        console.error("Failed to load document", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDoc();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;
  if (!doc) return <div className="text-center mt-20">Document not found</div>;

  const backendUrl = "http://backend:3000";

  const config = {
    document: {
      fileType: doc.mimeType.split('/').pop() === 'pdf' ? 'pdf' : 'docx',
      key: `${doc.id}-${Date.now()}`,
      title: doc.filename,
      url: `${backendUrl}/documents/${doc.id}/download`,
    },
    documentType: "word",
    editorConfig: {
      callbackUrl: `${backendUrl}/documents/${doc.id}/track`,
    },
  };

  return (
    <div className="h-screen w-full">
      <DocumentEditor
        id="docxEditor"
        documentServerUrl="http://localhost:8080"
        config={config}
        events_onDocumentReady={() => console.log("Document Ready")}
      />
    </div>
  );
}
