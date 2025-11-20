import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Dimensions } from 'react-native';
import { useLocalization } from '../contexts/LocalizationContext';
import { GlucoseLog, GlucoseStatus, WeightLog } from '../types';
import { getGlucoseLogs, getWeightLogs, deleteGlucoseLog, deleteWeightLog } from '../services/logService';
import { CalendarDaysIcon, ChartLineIcon, ChartScatterIcon, TrashIcon, WeightScaleIcon } from './icons/Icons';
import { LineChart, ScatterChart } from 'react-native-chart-kit';

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

    const filterOptions: { key: FilterOption; label: string }[] = [
        { key: 'week', label: 'Last 7 days' },
        { key: 'month', label: 'Last 30 days' },
        { key: 'all', label: 'All time' },
    ];

    const EmptyState = ({type}: {type?: LogType}) => (
        <View style={styles.emptyState}>
            <CalendarDaysIcon width={48} height={48} color="rgba(243, 243, 233, 0.3)" />
            <Text style={styles.emptyStateTitle}>{t('noReadingsFound')}</Text>
            <Text style={styles.emptyStateText}>
                {type === 'weight' ? t('noWeightLogsDescription') : t('noGlucoseLogsDescription')}
            </Text>
        </View>
    );

    const GlucoseChart = () => (
        <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
                 <Text style={styles.chartTitle}>{t('glucoseTrend')}</Text>
                 <View style={styles.chartTypeSelector}>
                    <TouchableOpacity
                        onPress={() => setChartType('line')}
                        style={[styles.chartTypeButton, chartType === 'line' && styles.activeChartTypeButton]}
                    >
                       <ChartLineIcon width={16} height={16} color={chartType === 'line' ? '#FFD700' : 'rgba(243, 243, 233, 0.6)'} />
                       <Text style={[styles.chartTypeButtonText, chartType === 'line' && styles.activeChartTypeButtonText]}>{t('lineChart')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setChartType('scatter')}
                        style={[styles.chartTypeButton, chartType === 'scatter' && styles.activeChartTypeButton]}
                    >
                        <ChartScatterIcon width={16} height={16} color={chartType === 'scatter' ? '#FFD700' : 'rgba(243, 243, 233, 0.6)'} />
                        <Text style={[styles.chartTypeButtonText, chartType === 'scatter' && styles.activeChartTypeButtonText]}>{t('scatterChart')}</Text>
                    </TouchableOpacity>
                 </View>
            </View>
            {chartType === 'line' ? (
                <LineChart
                    data={{
                        labels: chartData.map(d => new Date(d.time).toLocaleDateString()),
                        datasets: [{ data: chartData.map(d => d.value) }]
                    }}
                    width={Dimensions.get('window').width - 40}
                    height={220}
                    chartConfig={{
                        backgroundColor: '#6B7A4A',
                        backgroundGradientFrom: '#6B7A4A',
                        backgroundGradientTo: '#6B7A4A',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(247, 178, 44, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(243, 243, 233, ${opacity})`,
                    }}
                />
            ) : (
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: 'white' }}>Scatter chart not available in react-native-chart-kit</Text>
                </View>
            )}
        </View>
    );
    
    const DeleteConfirmationModal = () => {
        if (!logToDelete) return null;

        const isGlucose = logToDelete.type === 'glucose';
        const log = logToDelete.log;

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={!!logToDelete}
                onRequestClose={() => setLogToDelete(null)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('deleteLogTitle')}</Text>
                        <Text style={styles.modalMessage}>{t('deleteLogMessage')}</Text>
                        <View style={styles.logToDeleteContainer}>
                            {isGlucose ? (
                                <View style={styles.logToDeleteContent}>
                                    <View>
                                        <Text style={styles.logToDeleteValue}>
                                            {(log as GlucoseLog).value} <Text style={styles.logToDeleteUnit}>mg/dL</Text>
                                        </Text>
                                        <Text style={styles.logToDeleteTimestamp}>{formatDate(log.timestamp).split(',').slice(0, 2).join(', ')}</Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.logToDeleteContent}>
                                    <WeightScaleIcon width={24} height={24} color="rgba(243, 243, 233, 0.6)" />
                                    <View>
                                        <Text style={styles.logToDeleteValue}>
                                            {(log as WeightLog).value} <Text style={styles.logToDeleteUnit}>{(log as WeightLog).unit}</Text>
                                        </Text>
                                        <Text style={styles.logToDeleteTimestamp}>{formatDate(log.timestamp).split(',').slice(0, 2).join(', ')}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setLogToDelete(null)}>
                                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteButton} onPress={handleConfirmDelete}>
                                <Text style={styles.deleteButtonText}>{t('delete')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <DeleteConfirmationModal />
            <View style={styles.header}>
                <Text style={styles.title}>{t('logHistory')}</Text>
                <Text style={styles.subtitle}>
                    {activeLogType === 'glucose' ? t('reviewGlucose') : t('reviewWeight')}
                </Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    onPress={() => setActiveLogType('glucose')}
                    style={[styles.tabButton, activeLogType === 'glucose' && styles.activeTabButton]}
                >
                    <Text style={[styles.tabButtonText, activeLogType === 'glucose' && styles.activeTabButtonText]}>{t('glucose')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveLogType('weight')}
                    style={[styles.tabButton, activeLogType === 'weight' && styles.activeTabButton]}
                >
                    <Text style={[styles.tabButtonText, activeLogType === 'weight' && styles.activeTabButtonText]}>{t('weight')}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                {filterOptions.map(({ key, label }) => (
                    <TouchableOpacity
                        key={key}
                        onPress={() => setActiveFilter(key)}
                        style={[styles.filterButton, activeFilter === key && styles.activeFilterButton]}
                    >
                        <Text style={[styles.filterButtonText, activeFilter === key && styles.activeFilterButtonText]}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            
            {activeLogType === 'glucose' && chartData.length > 0 && <GlucoseChart />}

            <View style={styles.logList}>
                {activeLogType === 'glucose' && (
                    <>
                        {filteredGlucoseLogs.length > 0 ? (
                            filteredGlucoseLogs.map(log => (
                                <View key={log.id} style={styles.logItem}>
                                    <View>
                                        <Text style={styles.logValue}>
                                            {log.value} <Text style={styles.logUnit}>mg/dL</Text>
                                        </Text>
                                        <Text style={styles.logTimestamp}>{formatDate(log.timestamp)}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDeleteRequest('glucose', log)}>
                                        <TrashIcon width={20} height={20} color="rgba(243, 243, 233, 0.6)" />
                                    </TouchableOpacity>
                                </View>
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
                                <View key={log.id} style={styles.logItem}>
                                    <View style={styles.logItemContent}>
                                        <WeightScaleIcon width={24} height={24} color="rgba(243, 243, 233, 0.6)" />
                                        <View>
                                            <Text style={styles.logValue}>
                                                {log.value} <Text style={styles.logUnit}>{log.unit}</Text>
                                            </Text>
                                            <Text style={styles.logTimestamp}>{formatDate(log.timestamp)}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDeleteRequest('weight', log)}>
                                        <TrashIcon width={20} height={20} color="rgba(243, 243, 233, 0.6)" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                           <EmptyState type="weight" />
                        )}
                    </>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#F3F3E9',
    },
    subtitle: {
        color: 'rgba(243, 243, 233, 0.8)',
        fontSize: 16,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#6B7A4A',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
    },
    activeTabButton: {
        backgroundColor: '#FFD700',
    },
    tabButtonText: {
        textAlign: 'center',
        fontWeight: '600',
        color: '#F3F3E9',
    },
    activeTabButtonText: {
        color: '#1E2A2D',
    },
    filterContainer: {
        flexDirection: 'row',
        backgroundColor: '#6B7A4A',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
    },
    activeFilterButton: {
        backgroundColor: '#FFD700',
    },
    filterButtonText: {
        textAlign: 'center',
        fontWeight: '600',
        color: '#F3F3E9',
        fontSize: 12,
    },
    activeFilterButtonText: {
        color: '#1E2A2D',
    },
    chartContainer: {
        backgroundColor: '#6B7A4A',
        borderRadius: 24,
        padding: 16,
        marginBottom: 20,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#F3F3E9',
    },
    chartTypeSelector: {
        flexDirection: 'row',
        backgroundColor: '#1E2A2D',
        borderRadius: 8,
        padding: 2,
    },
    chartTypeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    activeChartTypeButton: {
        backgroundColor: '#6B7A4A',
    },
    chartTypeButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(243, 243, 233, 0.6)',
        marginLeft: 4,
    },
    activeChartTypeButtonText: {
        color: '#FFD700',
    },
    logList: {
        gap: 12,
    },
    logItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#6B7A4A',
        borderRadius: 12,
        padding: 16,
    },
    logItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    logValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F3F3E9',
    },
    logUnit: {
        fontSize: 16,
        fontWeight: 'normal',
        color: 'rgba(243, 243, 233, 0.8)',
    },
    logTimestamp: {
        fontSize: 12,
        color: 'rgba(243, 243, 233, 0.6)',
        marginTop: 4,
    },
    emptyState: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 48,
        backgroundColor: '#6B7A4A',
        borderRadius: 24,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#F3F3E9',
        marginTop: 12,
    },
    emptyStateText: {
        fontSize: 14,
        color: 'rgba(243, 243, 233, 0.6)',
        marginTop: 4,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
        backgroundColor: '#6B7A4A',
        borderRadius: 24,
        padding: 24,
        width: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#F3F3E9',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalMessage: {
        fontSize: 14,
        color: 'rgba(243, 243, 233, 0.8)',
        textAlign: 'center',
        marginBottom: 16,
    },
    logToDeleteContainer: {
        backgroundColor: 'rgba(30, 42, 45, 0.5)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    logToDeleteContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logToDeleteValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#F3F3E9',
    },
    logToDeleteUnit: {
        fontSize: 14,
        fontWeight: 'normal',
        color: 'rgba(243, 243, 233, 0.8)',
    },
    logToDeleteTimestamp: {
        fontSize: 12,
        color: 'rgba(243, 243, 233, 0.6)',
        marginTop: 4,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#1E2A2D',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#F3F3E9',
        fontWeight: '600',
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#e74c3c',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default Logs;
