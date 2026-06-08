export interface CreateElementOptions {
    innerHtml?: string;
    innerText?: string;
    attribute?: Record<string, string>;
}

export type CreateElement = (
    elName: string,
    appendEl: Element,
    options?: CreateElementOptions
) => Element;
