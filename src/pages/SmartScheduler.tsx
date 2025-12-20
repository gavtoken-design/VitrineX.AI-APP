import { useState, useEffect } from 'react';
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
    XMarkIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { generateText } from '../services/ai/text';
import { getScheduleEntries, saveScheduleEntry, deleteScheduleEntry, getLibraryItems } from '../services/core/db';
import { useNavigate } from '../hooks/useNavigate';
import { ScheduleEntry as DbScheduleEntry, LibraryItem } from '../types';
import { publishFacebookPost, createInstagramMedia, publishInstagramMedia } from '../services/social';

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
    mediaUrl?: string; // Image/Video URL or Base64
}

const STORAGE_KEY = 'vitrinex_scheduled_posts';

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

    // Library Modal State
    const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

    const { addToast } = useToast();
    const { user } = useAuth();
    const { navigationParams } = useNavigate(); // Get params
    const userId = user?.id || 'anonymous';

    // Fetch Library Items when modal opens
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

    // Load posts from DB & Check for Imported Campaign
    useEffect(() => {
        const load = async () => {
            try {
                // 1. Load existing posts
                const data = await getScheduleEntries(userId);

                // Map existing DB entries
                const dbPosts: ScheduledPost[] = data.map(item => ({
                    id: item.id,
                    title: item.platform.toUpperCase(),
                    content: item.content || 'Conteúdo do agendamento', // Load content from DB/Local
                    mediaUrl: item.mediaUrl, // Load media from DB/Local
                    // Note: In real app, DB entry should have content. Checking types... 
                    // db.ts: saveScheduleEntry accepts partial? 
                    // Let's assume we map what we can. 
                    platform: item.platform as any,
                    scheduledDate: item.datetime.split('T')[0],
                    scheduledTime: item.datetime.split('T')[1]?.substring(0, 5) || '12:00',
                    status: item.status as any,
                }));

                let combinedPosts = [...dbPosts];

                // 2. Check for passed Campaign Params
                if (navigationParams?.campaign) {
                    const campaign = navigationParams.campaign;
                    console.log('Importing campaign:', campaign);
                    addToast({ type: 'info', message: `Importando posts da campanha: ${campaign.name}` });

                    // Convert campaign posts to ScheduledPosts
                    const importedPosts: ScheduledPost[] = (campaign.posts || []).map((p: any, index: number) => {
                        // Logic to determine date/time based on campaign "day 1", "day 2" etc.
                        // For simplicity, we schedule starting tomorrow, one per day?
                        // Or try to parse p.date if it's like "Day 1".
                        const dateOffset = index; // +1 day per post
                        const targetDate = new Date();
                        targetDate.setDate(targetDate.getDate() + 1 + dateOffset);
                        const dateStr = targetDate.toISOString().split('T')[0];

                        const postPlatform = (p.platform || 'instagram').toLowerCase().includes('insta') ? 'instagram' : 'all';

                        return {
                            id: `camp-${Date.now()}-${index}`,
                            title: `Post Campanha: ${p.title || `Post ${index + 1}`}`,
                            content: p.content_text || p.content || '',
                            platform: postPlatform as any,
                            scheduledDate: dateStr,
                            scheduledTime: '10:00', // Default time
                            status: 'scheduled',
                            aiSuggested: true
                        };
                    });

                    // Option: Save them to DB immediately so they persist?
                    // Yes, to ensure consistency.
                    for (const newPost of importedPosts) {
                        await saveScheduleEntry({
                            id: newPost.id,
                            userId: userId,
                            platform: newPost.platform,
                            datetime: `${newPost.scheduledDate}T${newPost.scheduledTime}:00`,
                            status: 'scheduled',
                            contentId: '',
                            contentType: 'post'
                        });
                    }

                    combinedPosts = [...combinedPosts, ...importedPosts];
                    addToast({ type: 'success', message: `${importedPosts.length} posts da campanha importados!` });
                }

                setPosts(combinedPosts);

            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, [userId, navigationParams, addToast]); // Added navigationParams dependency

    // Removal of auto-save useEffect for LocalStorage
    /*
    useEffect(() => {
        if (posts.length > 0) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
            } catch (e) {
                console.warn('localStorage indisponível para salvar', e);
            }
        }
    }, [posts]);
    */

    // Check for posts to publish
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const currentDate = now.toISOString().split('T')[0];
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            setPosts(prev => {
                const newPostsToAdd: ScheduledPost[] = [];

                const updated = prev.map(post => {
                    if (
                        post.status === 'scheduled' &&
                        post.scheduledDate === currentDate &&
                        post.scheduledTime === currentTime
                    ) {
                        // Simulate publishing
                        addToast({
                            type: 'success',
                            message: `Post "${post.title}" publicado em ${platformIcons[post.platform]} ${post.platform}!`
                        });

                        // If recurring, create next occurrence
                        if (post.recurring?.enabled) {
                            const nextDate = calculateNextOccurrence(post.scheduledDate, post.recurring.frequency);
                            if (!post.recurring.endDate || nextDate <= post.recurring.endDate) {
                                const newPost: ScheduledPost = {
                                    ...post,
                                    id: Date.now().toString(),
                                    scheduledDate: nextDate,
                                    status: 'scheduled'
                                };
                                newPostsToAdd.push(newPost);
                            }
                        }

                        return { ...post, status: 'published' as const };
                    }
                    return post;
                });

                return [...updated, ...newPostsToAdd];
            });
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [addToast]);

    const calculateNextOccurrence = (currentDate: string, frequency: 'daily' | 'weekly' | 'monthly'): string => {
        const date = new Date(currentDate);
        switch (frequency) {
            case 'daily':
                date.setDate(date.getDate() + 1);
                break;
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
        }
        return date.toISOString().split('T')[0];
    };

    const handleAISuggestBestTime = async () => {
        setIsGeneratingAI(true);
        try {
            const prompt = `Baseado em análises de engajamento de redes sociais, sugira o melhor horário para postar conteúdo na plataforma ${newPlatform}. 
      Considere:
      - Horário de pico de audiência
      - Dias da semana mais efetivos
      - Tipo de conteúdo: ${newTitle || 'geral'}
      
      Responda APENAS com data e hora no formato: YYYY-MM-DD HH:MM
      Use a data de hoje ou próximos dias úteis.`;

            const suggestion = await generateText(prompt);

            // Parse AI suggestion
            const match = suggestion.match(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/);
            if (match) {
                setNewDate(match[1]);
                setNewTime(match[2]);
                addToast({
                    type: 'success',
                    message: '✨ IA sugeriu o melhor horário para máximo engajamento!'
                });
            } else {
                throw new Error('Formato inválido');
            }
        } catch (error) {
            console.error('AI suggestion failed:', error);
            // Fallback to default best times
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const bestTimes = {
                instagram: '19:00',
                facebook: '13:00',
                twitter: '12:00',
                linkedin: '10:00',
                all: '18:00'
            };

            setNewDate(tomorrow.toISOString().split('T')[0]);
            setNewTime(bestTimes[newPlatform]);
            addToast({
                type: 'info',
                message: 'Usando horário otimizado padrão para ' + newPlatform
            });
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleAddPost = async () => {
        if (!newTitle || !newContent || !newDate || !newTime) {
            addToast({ type: 'warning', message: 'Preencha todos os campos obrigatórios.' });
            return;
        }

        const newPost: ScheduledPost = {
            id: Date.now().toString(),
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
            // Save to DB
            await saveScheduleEntry({
                id: newPost.id,
                userId: userId,
                platform: newPost.platform,
                datetime: `${newPost.scheduledDate}T${newPost.scheduledTime}:00`,
                status: 'scheduled',
                contentId: '', // Corrected property name
                contentType: 'post', // Added required property
                content: newPost.content,
                mediaUrl: newPost.mediaUrl
            });

            setPosts([...posts, newPost]);

            // Reset form
            setNewTitle('');
            setNewContent('');
            setNewDate('');
            setNewTime('');
            setIsRecurring(false);
            setRecurringEndDate('');
            setNewImage(null);


            addToast({ type: 'success', message: '📅 Post agendado com sucesso!' });
        } catch (e) {
            addToast({ type: 'error', message: 'Erro ao salvar agendamento.' });
        }
    };

    const handleDeletePost = async (id: string) => {
        try {
            await deleteScheduleEntry(id);
            setPosts(posts.filter(p => p.id !== id));
            addToast({ type: 'info', message: 'Post removido do agendamento.' });
        } catch (e) {
            addToast({ type: 'error', message: 'Erro ao remover post.' });
        }
    };

    const pendingPosts = posts.filter(p => p.status === 'scheduled');
    const publishedPosts = posts.filter(p => p.status === 'published');

    const totalEngagement = publishedPosts.reduce((acc, post) => {
        if (post.engagement) {
            return acc + post.engagement.likes + post.engagement.comments + post.engagement.shares;
        }
        return acc;
    }, 0);

    const handlePublishPost = async (post: ScheduledPost) => {
        setPublishingId(post.id);
        addToast({ type: 'info', title: 'Publicando', message: `Iniciando publicação no ${post.platform}...` });

        try {
            // Simulation of connection (Tokens would come from DB/Auth in real app)
            const MOCK_ACCESS_TOKEN = "EAAG...";
            const MOCK_USER_ID = "1784...";

            let result;

            if (post.platform === 'facebook') {
                // Real implementation would look like this:
                // result = await publishFacebookPost(MOCK_USER_ID, MOCK_ACCESS_TOKEN, post.content);

                // For this demo (as connections aren't really set up in DB):
                await new Promise(resolve => setTimeout(resolve, 2000)); // Mock network delay
                result = { id: 'mock_fb_post_id_' + Date.now() };

            } else if (post.platform === 'instagram') {
                if (post.mediaUrl) {
                    // Instagram needs media
                    // const containerId = await createInstagramMedia(MOCK_USER_ID, MOCK_ACCESS_TOKEN, post.mediaUrl, post.content);
                    // result = await publishInstagramMedia(MOCK_USER_ID, MOCK_ACCESS_TOKEN, containerId);
                }

                // Mock delay
                await new Promise(resolve => setTimeout(resolve, 2500));
                result = { id: 'mock_ig_media_id_' + Date.now() };
            } else {
                // Generic handler for 'all' or others
                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            // Update status locally
            const updatedPosts = posts.map(p =>
                p.id === post.id ? { ...p, status: 'published' as const } : p
            );
            setPosts(updatedPosts);

            // Optionally update DB
            // await updateScheduleEntry(post.id, { status: 'published' });

            addToast({ type: 'success', title: 'Sucesso!', message: 'Post publicado com sucesso.' });

        } catch (error) {
            console.error("Publish error:", error);
            addToast({ type: 'error', title: 'Erro', message: 'Falha ao publicar. Verifique a conexão.' });
        } finally {
            setPublishingId(null);
        }
    };

    return (
        <div className="animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-border">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                        <ClockIcon className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-title">Smart Scheduler</h1>
                        <p className="text-muted">Agendamento inteligente com IA para máximo engajamento</p>
                    </div>
                </div>
                <Button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    variant="outline"
                    className="gap-2"
                >
                    <ChartBarIcon className="w-5 h-5" />
                    {showAnalytics ? 'Ocultar' : 'Ver'} Analytics
                </Button>
            </div>

            {/* Analytics Dashboard */}
            {showAnalytics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 rounded-xl border border-blue-500/20">
                        <div className="flex items-center gap-3 mb-2">
                            <CalendarDaysIcon className="w-6 h-6 text-blue-500" />
                            <h3 className="text-lg font-semibold text-title">Posts Agendados</h3>
                        </div>
                        <p className="text-4xl font-bold text-blue-500">{pendingPosts.length}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-xl border border-green-500/20">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircleIcon className="w-6 h-6 text-green-500" />
                            <h3 className="text-lg font-semibold text-title">Publicados</h3>
                        </div>
                        <p className="text-4xl font-bold text-green-500">{publishedPosts.length}</p>
                    </div>

                    <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 p-6 rounded-xl border border-pink-500/20">
                        <div className="flex items-center gap-3 mb-2">
                            <ChartBarIcon className="w-6 h-6 text-pink-500" />
                            <h3 className="text-lg font-semibold text-title">Engajamento Total</h3>
                        </div>
                        <p className="text-4xl font-bold text-pink-500">{totalEngagement}</p>
                    </div>
                </div>
            )}

            {/* Create New Post */}
            <div className="bg-surface p-8 rounded-xl shadow-card border border-border">
                <h3 className="text-xl font-semibold text-title mb-6 flex items-center gap-2">
                    <PlusIcon className="w-6 h-6" />
                    Agendar Novo Post
                </h3>

                <div className="space-y-4">
                    <Input
                        id="post-title"
                        label="Título do Post"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Ex: Lançamento de Produto"
                    />

                    <div>
                        <label className="block text-sm font-medium text-title mb-2">
                            Conteúdo
                        </label>
                        <textarea
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            placeholder="Digite o conteúdo do seu post..."
                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                            rows={4}
                        />

                        {/* Image Upload & Library Import */}
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-title mb-2">
                                Mídia (Imagem)
                            </label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                {/* Option 1: Upload from Device */}
                                <label className="cursor-pointer bg-background border border-border hover:bg-surface text-title px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto">
                                    <SparklesIcon className="w-5 h-5" />
                                    Do Dispositivo
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setNewImage(reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>

                                {/* Option 2: Import from Library */}
                                <Button
                                    onClick={() => setIsLibraryModalOpen(true)}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 w-full sm:w-auto justify-center py-3 sm:py-2"
                                >
                                    <PhotoIcon className="w-5 h-5" />
                                    Da Biblioteca
                                </Button>

                                {newImage && (
                                    <div className="relative group self-center sm:self-auto mt-2 sm:mt-0">
                                        <img src={newImage} alt="Preview" className="h-24 w-24 sm:h-16 sm:w-16 object-cover rounded-md border border-border" />
                                        <button
                                            onClick={() => setNewImage(null)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                            title="Remover imagem"
                                        >
                                            <TrashIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Library Selection Modal */}
                    {isLibraryModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                            <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative">
                                <div className="flex justify-between items-center p-4 border-b border-white/10">
                                    <h3 className="text-xl font-bold text-title">Selecionar da Biblioteca</h3>
                                    <button onClick={() => setIsLibraryModalOpen(false)} className="text-muted hover:text-title p-2">
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                                    {isLoadingLibrary ? (
                                        <div className="flex justify-center p-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    ) : libraryItems.filter(item => item.type === 'image' || item.type === 'post').length === 0 ? (
                                        <div className="text-center py-12 text-muted">
                                            <PhotoIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>Nenhuma imagem encontrada na biblioteca.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {libraryItems.filter(item => item.type === 'image' || item.type === 'post').map((item) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => {
                                                        if (item.file_url) {
                                                            setNewImage(item.file_url);
                                                            setIsLibraryModalOpen(false);
                                                            addToast({ type: 'success', message: 'Imagem selecionada!' });
                                                        }
                                                    }}
                                                    className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-all"
                                                >
                                                    <img
                                                        src={item.file_url}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-white font-bold text-sm bg-primary/80 px-2 py-1 rounded">Selecionar</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-title mb-2">
                                Plataforma
                            </label>
                            <select
                                value={newPlatform}
                                onChange={(e) => setNewPlatform(e.target.value as ScheduledPost['platform'])}
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="instagram">📸 Instagram</option>
                                <option value="facebook">👥 Facebook</option>
                                <option value="twitter">🐦 Twitter</option>
                                <option value="linkedin">💼 LinkedIn</option>
                                <option value="all">🌐 Todas as Plataformas</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <Button
                                onClick={handleAISuggestBestTime}
                                variant="outline"
                                className="w-full gap-2"
                                disabled={isGeneratingAI}
                            >
                                <SparklesIcon className="w-5 h-5" />
                                {isGeneratingAI ? 'Analisando...' : 'IA: Melhor Horário'}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            id="post-date"
                            label="Data"
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                        />
                        <Input
                            id="post-time"
                            label="Horário"
                            type="time"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                        />
                    </div>

                    {/* Recurring Options */}
                    <div className="p-4 bg-background rounded-lg border border-border">
                        <label className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox"
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                                className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-title flex items-center gap-2">
                                <ArrowPathIcon className="w-4 h-4" />
                                Post Recorrente
                            </span>
                        </label>

                        {isRecurring && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-2">
                                        Frequência
                                    </label>
                                    <select
                                        value={recurringFrequency}
                                        onChange={(e) => setRecurringFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm"
                                    >
                                        <option value="daily">Diariamente</option>
                                        <option value="weekly">Semanalmente</option>
                                        <option value="monthly">Mensalmente</option>
                                    </select>
                                </div>
                                <Input
                                    id="recurring-end"
                                    label="Data Final (Opcional)"
                                    type="date"
                                    value={recurringEndDate}
                                    onChange={(e) => setRecurringEndDate(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <Button onClick={handleAddPost} variant="primary" className="w-full gap-2">
                        <PlusIcon className="w-5 h-5" />
                        Agendar Post
                    </Button>
                </div>
            </div>

            {/* Scheduled Posts */}
            <div className="bg-surface p-8 rounded-xl shadow-card border border-border">
                <h3 className="text-xl font-semibold text-title mb-6 flex items-center gap-2">
                    <BellIcon className="w-6 h-6" />
                    Posts Agendados ({pendingPosts.length})
                </h3>

                {pendingPosts.length === 0 ? (
                    <p className="text-muted text-center py-8">Nenhum post agendado no momento.</p>
                ) : (
                    <div className="space-y-3">
                        {pendingPosts.map((post) => (
                            <div
                                key={post.id}
                                className="p-4 bg-background rounded-lg border border-border hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${platformColors[post.platform]}`}>
                                                {platformIcons[post.platform]} {post.platform}
                                            </span>
                                            {post.recurring?.enabled && (
                                                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium flex items-center gap-1">
                                                    <ArrowPathIcon className="w-3 h-3" />
                                                    {post.recurring.frequency}
                                                </span>
                                            )}
                                            {post.aiSuggested && (
                                                <span className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium flex items-center gap-1">
                                                    <SparklesIcon className="w-3 h-3" />
                                                    IA
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-title mb-1">{post.title}</h4>
                                        <p className="text-sm text-muted line-clamp-2 mb-2">{post.content}</p>
                                        <p className="text-xs text-muted">
                                            📅 {new Date(post.scheduledDate).toLocaleDateString('pt-BR')} às {post.scheduledTime}
                                        </p>
                                        {post.mediaUrl && (
                                            <div className="mt-2">
                                                <img src={post.mediaUrl} alt="Post media" className="h-20 w-auto rounded-md border border-border object-cover" />
                                            </div>
                                        )}
                                        {post.status === 'published' && (
                                            <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                <CheckCircleIcon className="w-3 h-3 mr-1" /> Publicado
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {post.status !== 'published' && (
                                            <Button
                                                onClick={() => handlePublishPost(post)}
                                                variant="outline"
                                                size="sm"
                                                className="text-primary border-primary/20 hover:bg-primary/10"
                                                isLoading={publishingId === post.id}
                                                disabled={publishingId !== null}
                                            >
                                                {publishingId === post.id ? 'Enviando...' : 'Enviar Agora'}
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => handleDeletePost(post.id)}
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
                                            title="Excluir agendamento"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Published Posts History */}
            {publishedPosts.length > 0 && (
                <div className="bg-surface p-8 rounded-xl shadow-card border border-border">
                    <h3 className="text-xl font-semibold text-title mb-6 flex items-center gap-2">
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                        Histórico de Publicações ({publishedPosts.length})
                    </h3>

                    <div className="space-y-3">
                        {publishedPosts.slice(0, 5).map((post) => (
                            <div
                                key={post.id}
                                className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${platformColors[post.platform]}`}>
                                                {platformIcons[post.platform]} {post.platform}
                                            </span>
                                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                                ✓ Publicado
                                            </span>
                                        </div>
                                        <h4 className="font-semibold text-title mb-1">{post.title}</h4>
                                        <p className="text-xs text-muted">
                                            📅 {new Date(post.scheduledDate).toLocaleDateString('pt-BR')} às {post.scheduledTime}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartScheduler;
