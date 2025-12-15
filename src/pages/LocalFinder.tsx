import * as React from 'react';
import { useState } from 'react';
import { MapPinIcon, MagnifyingGlassIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../contexts/ToastContext';

interface LocalPlace {
  id: string;
  name: string;
  address: string;
  category: string;
  distance: string;
}

const LocalFinder: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<LocalPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { addToast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      addToast({ type: 'warning', message: 'Digite algo para buscar.' });
      return;
    }

    setIsSearching(true);

    // Simulando busca local
    setTimeout(() => {
      const mockPlaces: LocalPlace[] = [
        {
          id: '1',
          name: 'Café Aconchego',
          address: 'Rua das Flores, 123 - Centro',
          category: 'Cafeteria',
          distance: '500m',
        },
        {
          id: '2',
          name: 'Restaurante Sabor Local',
          address: 'Av. Principal, 456 - Bairro Novo',
          category: 'Restaurante',
          distance: '1.2km',
        },
        {
          id: '3',
          name: 'Livraria Páginas',
          address: 'Praça Central, 789',
          category: 'Livraria',
          distance: '800m',
        },
      ];

      setPlaces(mockPlaces);
      setIsSearching(false);
      addToast({ type: 'success', message: `Encontrados ${mockPlaces.length} lugares próximos.` });
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 pb-6 border-b border-border">
        <div className="p-3 bg-orange-500/10 rounded-xl">
          <MapPinIcon className="w-8 h-8 text-orange-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-title">Buscador Local</h1>
          <p className="text-muted">Encontre lugares, negócios e serviços na sua região.</p>
        </div>
      </div>

      <div className="bg-surface p-8 rounded-xl shadow-card border border-border">
        <h3 className="text-xl font-semibold text-title mb-6">Buscar Lugares Próximos</h3>
        <div className="flex gap-3">
          <Input
            id="search-query"
            label=""
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ex: cafeteria, restaurante, farmácia..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} isLoading={isSearching} variant="primary">
            <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
            Buscar
          </Button>
        </div>
      </div>

      {places.length > 0 && (
        <div className="bg-surface p-8 rounded-xl shadow-card border border-border">
          <h3 className="text-xl font-semibold text-title mb-6">Resultados Encontrados</h3>
          <div className="space-y-4">
            {places.map((place) => (
              <div
                key={place.id}
                className="flex items-start gap-4 p-5 bg-background rounded-lg border border-border hover:shadow-md transition-shadow"
              >
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <BuildingStorefrontIcon className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-title text-lg">{place.name}</h4>
                  <p className="text-sm text-muted mb-1">{place.address}</p>
                  <div className="flex gap-3 text-xs">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded">
                      {place.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-muted rounded">
                      📍 {place.distance}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Ver no Mapa
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-muted">
          <strong>Nota:</strong> Esta é uma versão de demonstração com dados mock. Para funcionar com localizações
          reais, é necessário integrar APIs de geolocalização (Google Maps, OpenStreetMap, etc.).
        </p>
      </div>
    </div>
  );
};

export default LocalFinder;
