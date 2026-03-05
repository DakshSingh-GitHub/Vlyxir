export type IdeUiLayout = "classic" | "wide";

export const ideLayoutOptions: { id: IdeUiLayout; label: string; description: string }[] = [
    {
        id: "classic",
        label: "Classic",
        description: "Editor left, tools and output right."
    },
    {
        id: "wide",
        label: "Wide Stack",
        description: "Editor on top, input and output at bottom."
    }
];
