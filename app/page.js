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
let lplEquity;
let koEquity;

const startingCash = 100000;
const startingIndex = 250;
const tickers = ["SPY", "TQQQ", "NFLX", "TLT", "BAC", "LPL", "KO"];
const fakeTickers = { SPY: "ETF", TQQQ: "3xETF", NFLX: "TV", TLT: "BONDS", BAC: "BANK", LPL: "PHONE", KO: "DRINK" };

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
    const [lplData, setLPLData] = useState([]);
    const [koData, setKOData] = useState([]);
    const [speed, setSpeed] = useState(250);
    const [index, setIndex] = useState(startingIndex);
    const [cash, setCash] = useState(startingCash);
    const [shares, setShares] = useState({
        SPY: { shares: 0, price: 0, amountInvested: 0 },
        TQQQ: { shares: 0, price: 0, amountInvested: 0 },
        NFLX: { shares: 0, price: 0, amountInvested: 0 },
        TLT: { shares: 0, price: 0, amountInvested: 0 },
        BAC: { shares: 0, price: 0, amountInvested: 0 },
        LPL: { shares: 0, price: 0, amountInvested: 0 },
        KO: { shares: 0, price: 0, amountInvested: 0 },
    });
    const [equity, setEquity] = useState(0);
    const [totalReturn, setTotalReturn] = useState(0);
    const [annualReturn, setAnnualReturn] = useState(0);
    const [activeTicker, setActiveTicker] = useState("SPY");

    function buy() {
        const sharePrice = Number(getClosePrice(activeTicker));
        if (cash >= sharePrice * 100) {
            const currentShares = Number(shares[activeTicker].shares);
            const amountInvested = Number(shares[activeTicker].amountInvested);
            const newInvestment = Number(sharePrice * 100);
            const avgPrice = (amountInvested + newInvestment) / (currentShares + 100);
            setShares({
                ...shares,
                [activeTicker]: {
                    shares: currentShares + 100,
                    price: avgPrice,
                    amountInvested: amountInvested + newInvestment,
                },
            });
            setCash(cash - newInvestment);
        }
    }

    function sell() {
        const currentShares = Number(shares[activeTicker].shares);
        if (currentShares >= 100) {
            const sharePrice = Number(getClosePrice(activeTicker));
            const currentPrice = Number(shares[activeTicker].price);
            const amountInvested = Number(shares[activeTicker].amountInvested);
            setShares({
                ...shares,
                [activeTicker]: {
                    shares: currentShares - 100,
                    price: currentShares == 100 ? 0 : currentPrice,
                    amountInvested: amountInvested - sharePrice * 100,
                },
            });
            setCash(cash + sharePrice * 100);
        }
    }

    function buyMax() {
        const sharePrice = Number(getClosePrice(activeTicker));
        const maxShares = Math.floor(cash / sharePrice);
        if (maxShares > 0) {
            const currentShares = shares[activeTicker].shares;
            const amountInvested = Number(shares[activeTicker].amountInvested);
            const newInvestment = Number(sharePrice * maxShares);
            const avgPrice = (amountInvested + newInvestment) / (currentShares + maxShares);
            setShares({
                ...shares,
                [activeTicker]: {
                    shares: currentShares + maxShares,
                    price: avgPrice,
                    amountInvested: amountInvested + newInvestment,
                },
            });
            setCash(cash - newInvestment);
        }
    }

    function sellMax() {
        const sharePrice = Number(getClosePrice(activeTicker));
        const numberOfShares = shares[activeTicker].shares;
        if (numberOfShares > 0) {
            setShares({ ...shares, [activeTicker]: { shares: 0, price: 0, amountInvested: 0 } });
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
            if (index < stockData?.bars?.LPL.length) {
                setLPLData([
                    ...lplData,
                    { t: formatNumber(stockData.bars.LPL[index].c, "decimal", 0, 0), c: stockData.bars.LPL[index].c },
                ]);
            }
            if (index < stockData?.bars?.KO.length) {
                setKOData([
                    ...koData,
                    { t: formatNumber(stockData.bars.KO[index].c, "decimal", 0, 0), c: stockData.bars.KO[index].c },
                ]);
            }
        }
    }

    function getClosePrice(ticker) {
        if (stockData?.bars) {
            let indexOffset = 1;
            while (index - indexOffset >= stockData.bars[ticker].length) {
                indexOffset++;
            }
            return stockData?.bars[ticker][index - indexOffset].c;
        }
    }

    function calculatePL(ticker) {
        if (shares[ticker].price > 0) {
            return (getClosePrice(ticker) - shares[ticker].price) / shares[ticker].price;
        } else {
            return 0;
        }
    }

    useEffect(() => {
        getStockData();
    }, []);

    // set equity
    useEffect(() => {
        if (stockData?.bars) {
            spyEquity = Math.abs(shares.SPY.shares) * Number(getClosePrice("SPY"));
            tqqqEquity = Math.abs(shares.TQQQ.shares) * Number(getClosePrice("TQQQ"));
            nflxEquity = Math.abs(shares.NFLX.shares) * Number(getClosePrice("NFLX"));
            tltEquity = Math.abs(shares.TLT.shares) * Number(getClosePrice("TLT"));
            bacEquity = Math.abs(shares.BAC.shares) * Number(getClosePrice("BAC"));
            lplEquity = Math.abs(shares.LPL.shares) * Number(getClosePrice("LPL"));
            koEquity = Math.abs(shares.KO.shares) * Number(getClosePrice("KO"));
            setEquity(spyEquity + tqqqEquity + nflxEquity + tltEquity + bacEquity + lplEquity + koEquity);
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
            setLPLData(
                stockData?.bars?.LPL.slice(0, startingIndex).map((day) => {
                    return { t: formatNumber(day.c, "decimal", 0, 0), c: day.c };
                }),
            );
            setKOData(
                stockData?.bars?.KO.slice(0, startingIndex).map((day) => {
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
        <div className="flex justify-center min-h-96 pr-4">
            {loadingStocks ? (
                <div className="loading loading-spinner"></div>
            ) : stocksError ? (
                <div>Error fetching data</div>
            ) : (
                <div className="flex">
                    <ul className="menu gap-2 bg-base-200 w-56">
                        <div>Stocks</div>
                        {tickers.map((ticker) => (
                            <li key={ticker}>
                                <a
                                    className={
                                        ticker == activeTicker ? "active flex justify-between" : "flex justify-between"
                                    }
                                    onClick={() => setActiveTicker(ticker)}
                                >
                                    <p>{fakeTickers[ticker]}</p>
                                    <p>{getClosePrice(ticker)}</p>
                                </a>
                            </li>
                        ))}
                    </ul>
                    <ul className="menu gap-2 bg-base-200 w-56">
                        <div>Positions</div>
                        {tickers.map((ticker) => {
                            const pnl = calculatePL(ticker);
                            const myShares = shares[ticker].shares;
                            const price = shares[ticker].price;
                            return (
                                <li key={ticker}>
                                    <a
                                        className={
                                            ticker == activeTicker
                                                ? "active flex justify-between"
                                                : "flex justify-between"
                                        }
                                        onClick={() => setActiveTicker(ticker)}
                                    >
                                        <p className={myShares == 0 ? "hidden" : ""}>
                                            {formatNumber(myShares, "decimal", 0, 0)}
                                        </p>
                                        <p className={myShares == 0 ? "hidden" : ""}>{`@ ${formatNumber(price)}`}</p>
                                        <p className={pnl > 0 ? "text-success" : pnl == 0 ? "" : "text-red-600"}>
                                            {myShares == 0 ? "--" : formatNumber(pnl, "percent", 0, 0)}
                                        </p>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                    {activeTicker == "SPY" && <StockChart chartData={spyData} xDataKey={"t"} yDataKey={"c"} />}
                    {activeTicker == "TQQQ" && <StockChart chartData={tqqqData} xDataKey={"t"} yDataKey={"c"} />}
                    {activeTicker == "NFLX" && <StockChart chartData={nflxData} xDataKey={"t"} yDataKey={"c"} />}
                    {activeTicker == "TLT" && <StockChart chartData={tltData} xDataKey={"t"} yDataKey={"c"} />}
                    {activeTicker == "BAC" && <StockChart chartData={bacData} xDataKey={"t"} yDataKey={"c"} />}
                    {activeTicker == "LPL" && <StockChart chartData={lplData} xDataKey={"t"} yDataKey={"c"} />}
                    {activeTicker == "KO" && <StockChart chartData={koData} xDataKey={"t"} yDataKey={"c"} />}
                    <div className="flex flex-col items-end">
                        <div className="stat place-items-end">
                            <div className="stat-title">Close</div>
                            <div className="stat-value">{getClosePrice(activeTicker)}</div>
                        </div>
                        <div className="flex justify-between w-52">
                            <button className="btn m-1 bg-green-800 w-max" onClick={buy}>
                                Buy 100
                            </button>
                            <button className="btn m-1 bg-red-800" onClick={sell}>
                                Sell 100
                            </button>
                        </div>
                        <div className="flex justify-between w-52">
                            <button className="btn m-1 bg-green-800 w-max" onClick={buyMax}>
                                Buy Max
                            </button>
                            <button className="btn m-1 bg-red-800" onClick={sellMax}>
                                Sell Max
                            </button>
                        </div>
                        <div className="stats stats-vertical shadow">
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
                                <button className="btn" onClick={() => setSpeed(250)}>
                                    Slow
                                </button>
                                <button className="btn" onClick={() => setSpeed(100)}>
                                    Normal
                                </button>
                                <button className="btn" onClick={() => setSpeed(10)}>
                                    Fast
                                </button>
                                <button className="btn" onClick={() => setSpeed(1)}>
                                    Ludacris Speed!
                                </button>
                            </div>
                            <div className="stat place-items-end">
                                <progress
                                    className="progress w-56"
                                    value={speed == 250 ? "10" : speed == 100 ? "75" : speed == 10 ? "150" : "250"}
                                    max="250"
                                ></progress>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
