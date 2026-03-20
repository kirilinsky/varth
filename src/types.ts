export type TokenKeys = readonly string[];

export type DefineThemesConfig = {
  prefix?: string;
  tokens: readonly string[];
  themes: Record<string, readonly string[]>;
};

export type CSSVarItem<Prefix extends string, Keys extends TokenKeys> = {
  [K in Keys[number] as `--${Prefix}-${K}`]: string;
};
