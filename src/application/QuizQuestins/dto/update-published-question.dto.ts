import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdatePublishedQuestionDto {
  @IsNotEmpty()
  @IsBoolean()
  public published: boolean;
}
