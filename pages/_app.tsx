import '@/styles/nprogress.css';
import '@/styles/theme.css';
import 'inter-ui/inter.css';
import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { DefaultSeo } from 'next-seo';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';
import { currentUser } from '../lib/currentUser';
import SEO from '../next-seo.config';

declare global {
    interface Window {
        analytics: any;
    }
}

const HMSThemeProvider = dynamic(
    () => import("@100mslive/react-ui").then((mod) => mod.HMSThemeProvider),
    { ssr: true }
);

const Application: NextPage<AppProps<{}>> = ({ Component, pageProps }) => {
    const router = useRouter();
    const userDetails = currentUser();
    const [count, setCount] = useState(0);
    React.useEffect(() => {
        if (!!userDetails && Object.keys(userDetails).length !== 0 && count === 0) {
            window.analytics.identify(userDetails.customer_id);
            setCount(count + 1);
        }
    }, [userDetails]);

    useEffect(() => {
        router.events.on('routeChangeStart', () => NProgress.start());
        router.events.on('routeChangeComplete', () => NProgress.done());
        router.events.on('routeChangeError', () => NProgress.done());
    }, []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getLayout = (Component as any)?.getLayout || ((page) => page)
    return (
        <>
            <DefaultSeo {...SEO} />
            <HMSThemeProvider>
                {getLayout(<Component {...pageProps} key={router.asPath} />)}
                {/* <Component {...pageProps} key={router.asPath} /> */}
            </HMSThemeProvider>
        </>
    );
};

export default Application;
