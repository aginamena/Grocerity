"use client";

import Script from "next/script";

export default function SignupForm() {
  const handleOnLoad = () => {
    // This triggers specifically when the script has finished loading
    if (typeof window !== "undefined" && (window as any).ml) {
      (window as any).ml("account", "1579601");
    }
  };

  return (
    <div style={{ width: "100%", minHeight: "200px" }}>
      <Script
        id="mailerlite-script"
        src="https://assets.mailerlite.com/js/universal.js"
        onLoad={handleOnLoad}
      />
      <Script id="mailerlite-init" strategy="afterInteractive">
        {`
          (function(w,d,e,u,f,l,n){w[f]=w[f]||function(){(w[f].q=w[f].q||[])
          .push(arguments);},l=d.createElement(e),l.async=1,l.src=u,
          n=d.getElementsByTagName(e)[0],n.parentNode.insertBefore(l,n);})
          (window,document,'script','https://assets.mailerlite.com/js/universal.js','ml');
          ml('account', '1579601');
        `}
      </Script>

      <div className="ml-embedded" data-form="LT2cp6"></div>
    </div>
  );
}
