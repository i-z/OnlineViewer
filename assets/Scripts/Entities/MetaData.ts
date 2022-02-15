import { Favorite } from "./Favorite";
import { FileIdentificationData } from "./FileIdentificationData";

export interface MetaData {
    name: string;
    deleted: number[];
    favorites: Favorite[];
    currentIndex: number;
    idData?: FileIdentificationData;
    description?: string;
}