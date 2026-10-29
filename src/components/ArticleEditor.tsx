import React, { useState, useRef } from 'react';
import { Article, CategoryId } from '../types';
import { CATEGORIES } from '../data/initialData';
import { addArticle } from '../lib/storage';
import {
  PenLine,
  Eye,
  Check,
  X,
  FileText,
  FileUp,
  AlertCircle,
  ImageIcon,
  ImageUp,
  Trash2,
} from 'lucide-react';

interface ArticleEditorProps {
  onClose: () => void;
  onArticleCreated: (newArticle: Article) => void;
  initialCategory?: CategoryId;
}

const PRESET_IMAGES = [
  {
    url: '/src/assets/images/barcelona_urbanisme_1790339518427.jpg',
    title: 'Barcelona Urbanisme & Societat',
  },
  {
    url: '/src/assets/images/literatura_catalana_1790339530970.jpg',
    title: 'Literatura & Lletres Catalanes',
  },
  {
    url: '/src/assets/images/filosofia_tecnologia_1790339545624.jpg',
    title: 'Filosofia, Ciència & Futur',
  },
  {
    url: '/src/assets/images/petit_pensador_logo_1790339503586.jpg',
    title: "Emblema L'oca del Caire",
  },
];

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  onClose,
  onArticleCreated,
  initialCategory = 'escrits-personals',
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<CategoryId>(initialCategory);
  const [authorName, setAuthorName] = useState("Redacció de L'oca del Caire");
  const [authorRole, setAuthorRole] = useState('Col·laborador/a');

  // Cover Image State
  const [imageUrl, setImageUrl] = useState<string>(PRESET_IMAGES[0].url);
  const [uploadedImageName, setUploadedImageName] = useState<string>('');
  const [uploadedImageSize, setUploadedImageSize] = useState<string>('');
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [imageCaption, setImageCaption] = useState('');
  const [showPresetsAndUrl, setShowPresetsAndUrl] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // PDF Upload State
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [pdfFileSize, setPdfFileSize] = useState<string>('');
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editorial Options
  const [featured, setFeatured] = useState(false);
  const [editorialPick, setEditorialPick] = useState(true);
  const [allowComments, setAllowComments] = useState(true);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Process PDF
  const processPdfFile = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Cal adjuntar un document en format PDF.');
      return;
    }

    setErrorMsg(null);
    setPdfFileName(file.name);
    setPdfFileSize(formatFileSize(file.size));

    // If title is empty, deduce default title from file name
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPdfUrl(result);
    };
    reader.onerror = () => {
      setErrorMsg('No s’ha pogut carregar el fitxer PDF.');
    };
    reader.readAsDataURL(file);
  };

  const handlePdfDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPdf(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processPdfFile(e.dataTransfer.files[0]);
    }
  };

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processPdfFile(e.target.files[0]);
    }
  };

  const handleRemovePdf = () => {
    setPdfUrl(null);
    setPdfFileName('');
    setPdfFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process Cover Image Upload
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Només s’admeten imatges (JPG, PNG, WebP).');
      return;
    }

    setErrorMsg(null);
    setUploadedImageName(file.name);
    setUploadedImageSize(formatFileSize(file.size));

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);
    };
    reader.onerror = () => {
      setErrorMsg('No s’ha pogut carregar la imatge.');
    };
    reader.readAsDataURL(file);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setUploadedImageName('');
    setUploadedImageSize('');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('El títol del document és obligatori.');
      return;
    }

    if (!pdfUrl) {
      setErrorMsg('Cal adjuntar un document en format PDF.');
      return;
    }

    const created = addArticle({
      title: title.trim(),
      subtitle: subtitle.trim(),
      category,
      author: {
        name: authorName.trim() || 'Redacció',
        role: authorRole.trim() || 'Col·laborador/a',
      },
      publishedAt: new Date().toISOString(),
      readTimeMinutes: 5,
      imageUrl: imageUrl.trim() || PRESET_IMAGES[0].url,
      imageCaption: imageCaption.trim() || undefined,
      pdfUrl,
      pdfFileName,
      pdfFileSize,
      featured,
      editorialPick,
      allowComments,
    });

    onArticleCreated(created);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#FBF9F5] border border-[#DDD5C7] rounded-xs shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col text-[#1C1917] overflow-hidden">
        {/* Editor Header */}
        <div className="px-6 py-4 border-b border-[#E7E2D8] flex items-center justify-between bg-[#F4EFE6]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1C1917] text-white flex items-center justify-center">
              <PenLine className="w-4 h-4 text-[#E7E2D8]" />
            </div>
            <div>
              <h2 className="text-lg font-editorial font-bold text-[#1C1917]">
                Publicar nou document
              </h2>
              <p className="text-[11px] text-[#78716C]">
                Pengeu el document en PDF i la imatge de portada per a la redacció
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode toggle */}
            <div className="flex items-center p-0.5 bg-[#EAE5DC] rounded-xs text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1 rounded-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'edit' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#78716C]'
                }`}
              >
                Edició
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  activeTab === 'preview' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#78716C]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Previsualització
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#EAE5DC] rounded-xs text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer"
              title="Tancar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xs text-xs text-red-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              {errorMsg}
            </span>
            <button onClick={() => setErrorMsg(null)} className="text-red-500 font-bold ml-2 cursor-pointer">
              ×
            </button>
          </div>
        )}

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'edit' ? (
            <form id="article-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Category, Author, and Affiliation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                    Secció del diari *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryId)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DDD5C7] rounded-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#9A3412]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                    Nom de l'autor/a *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Nom de l'autor/a"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DDD5C7] rounded-xs text-[#1C1917] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                    Filiació o càrrec
                  </label>
                  <input
                    type="text"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    placeholder="ex. Assagista, Filòsof, Crític..."
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DDD5C7] rounded-xs text-[#1C1917] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>
              </div>

              {/* Title and Subtitle */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                    Títol del document *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Sobre la decència, L'art d'escriure a contracorrent..."
                    className="w-full px-3.5 py-2.5 font-editorial text-lg sm:text-xl font-bold bg-white border border-[#DDD5C7] rounded-xs text-[#1C1917] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-1">
                    Subtítol o síntesi d'obertura
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Resum introductori que es veurà destacat a la portada..."
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DDD5C7] rounded-xs text-[#1C1917] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>
              </div>

              {/* 1. PDF DOCUMENT DROPZONE */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#9A3412]" />
                    Document en fitxer PDF *
                  </span>
                  <span className="text-[11px] font-normal text-[#A8A29E]">
                    Obligatori (.pdf)
                  </span>
                </label>

                {/* Hidden file input for PDF */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="application/pdf,.pdf"
                  onChange={handlePdfSelect}
                  className="hidden"
                  id="pdf-file-input"
                />

                {!pdfUrl ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingPdf(true);
                    }}
                    onDragLeave={() => setIsDraggingPdf(false)}
                    onDrop={handlePdfDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer border-2 border-dashed rounded-xs p-8 text-center transition-all flex flex-col items-center justify-center ${
                      isDraggingPdf
                        ? 'border-[#9A3412] bg-[#F5EFE6]'
                        : 'border-[#DDD5C7] hover:border-[#9A3412] bg-[#FAF8F3]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#EFE9DE] flex items-center justify-center text-[#9A3412] mb-3">
                      <FileUp className="w-6 h-6" />
                    </div>
                    <p className="font-editorial text-base font-bold text-[#1C1917] mb-1">
                      Deixeu caure aquí el fitxer PDF de l'article o escrit
                    </p>
                    <p className="text-xs text-[#78716C] max-w-sm mb-4">
                      Feu clic o arrossegueu el document directament des del vostre ordinador
                    </p>
                    <span className="px-3.5 py-1.5 bg-[#1C1917] hover:bg-[#322D29] text-white text-xs font-medium rounded-xs transition-colors shadow-xs">
                      Seleccionar fitxer PDF
                    </span>
                  </div>
                ) : (
                  /* Loaded PDF Card */
                  <div className="p-4 bg-white border border-[#DDD5C7] rounded-xs shadow-xs">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xs bg-[#9A3412]/10 border border-[#9A3412]/30 flex items-center justify-center text-[#9A3412] shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-xs text-[#1C1917] truncate font-mono">
                            {pdfFileName}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-[#78716C] mt-0.5">
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              PDF preparat per a la publicació
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{pdfFileSize}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-xs text-[#57534E] hover:text-[#1C1917] bg-[#F4EFE6] border border-[#DDD5C7] rounded-xs cursor-pointer"
                        >
                          Canviar fitxer
                        </button>
                        <button
                          type="button"
                          onClick={handleRemovePdf}
                          className="px-2.5 py-1 text-xs text-red-700 hover:text-red-900 bg-red-50 border border-red-200 rounded-xs cursor-pointer"
                        >
                          Eliminar PDF
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. COVER IMAGE UPLOAD / PRESET */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#9A3412]" />
                    Imatge de portada
                  </span>
                  <span className="text-[11px] font-normal text-[#A8A29E]">
                    Fotografia o il·lustració
                  </span>
                </label>

                {/* Hidden Image Input */}
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-file-input"
                />

                {/* Cover Image Upload Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingImage(true);
                  }}
                  onDragLeave={() => setIsDraggingImage(false)}
                  onDrop={handleImageDrop}
                  className={`border-2 border-dashed rounded-xs p-5 transition-all ${
                    isDraggingImage
                      ? 'border-[#9A3412] bg-[#F5EFE6]'
                      : 'border-[#DDD5C7] bg-[#FAF8F3]'
                  }`}
                >
                  {imageUrl ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Image Thumbnail */}
                      <div className="relative w-full sm:w-48 h-32 bg-stone-200 rounded-xs overflow-hidden border border-[#DDD5C7] shrink-0 group">
                        <img
                          src={imageUrl}
                          alt="Previsualització portada"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded-xs font-mono">
                          Portada
                        </span>
                      </div>

                      {/* Info & Actions */}
                      <div className="flex-1 space-y-2 text-center sm:text-left">
                        <div>
                          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-emerald-800">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Imatge de portada seleccionada</span>
                          </div>
                          {uploadedImageName ? (
                            <p className="font-mono text-xs text-[#1C1917] truncate mt-0.5">
                              {uploadedImageName} {uploadedImageSize && `(${uploadedImageSize})`}
                            </p>
                          ) : (
                            <p className="text-xs text-[#78716C] truncate mt-0.5">
                              Imatge de la galeria de redacció
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="px-3 py-1.5 bg-[#1C1917] hover:bg-[#322D29] text-white text-xs font-medium rounded-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                          >
                            <ImageUp className="w-3.5 h-3.5" />
                            <span>Penjar una altra imatge</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-medium rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar imatge</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowPresetsAndUrl(!showPresetsAndUrl)}
                            className="px-3 py-1.5 bg-white hover:bg-[#F4EFE6] text-[#57534E] border border-[#DDD5C7] text-xs font-medium rounded-xs transition-colors cursor-pointer"
                          >
                            {showPresetsAndUrl ? 'Amagar galeria' : 'Triar de la galeria'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Empty State: Prompt to drag or select */
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="cursor-pointer text-center py-4 flex flex-col items-center justify-center"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#EFE9DE] flex items-center justify-center text-[#9A3412] mb-2">
                        <ImageUp className="w-5 h-5" />
                      </div>
                      <p className="font-editorial text-sm font-bold text-[#1C1917] mb-1">
                        Deixeu caure una imatge de portada o feu clic aquí
                      </p>
                      <p className="text-[11px] text-[#78716C] max-w-sm mb-3">
                        Podeu carregar fitxers JPG, PNG o WebP que acompanyaran el document
                      </p>
                      <span className="px-3 py-1.5 bg-[#1C1917] hover:bg-[#322D29] text-white text-xs font-medium rounded-xs transition-colors shadow-xs">
                        Seleccionar imatge de portada
                      </span>
                    </div>
                  )}
                </div>

                {/* Expandable Gallery of Presets & External URL */}
                {(!imageUrl || showPresetsAndUrl) && (
                  <div className="p-3 bg-[#F4EFE6] border border-[#DDD5C7] rounded-xs space-y-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C]">
                      Galeria de redacció de L'oca del Caire
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {PRESET_IMAGES.map((preset) => (
                        <div
                          key={preset.url}
                          onClick={() => {
                            setImageUrl(preset.url);
                            setUploadedImageName('');
                            setUploadedImageSize('');
                          }}
                          className={`cursor-pointer rounded-xs overflow-hidden border-2 transition-all ${
                            imageUrl === preset.url
                              ? 'border-[#9A3412] shadow-xs'
                              : 'border-[#DDD5C7] hover:border-[#A8A29E]'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.title}
                            className="w-full h-14 object-cover"
                          />
                          <div className="p-1 text-[10px] bg-white truncate font-medium text-[#44403C]">
                            {preset.title}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#DDD5C7]">
                      <input
                        type="text"
                        value={imageUrl.startsWith('data:') ? '' : imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setUploadedImageName('');
                          setUploadedImageSize('');
                        }}
                        placeholder="O bé introduïu un URL d'imatge extern..."
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#DDD5C7] rounded-xs focus:outline-none focus:border-[#9A3412]"
                      />
                    </div>
                  </div>
                )}

                {/* Caption / Image Credit */}
                <div>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="Peu de foto o crèdits de la imatge (opcional)..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#DDD5C7] rounded-xs focus:outline-none focus:border-[#9A3412]"
                  />
                </div>
              </div>

              {/* Editorial Options */}
              <div className="pt-4 border-t border-[#E7E2D8] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="accent-[#9A3412]"
                  />
                  <span>Destacar a la portada com a notícia principal</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editorialPick}
                    onChange={(e) => setEditorialPick(e.target.checked)}
                    className="accent-[#9A3412]"
                  />
                  <span>Selecció editorial recomanada</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    className="accent-[#9A3412]"
                  />
                  <span>Permetre comentaris dels lectors</span>
                </label>
              </div>
            </form>
          ) : (
            /* Live Document Preview */
            <div className="max-w-2xl mx-auto py-6">
              <div className="text-xs text-[#9A3412] font-semibold uppercase tracking-wider mb-2">
                {CATEGORIES.find((c) => c.id === category)?.name} · Previsualització
              </div>
              <h1 className="text-3xl sm:text-4xl font-editorial font-bold text-[#1C1917] leading-tight mb-4">
                {title || 'Títol del document'}
              </h1>
              <p className="text-lg italic font-editorial text-[#57534E] pb-4 border-b border-[#E7E2D8] mb-6">
                {subtitle || 'Subtítol o descripció breu del text'}
              </p>

              {/* Cover Image in preview */}
              {imageUrl && (
                <div className="mb-6 rounded-xs overflow-hidden border border-[#DDD5C7]">
                  <img
                    src={imageUrl}
                    alt={title || 'Portada'}
                    className="w-full h-64 object-cover"
                  />
                  {imageCaption && (
                    <div className="p-2 text-[11px] text-[#78716C] bg-[#FAF8F3] italic border-t border-[#DDD5C7]">
                      {imageCaption}
                    </div>
                  )}
                </div>
              )}

              {pdfUrl ? (
                <div className="space-y-4">
                  <div className="p-4 bg-[#F5F0E6] border border-[#DDD5C7] rounded-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#9A3412]" />
                      <span className="font-mono text-xs font-semibold text-[#1C1917]">
                        {pdfFileName}
                      </span>
                    </div>
                    <span className="text-xs text-[#78716C]">{pdfFileSize}</span>
                  </div>
                  <div className="w-full h-96 border border-[#DDD5C7] rounded-xs overflow-hidden">
                    <iframe src={pdfUrl} title="Vista PDF" className="w-full h-full border-0" />
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-[#DDD5C7] rounded-xs text-[#78716C] italic font-editorial">
                  Encara no heu adjuntat cap fitxer PDF. Aneu a la pestanya d'Edició per carregar-ne un.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Editor Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E7E2D8] bg-[#F4EFE6] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#57534E] hover:text-[#1C1917] transition-colors cursor-pointer"
          >
            Cancel·lar
          </button>

          <button
            type="submit"
            form="article-form"
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#1C1917] hover:bg-[#322D29] rounded-xs shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-[#E7E2D8]" />
            <span>Publicar document</span>
          </button>
        </div>
      </div>
    </div>
  );
};
