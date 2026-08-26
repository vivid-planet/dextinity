import type { ComponentNameToClassKey, ComponentsPropsList, Interpolation, Theme } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";

type OwnerState<PropsName extends keyof ComponentsPropsList> = PropsName extends keyof ComponentsPropsList
    ? { ownerState: ComponentsPropsList[PropsName] & Record<string, unknown> }
    : Record<string, unknown>;

type OverrideProps<PropsName extends keyof ComponentsPropsList> = OwnerState<PropsName> & { theme: Theme } & Record<string, unknown>;

type ClassKey<ClassesName extends keyof ComponentNameToClassKey> = ComponentNameToClassKey[ClassesName];

// Copied from https://github.com/mui/material-ui/blob/d70a45a3f2cc87521b5822bbe2b40b9b054c22f9/packages/mui-material/src/styles/overrides.ts#L121-L139.
type OverridesStyleRules<ClassKey extends string = string, ComponentName = keyof ComponentsPropsList, Theme = unknown> = Record<
    ClassKey,
    Interpolation<
        // Record<string, unknown> is for other props that the slot receive internally
        // Documenting all ownerStates could be a huge work, let's wait until we have a real needs from developers.
        (ComponentName extends keyof ComponentsPropsList
            ? ComponentsPropsList[ComponentName] &
                  Record<string, unknown> & {
                      ownerState: ComponentsPropsList[ComponentName] & Record<string, unknown>;
                  }
            : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
              {}) & {
            theme: Theme;
        } & Record<string, unknown>
    >
>;

type StyleOverrideInterpolation<ClassKey extends string = string, ComponentName = keyof ComponentsPropsList, Theme = unknown> = OverridesStyleRules<
    ClassKey,
    ComponentName,
    Theme
>[ClassKey];

const getOverridesInterpolation = <PropsName extends keyof ComponentsPropsList>(
    props: OverrideProps<PropsName>,
    overrides?: StyleOverrideInterpolation<PropsName> | undefined,
): StyleOverrideInterpolation => {
    if (typeof overrides === "undefined") {
        return {};
    }

    if (typeof overrides === "function") {
        return overrides(props);
    }

    return overrides;
};

// Overload for standard MUI components
export function mergeOverrideStyles<ComponentName extends keyof ComponentNameToClassKey & keyof ComponentsPropsList>(
    passedIn?: Partial<OverridesStyleRules<ClassKey<ComponentName>>>,
    dextinity?: Partial<OverridesStyleRules<ClassKey<ComponentName>>>,
): Partial<OverridesStyleRules<ClassKey<ComponentName>>>;

// Overload for components with custom owner state (e.g. MuiPickersTextField from `@mui/x-date-pickers`)
export function mergeOverrideStyles<TStyleOverrides extends Record<string, any>>(
    passedIn?: Partial<TStyleOverrides>,
    dextinity?: Partial<TStyleOverrides>,
): Partial<TStyleOverrides>;

export function mergeOverrideStyles(passedIn: Record<string, any> = {}, dextinity: Record<string, any> = {}): Record<string, any> {
    const mergedOverrides = { ...dextinity };

    Object.keys(passedIn).forEach((classKey: string) => {
        mergedOverrides[classKey] = (props: any) => {
            return deepmerge<StyleOverrideInterpolation>(
                getOverridesInterpolation(props, dextinity[classKey]),
                getOverridesInterpolation(props, passedIn[classKey]),
            );
        };
    });

    return mergedOverrides;
}
