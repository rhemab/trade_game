"use client";

import useFormat from "@/app/hooks/useFormat";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function Performance() {
    const { formatNumber } = useFormat();
    const [performanceData, setPerformanceData] = useState([]);
    const [tradeHistory, setTradeHistory] = useState([]);

    useEffect(() => {
        setPerformanceData(JSON.parse(localStorage.getItem("performanceData")));
        setTradeHistory(JSON.parse(localStorage.getItem("tradeHistory")));
    }, []);

    return (
        <>
            <div className="flex flex-col items-start m-9">
                <div className="flex justify-center w-full">Performance</div>
                <LineChart width={1500} height={900} data={performanceData}>
                    <XAxis dataKey={"duration"} />
                    <YAxis />
                    <Tooltip isAnimationActive={false} />
                    <Line
                        isAnimationActive={false}
                        type="monotone"
                        dataKey={"SPY"}
                        stroke="#8884d8"
                        dot={false}
                        unit={"%"}
                    />
                    <Line
                        isAnimationActive={false}
                        type="monotone"
                        dataKey={"netWorth"}
                        stroke="#82ca9d"
                        dot={false}
                        unit={"%"}
                    />
                </LineChart>
                <div className="overflow-x-auto min-w-[50vw]">
                    <table className="table">
                        {/* head */}
                        <thead>
                            <tr>
                                <th></th>
                                <th>Ticker</th>
                                <th>Type</th>
                                <th>Shares</th>
                                <th>Price</th>
                                <th>Return</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tradeHistory.map((trade, index) => (
                                <tr key={index}>
                                    <th>{index + 1}</th>
                                    <td>{trade.ticker}</td>
                                    <td className={trade.type === "buy" ? "text-success" : "text-error"}>
                                        {trade.type}
                                    </td>
                                    <td>{trade.shares}</td>
                                    <td>{trade.price}</td>
                                    {trade?.return && (
                                        <td className={trade.return > 0 ? "text-success" : "text-error"}>
                                            {formatNumber(trade.return, "percent")}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
