import type { V1ObjectMeta } from "@kubernetes/client-node";

import { LABEL_PREFIX, LEGACY_LABEL_PREFIX } from "./kubernetes.constants";

type KubernetesResource = { metadata?: V1ObjectMeta };

/**
 * Reads an annotation, falling back to the legacy `comet-dxp.com/*` annotation for resources that
 * haven't been migrated to the `dextinity.com/*` prefix yet.
 */
export function getAnnotation(resource: KubernetesResource, annotation: string): string | undefined {
    const annotations = resource.metadata?.annotations;
    return annotations?.[annotation] ?? annotations?.[toLegacyName(annotation)];
}

/**
 * Reads a label, falling back to the legacy `comet-dxp.com/*` label for resources that haven't been
 * migrated to the `dextinity.com/*` prefix yet.
 */
export function getLabel(resource: KubernetesResource, label: string): string | undefined {
    const labels = resource.metadata?.labels;
    return labels?.[label] ?? labels?.[toLegacyName(label)];
}

/**
 * Kubernetes label selectors can't express OR, so a selector using `dextinity.com/*` labels never matches
 * resources that are still labeled with the legacy `comet-dxp.com/*` prefix. Such selectors are queried
 * again with the legacy prefix if they don't match any resource.
 *
 * Returns undefined if the selector doesn't contain a `dextinity.com/*` label, as no second query is possible then.
 */
export function toLegacyLabelSelector(labelSelector: string): string | undefined {
    if (!labelSelector.includes(`${LABEL_PREFIX}/`)) {
        return undefined;
    }

    return labelSelector.replaceAll(`${LABEL_PREFIX}/`, `${LEGACY_LABEL_PREFIX}/`);
}

/** Returns the legacy `comet-dxp.com/*` name of a `dextinity.com/*` label or annotation */
export function toLegacyName(name: string): string {
    if (!name.startsWith(`${LABEL_PREFIX}/`)) {
        return name;
    }

    return `${LEGACY_LABEL_PREFIX}/${name.slice(LABEL_PREFIX.length + 1)}`;
}
