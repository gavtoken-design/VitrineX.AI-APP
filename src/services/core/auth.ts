import { UserProfile, OrganizationMembership } from '../../types';
import { getUserProfile } from './db'; // Will be moved to ../core/db
// import { getUserProfile } from './db'; // Future proofing? No, let's point to current until we move it.
// Actually, I am moving dbService to core/db.ts next. So I should point to './db'.

export const BACKEND_URL = 'http://localhost:3000';

let currentUserId: string | null = 'mock-user-123';
let currentUserProfile: UserProfile | null = null;

let currentUserOrganizations: OrganizationMembership[] = [
    {
        organization: {
            id: 'mock-org-default',
            name: 'Minha Organização',
            fileSearchStoreName: undefined
        },
        role: 'ADMIN'
    }
];

export const getAuthToken = async (): Promise<string> => {
    return 'mock-auth-token';
};

export const loginWithGoogle = async (): Promise<UserProfile> => {
    console.log('Initiating Mock Google login...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser = {
        uid: 'mock-user-123',
        email: 'demo@vitrinex.ai',
        displayName: 'Usuário Demo'
    }
    currentUserId = mockUser.uid;
    currentUserProfile = {
        id: mockUser.uid,
        email: mockUser.email,
        name: mockUser.displayName,
        plan: 'premium',
        businessProfile: {
            name: 'Minha Empresa', industry: 'Marketing Digital', targetAudience: 'Pequenas e Médias Empresas', visualStyle: 'moderno'
        },
    };
    console.log('User logged in successfully (MOCKED):', currentUserId);
    return currentUserProfile;
};

export const logout = async (): Promise<void> => {
    console.log('Logging out (MOCKED)...');
    currentUserId = null;
    currentUserProfile = null;
    console.log('User logged out.');
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
    if (currentUserId && !currentUserProfile) {
        // NOTE: getUserProfile will be in ./db when we move it, or ../dbService if not moved yet.
        // Trying dynamic import or assume I move db same time.
        try {
            const { getUserProfile } = await import('./db'); // Keep old path for now or ../core/db if I move it now.
            const profile = await getUserProfile(currentUserId);
            if (profile) {
                currentUserProfile = profile;
            }
        } catch (e) {
            console.warn("Could not load dbService", e);
        }
    }
    return currentUserProfile;
};

export const getActiveOrganization = (): OrganizationMembership | undefined => {
    return currentUserOrganizations.length > 0 ? currentUserOrganizations[0] : undefined;
};

export const getActiveOrganizationId = (): string => {
    const activeOrg: OrganizationMembership | undefined = getActiveOrganization();
    return activeOrg ? activeOrg.organization.id : 'mock-org-default';
};
