// src/components/features/TargetAudienceManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { TargetAudience } from '../../types';
import { getTargetAudiences, createTargetAudience, updateTargetAudience, deleteTargetAudience } from '../../services/core/db';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import LoadingSpinner from '../ui/LoadingSpinner';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const TargetAudienceManager: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [audiences, setAudiences] = useState<TargetAudience[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [currentName, setCurrentName] = useState('');
    const [currentDescription, setCurrentDescription] = useState('');

    const fetchAudiences = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await getTargetAudiences(user.id);
            setAudiences(data);
        } catch (error: any) {
            addToast({ type: 'error', message: `Failed to fetch audiences: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    }, [user, addToast]);

    useEffect(() => {
        fetchAudiences();
    }, [fetchAudiences]);

    const handleAdd = async () => {
        if (!user || !currentName.trim()) return;
        try {
            const newAudience = await createTargetAudience({
                user_id: user.id,
                name: currentName,
                description: currentDescription,
            });
            setAudiences([newAudience, ...audiences]);
            setCurrentName('');
            setCurrentDescription('');
            addToast({ type: 'success', message: 'Audience added!' });
        } catch (error: any) {
            addToast({ type: 'error', message: `Failed to add audience: ${error.message}` });
        }
    };

    const handleUpdate = async (id: string) => {
        if (!user || !currentName.trim()) return;
        try {
            const updatedAudience = await updateTargetAudience(id, {
                name: currentName,
                description: currentDescription,
            });
            setAudiences(audiences.map(a => a.id === id ? updatedAudience : a));
            setIsEditing(null);
            setCurrentName('');
            setCurrentDescription('');
            addToast({ type: 'success', message: 'Audience updated!' });
        } catch (error: any) {
            addToast({ type: 'error', message: `Failed to update audience: ${error.message}` });
        }
    };

    const handleDelete = async (id: string) => {
        if (!user) return;
        try {
            await deleteTargetAudience(id);
            setAudiences(audiences.filter(a => a.id !== id));
            addToast({ type: 'success', message: 'Audience deleted!' });
        } catch (error: any) {
            addToast({ type: 'error', message: `Failed to delete audience: ${error.message}` });
        }
    };

    const startEditing = (audience: TargetAudience) => {
        setIsEditing(audience.id);
        setCurrentName(audience.name);
        setCurrentDescription(audience.description || '');
    };

    const cancelEditing = () => {
        setIsEditing(null);
        setCurrentName('');
        setCurrentDescription('');
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-textlight">Manage Target Audiences</h3>
            <div className="bg-lightbg p-4 rounded-lg shadow-sm border border-gray-800">
                <div className="space-y-4">
                    <Input
                        id="audienceName"
                        label="Audience Name"
                        value={currentName}
                        onChange={(e) => setCurrentName(e.target.value)}
                        placeholder="e.g., Tech Enthusiasts"
                    />
                    <Textarea
                        id="audienceDescription"
                        label="Description"
                        value={currentDescription}
                        onChange={(e) => setCurrentDescription(e.target.value)}
                        rows={3}
                        placeholder="e.g., People interested in the latest gadgets and software."
                    />
                    <div className="flex justify-end gap-3">
                        {isEditing ? (
                            <>
                                <Button variant="secondary" onClick={cancelEditing}>Cancel</Button>
                                <Button onClick={() => handleUpdate(isEditing)}>Save Changes</Button>
                            </>
                        ) : (
                            <Button onClick={handleAdd} disabled={!currentName.trim()}>
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Add Audience
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {audiences.map(audience => (
                    <div key={audience.id} className="bg-surface p-4 rounded-lg border border-border flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-textlight">{audience.name}</p>
                            <p className="text-sm text-muted">{audience.description}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => startEditing(audience)}>
                                <PencilIcon className="w-5 h-5" />
                            </Button>
                            <Button variant="danger" onClick={() => handleDelete(audience.id)}>
                                <TrashIcon className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TargetAudienceManager;
