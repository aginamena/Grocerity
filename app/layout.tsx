import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";
// import NavigationBar from "@/components/NavigationBar";

export const metadata: Metadata = {
  title: "AI Made Simple",
  description:
    "Unlock the power of AI with our free guide and 7-day plan. Learn how to use AI tools effectively and boost your productivity today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
 window._mfq = window._mfq || [];
  (function() {
    var mf = document.createElement("script");
    mf.type = "text/javascript"; mf.defer = true;
    mf.src = "//cdn.mouseflow.com/projects/2d7ea231-2812-400d-b6c6-73797b9636a4.js";
    document.getElementsByTagName("head")[0].appendChild(mf);
  })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeRegistry>
          {/* <NavigationBar /> */}
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
