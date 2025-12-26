
import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { SocialLinks } from '../types';

interface LandingPageConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (links: SocialLinks) => void;
    loading: boolean;
}

const LandingPageConfigModal: React.FC<LandingPageConfigModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    loading
}) => {
    const [links, setLinks] = useState<SocialLinks>({
        instagram: '',
        facebook: '',
        pinterest: '',
        twitter: '',
        tiktok: '',
        contact: '',
        email: '',
        website: ''
    });

    const handleChange = (field: keyof SocialLinks, value: string) => {
        setLinks(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        onConfirm(links);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Configurar Landing Page"
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-400">
                    Adicione os links de redirecionamento para incluir na Landing Page gerada.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        id="instagram"
                        label="Instagram"
                        placeholder="https://instagram.com/..."
                        value={links.instagram}
                        onChange={(e) => handleChange('instagram', e.target.value)}
                    />
                    <Input
                        id="facebook"
                        label="Facebook"
                        placeholder="https://facebook.com/..."
                        value={links.facebook}
                        onChange={(e) => handleChange('facebook', e.target.value)}
                    />
                    <Input
                        id="pinterest"
                        label="Pinterest"
                        placeholder="https://pinterest.com/..."
                        value={links.pinterest}
                        onChange={(e) => handleChange('pinterest', e.target.value)}
                    />
                    <Input
                        id="twitter"
                        label="X (Twitter)"
                        placeholder="https://x.com/..."
                        value={links.twitter}
                        onChange={(e) => handleChange('twitter', e.target.value)}
                    />
                    <Input
                        id="tiktok"
                        label="TikTok"
                        placeholder="https://tiktok.com/..."
                        value={links.tiktok}
                        onChange={(e) => handleChange('tiktok', e.target.value)}
                    />
                    <Input
                        id="contact"
                        label="Link de Contato (WhatsApp)"
                        placeholder="https://wa.me/..."
                        value={links.contact}
                        onChange={(e) => handleChange('contact', e.target.value)}
                    />
                    <Input
                        id="email"
                        label="Email"
                        placeholder="contato@exemplo.com"
                        value={links.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                    />
                    <Input
                        id="website"
                        label="Site / Loja"
                        placeholder="https://meusite.com"
                        value={links.website}
                        onChange={(e) => handleChange('website', e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} isLoading={loading}>
                        Gerar Landing Page
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default LandingPageConfigModal;
