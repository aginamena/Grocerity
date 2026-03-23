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
    mf.src = "//cdn.mouseflow.com/projects/9223a8d2-3af5-40ba-af55-bd541b2b8674.js;
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
