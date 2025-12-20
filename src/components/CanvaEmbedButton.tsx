// src/components/CanvaEmbedButton.tsx
import { useState } from "react";

export default function CanvaEmbedButton() {
    const [show, setShow] = useState(false);
    const open = () => setShow(true);
    const close = () => setShow(false);

    return (
        <>
            <button
                className="px-3 py-1.5 md:px-4 md:py-2 bg-indigo-600 text-white rounded text-xs md:text-sm font-medium transition-all hover:bg-indigo-700 whitespace-nowrap"
                onClick={open}
            >
                <span className="hidden md:inline">Criar design no Canva</span>
                <span className="md:hidden">Canva</span>
            </button>

            {show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] overflow-hidden relative">
                        <iframe
                            src={`https://www.canva.com/design-editor?apiKey=${import.meta.env.VITE_CANVA_TOKEN}`}
                            className="w-full h-full border-0"
                            title="Canva Editor"
                        />
                        <button
                            className="absolute top-2 right-2 text-gray-600"
                            onClick={close}
                        >✕</button>
                    </div>
                </div>
            )}
        </>
    );
}
