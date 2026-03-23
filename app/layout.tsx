import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";
// import NavigationBar from "@/components/NavigationBar";

export const metadata: Metadata = {
  title: "Grocerity",
  description:
    "Grocerity is a platform that helps boutique owners automate their business, allowing them to focus on higher-level activities while lower-level tasks are handled automatically.",
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
