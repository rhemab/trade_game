"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function Performance() {
    const performanceData = JSON.parse(localStorage.getItem("performanceData"));
    return (
        <>
            <div className="flex justify-center">Performance</div>
            <LineChart width={1500} height={900} data={performanceData}>
                <XAxis hide dataKey={"c"} />
                <YAxis />
                <Tooltip isAnimationActive={false} />
                <Line isAnimationActive={false} type="monotone" dataKey={"SPY"} stroke="#8884d8" dot={false} />
                <Line isAnimationActive={false} type="monotone" dataKey={"netWorth"} stroke="#82ca9d" dot={false} />
            </LineChart>
        </>
    );
}
