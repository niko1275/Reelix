'use client';

import { useState } from 'react';
import MuxUploadButton from './MuxUploadButton';
import ModalCargarMux from './ModalCargarMux';

export default function MuxUploadContainer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <MuxUploadButton onOpen={() => setIsOpen(true)}>
        Cargar Video
      </MuxUploadButton>
      <ModalCargarMux 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
} 