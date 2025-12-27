import React from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

interface RadarChartProps {
    label1: string;
    data1: number[]; // [Volume, Search, Competition, Social, Potencial]
    label2?: string;
    data2?: number[];
    className?: string;
}

const RadarChart: React.FC<RadarChartProps> = ({ label1, data1, label2, data2, className }) => {

    const chartData: ChartData<'radar'> = {
        labels: ['Volume de Busca', 'Crescimento', 'Competição', 'Engajamento Social', 'Potencial Viral'],
        datasets: [
            {
                label: label1,
                data: data1,
                backgroundColor: 'rgba(59, 130, 246, 0.2)', // Blue-500 equivalent
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
            },
            ...(data2 ? [{
                label: label2 || 'Comparação',
                data: data2,
                backgroundColor: 'rgba(168, 85, 247, 0.2)', // Purple-500 equivalent
                borderColor: 'rgba(168, 85, 247, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(168, 85, 247, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(168, 85, 247, 1)',
            }] : [])
        ],
    };

    const options: ChartOptions<'radar'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                pointLabels: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: {
                        size: 11,
                        family: "'Inter', sans-serif"
                    }
                },
                ticks: {
                    display: false, // Hide numeric ticks for cleaner look
                    backdropColor: 'transparent',
                },
                suggestedMin: 0,
                suggestedMax: 100,
            },
        },
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    font: {
                        family: "'Inter', sans-serif"
                    },
                    usePointStyle: true,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
            }
        },
    };

    return (
        <div className={`w-full h-full min-h-[300px] ${className}`}>
            <Radar data={chartData} options={options} />
        </div>
    );
};

export default RadarChart;
