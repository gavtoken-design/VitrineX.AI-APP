import * as React from 'react';
import { useState, useEffect } from 'react';
import { CalendarDaysIcon, PlusIcon, TrashIcon, BellIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { getScheduleEntries, saveScheduleEntry, deleteScheduleEntry } from '../services/core/db';
import { ScheduleEntry } from '../types';
import { useNavigate } from '../hooks/useNavigate';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'post' | 'meeting' | 'task';
  platform?: string; // To identify source
  notified?: boolean;
}

const CalendarManager: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [eventType, setEventType] = useState<'post' | 'meeting' | 'task'>('task');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { addToast } = useToast();
  const { user } = useAuth();
  const { navigateTo } = useNavigate();
  const userId = user?.id || 'guest';

  // Load events from DB
  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const dbEntries = await getScheduleEntries(userId);

      const mappedEvents: CalendarEvent[] = dbEntries.map(entry => {
        const dateObj = new Date(entry.datetime);
        const date = entry.datetime.split('T')[0];
        const time = entry.datetime.split('T')[1]?.substring(0, 5) || '00:00';

        // Determine type based on platform or contentType
        let type: 'post' | 'meeting' | 'task' = 'post';
        if (entry.platform === 'Calendar') {
          // If we saved it as a task/meeting locally, we might have stored specific info in content or just treat as task
          type = 'task';
        }

        // Determine Title
        // If it's a post, maybe use content truncated or platform
        let title = entry.content || 'Sem título';
        if (entry.contentType === 'post') {
          title = `Post: ${entry.platform} - ${entry.content?.substring(0, 20)}...`;
        } else if (entry.platform === 'Calendar') {
          title = entry.content || 'Evento';
        }

        return {
          id: entry.id,
          title: title,
          date: date,
          time: time,
          type: type,
          platform: entry.platform
        };
      });

      setEvents(mappedEvents);
    } catch (e) {
      console.error('Failed to load schedule', e);
      addToast({ type: 'error', message: 'Erro ao carregar agenda.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationsEnabled(permission === 'granted');
      });
    } else {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, [userId]);

  // Check for events to notify every minute
  useEffect(() => {
    if (!notificationsEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      events.forEach(event => {
        if (!event.notified && event.date === currentDate && event.time === currentTime) {
          // Show notification
          new Notification('📅 Lembrete de Evento - VitrineX', {
            body: `${event.title}\nAgora: ${event.time}`,
            icon: '/icon.svg',
            tag: event.id,
          });

          // Mark as notified (in local state only for now)
          setEvents(prev => prev.map(e => e.id === event.id ? { ...e, notified: true } : e));
          addToast({ type: 'info', message: `Lembrete: ${event.title}` });
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [events, notificationsEnabled, addToast]);

  const handleAddEvent = async () => {
    if (!newTitle || !newDate || !newTime) {
      addToast({ type: 'warning', message: 'Preencha todos os campos.' });
      return;
    }

    try {
      const newEntry: ScheduleEntry = {
        id: Date.now().toString(),
        userId: userId,
        datetime: `${newDate}T${newTime}:00`,
        platform: 'Calendar', // Mark as internal calendar event
        contentId: '',
        contentType: 'text',
        content: newTitle,
        status: 'scheduled'
      };

      await saveScheduleEntry(newEntry);
      await loadEvents(); // Reload to refresh list

      setNewTitle('');
      setNewDate('');
      setNewTime('');
      addToast({ type: 'success', message: 'Evento adicionado!' });
    } catch (e) {
      addToast({ type: 'error', message: 'Erro ao salvar evento.' });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteScheduleEntry(id);
      setEvents(events.filter(e => e.id !== id));
      addToast({ type: 'info', message: 'Evento removido.' });
    } catch (e) {
      addToast({ type: 'error', message: 'Erro ao remover evento.' });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-xl">
            <CalendarDaysIcon className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-title">Gerenciador de Calendário</h1>
            <p className="text-muted">Visão unificada de posts, campanhas e tarefas.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={loadEvents} variant="ghost" size="sm">
            <ArrowPathIcon className="w-4 h-4 mr-1" /> Atualizar
          </Button>
          {notificationsEnabled && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <BellIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Ativo
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface p-8 rounded-xl shadow-card border border-border">
        <h3 className="text-xl font-semibold text-title mb-6">Adicionar Lembrete / Tarefa</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
            <Input
              id="event-title"
              label="Título"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex: Reunião com Fornecedor"
            />
          </div>
          <Input
            id="event-date"
            label="Data"
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <Input
            id="event-time"
            label="Horário"
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
          />
        </div>
        <Button onClick={handleAddEvent} variant="primary">
          <PlusIcon className="w-4 h-4 mr-2" />
          Adicionar ao Calendário
        </Button>
      </div>

      <div className="bg-surface p-8 rounded-xl shadow-card border border-border">
        <h3 className="text-xl font-semibold text-title mb-6 flex items-center gap-2">
          Agenda Completa
          <span className="text-sm font-normal text-muted ml-2">({events.length} itens)</span>
        </h3>

        {isLoading ? (
          <div className="py-8 text-center text-muted">Carregando agenda...</div>
        ) : events.length === 0 ? (
          <p className="text-muted text-center py-8">Nenhum evento agendado ainda.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className={`flex items-center justify-between p-4 rounded-lg border border-border transition-shadow hover:shadow-md 
                    ${event.platform === 'Calendar' ? 'bg-background' : 'bg-primary/5 dark:bg-primary/5 border-primary/20'}`}
              >
                <div className="flex items-start gap-4">
                  {/* Date Box */}
                  <div className="flex flex-col items-center bg-surface border border-border rounded-lg p-2 min-w-[60px]">
                    <span className="text-xs text-muted uppercase font-bold">
                      {new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold text-title">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {event.time}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded capitalize 
                                ${event.platform === 'Calendar' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {event.platform === 'Calendar' ? 'Tarefa' : event.platform}
                      </span>
                    </div>
                    <h4 className="font-semibold text-title">{event.title}</h4>
                  </div>
                </div>

                <Button
                  onClick={() => handleDeleteEvent(event.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Remover"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
        <p className="text-sm text-blue-600 dark:text-blue-300">
          <strong>Dica:</strong> Esta agenda integra automaticamente os posts agendados no
          <span className="font-semibold cursor-pointer hover:underline mx-1" onClick={() => navigateTo('SmartScheduler')}>Smart Scheduler</span>
          e no
          <span className="font-semibold cursor-pointer hover:underline mx-1" onClick={() => navigateTo('TrendHunter')}>Trend Hunter</span>.
        </p>
      </div>
    </div>
  );
};

export default CalendarManager;
