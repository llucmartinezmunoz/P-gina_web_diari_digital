import React from 'react';
import { Logo } from './Logo';
import { CATEGORIES, MANIFESTO_TEXT } from '../data/initialData';
import { CategoryId } from '../types';
import { ShieldCheck, PenLine, Lock } from 'lucide-react';

interface FooterProps {
  onCategoryClick: (cat: CategoryId | 'totes') => void;
  isEditor: boolean;
  onOpenModerator: () => void;
  onOpenEditor: () => void;
  onOpenEditorLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onCategoryClick,
  isEditor,
  onOpenModerator,
  onOpenEditor,
  onOpenEditorLogin,
}) => {
  return (
    <footer className="w-full bg-[#181614] text-[#E7E2D8] border-t border-[#2C2825] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        {/* Editorial Declaration Box */}
        <div className="pb-10 border-b border-[#2C2825] mb-8">
          <div className="max-w-3xl">
            <span className="text-[10px] uppercase tracking-widest text-[#9A3412] font-semibold block mb-2 font-sans-editorial">
              Declaració fundacional
            </span>
            <p className="font-editorial text-lg sm:text-xl text-[#D6CEBE] italic leading-relaxed">
              «{MANIFESTO_TEXT}»
            </p>
          </div>
        </div>

        {/* Minimal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#2C2825] text-xs">
          {/* Brand */}
          <div className="md:col-span-5 space-y-3">
            <Logo
              size="sm"
              brandName="L'oca del Caire"
              className="filter brightness-95 text-white"
              onClick={() => onCategoryClick('totes')}
            />
            <p className="text-[#A8A29E] leading-relaxed max-w-sm">
              Diari digital d'avantguarda, opinió i assaig. Un espai lliure per a la reflexió pausada i el pensament amb veu pròpia.
            </p>
          </div>

          {/* 3 Sections */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-[11px] uppercase tracking-widest font-semibold text-[#D6CEBE]">
              Seccions
            </h4>
            <ul className="space-y-1.5 text-[#A8A29E]">
              <li>
                <button
                  onClick={() => onCategoryClick('totes')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Portada general
                </button>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onCategoryClick(cat.id)}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions & Editorial Access */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-[11px] uppercase tracking-widest font-semibold text-[#D6CEBE]">
              Redacció & Publicació
            </h4>
            <div className="flex flex-col gap-2.5 text-[#A8A29E]">
              {isEditor ? (
                <>
                  <button
                    onClick={onOpenEditor}
                    className="flex items-center gap-2 hover:text-white transition-colors text-left font-medium cursor-pointer"
                  >
                    <PenLine className="w-3.5 h-3.5 text-[#9A3412]" />
                    <span>Publicar document PDF</span>
                  </button>
                  <button
                    onClick={onOpenModerator}
                    className="flex items-center gap-2 hover:text-white transition-colors text-left cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#9A3412]" />
                    <span>Panell de moderació i documents</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={onOpenEditorLogin}
                  className="flex items-center gap-2 hover:text-white transition-colors text-left text-zinc-400 cursor-pointer"
                  title="Accés exclusiu de redacció"
                >
                  <Lock className="w-3.5 h-3.5 text-[#A8A29E]" />
                  <span>Accés de redacció</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Minimal Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-[#78716C]">
          <span>© 2026 L'oca del Caire. Barcelona.</span>
          <span>Des del cor de la ciutat comtal, amb rebel·lia, seny i rauxa.</span>
        </div>
      </div>
    </footer>
  );
};
