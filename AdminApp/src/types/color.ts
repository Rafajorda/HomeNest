export interface Color {
  id: string;
  name: string;
  hexCode: string | null;
}

export interface CreateColorDto {
  name: string;
  hexCode?: string;
}
