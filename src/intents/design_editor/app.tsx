import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { AppUiProvider, Button, Box, Text, FormField, TextInput, Rows } from "@canva/app-ui-kit";
import "@canva/app-ui-kit/styles.css";
import { DEFAULT_BRAND_DATA, BrandData } from "../../services/businessLogic";

const DesignEditorApp: React.FC = () => {
    const [brandData, setBrandData] = React.useState<BrandData>(DEFAULT_BRAND_DATA);

    const handleSave = () => {
        // This call would eventually go to VitrineX backend
        console.log("Saving brand data via VitrineX API:", brandData);
    };

    return (
        <AppUiProvider>
            <Box padding="2u">
                <Rows spacing="2u">
                    <Text variant="bold">VitrineX AI - Perfil da Marca</Text>
                    <Text variant="regular">Mantenha os dados da sua marca atualizados para gerações inteligentes no Canva.</Text>

                    <FormField label="Nome da Empresa" control={(props) => (
                        <TextInput
                            {...props}
                            value={brandData.name}
                            onChange={(val: string) => setBrandData({ ...brandData, name: val })}
                            placeholder="Ex: VitrineX Store"
                        />
                    )} />

                    <FormField label="Indústria / Nicho" control={(props) => (
                        <TextInput
                            {...props}
                            value={brandData.industry}
                            onChange={(val: string) => setBrandData({ ...brandData, industry: val })}
                            placeholder="Ex: E-commerce de Tecnologia"
                        />
                    )} />

                    <Button variant="primary" onClick={handleSave}>
                        Salvar Preferências
                    </Button>
                </Rows>
            </Box>
        </AppUiProvider>
    );
};

export const designEditor = {
    render: async () => {
        const rootElement = document.getElementById('root');
        if (rootElement) {
            const root = ReactDOM.createRoot(rootElement);
            root.render(
                <React.StrictMode>
                    <DesignEditorApp />
                </React.StrictMode>
            );
        }
    },
};
