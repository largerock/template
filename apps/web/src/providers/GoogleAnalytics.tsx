import Script from 'next/script';
import { ReactNode } from 'react';
import CONFIG, { Environment } from "@template/global-config";

const currentEnv = process.env.NEXT_PUBLIC_ENVIRONMENT as Environment;

interface GoogleAnalyticsProps {
  children?: ReactNode;
}

export default function GoogleAnalytics({ children }: GoogleAnalyticsProps) {
  const trackingId = CONFIG[currentEnv].GA_TRACKING_ID;

  return (
    <>
      {/* Google Analytics Scripts */}
      {trackingId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${trackingId}', {
                  page_path: window.location.pathname,
                  send_page_view: true
                });
              `,
            }}
          />
        </>
      )}
      {children}
    </>
  );
}
