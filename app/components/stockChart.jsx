"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StockChart({ chartData, xDataKey, yDataKey }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart width={1000} height={600} data={chartData}>
                <XAxis dataKey={xDataKey} />
                <YAxis />
                <Tooltip isAnimationActive={false} />
                <Line isAnimationActive={false} type="monotone" dataKey={yDataKey} stroke="#8884d8" dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}
