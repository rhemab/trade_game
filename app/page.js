"use client";

import useAlpacaApi from "./hooks/useAlpacaApi";
import { useEffect, useState } from "react";
import StockChart from "./components/stockChart";
import useFormat from "./hooks/useFormat";

const startingCash = 100000;
const startingIndex = 200;

export default function Home() {
    const [loadingSpy, spyError, spyData, getSpyData] = useAlpacaApi(
        "stocks/bars?symbols=SPY&timeframe=1Day&start=2020-01-01T00%3A00%3A00Z&limit=10000&adjustment=raw&sort=asc&feed=iex",
    );
    const { formatCurrency, formatNumber } = useFormat();
    const [chartData, setChartData] = useState([]);
    const [speed, setSpeed] = useState(500);
    const [index, setIndex] = useState(startingIndex);
    const [cash, setCash] = useState(startingCash);
    const [shares, setShares] = useState(0);
    const [equity, setEquity] = useState(0);
    const [totalReturn, setTotalReturn] = useState(0);
    const [annualReturn, setAnnualReturn] = useState(0);

    function buy() {
        if (cash >= Number(spyData.bars.SPY[index].c) * 100) {
            setShares(shares + 100);
            setCash(cash - Number(spyData.bars.SPY[index].c) * 100);
        }
    }

    function sell() {
        if (shares > 0) {
            setShares(shares - 100);
            setCash(cash + Number(spyData.bars.SPY[index].c) * 100);
        }
    }

    function addChartData() {
        if (spyData?.bars?.SPY && index < spyData?.bars?.SPY.length - 1) {
            setIndex(index + 1);
            setChartData([
                ...chartData,
                { t: formatNumber(spyData.bars.SPY[index].c, "decimal", 0, 0), c: spyData.bars.SPY[index].c },
            ]);
        }
    }

    useEffect(() => {
        getSpyData();
    }, []);

    useEffect(() => {
        if (spyData?.bars?.SPY) {
            setEquity(Math.abs(shares) * Number(spyData.bars.SPY[index].c));
        }
    }, [chartData, shares]);

    useEffect(() => {
        if (spyData?.bars?.SPY) {
            const totalReturn = (cash + equity - startingCash) / startingCash;
            setTotalReturn(totalReturn);
            setAnnualReturn(totalReturn / (index / 250));
        }
    }, [equity]);

    useEffect(() => {
        if (!loadingSpy) {
            setChartData(
                spyData?.bars?.SPY.slice(0, startingIndex).map((day) => {
                    return { t: formatNumber(day.c, "decimal", 0, 0), c: day.c };
                }),
            );
        }
    }, [loadingSpy]);

    useEffect(() => {
        const timer = setInterval(() => addChartData(), speed);

        return () => clearInterval(timer);
    });

    return (
        <div className="flex justify-center items-center min-h-96">
            {loadingSpy ? (
                <div className="loading loading-spinner"></div>
            ) : spyError ? (
                <div>Error fetching data</div>
            ) : (
                <div className="flex gap-8">
                    <StockChart chartData={chartData} xDataKey={"t"} yDataKey={"c"} />
                    <div className="flex flex-col items-center rounded-lg text-center min-w-[25rem]">
                        {spyData?.bars?.SPY && <div className="p-4">Last: {spyData?.bars?.SPY[index].c}</div>}
                        <div className="flex">
                            <button className="btn bg-green-800 w-max" onClick={buy}>
                                Buy 100
                            </button>
                            <button className="btn bg-red-800" onClick={sell}>
                                Sell 100
                            </button>
                        </div>
                        <div className="stats stats-vertical shadow">
                            <div className="stat place-items-center">
                                <div className="stat-title">Shares</div>
                                <div className="stat-value">{shares}</div>
                            </div>
                            <div className="stat place-items-center">
                                <div className="stat-title">Cash</div>
                                <div className="stat-value">{formatCurrency(cash, 0)}</div>
                            </div>
                            <div className="stat place-items-center">
                                <div className="stat-title">Equity</div>
                                <div className="stat-value">{formatCurrency(equity, 0)}</div>
                            </div>
                            <div className="stat place-items-center">
                                <div className="stat-title">Net Worth</div>
                                <div className="stat-value">{formatCurrency(cash + equity, 0)}</div>
                            </div>
                            <div className="stat flex">
                                <div className="stat place-items-center">
                                    <div className="stat-title">Total Return</div>
                                    <div className="stat-value">{formatNumber(totalReturn, "percent", 0, 0)}</div>
                                </div>
                                <div className="stat place-items-center">
                                    <div className="stat-title">Annual Return</div>
                                    <div className="stat-value">{formatNumber(annualReturn, "percent", 0, 0)}</div>
                                </div>
                            </div>
                            <div className="stat flex justify-center">
                                <button className="btn bg-gray-700" onClick={() => setSpeed(500)}>
                                    Slow
                                </button>
                                <button className="btn bg-gray-700" onClick={() => setSpeed(250)}>
                                    Normal
                                </button>
                                <button className="btn bg-gray-700 w-max" onClick={() => setSpeed(100)}>
                                    Fast
                                </button>
                                <button className="btn bg-gray-700 w-max" onClick={() => setSpeed(10)}>
                                    Ludacris Speed!
                                </button>
                            </div>
                            <div className="stat place-items-center">
                                <progress
                                    className="progress w-56"
                                    value={speed == 500 ? "10" : speed == 250 ? "100" : speed == 100 ? "250" : "500"}
                                    max="500"
                                ></progress>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
