
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getLibraryItems, getScheduleEntries, saveScheduleEntry, deleteScheduleEntry } from '../services/core/db';
import { ScheduleEntry, LibraryItem } from '../types';
import { PlusIcon, TrashIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useToast } from '../contexts/ToastContext';

const SmartScheduler: React.FC = () => {
  const [scheduledItems, setScheduledItems] = useState<ScheduleEntry[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newSchedulePlatform, setNewSchedulePlatform] = useState<string>('');
  const [newScheduleDate, setNewScheduleDate] = useState<string>('');
  const [newScheduleTime, setNewScheduleTime] = useState<string>('');
  const [newScheduleContentId, setNewScheduleContentId] = useState<string>('');
  const [newScheduleContentType, setNewScheduleContentType] = useState<ScheduleEntry['contentType']>('post');
  const [scheduling, setScheduling] = useState<boolean>(false);

  const userId = 'mock-user-123';
  const { addToast } = useToast();

  const fetchSchedulerData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedSchedule = await getScheduleEntries(userId);
      const fetchedLibrary = await getLibraryItems(userId);
      setScheduledItems(fetchedSchedule.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()));
      setLibraryItems(fetchedLibrary);

      if (fetchedLibrary.length > 0 && !newScheduleContentId) {
        setNewScheduleContentId(fetchedLibrary[0].id);
        setNewScheduleContentType(fetchedLibrary[0].type);
      }
    } catch (err) {
      const errorMessage = `Falha ao carregar dados do agendador: ${err instanceof Error ? err.message : String(err)}`;
      setError(errorMessage);
      addToast({ type: 'error', title: 'Erro de Carregamento', message: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [userId, newScheduleContentId, addToast]);

  useEffect(() => {
    fetchSchedulerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScheduleContent = useCallback(async () => {
    if (!newSchedulePlatform || !newScheduleDate || !newScheduleTime || !newScheduleContentId) {
      addToast({ type: 'warning', message: 'Por favor, preencha todos os campos para agendar.' });
      return;
    }

    setScheduling(true);
    setError(null);

    try {
      const combinedDateTime = `${newScheduleDate}T${newScheduleTime}:00`;
      const newEntry: ScheduleEntry = {
        id: `schedule-${Date.now()}`,
        userId: userId,
        datetime: new Date(combinedDateTime).toISOString(),
        platform: newSchedulePlatform,
        contentId: newScheduleContentId,
        contentType: newScheduleContentType,
        status: 'scheduled',
      };
      const savedEntry = await saveScheduleEntry(newEntry);
      setScheduledItems((prev) => [...prev, savedEntry].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()));

      setNewSchedulePlatform('');
      setNewScheduleDate('');
      setNewScheduleTime('');
      addToast({ type: 'success', message: 'Conteúdo agendado com sucesso!' });
    } catch (err) {
      const errorMessage = `Falha ao agendar conteúdo: ${err instanceof Error ? err.message : String(err)}`;
      setError(errorMessage);
      addToast({ type: 'error', title: 'Erro', message: errorMessage });
    } finally {
      setScheduling(false);
    }
  }, [newSchedulePlatform, newScheduleDate, newScheduleTime, newScheduleContentId, newScheduleContentType, userId, addToast]);

  const handleDeleteSchedule = useCallback(async (entryId: string) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      setError(null);
      try {
        await deleteScheduleEntry(entryId);
        setScheduledItems((prev) => prev.filter((entry) => entry.id !== entryId));
        addToast({ type: 'success', message: 'Agendamento cancelado.' });
      } catch (err) {
        const errorMessage = `Falha ao cancelar agendamento: ${err instanceof Error ? err.message : String(err)}`;
        setError(errorMessage);
        addToast({ type: 'error', title: 'Erro', message: errorMessage });
      }
    }
  }, [addToast]);

  const getItemDetails = useCallback((contentId: string) => {
    return libraryItems.find(item => item.id === contentId);
  }, [libraryItems]);

  const getStatusIcon = (status: ScheduleEntry['status']) => {
    switch (status) {
      case 'published':
        return <CheckCircleIcon className="w-5 h-5 text-accent" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'scheduled':
      default:
        return <ClockIcon className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="container mx-auto py-8 lg:py-10">
      <h2 className="text-3xl font-bold text-textdark mb-8">Agendador Inteligente (Autopost)</h2>

      {error && (
        <div className="bg-red-900 border border-red-600 text-red-300 px-4 py-3 rounded relative mb-8" role="alert">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800 mb-8">
        <h3 className="text-xl font-semibold text-textlight mb-5">Agendar Nova Publicação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contentSelect" className="block text-sm font-medium text-textlight mb-1">
              Conteúdo para Publicar:
            </label>
            <select
              id="contentSelect"
              value={newScheduleContentId}
              onChange={(e) => {
                setNewScheduleContentId(e.target.value);
                const selectedItem = libraryItems.find(item => item.id === e.target.value);
                if (selectedItem) {
                  setNewScheduleContentType(selectedItem.type);
                }
              }}
              className="block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-neonGreen focus:border-neonGreen focus:ring-offset-2 focus:ring-offset-lightbg sm:text-sm mb-2"
            >
              <option value="">Selecione um item da Biblioteca</option>
              {libraryItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.type})
                </option>
              ))}
            </select>
            {newScheduleContentId && getItemDetails(newScheduleContentId)?.thumbnail_url && (
              <img
                src={getItemDetails(newScheduleContentId)?.thumbnail_url || 'https://picsum.photos/100/100'}
                alt="Selected content thumbnail"
                className="w-24 h-24 object-cover rounded-md mt-2 border border-gray-700"
              />
            )}
          </div>
          <div>
            <label htmlFor="platformSelect" className="block text-sm font-medium text-textlight mb-1">
              Plataforma:
            </label>
            <select
              id="platformSelect"
              value={newSchedulePlatform}
              onChange={(e) => setNewSchedulePlatform(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-neonGreen focus:border-neonGreen focus:ring-offset-2 focus:ring-offset-lightbg sm:text-sm"
            >
              <option value="">Selecione uma plataforma</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="TikTok">TikTok</option>
              <option value="Pinterest">Pinterest</option>
              <option value="GoogleMyBusiness">Google My Business</option>
            </select>
          </div>
          <Input
            id="scheduleDate"
            label="Data:"
            type="date"
            value={newScheduleDate}
            onChange={(e) => setNewScheduleDate(e.target.value)}
          />
          <Input
            id="scheduleTime"
            label="Hora:"
            type="time"
            value={newScheduleTime}
            onChange={(e) => setNewScheduleTime(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            onClick={handleScheduleContent}
            isLoading={scheduling}
            variant="primary"
            className="w-full md:w-auto"
            disabled={!newScheduleContentId || !newSchedulePlatform || !newScheduleDate || !newScheduleTime}
          >
            {scheduling ? 'Agendando...' : 'Agendar'}
          </Button>
          <Button
            onClick={() => {
              if (!newSchedulePlatform || !newScheduleContentId) {
                addToast({ type: 'warning', message: 'Selecione conteúdo e plataforma para publicar.' });
                return;
              }
              const now = new Date();
              // Create entry with current time and status 'published'
              const newEntry: ScheduleEntry = {
                id: `schedule-${Date.now()}`,
                userId: userId,
                datetime: now.toISOString(),
                platform: newSchedulePlatform,
                contentId: newScheduleContentId,
                contentType: newScheduleContentType,
                status: 'published',
              };

              saveScheduleEntry(newEntry).then((saved) => {
                setScheduledItems((prev) => [...prev, saved].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()));
                addToast({ type: 'success', message: 'Conteúdo publicado com sucesso!' });
                // Reset form
                setNewSchedulePlatform('');
                setNewScheduleDate('');
                setNewScheduleTime('');
              }).catch(err => {
                addToast({ type: 'error', message: 'Erro ao publicar.' });
                console.error(err);
              });
            }}
            variant="secondary"
            className="w-full md:w-auto"
            disabled={!newScheduleContentId || !newSchedulePlatform}
          >
            Publicar Agora
          </Button>
        </div>
      </div>

      <div className="bg-lightbg p-6 rounded-lg shadow-sm border border-gray-800">
        <h3 className="text-xl font-semibold text-textlight mb-5">Próximos Agendamentos e Histórico</h3>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner />
            <p className="ml-2 text-textlight">Carregando agendamentos...</p>
          </div>
        ) : scheduledItems.length === 0 ? (
          <div className="text-center text-textlight p-4">Nenhum agendamento encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-darkbg">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textmuted uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textmuted uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textmuted uppercase tracking-wider">
                    Conteúdo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textmuted uppercase tracking-wider">
                    Plataforma
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textmuted uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-lightbg divide-y divide-gray-700">
                {scheduledItems.map((entry) => {
                  const item = getItemDetails(entry.contentId);
                  const dateTime = new Date(entry.datetime);
                  const isPast = dateTime < new Date();
                  return (
                    <tr key={entry.id} className={isPast ? 'bg-darkbg text-textmuted' : 'text-textlight'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center">
                          {getStatusIcon(entry.status)}
                          <span className="ml-2 capitalize">{entry.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {dateTime.toLocaleDateString()} {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item ? item.name : 'Conteúdo não encontrado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {entry.platform}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!isPast && (
                          <Button
                            onClick={() => handleDeleteSchedule(entry.id)}
                            variant="danger"
                            size="sm"
                            className="mr-2"
                          >
                            <TrashIcon className="w-4 h-4 text-red-300" /> Cancelar
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartScheduler;
