export type TitleFocusTarget = "review" | "watch-memory";

export type TitleOpenOptions = {
  focusTarget?: TitleFocusTarget | null;
  watchLogId?: number;
};

export type TitleFocusIntent = {
  requestId: number;
  focusTarget: TitleFocusTarget;
  watchLogId?: number;
};
