import { Favorite } from "./Favorite";

export interface MetaData {
    name: string;
    deleted: number[];
    favorites: Favorite[];
    currentIndex: number;
}