
import React, { useState, useEffect } from 'react';
import {
    ClockIcon,
    CalendarDaysIcon,
    SparklesIcon,
    ChartBarIcon,
    PlusIcon,
    TrashIcon,
    ArrowPathIcon,
    BellIcon,
    CheckCircleIcon,
    PhotoIcon,
    XMarkIcon,
    PencilIcon,
    ListBulletIcon,
    TableCellsIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { generateText } from '../services/ai/text';
import { getScheduleEntries, saveScheduleEntry, deleteScheduleEntry, getLibraryItems } from '../services/core/db';
import { useNavigate } from '../hooks/useNavigate';
import { ScheduleEntry as DbScheduleEntry, LibraryItem } from '../types';
import LiquidCalendar from '../components/features/LiquidCalendar';

interface ScheduledPost {
    id: string;
    title: string;
    content: string;
    platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'all';
    scheduledDate: string;
    scheduledTime: string;
    status: 'scheduled' | 'published' | 'failed';
    recurring?: {
        enabled: boolean;
        frequency: 'daily' | 'weekly' | 'monthly';
        endDate?: string;
    };
    aiSuggested?: boolean;
    engagement?: {
        likes: number;
        comments: number;
        shares: number;
    };
    mediaUrl?: string;
}

const platformColors = {
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
    facebook: 'bg-blue-600',
    twitter: 'bg-sky-500',
    linkedin: 'bg-blue-700',
    all: 'bg-gradient-to-r from-blue-500 to-purple-500'
};

const platformIcons = {
    instagram: '📸',
    facebook: '👥',
    twitter: '🐦',
    linkedin: '💼',
    all: '🌐'
};

const SmartScheduler: React.FC = () => {
    const [posts, setPosts] = useState<ScheduledPost[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newPlatform, setNewPlatform] = useState<ScheduledPost['platform']>('instagram');
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [recurringEndDate, setRecurringEndDate] = useState('');
    const [newImage, setNewImage] = useState<string | null>(null);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [publishingId, setPublishingId] = useState<string | null>(null);
    const [showAnalytics, setShowAnalytics] = useState(false);

    // View & Edit State
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
    const [editingId, setEditingId] = useState<string | null>(null);

    // Library Modal State
    const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

    const { addToast } = useToast();
    const { user } = useAuth();
    const { navigationParams } = useNavigate();
    const userId = user?.id || 'anonymous';

    // Fetch Library Items
    useEffect(() => {
        if (isLibraryModalOpen) {
            const fetchLibrary = async () => {
                setIsLoadingLibrary(true);
                try {
                    const items = await getLibraryItems(userId);
                    setLibraryItems(items);
                } catch (error) {
                    console.error('Failed to load library items', error);
                    addToast({ type: 'error', message: 'Erro ao carregar biblioteca.' });
                } finally {
                    setIsLoadingLibrary(false);
                }
            };
            fetchLibrary();
        }
    }, [isLibraryModalOpen, userId, addToast]);

    // Load Posts
    useEffect(() => {
        const load = async () => {
            try {
                const data = await getScheduleEntries(userId);
                const dbPosts: ScheduledPost[] = data.map(item => ({
                    id: item.id,
                    title: item.platform.toUpperCase(),
                    content: item.content || 'Conteúdo do agendamento',
                    mediaUrl: item.mediaUrl,
                    platform: item.platform as any,
                    scheduledDate: item.datetime.split('T')[0],
                    scheduledTime: item.datetime.split('T')[1]?.substring(0, 5) || '12:00',
                    status: item.status as any,
                }));
                setPosts(dbPosts);
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, [userId]);

    const calculateNextOccurrence = (currentDate: string, frequency: 'daily' | 'weekly' | 'monthly'): string => {
        const date = new Date(currentDate);
        switch (frequency) {
            case 'daily': date.setDate(date.getDate() + 1); break;
            case 'weekly': date.setDate(date.getDate() + 7); break;
            case 'monthly': date.setMonth(date.getMonth() + 1); break;
        }
        return date.toISOString().split('T')[0];
    };

    const handleDateSelect = (date: string) => {
        setNewDate(date);
        document.getElementById('scheduler-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handlePostSelect = (post: ScheduledPost) => {
        setEditingId(post.id);
        setNewTitle(post.title);
        setNewContent(post.content);
        setNewPlatform(post.platform);
        setNewDate(post.scheduledDate);
        setNewTime(post.scheduledTime);
        setNewImage(post.mediaUrl || null);
        if (post.recurring) {
            setIsRecurring(true);
            setRecurringFrequency(post.recurring.frequency);
            setRecurringEndDate(post.recurring.endDate || '');
        } else {
            setIsRecurring(false);
        }
        document.getElementById('scheduler-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNewTitle('');
        setNewContent('');
        setNewDate('');
        setNewTime('');
        setIsRecurring(false);
        setNewImage(null);
    };

    const handleAISuggestBestTime = async () => {
        setIsGeneratingAI(true);
        try {
            const prompt = `Melhor horário para postar ${newTitle} no ${newPlatform}. Responda YYYY-MM-DD HH:MM`;
            const suggestion = await generateText(prompt);
            const match = suggestion.match(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/);
            if (match) {
                setNewDate(match[1]);
                setNewTime(match[2]);
                addToast({ type: 'success', message: '✨ IA sugeriu horário!' });
            }
        } catch (error) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setNewDate(tomorrow.toISOString().split('T')[0]);
            setNewTime('18:00');
            addToast({ type: 'info', message: 'Usando horário padrão.' });
        } finally {
            setIsGeneratingAI(false);
        }
    };

    // Placeholder AI generation
    const handleGenerateAI = async () => {
        if (!newTitle) return addToast({ type: 'warning', message: 'Adicione um título primeiro' });
        setIsGeneratingAI(true);
        try {
            const text = await generateText(`Crie um post para ${newPlatform} sobre: ${newTitle}`);
            setNewContent(text);
        } catch (e) {
            addToast({ type: 'error', message: 'Erro ao gerar' });
        } finally {
            setIsGeneratingAI(false);
        }
    }

    const handleAddPost = async () => {
        if (!newTitle || !newContent || !newDate || !newTime) {
            addToast({ type: 'warning', message: 'Preencha todos os campos obrigatórios.' });
            return;
        }

        const newPost: ScheduledPost = {
            id: editingId || Date.now().toString(),
            title: newTitle,
            content: newContent,
            platform: newPlatform,
            scheduledDate: newDate,
            scheduledTime: newTime,
            status: 'scheduled',
            recurring: isRecurring ? {
                enabled: true,
                frequency: recurringFrequency,
                endDate: recurringEndDate || undefined
            } : undefined,
            aiSuggested: isGeneratingAI,
            mediaUrl: newImage || undefined
        };

        try {
            await saveScheduleEntry({
                id: newPost.id,
                userId: userId,
                platform: newPost.platform,
                datetime: `${newPost.scheduledDate}T${newPost.scheduledTime}:00`,
                status: 'scheduled',
                contentId: '',
                contentType: 'post',
                content: newPost.content,
                mediaUrl: newPost.mediaUrl
            });

            if (editingId) {
                setPosts(posts.map(p => p.id === editingId ? newPost : p));
                addToast({ type: 'success', message: '📅 Post atualizado!' });
                setEditingId(null);
            } else {
                setPosts([...posts, newPost]);
                addToast({ type: 'success', message: '📅 Post agendado!' });
            }

            setNewTitle('');
            setNewContent('');
            setNewDate('');
            setNewTime('');
            setIsRecurring(false);
            setRecurringEndDate('');
            setNewImage(null);
        } catch (e) {
            addToast({ type: 'error', message: 'Erro ao salvar.' });
        }
    };

    const handleDeletePost = async (id: string) => {
        try {
            await deleteScheduleEntry(id);
            setPosts(posts.filter(p => p.id !== id));
            addToast({ type: 'info', message: 'Post removido.' });
        } catch (e) {
            addToast({ type: 'error', message: 'Erro ao remover.' });
        }
    };

    const handlePublishPost = async (post: ScheduledPost) => {
        setPublishingId(post.id);
        addToast({ type: 'info', message: 'Publicando...' });
        // Simulação
        setTimeout(() => {
            setPosts(posts.map(p => p.id === post.id ? { ...p, status: 'published' } : p));
            setPublishingId(null);
            addToast({ type: 'success', message: 'Publicado!' });
        }, 2000);
    };

    const pendingPosts = posts.filter(p => p.status === 'scheduled');
    const publishedPosts = posts.filter(p => p.status === 'published');
    const totalEngagement = publishedPosts.reduce((acc, p) => acc + (p.engagement?.likes || 0), 0);

    return (
        <div className="animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between pb-6 border-b border-border gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                        <ClockIcon className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-title">Smart Scheduler</h1>
                        <p className="text-muted">Agendamento inteligente com visualização avançada.</p>
                    </div>
                </div>

                <div className="bg-surface border border-white/10 rounded-lg p-1 flex gap-1">
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400'}`}>
                        <ListBulletIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-md ${viewMode === 'calendar' ? 'bg-primary text-white' : 'text-gray-400'}`}>
                        <TableCellsIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Analytics */}
                    {showAnalytics && (
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-surface p-4 rounded-xl border border-border">
                                <h3 className="text-sm font-medium text-muted">Pendentes</h3>
                                <p className="text-2xl font-bold text-primary">{pendingPosts.length}</p>
                            </div>
                            <div className="bg-surface p-4 rounded-xl border border-border">
                                <h3 className="text-sm font-medium text-muted">Publicados</h3>
                                <p className="text-2xl font-bold text-green-500">{publishedPosts.length}</p>
                            </div>
                        </div>
                    )}

                    {viewMode === 'calendar' ? (
                        <div className="animate-fade-in">
                            <LiquidCalendar
                                posts={posts}
                                onDateSelect={handleDateSelect}
                                onPostSelect={handlePostSelect}
                            />
                        </div>
                    ) : (
                        /* List View */
                        <div className="space-y-4">
                            {posts.length === 0 && <p className="text-muted text-center py-10">Sem posts.</p>}
                            {posts.map((post) => (
                                <div key={post.id} className="bg-surface border border-border rounded-xl p-5 hover:border-primary/50 transition-colors relative">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">{platformIcons[post.platform]}</div>
                                            <h3 className="font-bold text-title">{post.title}</h3>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handlePostSelect(post)} className="text-gray-400 hover:text-primary"><PencilIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDeletePost(post.id)} className="text-gray-400 hover:text-red-400"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                    <p className="text-body text-sm mb-2">{post.content}</p>
                                    <div className="text-xs text-muted flex gap-4">
                                        <span>📅 {post.scheduledDate} {post.scheduledTime}</span>
                                        {post.status === 'published' && <span className="text-green-500">Publicado</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar Form */}
                <div id="scheduler-form" className="lg:col-span-1">
                    <div className="bg-surface rounded-xl border border-border p-6 shadow-lg lg:sticky lg:top-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-title flex items-center gap-2">
                                {editingId ? <PencilIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                                {editingId ? 'Editar' : 'Novo'}
                            </h2>
                            {editingId && <button onClick={handleCancelEdit} className="text-xs text-red-400">Cancelar</button>}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Título</label>
                                <Input id="post-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Plataforma</label>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                    {Object.keys(platformIcons).map((p: any) => (
                                        <button key={p} onClick={() => setNewPlatform(p)} className={`p-2 rounded border ${newPlatform === p ? 'border-primary bg-primary/10' : 'border-transparent'}`}>{platformIcons[p as keyof typeof platformIcons]}</button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium text-muted">Conteúdo</label>
                                    <button onClick={handleGenerateAI} disabled={isGeneratingAI} className="text-xs text-purple-400 flex gap-1"><SparklesIcon className="w-3 h-3" /> {isGeneratingAI ? '...' : 'IA'}</button>
                                </div>
                                <textarea className="w-full h-32 px-3 py-2 bg-background border border-border rounded-lg text-body" value={newContent} onChange={(e) => setNewContent(e.target.value)} />
                            </div>

                            <div className="mt-2">
                                <label className="text-sm font-medium text-muted">Mídia</label>
                                <div className="flex gap-2 mt-1">
                                    <Button onClick={() => setIsLibraryModalOpen(true)} variant="outline" size="sm" className="w-full"><PhotoIcon className="w-4 h-4 mr-2" /> Biblioteca</Button>
                                    <label className="w-full cursor-pointer bg-background border border-border hover:bg-surface text-title px-3 py-2 rounded-lg text-sm flex items-center justify-center">
                                        Upload <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => setNewImage(reader.result as string);
                                                reader.readAsDataURL(file);
                                            }
                                        }} />
                                    </label>
                                </div>
                                {newImage && <div className="mt-2 relative"><img src={newImage} className="h-20 rounded border border-border" /><button onClick={() => setNewImage(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"><XMarkIcon className="w-3 h-3" /></button></div>}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Input id="post-date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                                <Input id="post-time" type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
                                <span className="text-sm">Recorrente</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button onClick={handleAISuggestBestTime} variant="outline" disabled={isGeneratingAI}>Melhor Hora</Button>
                                <Button onClick={handleAddPost} variant="liquid">{editingId ? 'Salvar' : 'Agendar'}</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Library Modal */}
            {isLibraryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
                        <div className="flex justify-between p-4 border-b border-white/10">
                            <h3>Biblioteca</h3>
                            <button onClick={() => setIsLibraryModalOpen(false)}><XMarkIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="p-4 overflow-y-auto grid grid-cols-3 gap-4">
                            {libraryItems.filter(i => i.type === 'image' || i.type === 'post').map(item => (
                                <div key={item.id} onClick={() => { setNewImage(item.file_url); setIsLibraryModalOpen(false); }} className="cursor-pointer">
                                    <img src={item.file_url} className="w-full aspect-square object-cover rounded hover:opacity-80" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartScheduler;
