import React from 'react';
import { cn } from '../lib/utils';

interface SaqibSignatureProps {
  className?: string;
}

export const SaqibSignature: React.FC<SaqibSignatureProps> = ({ className }) => {
  return (
    <span 
      id="author-signature" 
      className={cn("text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]", className)}
    >
      {atob('Ynkgc2FxaWI=')}
    </span>
  );
};
