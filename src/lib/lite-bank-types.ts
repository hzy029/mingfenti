export type LiteBankKind = "core-extreme" | "core-rational" | "ordinary-extreme" | "ordinary-rational";

export type LiteBankEntry = {
  id: string;
  kind: LiteBankKind;
  stem: string;
  /** 与 Markdown「明粉倾向」「理性倾向」一致 */
  lean: "支持" | "反对";
  mode: "extreme" | "rational";
};
