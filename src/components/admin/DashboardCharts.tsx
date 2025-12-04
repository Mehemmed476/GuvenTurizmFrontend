"use client";

import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

interface Props {
    data: { month: string; revenue: number; count: number }[];
}

export default function DashboardCharts({ data }: Props) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return <div className="h-80 bg-gray-50 rounded-2xl"></div>;

    if (!data || data.length === 0) {
        return <div className="text-center p-10 text-gray-400">Qrafik üçün məlumat yoxdur</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* --- QRAFIK 1: GƏLİR (Area Chart) --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Aylıq Gəlir</h3>

                {/* Konkret hündürlük (320px) */}
                <div className="h-80 w-full">
                    <ResponsiveContainer width="99%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                width={80}
                                tickFormatter={(val) => `${val} ₼`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            {/* Sadə yaşıl rəng */}
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#10B981"
                                strokeWidth={3}
                                fill="#D1FAE5"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- QRAFIK 2: SİFARİŞ SAYI (Bar Chart) --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Sifariş Sayı</h3>

                <div className="h-80 w-full">
                    <ResponsiveContainer width="99%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: '#F3F4F6' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#3B82F6"
                                radius={[4, 4, 0, 0]}
                                barSize={50}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
}