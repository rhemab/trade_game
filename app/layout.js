import Navbar from "./components/navbar";
import "./globals.css";

export const metadata = {
    title: "Trade Game",
    description: "Historical market data played back in real time.",
    icons: {
        icon: "coinIcon.png",
        apple: "coinIcon.png",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <Navbar>{children}</Navbar>
            </body>
        </html>
    );
}
