"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function StockChart({ chartData, xDataKey, yDataKey }) {
    const largeScreen = screen.width > 1700;

    return (
        <LineChart width={largeScreen ? 1000 : 800} height={largeScreen ? 600 : 600} data={chartData}>
            <XAxis dataKey={xDataKey} />
            <YAxis />
            <Tooltip isAnimationActive={false} />
            <Line isAnimationActive={false} type="monotone" dataKey={yDataKey} stroke="#8884d8" dot={false} />
        </LineChart>
    );
}
