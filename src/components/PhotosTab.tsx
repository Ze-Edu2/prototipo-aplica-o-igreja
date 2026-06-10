import React, { useState, useRef } from 'react';
import { PhotoAlbum, Photo } from '../types';
import { Image, Plus, Trash2, Camera, Upload, X, Eye, ZoomIn, Grid } from 'lucide-react';

interface PhotosTabProps {
  albums: PhotoAlbum[];
  photos: Photo[];
  onAddAlbum: (name: string) => void;
  onDeleteAlbum: (id: string) => void;
  onAddPhotos: (albumId: string, base64Urls: string[]) => void;
  onDeletePhoto: (id: string) => void;
  isAdm: boolean;
}

export function PhotosTab({
  albums,
  photos,
  onAddAlbum,
  onDeleteAlbum,
  onAddPhotos,
  onDeletePhoto,
  isAdm
}: PhotosTabProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [isNewAlbumModalOpen, setIsNewAlbumModalOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  
  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  // Image Upload helper referrers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Group photos of the selected album
  const currentAlbumPhotos = selectedAlbumId 
    ? photos.filter(p => p.albumId === selectedAlbumId)
    : [];

  const handleCreateAlbumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;
    onAddAlbum(newAlbumName);
    setNewAlbumName('');
    setIsNewAlbumModalOpen(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedAlbumId) return;

    setUploading(true);
    const loadedBase64s: string[] = [];

    // Process multiple selected images
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await convertFileToBase64(file);
      if (base64) loadedBase64s.push(base64);
    }

    if (loadedBase64s.length > 0) {
      onAddPhotos(selectedAlbumId, loadedBase64s);
    }

    setUploading(false);
    // Reset file input value
    e.target.value = '';
  };

  const convertFileToBase64 = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  };

  const triggerUploadInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Upper Navigation / Tab Header */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm gap-2.5">
        <div className="flex items-center gap-1.5">
          <Image className="h-4.5 w-4.5 text-blue-600" />
          <div>
            <h3 className="font-bold text-slate-800 text-xs">
              {selectedAlbumId 
                ? `Álbum: ${albums.find(a => a.id === selectedAlbumId)?.name || ''}` 
                : 'Galeria & Álbuns de Fotos'}
            </h3>
            <p className="text-[10px] text-slate-400">
              {selectedAlbumId 
                ? 'Visualize ou adicione fotos a este álbum de recordações da nossa igreja' 
                : 'Registros dos cultos, batismos, retiros e ações sociais'}
            </p>
          </div>
        </div>

        <div className="flex gap-1.5">
          {selectedAlbumId && (
            <button
              onClick={() => setSelectedAlbumId(null)}
              className="px-2.5 py-1.5 border border-slate-200 rounded hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Grid className="h-3.5 w-3.5" />
              Ver Todos os Álbuns
            </button>
          )}

          {isAdm && (
            <>
              {selectedAlbumId ? (
                <button
                  onClick={triggerUploadInput}
                  disabled={uploading}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-transparent rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm transition-colors cursor-pointer disabled:bg-slate-300"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>{uploading ? 'Processando...' : 'Adicionar Fotos (Multi)'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsNewAlbumModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-transparent rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Criar Novo Álbum</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hidden file input with multiple and capture parameters */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/*"
        className="hidden"
        title="Selecione imagens da galeria ou dispare a câmera"
      />

      {/* MAIN VIEW: ALBUMS LIST */}
      {!selectedAlbumId ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-lg border border-slate-200 text-slate-400 space-y-2.5 shadow-sm">
              <Image className="h-8 w-8 text-slate-200 mx-auto" />
              <p className="text-xs font-medium">Nenhum álbum de fotos criado.</p>
              {isAdm && <p className="text-[10px] text-slate-400">Comece publicando um álbum pelo botão acima!</p>}
            </div>
          ) : (
            albums.map((album) => {
              // Retrieve specific cover photo or default first photo URL
              const albumPhotosList = photos.filter(p => p.albumId === album.id);
              const coverPhotoUrl = albumPhotosList.length > 0 
                ? albumPhotosList[0].url 
                : album.coverUrl || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23cbd5e1'><rect width='100' height='100'/><text x='50' y='55' font-size='10' text-anchor='middle' fill='%2364748b'>Vazio</text></svg>";

              return (
                <div 
                  key={album.id}
                  className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow transition-shadow group flex flex-col justify-between"
                >
                  <div 
                    onClick={() => setSelectedAlbumId(album.id)}
                    className="relative aspect-video bg-slate-100 overflow-hidden cursor-pointer"
                  >
                    <img 
                      src={coverPhotoUrl} 
                      alt={album.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/20 transition-colors"></div>
                    
                    <span className="absolute bottom-2 left-2 bg-slate-950/75 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Image className="h-2.5 w-2.5" />
                      {albumPhotosList.length} {albumPhotosList.length === 1 ? 'Foto' : 'Fotos'}
                    </span>
                  </div>

                  <div className="p-3 flex items-center justify-between gap-3 bg-white">
                    <div 
                      onClick={() => setSelectedAlbumId(album.id)}
                      className="cursor-pointer flex-1"
                    >
                      <h4 className="font-bold text-slate-800 text-xs hover:text-blue-600 transition-colors line-clamp-1">{album.name}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5 font-mono">Criado em: {new Date(album.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>

                    {isAdm && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Tem certeza que deseja apagar o álbum "${album.name}" e todas as suas fotos asociadas?`)) {
                            onDeleteAlbum(album.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 p-1 rounded border border-red-100 hover:bg-red-50 transition-colors cursor-pointer shrink-0 animate-fade-in"
                        title="Deletar Álbum"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* SECONDARY VIEW: INTERNAL PHOTOS GRID OF THE SINGLE SELECTION */
        <div className="space-y-4">
          {currentAlbumPhotos.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-100 rounded-xl text-slate-400 space-y-4 shadow-sm">
              <Camera className="h-10 w-10 text-slate-200 mx-auto" />
              <p className="text-sm">Este álbum está completamente vazio.</p>
              {isAdm ? (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={triggerUploadInput}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
                  >
                    Fazer Upload de Fotos
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Em breve a liderança publicará novas lembranças aqui.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" id="photo-lightbox-gallery">
              {currentAlbumPhotos.map((photo, index) => (
                <div 
                  key={photo.id}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-slate-150 bg-slate-50 shadow-sm hover:shadow-md transition-shadow"
                >
                  <img 
                    src={photo.url} 
                    alt="Foto do álbum" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                  />
                  
                  {/* Photo Overlay Options */}
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setLightboxIndex(index)}
                      className="p-1 px-2.5 bg-white/95 text-slate-800 hover:bg-white rounded-lg text-xs font-bold shadow-sm cursor-pointer flex items-center gap-1 transition-transform"
                    >
                      <ZoomIn className="h-3.5 w-3.5 text-blue-900" />
                      Ampliar
                    </button>

                    {isAdm && (
                      <button
                        onClick={() => {
                          if (confirm(`Excluir essa foto permanentemente?`)) {
                            onDeletePhoto(photo.id);
                          }
                        }}
                        className="p-1.5 bg-red-600/95 text-white hover:bg-red-700 rounded-lg shadow-sm cursor-pointer"
                        title="Deletar Foto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE ALBUM DIAG modal */}
      {isNewAlbumModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsNewAlbumModalOpen(false)}></div>
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider">Criar Novo Álbum Fotográfico</h3>
              <button 
                onClick={() => setIsNewAlbumModalOpen(false)}
                className="text-white hover:bg-white/10 p-1 rounded transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateAlbumSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Nome do Álbum *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Festividades Pentecostais 2026"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  className="block w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setIsNewAlbumModalOpen(false)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
                >
                  Criar Álbum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX SLIDER SCREEN */}
      {lightboxIndex !== null && currentAlbumPhotos[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4">
          {/* Lightbox header controls */}
          <div className="flex justify-between items-center p-2 text-slate-300">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
              Foto {lightboxIndex + 1} de {currentAlbumPhotos.length}
            </span>
            <button 
              onClick={() => setLightboxIndex(null)}
              className="p-1 px-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors flex items-center gap-1 cursor-pointer text-sm font-bold"
            >
              <X className="h-4.5 w-4.5" />
              Fechar [Esc]
            </button>
          </div>

          {/* Core image display container */}
          <div className="flex-1 flex items-center justify-center p-2 md:p-6 relative select-none">
            {/* Nav controls on desktop */}
            {lightboxIndex > 0 && (
              <button 
                onClick={() => setLightboxIndex(lightboxIndex - 1)}
                className="absolute left-4 bg-white/15 hover:bg-white/25 text-white p-3 rounded-full cursor-pointer transition-colors"
                title="Foto Anterior"
              >
                &larr;
              </button>
            )}

            <img 
              src={currentAlbumPhotos[lightboxIndex].url}
              alt="VisualizaçãoLightbox"
              referrerPolicy="no-referrer"
              className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl animate-fade-in"
            />

            {lightboxIndex < currentAlbumPhotos.length - 1 && (
              <button 
                onClick={() => setLightboxIndex(lightboxIndex + 1)}
                className="absolute right-4 bg-white/15 hover:bg-white/25 text-white p-3 rounded-full cursor-pointer transition-colors"
                title="Próxima Foto"
              >
                &rarr;
              </button>
            )}
          </div>

          {/* Close trigger footer */}
          <div className="text-center text-xs text-slate-500 pb-3 font-medium">
            Toque nas laterais ou use as setas para navegar.
          </div>
        </div>
      )}
    </div>
  );
}
