"use client";

import useAlpacaApi from "./hooks/useAlpacaApi";
import { useEffect, useState } from "react";
import StockChart from "./components/stockChart";
import useFormat from "./hooks/useFormat";

let spyEquity;
let tqqqEquity;
let nflxEquity;
let tltEquity;
let bacEquity;
const startingCash = 100000;
const startingIndex = 200;
const tickers = ["SPY", "TQQQ", "NFLX", "TLT", "BAC"];
const fakeTickers = { SPY: "ETF", TQQQ: "3xETF", NFLX: "TV", TLT: "BONDS", BAC: "BANK" };

export default function Home() {
    const [loadingStocks, stocksError, stockData, getStockData] = useAlpacaApi(
        `stocks/bars?symbols=${tickers}&timeframe=1Day&start=2020-01-01T00%3A00%3A00Z&limit=10000&adjustment=raw&sort=asc&feed=iex`,
    );
    const { formatCurrency, formatNumber } = useFormat();
    const [spyData, setSPYData] = useState([]);
    const [tqqqData, setTQQQData] = useState([]);
    const [nflxData, setNFLXData] = useState([]);
    const [tltData, setTLTData] = useState([]);
    const [bacData, setBACData] = useState([]);
    const [speed, setSpeed] = useState(500);
    const [index, setIndex] = useState(startingIndex);
    const [cash, setCash] = useState(startingCash);
    const [shares, setShares] = useState({ SPY: 0, TQQQ: 0, NFLX: 0, TLT: 0, BAC: 0 });
    const [equity, setEquity] = useState(0);
    const [totalReturn, setTotalReturn] = useState(0);
    const [annualReturn, setAnnualReturn] = useState(0);
    const [activeTicker, setActiveTicker] = useState("SPY");

    function buy() {
        const sharePrice = Number(stockData.bars[activeTicker][index].c);
        if (cash >= sharePrice * 100) {
            setShares({ ...shares, [activeTicker]: shares[activeTicker] + 100 });
            setCash(cash - sharePrice * 100);
        }
    }

    function sell() {
        if (shares[activeTicker] > 0) {
            setShares({ ...shares, [activeTicker]: shares[activeTicker] - 100 });
            setCash(cash + Number(stockData.bars[activeTicker][index].c) * 100);
        }
    }

    function buyMax() {
        const sharePrice = Number(stockData.bars[activeTicker][index].c);
        const maxShares = Math.floor(cash / sharePrice);
        if (maxShares > 0) {
            setShares({ ...shares, [activeTicker]: shares[activeTicker] + maxShares });
            setCash(cash - sharePrice * maxShares);
        }
    }

    function sellMax() {
        const sharePrice = Number(stockData.bars[activeTicker][index].c);
        const numberOfShares = shares[activeTicker];
        if (numberOfShares > 0) {
            setShares({ ...shares, [activeTicker]: shares[activeTicker] - numberOfShares });
            setCash(cash + sharePrice * numberOfShares);
        }
    }

    function addChartData() {
        if (stockData?.bars && index < stockData?.bars?.SPY.length - 1) {
            setIndex(index + 1);
            setSPYData([
                ...spyData,
                { t: formatNumber(stockData.bars.SPY[index].c, "decimal", 0, 0), c: stockData.bars.SPY[index].c },
            ]);
            if (index < stockData?.bars?.TQQQ.length) {
                setTQQQData([
                    ...tqqqData,
                    { t: formatNumber(stockData.bars.TQQQ[index].c, "decimal", 0, 0), c: stockData.bars.TQQQ[index].c },
                ]);
            }
            if (index < stockData?.bars?.NFLX.length) {
                setNFLXData([
                    ...nflxData,
                    { t: formatNumber(stockData.bars.NFLX[index].c, "decimal", 0, 0), c: stockData.bars.NFLX[index].c },
                ]);
            }
            if (index < stockData?.bars?.TLT.length) {
                setTLTData([
                    ...tltData,
                    { t: formatNumber(stockData.bars.TLT[index].c, "decimal", 0, 0), c: stockData.bars.TLT[index].c },
                ]);
            }
            if (index < stockData?.bars?.BAC.length) {
                setBACData([
                    ...bacData,
                    { t: formatNumber(stockData.bars.BAC[index].c, "decimal", 0, 0), c: stockData.bars.BAC[index].c },
                ]);
            }
        }
    }

    useEffect(() => {
        getStockData();
    }, []);

    // set equity
    useEffect(() => {
        if (stockData?.bars) {
            if (index < stockData?.bars?.SPY.length) {
                spyEquity = Math.abs(shares.SPY) * Number(stockData.bars.SPY[index].c);
            }
            if (index < stockData?.bars?.TQQQ.length) {
                tqqqEquity = Math.abs(shares.TQQQ) * Number(stockData.bars.TQQQ[index].c);
            }
            if (index < stockData?.bars?.NFLX.length) {
                nflxEquity = Math.abs(shares.NFLX) * Number(stockData.bars.NFLX[index].c);
            }
            if (index < stockData?.bars?.TLT.length) {
                tltEquity = Math.abs(shares.TLT) * Number(stockData.bars.TLT[index].c);
            }
            if (index < stockData?.bars?.BAC.length) {
                bacEquity = Math.abs(shares.BAC) * Number(stockData.bars.BAC[index].c);
            }
            setEquity(spyEquity + tqqqEquity + nflxEquity + tltEquity + bacEquity);
        }
    }, [index, shares]);

    // set return
    useEffect(() => {
        if (stockData?.bars) {
            const totalReturn = (cash + equity - startingCash) / startingCash;
            setTotalReturn(totalReturn);
            setAnnualReturn(totalReturn / (index / 250));
        }
    }, [equity]);

    // set stock data when loaded
    useEffect(() => {
        if (!loadingStocks && stockData?.bars) {
            setSPYData(
                stockData?.bars?.SPY.slice(0, startingIndex).map((day) => {
                    return { t: formatNumber(day.c, "decimal", 0, 0), c: day.c };
                }),
            );
            setTQQQData(
                stockData?.bars?.TQQQ.slice(0, startingIndex).map((day) => {
                    return { t: formatNumber(day.c, "decimal", 0, 0), c: day.c };
                }),
            );
            setNFLXData(
                stockData?.bars?.NFLX.slice(0, startingIndex).map((day) => {
                    return { t: formatNumber(day.c, "decimal", 0, 0), c: day.c };
                }),
            );
            setTLTData(
                stockData?.bars?.TLT.slice(0, startingIndex).map((day) => {
                    return { t: formatNumber(day.c, "decimal", 0, 0), c: day.c };
                }),
            );
            setBACData(
                stockData?.bars?.BAC.slice(0, startingIndex).map((day) => {
                    return { t: formatNumber(day.c, "decimal", 0, 0), c: day.c };
                }),
            );
        }
    }, [loadingStocks]);

    // set interval
    useEffect(() => {
        const timer = setInterval(() => addChartData(), speed);

        return () => clearInterval(timer);
    });

    return (
        <div className="flex justify-end min-h-96 pr-4">
            {loadingStocks ? (
                <div className="loading loading-spinner"></div>
            ) : stocksError ? (
                <div>Error fetching data</div>
            ) : (
                <div className="flex gap-8">
                    <div className="menu gap-4">
                        {tickers.map((ticker) => (
                            <button key={ticker} className="btn" onClick={() => setActiveTicker(ticker)}>
                                {fakeTickers[ticker]}
                            </button>
                        ))}
                    </div>
                    {activeTicker == "SPY" && <StockChart chartData={spyData} xDataKey={"t"} yDataKey={"c"} />}
                    {activeTicker == "TQQQ" && <StockChart chartData={tqqqData} xDataKey={"t"} yDataKey={"c"} />}
                    {activeTicker == "NFLX" && <StockChart chartData={nflxData} xDataKey={"t"} yDataKey={"c"} />}
                    {activeTicker == "TLT" && <StockChart chartData={tltData} xDataKey={"t"} yDataKey={"c"} />}
                    {activeTicker == "BAC" && <StockChart chartData={bacData} xDataKey={"t"} yDataKey={"c"} />}
                    <div className="flex flex-col items-end">
                        <div className="stat place-items-end">
                            <div className="stat-title">Close</div>
                            {index < stockData.bars[activeTicker].length ? (
                                <div className="stat-value">{stockData?.bars[activeTicker][index].c}</div>
                            ) : index - 1 < stockData.bars[activeTicker].length ? (
                                <div className="stat-value">{stockData?.bars[activeTicker][index - 1].c}</div>
                            ) : index - 2 < stockData.bars[activeTicker].length ? (
                                <div className="stat-value">{stockData?.bars[activeTicker][index - 2].c}</div>
                            ) : index - 3 < stockData.bars[activeTicker].length ? (
                                <div className="stat-value">{stockData?.bars[activeTicker][index - 3].c}</div>
                            ) : index - 4 < stockData.bars[activeTicker].length ? (
                                <div className="stat-value">{stockData?.bars[activeTicker][index - 4].c}</div>
                            ) : index - 5 < stockData.bars[activeTicker].length ? (
                                <div className="stat-value">{stockData?.bars[activeTicker][index - 5].c}</div>
                            ) : (
                                <div className="stat-value">{stockData?.bars[activeTicker][index - 6].c}</div>
                            )}
                        </div>
                        <div className="flex">
                            <button className="btn bg-green-800 w-max" onClick={buy}>
                                Buy 100
                            </button>
                            <button className="btn bg-red-800" onClick={sell}>
                                Sell 100
                            </button>
                        </div>
                        <div className="flex">
                            <button className="btn bg-green-800 w-max" onClick={buyMax}>
                                Buy Max
                            </button>
                            <button className="btn bg-red-800" onClick={sellMax}>
                                Sell Max
                            </button>
                        </div>
                        <div className="stats stats-vertical shadow">
                            <div className="stat  place-items-end">
                                <div className="stat-title">Shares</div>
                                <div className="flex gap-8">
                                    {tickers.map((ticker) => (
                                        <div key={ticker}>
                                            <div className="stat-title">{fakeTickers[ticker]}</div>
                                            <div className="stat-value">{shares[ticker]}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="stat place-items-end">
                                <div className="stat-title">Cash</div>
                                <div className="stat-value">{formatCurrency(cash, 0)}</div>
                            </div>
                            <div className="stat place-items-end">
                                <div className="stat-title">Equity</div>
                                <div className="stat-value">{formatCurrency(equity, 0)}</div>
                            </div>
                            <div className="stat place-items-end">
                                <div className="stat-title">Net Worth</div>
                                <div className="stat-value">{formatCurrency(cash + equity, 0)}</div>
                            </div>
                            <div className="stat flex">
                                <div className="stat place-items-end">
                                    <div className="stat-title">Total Return</div>
                                    <div className="stat-value">{formatNumber(totalReturn, "percent", 0, 0)}</div>
                                </div>
                                <div className="stat place-items-end">
                                    <div className="stat-title">Annual Return</div>
                                    <div className="stat-value">{formatNumber(annualReturn, "percent", 0, 0)}</div>
                                </div>
                            </div>
                            <div className="stat flex justify-center">
                                <button className="btn" onClick={() => setSpeed(500)}>
                                    Slow
                                </button>
                                <button className="btn" onClick={() => setSpeed(250)}>
                                    Normal
                                </button>
                                <button className="btn" onClick={() => setSpeed(100)}>
                                    Fast
                                </button>
                                <button className="btn" onClick={() => setSpeed(10)}>
                                    Ludacris Speed!
                                </button>
                            </div>
                            <div className="stat place-items-end">
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
