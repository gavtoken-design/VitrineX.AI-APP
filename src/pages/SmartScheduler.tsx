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
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { generateText } from '../services/ai/text';
import { getScheduleEntries, saveScheduleEntry, deleteScheduleEntry } from '../services/core/db';
import { ScheduleEntry as DbScheduleEntry } from '../types';

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
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const { addToast } = useToast();
    const { user } = useAuth();
    const userId = user?.id || 'anonymous';

    // Load posts from DB
    useEffect(() => {
        const load = async () => {
            try {
                const data = await getScheduleEntries(userId);
                // Map DB entries to local state if needed
                const mapped: ScheduledPost[] = data.map(item => ({
                    id: item.id,
                    title: item.platform.toUpperCase(), // Logic fallback
                    content: 'Conteúdo de post', // Logic fallback
                    platform: item.platform as any,
                    scheduledDate: item.datetime.split('T')[0],
                    scheduledTime: item.datetime.split('T')[1]?.substring(0, 5) || '12:00',
                    status: item.status as any,
                }));
                setPosts(mapped);
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, [userId]);

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
            aiSuggested: isGeneratingAI
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
                contentType: 'post' // Added required property
            });

            setPosts([...posts, newPost]);

            // Reset form
            setNewTitle('');
            setNewContent('');
            setNewDate('');
            setNewTime('');
            setIsRecurring(false);
            setRecurringEndDate('');

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

    return (
        <div className="space-y-8 animate-fade-in">
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
                    </div>

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
                                    </div>
                                    <Button
                                        onClick={() => handleDeletePost(post.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </Button>
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
