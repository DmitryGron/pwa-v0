// Device detection utility for PWA

export type DeviceInfo = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'other';
  browser: 'safari' | 'chrome' | 'firefox' | 'edge' | 'opera' | 'other';
  isStandalone: boolean;
};

export const detectDevice = (): DeviceInfo => {
  // Default to desktop if not in browser environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      os: 'other',
      browser: 'other',
      isStandalone: false,
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  
  // Detect mobile or tablet
  const isMobile = /iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)|tablet|kindle|playbook|silk|android 3.0|(?=.*android)(?=.*mobile)/.test(userAgent) || 
                   (navigator.maxTouchPoints && navigator.maxTouchPoints > 1 && 
                   /macintosh/.test(navigator.userAgent.toLowerCase()));
  
  // OS detection
  const isIOS = /iphone|ipad|ipod/.test(userAgent) || 
                (/macintosh/.test(userAgent) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(userAgent);
  const isWindows = /windows nt/.test(userAgent);
  const isMacOS = /macintosh/.test(userAgent) && (!navigator.maxTouchPoints || navigator.maxTouchPoints <= 1);
  const isLinux = /linux/.test(userAgent) && !isAndroid;
  
  // Browser detection
  // On iOS, all browsers use WebKit, so we need to check for app-specific strings
  const isChromeIOS = /crios/.test(userAgent); // Chrome on iOS
  const isFirefoxIOS = /fxios/.test(userAgent); // Firefox on iOS
  const isEdgeIOS = /edgios/.test(userAgent); // Edge on iOS
  const isOperaIOS = /opr|opera/.test(userAgent) && isIOS;
  
  // Regular browser detection for non-iOS
  const isSafari = /safari/.test(userAgent) && !/chrome|crios/.test(userAgent);
  const isChrome = (/chrome/.test(userAgent) && !/edge|edg|opr|opera/.test(userAgent)) || isChromeIOS;
  const isFirefox = /firefox/.test(userAgent) || isFirefoxIOS;
  const isEdge = /edge|edg/.test(userAgent) || isEdgeIOS;
  const isOpera = /opr|opera/.test(userAgent) || isOperaIOS;
  
  // Standalone mode (PWA installed)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (('standalone' in window.navigator) && (window.navigator as unknown as { standalone: boolean }).standalone === true);
  
  let os: DeviceInfo['os'] = 'other';
  if (isIOS) os = 'ios';
  else if (isAndroid) os = 'android';
  else if (isWindows) os = 'windows';
  else if (isMacOS) os = 'macos';
  else if (isLinux) os = 'linux';
  
  // Determine browser with iOS priority
  let browser: DeviceInfo['browser'] = 'other';
  if (isChromeIOS) browser = 'chrome';
  else if (isFirefoxIOS) browser = 'firefox';
  else if (isEdgeIOS) browser = 'edge';
  else if (isOperaIOS) browser = 'opera';
  else if (isSafari) browser = 'safari';
  else if (isChrome) browser = 'chrome';
  else if (isFirefox) browser = 'firefox';
  else if (isEdge) browser = 'edge';
  else if (isOpera) browser = 'opera';
  else browser = 'other';
  
  return {
    isMobile: Boolean(isMobile),
    isTablet: Boolean(isTablet),
    isDesktop: !isMobile && !isTablet,
    os,
    browser,
    isStandalone: Boolean(isStandalone),
  };
};
