import React from "react";
export interface ResultModalProps {
  open: boolean;
  wpm: number | null;
  wpmHistory: number[];
  onClose: () => void;
}
declare const ResultModal: React.FC<ResultModalProps>;
export default ResultModal;
