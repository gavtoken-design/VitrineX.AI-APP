
import React from 'react';
import { GoogleDriveConnect } from '../../components/features/GoogleDriveConnect';

const IntegrationsSection: React.FC = () => {
    return (
        <section id="integrations-section" className="space-y-6">
            <GoogleDriveConnect />
        </section>
    );
};

export default IntegrationsSection;
