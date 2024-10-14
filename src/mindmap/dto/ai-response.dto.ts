export class AIResponseDto {
  data: any;
  documentsId: string[];

  constructor(data: any, documentsId: string[]) {
    (this.data = data), (this.documentsId = documentsId);
  }

  public static of(data: any, documentsId: string[]) {
    return new AIResponseDto(data, documentsId);
  }
}
