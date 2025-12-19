// src/components/SocialPublish.tsx
import { useState } from "react";
import { publishFacebookPost, createInstagramMedia, publishInstagramMedia } from "../services/social";

export default function SocialPublish() {
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [status, setStatus] = useState<string>("");

    // These IDs should be stored in env vars or fetched from user profile
    const fbPageId = import.meta.env.VITE_FB_PAGE_ID;
    const fbAccessToken = localStorage.getItem("fb_access_token") || ""; // demo storage
    const igUserId = import.meta.env.VITE_IG_USER_ID;
    const igAccessToken = localStorage.getItem("ig_access_token") || "";

    const handleFacebookPublish = async () => {
        try {
            setStatus("Publicando no Facebook...");
            await publishFacebookPost(fbPageId, fbAccessToken, message);
            setStatus("Publicação no Facebook concluída!");
            setTimeout(() => {
                setMessage("");
                setStatus("");
            }, 2000);
        } catch (e) {
            console.error(e);
            setStatus("Erro ao publicar no Facebook.");
        }
    };

    const handleInstagramPublish = async () => {
        try {
            setStatus("Criando mídia no Instagram...");
            const mediaId = await createInstagramMedia(igUserId, igAccessToken, imageUrl, message);
            setStatus("Publicando no Instagram...");
            await publishInstagramMedia(igUserId, igAccessToken, mediaId);
            setStatus("Publicação no Instagram concluída!");
            setTimeout(() => {
                setMessage("");
                setImageUrl("");
                setStatus("");
            }, 2000);
        } catch (e) {
            console.error(e);
            setStatus("Erro ao publicar no Instagram.");
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="p-2 rounded-full text-muted hover:bg-background transition-colors"
                title="Publicar em Redes Sociais"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-surface border border-border rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Publicar em Redes Sociais</h2>
                            <button onClick={() => setShowModal(false)} className="text-muted hover:text-body">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <textarea
                                className="w-full p-3 border border-border rounded-lg bg-background text-body resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Escreva sua mensagem..."
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <input
                                type="text"
                                className="w-full p-3 border border-border rounded-lg bg-background text-body focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="URL da imagem (para Instagram)"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <button
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                    onClick={handleFacebookPublish}
                                    disabled={!message}
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    Facebook
                                </button>
                                <button
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                    onClick={handleInstagramPublish}
                                    disabled={!message || !imageUrl}
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                    Instagram
                                </button>
                            </div>
                            {status && (
                                <p className="text-sm text-center text-muted mt-2 p-2 bg-background rounded-lg">
                                    {status}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
