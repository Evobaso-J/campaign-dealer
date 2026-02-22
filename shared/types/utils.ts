export type Brand<T, TBrandKey> = T & { __brand: TBrandKey };

export type I18nKey = Brand<string, "i18nKey">;
export type GeneratedText = Brand<string, "generatedText">;
