import React, { useState } from 'react';
import { Lock, KeyRound, Check, X, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { verifyEditorPasscode, setEditorAuthenticated, setEditorPasscode } from '../lib/storage';

interface EditorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  isAlreadyAuthenticated?: boolean;
}

export const EditorAuthModal: React.FC<EditorAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
  isAlreadyAuthenticated = false,
}) => {
  const [passcode, setPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmNewPasscode, setConfirmNewPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isChangingPasscode, setIsChangingPasscode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setErrorMsg('Si us plau, introduïu el codi d’accés.');
      return;
    }

    if (verifyEditorPasscode(passcode)) {
      setEditorAuthenticated(true);
      setErrorMsg(null);
      onAuthenticated();
      onClose();
    } else {
      setErrorMsg('Codi incorrecte. Comproveu la clau d’accés.');
    }
  };

  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasscode.length < 4) {
      setErrorMsg('El nou codi ha de tenir com a mínim 4 caràcters.');
      return;
    }
    if (newPasscode !== confirmNewPasscode) {
      setErrorMsg('Els dos codis nous no coincideixen.');
      return;
    }

    setEditorPasscode(newPasscode);
    setSuccessMsg('Codi de redacció actualitzat correctament.');
    setErrorMsg(null);
    setNewPasscode('');
    setConfirmNewPasscode('');
    setTimeout(() => {
      setIsChangingPasscode(false);
      setSuccessMsg(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FBF9F5] border border-[#DDD5C7] rounded-xs shadow-2xl w-full max-w-md overflow-hidden text-[#1C1917]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E7E2D8] bg-[#F4EFE6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1C1917] text-white flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#E7E2D8]" />
            </div>
            <div>
              <h3 className="font-editorial font-bold text-base text-[#1C1917]">
                {isAlreadyAuthenticated && isChangingPasscode
                  ? 'Canviar codi de redacció'
                  : 'Accés exclusiu de redacció'}
              </h3>
              <p className="text-[11px] text-[#78716C]">L'oca del Caire · Edició digital</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#EAE5DC] rounded-xs text-[#78716C] hover:text-[#1C1917] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xs text-xs text-red-800">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xs text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isChangingPasscode ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <p className="text-xs text-[#57534E] leading-relaxed">
                Aquest espai està reservat per a l'editor. Permet accedir a les pestanyes de publicació de documents PDF i al panell de moderació.
              </p>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-1.5">
                  Codi d'accés (PIN)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoFocus
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DDD5C7] rounded-xs pr-10 focus:outline-none focus:border-[#9A3412]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {isAlreadyAuthenticated && (
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => setIsChangingPasscode(true)}
                      className="text-[11px] text-[#9A3412] hover:underline cursor-pointer"
                    >
                      Canviar clau d'accés
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1C1917] hover:bg-[#322D29] text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#E7E2D8]" />
                  <span>Accedir</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePasscode} className="space-y-4">
              <p className="text-xs text-[#57534E] leading-relaxed">
                Trieu un nou codi o contrasenya per protegir l'accés a les eines de publicació del diari.
              </p>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                  Nou codi PIN
                </label>
                <input
                  type="password"
                  required
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  placeholder="Mínim 4 caràcters"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#DDD5C7] rounded-xs focus:outline-none focus:border-[#9A3412]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                  Confirmar nou codi PIN
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPasscode}
                  onChange={(e) => setConfirmNewPasscode(e.target.value)}
                  placeholder="Torneu a escriure el codi"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#DDD5C7] rounded-xs focus:outline-none focus:border-[#9A3412]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsChangingPasscode(false)}
                  className="px-3 py-1.5 text-xs text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                >
                  Enrere
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1C1917] text-white text-xs font-semibold rounded-xs hover:bg-[#322D29] cursor-pointer"
                >
                  Desar nou codi
                </button>
              </div>
            </form>
          )}

          {/* Privacy Notice */}
          <div className="mt-5 pt-4 border-t border-[#EAE5DC] text-[11px] text-[#78716C] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              La sessió de redacció es desa de manera privada al vostre navegador.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
