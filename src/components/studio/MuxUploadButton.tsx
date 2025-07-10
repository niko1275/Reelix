'use client';


interface MuxUploadButtonProps {
  children: React.ReactNode;
  onOpen: () => void;
}

export default function MuxUploadButton({ children, onOpen }: MuxUploadButtonProps) {
  return (
    <button 
      onClick={onOpen}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      {children}
    </button>
  );
} 