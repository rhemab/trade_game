"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function StockChart({ chartData, xDataKey, yDataKey }) {
    return (
        <LineChart width={1200} height={600} data={chartData}>
            <XAxis dataKey={xDataKey} />
            <YAxis />
            <Tooltip isAnimationActive={false} />
            <Line isAnimationActive={false} type="monotone" dataKey={yDataKey} stroke="#8884d8" dot={false} />
        </LineChart>
    );
}
