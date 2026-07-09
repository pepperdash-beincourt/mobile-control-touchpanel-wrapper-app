import classes from './controlSystemOffline.module.scss';
import logoUrl from '../../assets/mobile-control-pdt-logo.svg';
import { useAppSelector } from '../../store/hooks';
import {
  selectCustomLogoUrlDark,
  selectCustomLogoUrlLight,
} from '../../store/slices';

function ControlSystemDisconnected() {
  const customLogoUrlLight = useAppSelector(selectCustomLogoUrlLight);
  const customLogoUrlDark = useAppSelector(selectCustomLogoUrlDark);

  // Whichever join has a URL determines both the logo shown and the background/text
  // treatment it's designed for. If neither is configured, fall back to the default
  // (light-background) PepperDash logo.
  const isDark = Boolean(customLogoUrlDark);
  const logoSrc = customLogoUrlDark || customLogoUrlLight || logoUrl;

  return (
    <div className={isDark ? classes.containerDark : classes.containerLight}>
      <img src={logoSrc} className={`${classes.logo}`}></img>
      <h1>Control System Offline</h1>
    </div>
  );
}

export default ControlSystemDisconnected;
