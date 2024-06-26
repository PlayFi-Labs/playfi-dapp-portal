let analyticsLoaded = false;

async function loadRudder() {
  if (!window.rudderanalytics) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    throw new Error("Rudder not loaded");
  }
  const runtimeConfig = useRuntimeConfig();
  window.rudderanalytics.load(
    runtimeConfig.public.analytics.rudder.key,
    runtimeConfig.public.analytics.rudder.dataplaneUrl
  );
}

export async function initAnalytics(): Promise<boolean> {
  if (analyticsLoaded) return true;

  const runtimeConfig = useRuntimeConfig();
  const useRudder = Boolean(
    runtimeConfig.public.analytics.rudder.key && runtimeConfig.public.analytics.rudder.dataplaneUrl
  );

  if (!useRudder || analyticsLoaded) {
    return false;
  }

  const services = [];
  if (useRudder) services.push(loadRudder());

  await Promise.all(services);
  analyticsLoaded = true;
  return true;
}

export async function trackPage(): Promise<void> {
  if (await initAnalytics()) {
    window.rudderanalytics?.page();
  }
}

export async function trackEvent(eventName: string, params?: object): Promise<void> {
  if (await initAnalytics()) {
    window.rudderanalytics?.track(eventName, params);
  }
}
