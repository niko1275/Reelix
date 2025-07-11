'use client';

import MuxUploadButton from './MuxUploadButton';
import { ModalCargarMux } from "./ModalCargarMux";

export default function MuxUploadContainer() {
  return (
    <>
      <MuxUploadButton onOpen={() => {}}>
        Cargar Video
      </MuxUploadButton>
      <ModalCargarMux />
    </>
  );
} 