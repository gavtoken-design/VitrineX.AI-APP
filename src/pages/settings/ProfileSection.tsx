
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { updateUserProfile } from '../../services/core/db';
import Button from '../../components/ui/Button';
import { ShareIcon, UserIcon } from '@heroicons/react/24/outline';

const ProfileSection: React.FC = () => {
    const { user, profile } = useAuth();
    const { t } = useLanguage();
    const { addToast } = useToast();
    const [saving, setSaving] = useState(false);

    // Form State
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [address, setAddress] = useState('');

    // Social Connections State
    const [instagram, setInstagram] = useState('');
    const [facebook, setFacebook] = useState('');
    const [pinterest, setPinterest] = useState('');
    const [twitter, setTwitter] = useState('');
    const [tiktok, setTiktok] = useState('');
    const [genericContact, setGenericContact] = useState('');
    const [publicEmail, setPublicEmail] = useState('');
    const [website, setWebsite] = useState('');

    useEffect(() => {
        if (user?.user_metadata?.full_name) {
            setFullName(user.user_metadata.full_name);
        }
        if (profile?.contactInfo) {
            setPhone(profile.contactInfo.phone || '');
            setCnpj(profile.contactInfo.cnpj || '');
            setAddress(profile.contactInfo.address || '');

            // Load Social Connections
            setInstagram(profile.contactInfo.instagram || '');
            setFacebook(profile.contactInfo.facebook || '');
            setPinterest(profile.contactInfo.pinterest || '');
            setTwitter(profile.contactInfo.twitter || '');
            setTiktok(profile.contactInfo.tiktok || '');
            setGenericContact(profile.contactInfo.contact || '');
            setPublicEmail(profile.contactInfo.contactEmail || '');
            setWebsite(profile.contactInfo.website || '');
        }
    }, [user, profile]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await updateUserProfile(user.id, {
                name: fullName,
                contactInfo: {
                    phone,
                    cnpj,
                    address,
                    // Social Connections
                    instagram,
                    facebook,
                    pinterest,
                    twitter,
                    tiktok,
                    contact: genericContact,
                    contactEmail: publicEmail,
                    website
                }
            });

            // Sync with Supabase Auth Metadata for immediate UI updates (Dashboard Greeting)
            await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    name: fullName // Backup for legacy checks
                }
            });

            addToast({
                type: 'success',
                title: 'Salvo',
                message: 'Suas informações foram atualizadas com sucesso.'
            });
        } catch (error) {
            console.error('Error saving profile:', error);
            addToast({
                type: 'error',
                title: 'Erro',
                message: 'Falha ao salvar as alterações.'
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Account Settings */}
            <section id="profile-section" className="glass-card p-8">
                <div className="flex items-center gap-3 mb-6">
                    <UserIcon className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Informações da Conta</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Nome Completo</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Seu nome"
                            className="w-full bg-[var(--background-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">E-mail</label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full bg-[var(--background-input)]/50 border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-secondary)] cursor-not-allowed"
                        />
                    </div>
                    {/* New Fields */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Telefone / WhatsApp</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(11) 99999-9999"
                            className="w-full bg-[var(--background-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">CNPJ</label>
                        <input
                            type="text"
                            value={cnpj}
                            onChange={(e) => setCnpj(e.target.value)}
                            placeholder="00.000.000/0001-00"
                            className="w-full bg-[var(--background-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Endereço Comercial</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Rua Exemplo, 123 - Cidade/UF"
                            className="w-full bg-[var(--background-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>
                <div className="mt-8">
                    <Button variant="primary" onClick={handleSaveProfile} isLoading={saving}>
                        Salvar Alterações
                    </Button>
                </div>
            </section>

            {/* Social Connections Section */}
            <section id="social-section" className="glass-card p-8">
                <div className="flex items-center gap-3 mb-6">
                    <ShareIcon className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">{t('settings.social.title')}</h2>
                </div>
                <p className="text-[var(--text-secondary)] text-sm mb-6">
                    {t('settings.social.desc')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Instagram</label>
                        <input
                            type="text"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="@seu_perfil"
                            className="w-full bg-[var(--background-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Facebook</label>
                        <input
                            type="text"
                            value={facebook}
                            onChange={(e) => setFacebook(e.target.value)}
                            placeholder="Facebook URL"
                            className="w-full bg-[var(--background-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Pinterest</label>
                        <input
                            type="text"
                            value={pinterest}
                            onChange={(e) => setPinterest(e.target.value)}
                            placeholder="Pinterest URL"
                            className="w-full bg-[var(--background-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Twitter (X)</label>
                        <input
                            type="text"
                            value={twitter}
                            onChange={(e) => setTwitter(e.target.value)}
                            placeholder="@seu_handle"
                            className="w-full bg-[var(--background-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">TikTok</label>
                        <input
                            type="text"
                            value={tiktok}
                            onChange={(e) => setTiktok(e.target.value)}
                            placeholder="@seu_tiktok"
                            className="w-full bg-[var(--background-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{t('settings.social.contact')}</label>
                        <input
                            type="text"
                            value={genericContact}
                            onChange={(e) => setGenericContact(e.target.value)}
                            placeholder="Link de Contato ou Info"
                            className="w-full bg-[var(--background-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{t('settings.social.email')}</label>
                        <input
                            type="email"
                            value={publicEmail}
                            onChange={(e) => setPublicEmail(e.target.value)}
                            placeholder="contato@empresa.com"
                            className="w-full bg-[var(--background-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{t('settings.social.website')}</label>
                        <input
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://suaempresa.com"
                            className="w-full bg-[var(--background-input)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>
                <div className="mt-8">
                    <Button variant="primary" onClick={handleSaveProfile} isLoading={saving}>
                        {t('settings.social.btn_save')}
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default ProfileSection;
