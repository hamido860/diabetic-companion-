import React, { useState, useEffect, useMemo } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { GlucoseLog, GlucoseStatus, WeightLog } from '../types';
import { getGlucoseLogs, getWeightLogs, deleteGlucoseLog, deleteWeightLog } from '../services/logService';
import { CalendarDaysIcon, ChartLineIcon, ChartScatterIcon, TrashIcon, WeightScaleIcon } from './icons/Icons';
import { getStatusStyles } from '../utils';
import {
    LineChart,
    Line,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

type FilterOption = 'week' | 'month' | 'all';
type LogType = 'glucose' | 'weight';
type ChartType = 'line' | 'scatter';

const Logs: React.FC = () => {
    const { t } = useLocalization();
    const [glucoseLogs, setGlucoseLogs] = useState<GlucoseLog[]>([]);
    const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
    const [activeFilter, setActiveFilter] = useState<FilterOption>('week');
    const [activeLogType, setActiveLogType] = useState<LogType>('glucose');
    const [chartType, setChartType] = useState<ChartType>('line');
    const [logToDelete, setLogToDelete] = useState<{ type: LogType; log: GlucoseLog | WeightLog } | null>(null);

    useEffect(() => {
        setGlucoseLogs(getGlucoseLogs());
        setWeightLogs(getWeightLogs());
    }, []);

    const handleDeleteRequest = (type: LogType, log: GlucoseLog | WeightLog) => {
        setLogToDelete({ type, log });
    };

    const handleConfirmDelete = () => {
        if (!logToDelete) return;
        
        if (logToDelete.type === 'glucose') {
            deleteGlucoseLog(logToDelete.log.id);
            setGlucoseLogs(prevLogs => prevLogs.filter(l => l.id !== logToDelete.log.id));
        } else if (logToDelete.type === 'weight') {
            deleteWeightLog(logToDelete.log.id);
            setWeightLogs(prevLogs => prevLogs.filter(l => l.id !== logToDelete.log.id));
        }

        setLogToDelete(null);
    };

    const filteredGlucoseLogs = useMemo(() => {
        const now = new Date();
        if (activeFilter === 'all') {
            return glucoseLogs;
        }
        const daysToFilter = activeFilter === 'week' ? 7 : 30;
        
        const filterDateLimit = new Date(now.getTime());
        filterDateLimit.setDate(filterDateLimit.getDate() - daysToFilter);
        
        return glucoseLogs.filter(log => new Date(log.timestamp) >= filterDateLimit);
    }, [glucoseLogs, activeFilter]);

    const chartData = useMemo(() => {
        return filteredGlucoseLogs
            .map(log => ({
                ...log,
                time: new Date(log.timestamp).getTime(),
            }))
            .reverse(); // reverse to show oldest to newest
    }, [filteredGlucoseLogs]);

    const filteredWeightLogs = useMemo(() => {
        const now = new Date();
        if (activeFilter === 'all') {
            return weightLogs;
        }
        const daysToFilter = activeFilter === 'week' ? 7 : 30;
        
        const filterDateLimit = new Date(now.getTime());
        filterDateLimit.setDate(filterDateLimit.getDate() - daysToFilter);
        
        return weightLogs.filter(log => new Date(log.timestamp) >= filterDateLimit);
    }, [weightLogs, activeFilter]);
    
    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const formatChartXAxis = (tickItem: number) => {
        const date = new Date(tickItem);
        if (activeFilter === 'week') {
            return date.toLocaleTimeString([], { weekday: 'short', hour: '2-digit' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const filterOptions: { key: FilterOption; label: string }[] = [
        { key: 'week', label: 'Last 7 days' },
        { key: 'month', label: 'Last 30 days' },
        { key: 'all', label: 'All time' },
    ];

    const EmptyState = ({type}: {type?: LogType}) => (
        <div className="text-center py-12 bg-brand-olive rounded-3xl shadow-lg shadow-black/20">
            <CalendarDaysIcon className="w-12 h-12 mx-auto text-brand-beige/30 mb-3" />
            <h3 className="text-lg font-semibold text-brand-beige">{t('noReadingsFound')}</h3>
            <p className="text-sm text-brand-beige/60">
                {type === 'weight' ? t('noWeightLogsDescription') : t('noGlucoseLogsDescription')}
            </p>
        </div>
    );

    const GlucoseChart = () => (
        <div className="bg-brand-olive p-4 rounded-3xl shadow-lg shadow-black/20 mb-4">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-brand-offwhite">{t('glucoseTrend')}</h3>
                 <div className="bg-brand-dark p-1 rounded-lg flex items-center gap-1">
                    <button
                        onClick={() => setChartType('line')}
                        className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                            chartType === 'line' ? 'bg-brand-olive text-brand-yellow shadow' : 'text-brand-beige/60'
                        }`}
                        aria-label={t('lineChart')}
                    >
                       <ChartLineIcon className="w-4 h-4" /> {t('lineChart')}
                    </button>
                    <button
                        onClick={() => setChartType('scatter')}
                        className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                            chartType === 'scatter' ? 'bg-brand-olive text-brand-yellow shadow' : 'text-brand-beige/60'
                        }`}
                        aria-label={t('scatterChart')}
                    >
                        <ChartScatterIcon className="w-4 h-4" /> {t('scatterChart')}
                    </button>
                 </div>
            </div>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    {chartType === 'line' ? (
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
                            <XAxis
                                dataKey="time"
                                type="number"
                                domain={['dataMin', 'dataMax']}
                                tickFormatter={formatChartXAxis}
                                tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.8 }}
                                stroke="currentColor"
                                strokeOpacity={0.3}
                            />
                            <YAxis
                                domain={['dataMin - 20', 'dataMax + 20']}
                                tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.8 }}
                                stroke="currentColor"
                                strokeOpacity={0.3}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#3C312B',
                                    borderColor: 'rgba(247, 178, 44, 0.5)',
                                    borderRadius: '0.75rem',
                                    color: '#D7C3A5',
                                }}
                                labelFormatter={(label) => new Date(label).toLocaleString()}
                                formatter={(value: number) => [`${value} mg/dL`, t('glucose')]}
                            />
                            <Line type="monotone" dataKey="value" name={t('glucose')} stroke="#F7B22C" strokeWidth={2} dot={{ r: 4, fill: '#F7B22C' }} activeDot={{ r: 8 }} />
                        </LineChart>
                    ) : (
                        <ScatterChart margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
                            <XAxis
                                dataKey="time"
                                type="number"
                                domain={['dataMin', 'dataMax']}
                                tickFormatter={formatChartXAxis}
                                tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.8 }}
                                stroke="currentColor"
                                strokeOpacity={0.3}
                            />
                            <YAxis
                                dataKey="value"
                                domain={['dataMin - 20', 'dataMax + 20']}
                                tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.8 }}
                                stroke="currentColor"
                                strokeOpacity={0.3}
                                allowDecimals={false}
                            />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                contentStyle={{
                                    backgroundColor: '#3C312B',
                                    borderColor: 'rgba(247, 178, 44, 0.5)',
                                    borderRadius: '0.75rem',
                                    color: '#D7C3A5',
                                }}
                                labelFormatter={(label) => new Date(label).toLocaleString()}
                                formatter={(value: number, name: string, props: any) => [`${props.payload.value} mg/dL`, t('glucose')]}
                            />
                            <Scatter name={t('glucose')} data={chartData} fill="#F7B22C" />
                        </ScatterChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
    
    const DeleteConfirmationModal = () => {
        if (!logToDelete) return null;

        const isGlucose = logToDelete.type === 'glucose';
        const log = logToDelete.log;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4 animate-fadeInUp" aria-modal="true" role="dialog">
                <div className="bg-brand-olive rounded-3xl shadow-xl w-full max-w-sm p-6 space-y-4 text-center animate-scaleIn">
                    <h3 className="text-xl font-bold text-brand-offwhite">{t('deleteLogTitle')}</h3>
                    
                    <p className="text-sm text-brand-beige/80">{t('deleteLogMessage')}</p>

                    <div className="bg-brand-dark/50 p-4 rounded-xl w-full text-left">
                        {isGlucose ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xl font-bold text-brand-offwhite">
                                        {(log as GlucoseLog).value} <span className="text-sm font-normal text-brand-beige/80">mg/dL</span>
                                    </p>
                                    <p className="text-xs text-brand-beige/60 mt-1">{formatDate(log.timestamp).split(',').slice(0, 2).join(', ')}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyles((log as GlucoseLog).status)}`}>
                                    {t((log as GlucoseLog).status.charAt(0).toLowerCase() + (log as GlucoseLog).status.slice(1).replace(' ', '') as any)}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <WeightScaleIcon className="w-6 h-6 text-brand-beige/60" />
                                <div>
                                    <p className="text-xl font-bold text-brand-offwhite">
                                        {(log as WeightLog).value} <span className="text-sm font-normal text-brand-beige/80">{(log as WeightLog).unit}</span>
                                    </p>
                                    <p className="text-xs text-brand-beige/60 mt-1">{formatDate(log.timestamp).split(',').slice(0, 2).join(', ')}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3">
                        <button
                            onClick={() => setLogToDelete(null)}
                            className="w-full bg-brand-dark text-brand-beige font-semibold py-3 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            {t('delete')}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {logToDelete && <DeleteConfirmationModal />}
            <header>
                <h1 className="text-4xl font-bold text-brand-offwhite">{t('logHistory')}</h1>
                <p className="text-brand-beige/80 text-md">
                    {activeLogType === 'glucose' ? t('reviewGlucose') : t('reviewWeight')}
                </p>
            </header>

            <div className="bg-brand-olive p-2 rounded-xl shadow-lg shadow-black/20 flex items-center justify-center gap-2">
                <button
                    onClick={() => setActiveLogType('glucose')}
                    className={`w-full text-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        activeLogType === 'glucose'
                            ? 'bg-brand-yellow text-brand-dark shadow'
                            : 'text-brand-beige hover:bg-brand-dark/50'
                    }`}
                >
                    {t('glucose')}
                </button>
                <button
                    onClick={() => setActiveLogType('weight')}
                    className={`w-full text-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        activeLogType === 'weight'
                             ? 'bg-brand-yellow text-brand-dark shadow'
                            : 'text-brand-beige hover:bg-brand-dark/50'
                    }`}
                >
                    {t('weight')}
                </button>
            </div>

            <div className="bg-brand-olive p-2 rounded-xl shadow-lg shadow-black/20 flex items-center justify-center gap-2">
                {filterOptions.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setActiveFilter(key)}
                        className={`w-full text-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            activeFilter === key
                                ? 'bg-brand-yellow text-brand-dark shadow'
                                : 'text-brand-beige hover:bg-brand-dark/50'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
            
            {activeLogType === 'glucose' && chartData.length > 0 && <GlucoseChart />}

            <div className="space-y-3">
                {activeLogType === 'glucose' && (
                    <>
                        {filteredGlucoseLogs.length > 0 ? (
                            filteredGlucoseLogs.map(log => (
                                <div key={log.id} className="bg-brand-olive p-4 rounded-xl shadow-lg shadow-black/20 flex items-center justify-between animate-fadeInUp">
                                    <div>
                                        <p className="text-2xl font-bold text-brand-offwhite">
                                            {log.value} <span className="text-base font-normal text-brand-beige/80">mg/dL</span>
                                        </p>
                                        <p className="text-xs text-brand-beige/60 mt-1">{formatDate(log.timestamp)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyles(log.status)}`}>
                                            {t(log.status.charAt(0).toLowerCase() + log.status.slice(1).replace(' ', '') as any)}
                                        </span>
                                        <button 
                                            onClick={() => handleDeleteRequest('glucose', log)}
                                            className="p-2 text-brand-beige/60 rounded-full hover:bg-brand-dark hover:text-red-500 transition-colors"
                                            aria-label={`Delete glucose log of ${log.value}`}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                           <EmptyState type="glucose" />
                        )}
                    </>
                )}
                {activeLogType === 'weight' && (
                     <>
                        {filteredWeightLogs.length > 0 ? (
                            filteredWeightLogs.map(log => (
                                <div key={log.id} className="bg-brand-olive p-4 rounded-xl shadow-lg shadow-black/20 flex items-center justify-between animate-fadeInUp">
                                    <div className="flex items-center gap-4">
                                        <WeightScaleIcon className="w-6 h-6 text-brand-beige/60" />
                                        <div>
                                            <p className="text-2xl font-bold text-brand-offwhite">
                                                {log.value} <span className="text-base font-normal text-brand-beige/80">{log.unit}</span>
                                            </p>
                                            <p className="text-xs text-brand-beige/60 mt-1">{formatDate(log.timestamp)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteRequest('weight', log)}
                                        className="p-2 text-brand-beige/60 rounded-full hover:bg-brand-dark hover:text-red-500 transition-colors"
                                        aria-label={`Delete weight log of ${log.value}`}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        ) : (
                           <EmptyState type="weight" />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Logs;