export type UiGridLayout = "classic" | "stacked" | "grouped";

export const layoutOptions: { id: UiGridLayout; label: string; description: string }[] = [
    {
        id: "classic",
        label: "Classic",
        description: "Problems left, description center, code/submissions right."
    },
    {
        id: "stacked",
        label: "Split Left",
        description: "Problems top-left, description bottom-left, code/submissions right."
    },
    {
        id: "grouped",
        label: "Grouped Switch",
        description: "One left section with a Problems/Description switch, code/submissions right."
    }
];
