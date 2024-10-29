"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StockChart({ chartData, xDataKey, yDataKey }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart width={1000} height={600} data={chartData}>
                <CartesianGrid strokeDasharray="0.01" />
                <XAxis dataKey={xDataKey} />
                <YAxis />
                <Tooltip />

                <Area
                    isAnimationActive={false}
                    type="monotone"
                    dataKey={yDataKey}
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorUv)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
