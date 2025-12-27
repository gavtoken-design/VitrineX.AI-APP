import React, { useState, useEffect } from 'react';
import {
    ClockIcon,
    CalendarDaysIcon,
    SparklesIcon,
    PlusIcon,
    TrashIcon,
    PencilIcon,
    ListBulletIcon,
    TableCellsIcon,
    XMarkIcon,
    PhotoIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { generateText } from '../services/ai/text';
import { getScheduleEntries, saveScheduleEntry, deleteScheduleEntry } from '../services/core/db';
import { useNavigate } from '../hooks/useNavigate';
import { ScheduleEntry as DbScheduleEntry } from '../types';
import LiquidCalendar from '../components/features/LiquidCalendar';
import LibrarySelectorModal from '../components/features/LibrarySelectorModal';
import { useLanguage } from '../contexts/LanguageContext';
import { getRealTimeCalendarEvents, CalendarEvent } from '../services/calendar';

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

const platformIcons: Record<string, string> = {
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

    // Real-time Events
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [selectedEventContext, setSelectedEventContext] = useState<CalendarEvent | null>(null);

    // View & Edit State
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
    const [editingId, setEditingId] = useState<string | null>(null);

    // Library Modal State
    const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);

    const { addToast } = useToast();
    const { user } = useAuth();
    const userId = user?.id || 'anonymous';
    const { t } = useLanguage();

    // Load Posts
    useEffect(() => {
        const load = async () => {
            try {
                const data = await getScheduleEntries(userId);
                const dbPosts: ScheduledPost[] = data.map(item => ({
                    id: item.id,
                    title: item.platform.toUpperCase(),
                    content: item.content || '',
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

    // Load Real-Time Events (Holidays & Trends)
    useEffect(() => {
        const loadEvents = async () => {
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;
            try {
                const events = await getRealTimeCalendarEvents(year, month);
                setCalendarEvents(events);
            } catch (e) {
                console.error("Failed to load calendar events", e);
            }
        };
        loadEvents();
    }, []);

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

    const handleGenerateAI = async () => {
        if (!newTitle) return addToast({ type: 'warning', message: 'Adicione um título primeiro' });
        setIsGeneratingAI(true);
        try {
            let prompt = `Crie um post para ${newPlatform} sobre: ${newTitle}`;

            if (selectedEventContext) {
                if (selectedEventContext.type === 'holiday') {
                    prompt += `. O contexto é lúdico e comemorativo para o feriado de ${selectedEventContext.title}. Inclua emojis festivos.`;
                } else if (selectedEventContext.type === 'trend') {
                    prompt += `. Aproveite esta tendência de mercado (${selectedEventContext.description}). Seja ágil, noticioso e relevante.`;
                } else if (selectedEventContext.type === 'event') {
                    prompt += `. Este é um evento de marketing (${selectedEventContext.description}). Foco em engajamento ou conversão.`;
                }
            }

            const text = await generateText(prompt);
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

            handleCancelEdit();
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

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between pb-6 border-b border-white/10 gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-[0_0_15px_rgba(var(--color-primary),0.2)]">
                        <ClockIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tight italic">Smart <span className="text-primary not-italic">Scheduler</span></h1>
                        <p className="text-[var(--text-secondary)] font-medium text-sm mt-1">Agendamento inteligente com visualização avançada.</p>
                    </div>
                </div>

                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-1 flex gap-1 shadow-inner">
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                        <ListBulletIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                        <TableCellsIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {viewMode === 'calendar' ? (
                        <div className="animate-fade-in">
                            <LiquidCalendar
                                posts={posts}
                                events={calendarEvents}
                                onDateSelect={handleDateSelect}
                                onPostSelect={handlePostSelect}
                                onEventSelect={(event) => {
                                    setNewTitle(event.title.replace('🔥 Tendência: ', '').replace('🎉 ', ''));
                                    setNewDate(event.date);
                                    setNewContent(`Post sobre ${event.title}. ${event.description || ''}`);
                                    setSelectedEventContext(event); // Store for AI context
                                    addToast({ type: 'info', message: 'Evento selecionado! Edite os detalhes.' });
                                    document.getElementById('scheduler-form')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {posts.length === 0 && (
                                <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                                    <p>Nenhum post agendado.</p>
                                </div>
                            )}
                            {posts.map((post) => (
                                <div key={post.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-primary/50 transition-all group relative overflow-hidden backdrop-blur-sm">
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="text-3xl filter drop-shadow-lg">{platformIcons[post.platform]}</div>
                                            <div>
                                                <h3 className="font-bold text-[var(--text-primary)] text-lg">{post.title}</h3>
                                                <div className="flex gap-2 text-xs font-mono text-gray-500 mt-1">
                                                    <span>{post.scheduledDate}</span>
                                                    <span>•</span>
                                                    <span>{post.scheduledTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handlePostSelect(post)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-primary transition-colors"><PencilIcon className="w-4 h-4" /></button>
                                            <button onClick={() => handleDeletePost(post.id)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2 border-l-2 border-primary/20 pl-3">{post.content}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${post.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {post.status === 'published' ? 'Publicado' : 'Agendado'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar Form */}
                <div id="scheduler-form" className="lg:col-span-1">
                    <div className="bg-[#0A0A0A]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl lg:sticky lg:top-6">
                        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                            <h2 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-wide">
                                {editingId ? <PencilIcon className="w-5 h-5 text-primary" /> : <PlusIcon className="w-5 h-5 text-primary" />}
                                {editingId ? 'Editar Post' : 'Novo Agendamento'}
                            </h2>
                            {editingId && <button onClick={handleCancelEdit} className="text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-wider">Cancelar</button>}
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Título do Post</label>
                                <Input id="post-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-black/40 border-white/10 focus:border-primary/50" placeholder="Ex: Lançamento Verão..." />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Plataforma</label>
                                <div className="grid grid-cols-5 gap-1">
                                    {Object.keys(platformIcons).map((p: any) => (
                                        <button
                                            key={p}
                                            onClick={() => setNewPlatform(p)}
                                            className={`p-2 rounded-xl border transition-all ${newPlatform === p ? 'border-primary bg-primary/10 shadow-[0_0_10px_rgba(var(--color-primary),0.2)] scale-105' : 'border-white/5 bg-white/5 hover:bg-white/10 opacity-70 hover:opacity-100'}`}
                                            title={p}
                                        >
                                            <div className="text-xl text-center">{platformIcons[p]}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Conteúdo</label>
                                    <button onClick={handleGenerateAI} disabled={isGeneratingAI} className="text-[10px] font-bold text-purple-400 flex items-center gap-1 hover:text-purple-300 transition-colors bg-purple-500/10 px-2 rounded-full"><SparklesIcon className="w-3 h-3" /> {isGeneratingAI ? 'Criando...' : 'Gerar com IA'}</button>
                                </div>
                                <textarea
                                    className="w-full h-32 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-[var(--text-primary)] placeholder:text-gray-700 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none"
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    placeholder="Escreva sua legenda incrível aqui..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Mídia Visual</label>
                                    <div className="flex gap-2">
                                        <Button onClick={() => setIsLibraryModalOpen(true)} variant="outline" size="sm" className="w-full border-white/10 hover:bg-white/5 text-xs"><PhotoIcon className="w-4 h-4 mr-2" /> Biblioteca</Button>
                                        <label className="w-full cursor-pointer bg-black/40 border border-white/10 hover:border-primary/30 text-[var(--text-primary)] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center transition-all">
                                            Upload
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setNewImage(reader.result as string);
                                                    reader.readAsDataURL(file);
                                                }
                                            }} />
                                        </label>
                                    </div>
                                    {newImage && (
                                        <div className="mt-3 relative group">
                                            <img src={newImage} className="w-full h-32 object-cover rounded-xl border border-white/10" />
                                            <button onClick={() => setNewImage(null)} className="absolute top-2 right-2 bg-red-500 text-white rounded-lg p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><XMarkIcon className="w-3 h-3" /></button>
                                        </div>
                                    )}
                                </div>

                                <div className="col-span-1">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Data</label>
                                    <Input id="post-date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="bg-black/40 border-white/10" />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Hora</label>
                                    <Input id="post-time" type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="bg-black/40 border-white/10" />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="rounded border-gray-600 bg-black/50 text-primary focus:ring-primary" />
                                <span className="text-xs font-bold text-[var(--text-secondary)]">Repetir Semanalmente</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                                <Button onClick={handleAISuggestBestTime} variant="outline" disabled={isGeneratingAI} className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-xs font-bold uppercase">Melhor Hora (IA)</Button>
                                <Button onClick={handleAddPost} variant="liquid" className="w-full shadow-lg shadow-primary/20 text-xs font-bold uppercase">{editingId ? 'Salvar Alterações' : 'Agendar Post'}</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LibrarySelectorModal
                isOpen={isLibraryModalOpen}
                onClose={() => setIsLibraryModalOpen(false)}
                onSelect={(url) => {
                    setNewImage(url);
                    setIsLibraryModalOpen(false);
                }}
                userId={userId}
            />
        </div>
    );
};

export default SmartScheduler;
