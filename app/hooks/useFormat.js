import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default function useFormat() {
    function formatDate(date, format = "D MMM YYYY") {
        return dayjs(date).format(format);
    }
    function formatCurrency(number, fractionDigits = 2) {
        return Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: fractionDigits,
        }).format(number);
    }
    function formatNumber(number, style = "decimal", maximumFractionDigits = 2, minimumFractionDigits = 2) {
        return Intl.NumberFormat("en-US", {
            style,
            maximumFractionDigits,
            minimumFractionDigits,
        }).format(number);
    }
    function timeFromNow(time) {
        return dayjs(time).fromNow();
    }
    function addToDate(date, number, unit) {
        return dayjs(date).add(number, unit).format("D MMM YYYY");
    }

    return {
        formatDate,
        formatCurrency,
        formatNumber,
        timeFromNow,
        addToDate,
    };
}
