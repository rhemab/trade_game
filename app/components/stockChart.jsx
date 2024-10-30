"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function StockChart({ chartData, xDataKey, yDataKey }) {
    const largeScreen = window.innerWidth > 2000;

    return (
        <LineChart width={largeScreen ? 1000 : 600} height={largeScreen ? 600 : 400} data={chartData}>
            <XAxis hide dataKey={xDataKey} />
            <YAxis />
            <Tooltip isAnimationActive={false} />
            <Line isAnimationActive={false} type="monotone" dataKey={yDataKey} stroke="#8884d8" dot={false} />
        </LineChart>
    );
}
