import { MasterLayout } from "@dextinity/admin";
import { AiModeFlyout, aiModeFlyoutWidth, useAiMode } from "@dextinity/cms-admin";

import MasterHeader from "./MasterHeader";
import { AppMasterMenu, AppMasterMenuRoutes } from "./MasterMenu";

export function AppMasterLayout() {
    const { isEnabled: isAiModeEnabled, isOpen: isAiModeOpen } = useAiMode();

    return (
        <MasterLayout
            headerComponent={MasterHeader}
            menuComponent={AppMasterMenu}
            slotProps={{
                contentWrapper: {
                    // Clamping via max-width rather than width, because the content wrapper's flex-grow
                    // would otherwise immediately re-absorb the space freed up for the flyout. When the flyout is
                    // closed, the max-width equals the wrapper's own width, so that it has a value to transition from.
                    // The transition matches the `Slide` of the flyout.
                    sx: isAiModeEnabled
                        ? (theme) => ({
                              [theme.breakpoints.up("md")]: {
                                  maxWidth: isAiModeOpen
                                      ? `calc(100% - var(--dextinity-admin-master-layout-menu-width) - ${aiModeFlyoutWidth}px)`
                                      : "calc(100% - var(--dextinity-admin-master-layout-menu-width))",
                                  transition: theme.transitions.create(
                                      "max-width",
                                      isAiModeOpen
                                          ? { duration: theme.transitions.duration.enteringScreen, easing: theme.transitions.easing.easeOut }
                                          : { duration: theme.transitions.duration.leavingScreen, easing: theme.transitions.easing.sharp },
                                  ),
                              },
                          })
                        : undefined,
                },
            }}
        >
            <AppMasterMenuRoutes />
            <AiModeFlyout />
        </MasterLayout>
    );
}
