"use client";

import useAlpacaApi from "./hooks/useAlpacaApi";
import { useEffect, useState } from "react";
import StockChart from "./components/stockChart";
import useFormat from "./hooks/useFormat";
import dayjs from "dayjs";

let spyEquity = 0;
let tqqqEquity = 0;
let nflxEquity = 0;
let tltEquity = 0;
let bacEquity = 0;
let lplEquity = 0;
let koEquity = 0;

let gameOver = false;
const startingCash = 100000;
const startingIndex = 254;
let index = startingIndex;
let speed = 250;
const tickers = ["SPY", "TQQQ", "NFLX", "TLT", "BAC", "LPL", "KO"];
const fakeTickers = { SPY: "ETF", TQQQ: "3xETF", NFLX: "TV", TLT: "BONDS", BAC: "BANK", LPL: "PHONE", KO: "DRINK" };

export default function Home() {
    const [loadingSpy, spyError, spyData, getSpyData] = useAlpacaApi(
        `stocks/bars?symbols=SPY&timeframe=1Day&start=2004-01-03T09%3A30%3A00-04%3A00&limit=10000&adjustment=raw&sort=asc&feed=sip`,
    );
    const [loadingTqqq, tqqqError, tqqqData, getTqqqData] = useAlpacaApi(
        `stocks/bars?symbols=TQQQ&timeframe=1Day&start=2004-01-03T09%3A30%3A00-04%3A00&limit=10000&adjustment=raw&sort=asc&feed=sip`,
    );
    const [loadingNflx, nflxError, nflxData, getNflxData] = useAlpacaApi(
        `stocks/bars?symbols=NFLX&timeframe=1Day&start=2004-01-03T09%3A30%3A00-04%3A00&limit=10000&adjustment=raw&sort=asc&feed=sip`,
    );
    const [loadingTlt, tltError, tltData, getTltData] = useAlpacaApi(
        `stocks/bars?symbols=TLT&timeframe=1Day&start=2004-01-03T09%3A30%3A00-04%3A00&limit=10000&adjustment=raw&sort=asc&feed=sip`,
    );
    const [loadingBac, bacError, bacData, getBacData] = useAlpacaApi(
        `stocks/bars?symbols=BAC&timeframe=1Day&start=2004-01-03T09%3A30%3A00-04%3A00&limit=10000&adjustment=raw&sort=asc&feed=sip`,
    );
    const [loadingLpl, lplError, lplData, getLplData] = useAlpacaApi(
        `stocks/bars?symbols=LPL&timeframe=1Day&start=2004-01-03T09%3A30%3A00-04%3A00&limit=10000&adjustment=raw&sort=asc&feed=sip`,
    );
    const [loadingKo, koError, koData, getKoData] = useAlpacaApi(
        `stocks/bars?symbols=KO&timeframe=1Day&start=2004-01-03T09%3A30%3A00-04%3A00&limit=10000&adjustment=raw&sort=asc&feed=sip`,
    );
    const { formatCurrency, formatNumber, convertDuration } = useFormat();
    const [spyChartData, setSPYChartData] = useState([]);
    const [tqqqChartData, setTQQQChartData] = useState([]);
    const [nflxChartData, setNFLXChartData] = useState([]);
    const [tltChartData, setTLTChartData] = useState([]);
    const [bacChartData, setBACChartData] = useState([]);
    const [lplChartData, setLPLChartData] = useState([]);
    const [koChartData, setKOChartData] = useState([]);
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
    const [startingDay, setStartingDay] = useState(undefined);
    const [currentDay, setCurrentDay] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [startGame, setStartGame] = useState(false);
    const [netWorthHistory, setNetWorthHistory] = useState([]);
    const [userData, setUserData] = useState({});

    function buy() {
        const sharePrice = Number(getClosePrice(activeTicker));
        if (cash >= sharePrice * 100) {
            const currentShares = Number(shares[activeTicker].shares);
            const amountInvested = Number(shares[activeTicker].amountInvested);
            const newInvestment = Number(sharePrice * 100);
            const avgPrice = (amountInvested + newInvestment) / (currentShares + 100);
            const tradeHistory = JSON.parse(localStorage.getItem("tradeHistory")) ?? [];

            setShares({
                ...shares,
                [activeTicker]: {
                    shares: currentShares + 100,
                    price: avgPrice,
                    amountInvested: amountInvested + newInvestment,
                },
            });
            setCash(cash - newInvestment);
            localStorage.setItem(
                "tradeHistory",
                JSON.stringify([
                    ...tradeHistory,
                    {
                        ticker: activeTicker,
                        type: "buy",
                        shares: 100,
                        price: sharePrice,
                    },
                ]),
            );
        }
    }

    function sell() {
        const currentShares = Number(shares[activeTicker].shares);
        if (currentShares >= 100) {
            const sharePrice = Number(getClosePrice(activeTicker));
            const currentPrice = Number(shares[activeTicker].price);
            const amountInvested = Number(shares[activeTicker].amountInvested);
            const tradeHistory = JSON.parse(localStorage.getItem("tradeHistory")) ?? [];

            setShares({
                ...shares,
                [activeTicker]: {
                    shares: currentShares - 100,
                    price: currentShares == 100 ? 0 : currentPrice,
                    amountInvested: amountInvested - sharePrice * 100,
                },
            });
            setCash(cash + sharePrice * 100);
            localStorage.setItem(
                "tradeHistory",
                JSON.stringify([
                    ...tradeHistory,
                    {
                        ticker: activeTicker,
                        type: "sell",
                        shares: 100,
                        price: sharePrice,
                        return: formatNumber((100 * sharePrice - amountInvested) / amountInvested, "percent"),
                    },
                ]),
            );
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
            const tradeHistory = JSON.parse(localStorage.getItem("tradeHistory")) ?? [];

            setShares({
                ...shares,
                [activeTicker]: {
                    shares: currentShares + maxShares,
                    price: avgPrice,
                    amountInvested: amountInvested + newInvestment,
                },
            });

            setCash(cash - newInvestment);

            localStorage.setItem(
                "tradeHistory",
                JSON.stringify([
                    ...tradeHistory,
                    {
                        ticker: activeTicker,
                        type: "buy",
                        shares: maxShares,
                        price: sharePrice,
                    },
                ]),
            );
        }
    }

    function sellMax(ticker = activeTicker) {
        const sharePrice = Number(getClosePrice(ticker));
        const numberOfShares = shares[ticker].shares;
        const amountInvested = Number(shares[ticker].amountInvested);

        if (numberOfShares > 0) {
            setShares({ ...shares, [ticker]: { shares: 0, price: 0, amountInvested: 0 } });
            setCash(cash + sharePrice * numberOfShares);
            const tradeHistory = JSON.parse(localStorage.getItem("tradeHistory")) ?? [];
            localStorage.setItem(
                "tradeHistory",
                JSON.stringify([
                    ...tradeHistory,
                    {
                        ticker: ticker,
                        type: "sell",
                        shares: numberOfShares,
                        price: sharePrice,
                        return: (numberOfShares * sharePrice - amountInvested) / amountInvested,
                    },
                ]),
            );
        }
    }

    function addChartData() {
        if (spyData?.bars && index < spyData?.bars?.SPY.length) {
            setNetWorthHistory([
                ...netWorthHistory,
                {
                    netWorth: Math.floor(cash + equity),
                    spyPrice: spyData.bars.SPY[index - 1].c,
                    duration: convertDuration(dayjs(currentDay).diff(startingDay, "month")),
                },
            ]);
            setCurrentDay(spyData?.bars?.SPY[index].t);
            setSPYChartData([
                ...spyChartData,
                { t: convertDuration(dayjs(currentDay).diff(startingDay, "month")), c: spyData.bars.SPY[index].c },
            ]);
            if (tqqqData?.bars?.TQQQ?.length && index < tqqqData?.bars?.TQQQ.length) {
                setTQQQChartData([
                    ...tqqqChartData,
                    {
                        t: convertDuration(dayjs(currentDay).diff(startingDay, "month")),
                        c: tqqqData.bars.TQQQ[index].c,
                    },
                ]);
            }
            if (nflxData?.bars?.NFLX?.length && index < nflxData?.bars?.NFLX.length) {
                setNFLXChartData([
                    ...nflxChartData,
                    {
                        t: convertDuration(dayjs(currentDay).diff(startingDay, "month")),
                        c: nflxData.bars.NFLX[index].c,
                    },
                ]);
            }
            if (tltData?.bars?.TLT?.length && index < tltData?.bars?.TLT.length) {
                setTLTChartData([
                    ...tltChartData,
                    { t: convertDuration(dayjs(currentDay).diff(startingDay, "month")), c: tltData.bars.TLT[index].c },
                ]);
            }
            if (bacData?.bars?.BAC?.length && index < bacData?.bars?.BAC.length) {
                setBACChartData([
                    ...bacChartData,
                    { t: convertDuration(dayjs(currentDay).diff(startingDay, "month")), c: bacData.bars.BAC[index].c },
                ]);
            }
            if (lplData?.bars?.LPL?.length && index < lplData?.bars?.LPL.length) {
                setLPLChartData([
                    ...lplChartData,
                    { t: convertDuration(dayjs(currentDay).diff(startingDay, "month")), c: lplData.bars.LPL[index].c },
                ]);
            }
            if (koData?.bars?.KO?.length && index < koData?.bars?.KO.length) {
                setKOChartData([
                    ...koChartData,
                    { t: convertDuration(dayjs(currentDay).diff(startingDay, "month")), c: koData.bars.KO[index].c },
                ]);
            }
            index++;
        } else if (!gameOver) {
            // game over
            // calculate and save performance data
            gameOver = true;
            let performanceData = [];
            let spyReturn = 0;
            let netWorthReturn = 0;

            let spyLocalData = [];
            let tqqqLocalData = [];
            let nflxLocalData = [];
            let tltLocalData = [];
            let lplLocalData = [];
            let koLocalData = [];
            let bacLocalData = [];

            tickers.forEach((ticker) => sellMax(ticker));

            for (let i = 1; i < netWorthHistory.length; i++) {
                // stock data
                spyLocalData.push({
                    c: spyData.bars.SPY[i].c,
                    t:
                        startingIndex > index
                            ? ""
                            : convertDuration(dayjs(spyData.bars.SPY[i].t).diff(startingDay, "month")),
                });
                tqqqLocalData.push({
                    c: tqqqData.bars.TQQQ[i].c,
                    t:
                        startingIndex > index
                            ? ""
                            : convertDuration(dayjs(tqqqData.bars.TQQQ[i].t).diff(startingDay, "month")),
                });
                nflxLocalData.push({
                    c: nflxData.bars.NFLX[i].c,
                    t:
                        startingIndex > index
                            ? ""
                            : convertDuration(dayjs(nflxData.bars.NFLX[i].t).diff(startingDay, "month")),
                });
                tltLocalData.push({
                    c: tltData.bars.TLT[i].c,
                    t:
                        startingIndex > index
                            ? ""
                            : convertDuration(dayjs(tltData.bars.TLT[i].t).diff(startingDay, "month")),
                });
                bacLocalData.push({
                    c: bacData.bars.BAC[i].c,
                    t:
                        startingIndex > index
                            ? ""
                            : convertDuration(dayjs(bacData.bars.BAC[i].t).diff(startingDay, "month")),
                });
                koLocalData.push({
                    c: koData.bars.KO[i].c,
                    t:
                        startingIndex > index
                            ? ""
                            : convertDuration(dayjs(koData.bars.KO[i].t).diff(startingDay, "month")),
                });
                lplLocalData.push({
                    c: lplData.bars.LPL[i].c,
                    t:
                        startingIndex > index
                            ? ""
                            : convertDuration(dayjs(lplData.bars.LPL[i].t).diff(startingDay, "month")),
                });
                // performance data
                spyReturn += Number(
                    formatNumber(
                        ((netWorthHistory[i].spyPrice - netWorthHistory[i - 1].spyPrice) /
                            netWorthHistory[i - 1].spyPrice) *
                            100,
                    ),
                );
                netWorthReturn += Number(
                    formatNumber(
                        ((netWorthHistory[i].netWorth - netWorthHistory[i - 1].netWorth) /
                            netWorthHistory[i - 1].netWorth) *
                            100,
                    ),
                );
                performanceData.push({
                    SPY: Number(formatNumber(spyReturn)),
                    netWorth: Number(formatNumber(netWorthReturn)),
                    duration: netWorthHistory[i].duration,
                });
            }
            // set local storage items
            localStorage.setItem("performanceData", JSON.stringify(performanceData));
            localStorage.setItem(
                "userData",
                JSON.stringify({
                    netWorth: cash + equity,
                    totalReturn,
                    annualReturn,
                    duration: convertDuration(dayjs(currentDay).diff(startingDay, "month")),
                }),
            );

            localStorage.setItem("spyData", JSON.stringify(spyLocalData));
            localStorage.setItem("tqqqData", JSON.stringify(tqqqLocalData));
            localStorage.setItem("nflxData", JSON.stringify(nflxLocalData));
            localStorage.setItem("tltData", JSON.stringify(tltLocalData));
            localStorage.setItem("bacData", JSON.stringify(bacLocalData));
            localStorage.setItem("lplData", JSON.stringify(lplLocalData));
            localStorage.setItem("koData", JSON.stringify(koLocalData));
        }
    }

    function getClosePrice(ticker) {
        switch (ticker) {
            case "SPY":
                if (spyData?.bars?.SPY?.length) {
                    let indexOffset = 1;
                    while (index - indexOffset >= spyData.bars.SPY.length) {
                        indexOffset++;
                    }
                    return spyData?.bars.SPY[index - indexOffset].c;
                }
            case "TQQQ":
                if (tqqqData?.bars?.TQQQ?.length) {
                    let indexOffset = 1;
                    while (index - indexOffset >= tqqqData.bars.TQQQ.length) {
                        indexOffset++;
                    }
                    return tqqqData?.bars.TQQQ[index - indexOffset].c;
                }
            case "NFLX":
                if (nflxData?.bars?.NFLX?.length) {
                    let indexOffset = 1;
                    while (index - indexOffset >= nflxData.bars.NFLX.length) {
                        indexOffset++;
                    }
                    return nflxData?.bars.NFLX[index - indexOffset].c;
                }
            case "TLT":
                if (tltData?.bars?.TLT?.length) {
                    let indexOffset = 1;
                    while (index - indexOffset >= tltData.bars.TLT.length) {
                        indexOffset++;
                    }
                    return tltData?.bars.TLT[index - indexOffset].c;
                }
            case "LPL":
                if (lplData?.bars?.LPL?.length) {
                    let indexOffset = 1;
                    while (index - indexOffset >= lplData.bars.LPL.length) {
                        indexOffset++;
                    }
                    return lplData?.bars.LPL[index - indexOffset].c;
                }
            case "BAC":
                if (bacData?.bars?.BAC?.length) {
                    let indexOffset = 1;
                    while (index - indexOffset >= bacData.bars.BAC.length) {
                        indexOffset++;
                    }
                    return bacData?.bars.BAC[index - indexOffset].c;
                }
            case "KO":
                if (koData?.bars?.KO?.length) {
                    let indexOffset = 1;
                    while (index - indexOffset >= koData.bars.KO.length) {
                        indexOffset++;
                    }
                    return koData?.bars.KO[index - indexOffset].c;
                }
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
        if (
            (!loadingSpy && !loadingTqqq && !loadingNflx && !loadingBac && !loadingTlt && !loadingLpl && !loadingKo) ||
            localStorage.getItem("userData")
        ) {
            setLoading(false);
        }
    }, [loadingSpy, loadingTqqq, loadingNflx, loadingBac, loadingTlt, loadingLpl, loadingKo]);

    // on page load get stock data
    useEffect(() => {
        if (!localStorage.getItem("spyData")) {
            getSpyData();
        } else {
            setSPYChartData(JSON.parse(localStorage.getItem("spyData")));
        }
        if (!localStorage.getItem("tqqqData")) {
            getTqqqData();
        } else {
            setTQQQChartData(JSON.parse(localStorage.getItem("tqqqData")));
        }
        if (!localStorage.getItem("nflxData")) {
            getNflxData();
        } else {
            setNFLXChartData(JSON.parse(localStorage.getItem("nflxData")));
        }
        if (!localStorage.getItem("bacData")) {
            getBacData();
        } else {
            setBACChartData(JSON.parse(localStorage.getItem("bacData")));
        }
        if (!localStorage.getItem("tltData")) {
            getTltData();
        } else {
            setTLTChartData(JSON.parse(localStorage.getItem("tltData")));
        }
        if (!localStorage.getItem("lplData")) {
            getLplData();
        } else {
            setLPLChartData(JSON.parse(localStorage.getItem("lplData")));
        }
        if (!localStorage.getItem("koData")) {
            getKoData();
        } else {
            setKOChartData(JSON.parse(localStorage.getItem("koData")));
        }
        setUserData(JSON.parse(localStorage.getItem("userData")));
    }, []);

    // set equity
    useEffect(() => {
        if (spyData?.bars) {
            spyEquity = Math.abs(shares.SPY.shares) * Number(getClosePrice("SPY"));
        }
        if (tqqqData?.bars) {
            tqqqEquity = Math.abs(shares.TQQQ.shares) * Number(getClosePrice("TQQQ"));
        }
        if (nflxData?.bars) {
            nflxEquity = Math.abs(shares.NFLX.shares) * Number(getClosePrice("NFLX"));
        }
        if (tltData?.bars) {
            tltEquity = Math.abs(shares.TLT.shares) * Number(getClosePrice("TLT"));
        }
        if (bacData?.bars) {
            bacEquity = Math.abs(shares.BAC.shares) * Number(getClosePrice("BAC"));
        }
        if (lplData?.bars) {
            lplEquity = Math.abs(shares.LPL.shares) * Number(getClosePrice("LPL"));
        }
        if (koData?.bars) {
            koEquity = Math.abs(shares.KO.shares) * Number(getClosePrice("KO"));
        }
        setEquity(spyEquity + tqqqEquity + nflxEquity + tltEquity + bacEquity + lplEquity + koEquity);
    }, [index, shares]);

    // set return
    useEffect(() => {
        const days = Number(dayjs(currentDay).diff(startingDay, "day"));
        const newTotalReturn = (cash + equity - startingCash) / startingCash;
        const newAnnualReturn = newTotalReturn > 0 ? Math.pow(1 + newTotalReturn, 365 / days) - 1 : 0;

        setTotalReturn(newTotalReturn);
        setAnnualReturn(newAnnualReturn);
    }, [equity]);

    // set initial stock data when loaded
    useEffect(() => {
        if (!loading) {
            if (spyData?.bars?.SPY?.length) {
                setStartingDay(spyData?.bars?.SPY[startingIndex].t);
                setCurrentDay(spyData?.bars?.SPY[startingIndex].t);
                setSPYChartData(
                    spyData?.bars?.SPY.slice(0, startingIndex).map((day) => {
                        return { c: day.c };
                    }),
                );
            }
            if (tqqqData?.bars?.TQQQ?.length) {
                // localStorage.setItem("tqqqData", JSON.stringify(tqqqData.bars.TQQQ));
                setTQQQChartData(
                    tqqqData?.bars?.TQQQ.slice(0, startingIndex).map((day) => {
                        return { c: day.c };
                    }),
                );
            }
            if (nflxData?.bars?.NFLX?.length) {
                // localStorage.setItem("nflxData", JSON.stringify(nflxData.bars.NFLX));
                setNFLXChartData(
                    nflxData?.bars?.NFLX.slice(0, startingIndex).map((day) => {
                        return { c: day.c };
                    }),
                );
            }
            if (tltData?.bars?.TLT?.length) {
                // localStorage.setItem("tltData", JSON.stringify(tltData.bars.TLT));
                setTLTChartData(
                    tltData?.bars?.TLT.slice(0, startingIndex).map((day) => {
                        return { c: day.c };
                    }),
                );
            }
            if (bacData?.bars?.BAC?.length) {
                // localStorage.setItem("bacData", JSON.stringify(bacData.bars.BAC));
                setBACChartData(
                    bacData?.bars?.BAC.slice(0, startingIndex).map((day) => {
                        return { c: day.c };
                    }),
                );
            }
            if (lplData?.bars?.LPL?.length) {
                // localStorage.setItem("lplData", JSON.stringify(lplData.bars.LPL));
                setLPLChartData(
                    lplData?.bars?.LPL.slice(0, startingIndex).map((day) => {
                        return { c: day.c };
                    }),
                );
            }
            if (koData?.bars?.KO?.length) {
                // localStorage.setItem("koData", JSON.stringify(koData.bars.KO));
                setKOChartData(
                    koData?.bars?.KO.slice(0, startingIndex).map((day) => {
                        return { c: day.c };
                    }),
                );
            }
        }
    }, [loading]);

    // set interval
    useEffect(() => {
        if (startGame && !gameOver) {
            const timer = setInterval(() => addChartData(), speed);
            return () => clearInterval(timer);
        }
    });

    return (
        <>
            <div className="flex justify-center">
                {loading ? (
                    <div className="loading loading-spinner"></div>
                ) : spyError || tqqqError || nflxError || tltError || lplError || bacError || koError ? (
                    <div>Error fetching data</div>
                ) : (
                    <div>
                        <div className="flex justify-between m-2">
                            <div className="stats shadow">
                                <div className="stat w-60">
                                    <div className="stat-title">Net Worth</div>
                                    <div className="stat-value">
                                        {userData
                                            ? formatCurrency(userData?.netWorth, 0)
                                            : formatCurrency(cash + equity, 0)}
                                    </div>
                                </div>
                                <div className="stat w-60">
                                    <div className="stat-title">Cash</div>
                                    <div className="stat-value">
                                        {userData ? formatCurrency(userData?.netWorth, 0) : formatCurrency(cash, 0)}
                                    </div>
                                </div>
                                <div className="stat flex">
                                    <div className="stat">
                                        <div className="stat-title w-36">Total Return</div>
                                        <div className="stat-value">
                                            {userData
                                                ? formatNumber(userData?.totalReturn, "percent", 0, 0)
                                                : formatNumber(totalReturn, "percent", 0, 0)}
                                        </div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-title w-28">Annual Return</div>
                                        <div className="stat-value">
                                            {userData
                                                ? formatNumber(userData?.annualReturn, "percent", 0, 0)
                                                : formatNumber(startGame ? annualReturn : 0, "percent", 0, 0)}
                                        </div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-title">Duration</div>
                                        <div className="stat-value">
                                            {userData
                                                ? userData?.duration
                                                : convertDuration(dayjs(currentDay).diff(startingDay, "month"))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {!userData && startGame ? (
                                <div className="flex items-center">
                                    <button
                                        className={speed == 250 ? "btn btn-success" : "btn"}
                                        onClick={() => (speed = 250)}
                                    >
                                        Slow
                                    </button>
                                    <button
                                        className={speed == 100 ? "btn btn-success" : "btn"}
                                        onClick={() => (speed = 100)}
                                    >
                                        Normal
                                    </button>
                                    <button
                                        className={speed == 10 ? "btn btn-success" : "btn"}
                                        onClick={() => (speed = 10)}
                                    >
                                        Fast
                                    </button>
                                </div>
                            ) : (
                                !userData && (
                                    <div className="flex items-center">
                                        <button
                                            className="btn bg-success text-white"
                                            onClick={() => setStartGame(true)}
                                        >
                                            Start Game
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                        <div className="flex gap-4">
                            <div className="stat max-w-40">
                                <div className="stat-title">Close</div>
                                <div className="stat-value">{formatNumber(getClosePrice(activeTicker) ?? 0)}</div>
                            </div>
                            <div className="flex flex-col">
                                <button className="btn m-1 bg-green-800 w-24" onClick={buy}>
                                    Buy 100
                                </button>
                                <button className="btn m-1 bg-green-800 w-24" onClick={buyMax}>
                                    Buy Max
                                </button>
                            </div>
                            <div className="flex flex-col">
                                <button className="btn m-1 bg-red-800 w-24" onClick={sell}>
                                    Sell 100
                                </button>

                                <button className="btn m-1 bg-red-800 w-24" onClick={() => sellMax()}>
                                    Sell Max
                                </button>
                            </div>
                        </div>
                        <div className="flex mt-2">
                            <ul className="menu gap-2 bg-base-200 w-44">
                                <div>Stocks</div>
                                {tickers.map((ticker) => (
                                    <li key={ticker}>
                                        <a
                                            className={
                                                ticker == activeTicker
                                                    ? "active flex justify-between"
                                                    : "flex justify-between"
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
                                                <p
                                                    className={myShares == 0 ? "hidden" : ""}
                                                >{`@ ${formatNumber(price)}`}</p>
                                                <p
                                                    className={
                                                        pnl > 0 ? "text-success" : pnl == 0 ? "" : "text-red-600"
                                                    }
                                                >
                                                    {myShares == 0 ? "--" : formatNumber(pnl, "percent", 0, 0)}
                                                </p>
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                            {activeTicker == "SPY" && (
                                <StockChart chartData={spyChartData} xDataKey={"t"} yDataKey={"c"} />
                            )}
                            {activeTicker == "TQQQ" && (
                                <StockChart chartData={tqqqChartData} xDataKey={"t"} yDataKey={"c"} />
                            )}
                            {activeTicker == "NFLX" && (
                                <StockChart chartData={nflxChartData} xDataKey={"t"} yDataKey={"c"} />
                            )}
                            {activeTicker == "TLT" && (
                                <StockChart chartData={tltChartData} xDataKey={"t"} yDataKey={"c"} />
                            )}
                            {activeTicker == "BAC" && (
                                <StockChart chartData={bacChartData} xDataKey={"t"} yDataKey={"c"} />
                            )}
                            {activeTicker == "LPL" && (
                                <StockChart chartData={lplChartData} xDataKey={"t"} yDataKey={"c"} />
                            )}
                            {activeTicker == "KO" && (
                                <StockChart chartData={koChartData} xDataKey={"t"} yDataKey={"c"} />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
