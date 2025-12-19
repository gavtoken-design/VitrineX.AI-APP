import * as React from 'react';
import { useState, useEffect } from 'react';
import { CalendarDaysIcon, PlusIcon, TrashIcon, BellIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../contexts/ToastContext';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'post' | 'meeting' | 'task';
  notified?: boolean;
}

const STORAGE_KEY = 'vitrinex_calendar_events';

const CalendarManager: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { addToast } = useToast();

  // Load events from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setEvents(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load events', e);
      }
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationsEnabled(permission === 'granted');
      });
    } else {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }
  }, [events]);

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

          // Mark as notified
          setEvents(prev => prev.map(e => e.id === event.id ? { ...e, notified: true } : e));

          // Show toast
          addToast({ type: 'info', message: `Lembrete: ${event.title}` });
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [events, notificationsEnabled, addToast]);

  const handleAddEvent = () => {
    if (!newTitle || !newDate || !newTime) {
      addToast({ type: 'warning', message: 'Preencha todos os campos.' });
      return;
    }

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: newTitle,
      date: newDate,
      time: newTime,
      type: 'task',
    };

    setEvents([...events, newEvent]);
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    addToast({ type: 'success', message: 'Evento adicionado!' });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    addToast({ type: 'info', message: 'Evento removido.' });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-xl">
            <CalendarDaysIcon className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-title">Gerenciador de Calendário</h1>
            <p className="text-muted">Organize seus eventos, posts e reuniões.</p>
          </div>
        </div>
        {notificationsEnabled && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <BellIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Notificações ativas
            </span>
          </div>
        )}
      </div>

      <div className="bg-surface p-8 rounded-xl shadow-card border border-border">
        <h3 className="text-xl font-semibold text-title mb-6">Adicionar Novo Evento</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            id="event-title"
            label="Título do Evento"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Ex: Post para Instagram"
          />
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
          Adicionar Evento
        </Button>
      </div>

      <div className="bg-surface p-8 rounded-xl shadow-card border border-border">
        <h3 className="text-xl font-semibold text-title mb-6">Eventos Agendados</h3>
        {events.length === 0 ? (
          <p className="text-muted text-center py-8">Nenhum evento agendado ainda.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-title">{event.title}</h4>
                  <p className="text-sm text-muted">
                    {new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}
                  </p>
                </div>
                <Button
                  onClick={() => handleDeleteEvent(event.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
};

export default CalendarManager;
