export interface Influencer {
    name: string;
    role: string;
    trend: 'High' | 'Medium' | 'Rising';
}

export const LOCAL_INFLUENCERS: Record<string, Influencer[]> = {
    'BR': [
        { name: 'Anitta', role: 'Música / Global Ent.', trend: 'High' },
        { name: 'Casimiro', role: 'Streaming / Esportes', trend: 'High' },
        { name: 'Virgínia Fonseca', role: 'Lifestyle / Business', trend: 'High' },
        { name: 'Pablo Marçal', role: 'Política / Digital', trend: 'Medium' }
    ],
    'BR-SP': [
        { name: 'Tarcísio de Freitas', role: 'Governador', trend: 'High' },
        { name: 'Guilherme Boulos', role: 'Política', trend: 'Medium' },
        { name: 'Bianca Andrade', role: 'Business / Beauty', trend: 'High' }
    ],
    'Sao Paulo, SP': [
        { name: 'Ricardo Nunes', role: 'Prefeito', trend: 'High' },
        { name: 'Chef Erick Jacquin', role: 'Gastronomia', trend: 'Medium' },
        { name: 'Enaldinho', role: 'YouTube', trend: 'Rising' }
    ],
    'BR-RJ': [
        { name: 'Cláudio Castro', role: 'Governador', trend: 'Medium' },
        { name: 'Ludmilla', role: 'Música', trend: 'High' },
        { name: 'Felipe Neto', role: 'Digital / Opinião', trend: 'High' }
    ],
    'Rio de Janeiro, RJ': [
        { name: 'Eduardo Paes', role: 'Prefeito', trend: 'High' },
        { name: 'Anitta', role: 'Música', trend: 'High' },
        { name: 'Pedro Scooby', role: 'Surf / Lifestyle', trend: 'Medium' }
    ]
};

export const getTopInfluencers = (locationId: string): Influencer[] => {
    return LOCAL_INFLUENCERS[locationId] || LOCAL_INFLUENCERS['BR'];
};
