export type SizeTuples = [number, number];
export type Piece = {
    clone: () => HTMLElement;
    style: (props: Record<string, string>) => void;
};
export type Cell = {
    DOM: () => ChildNode | null;
    style: (props: Record<string, string>) => "OOB" | null;
    place: (piece: Node, cleanCell?: boolean) => "OOB" | null;
    rid: () => "OOB" | null;
    on: (ev: string, func: () => void) => "OOB" | null;
    removeOn: (ev: string, func: () => void) => "OOB" | null;
    get: () => ChildNode | "OOB" | null | undefined;
    where: () => SizeTuples | "OOB" | null;
};
export type Board = {
    DOM: () => HTMLElement;
    matrix: () => (string | null)[][];
    rows: () => number;
    cols: () => number;
    style: (props: Record<string, string>) => void;
    removeEvents: (ev: string, func: () => void) => void;
    clean: () => void;
    cell: (arr: [number, number] | HTMLElement | "each", move?: number) => Cell;
};
type PieceProps = Partial<CSSStyleDeclaration> & {
    text: string;
};
type Init = {
    attach: string;
    size: string;
    style: string;
    stylePattern?: [string, string];
};
declare const jsboard: {
    board: (props: Init) => Board | undefined;
    piece: (props: PieceProps, datasets?: Record<string, string>) => Piece;
};
export default jsboard;
