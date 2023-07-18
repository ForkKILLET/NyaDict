export type UpsertArchiveDto = {
  version: string;
  owner: string;
  idPerUser: string;
  title: string;
  wordCount: number;
  content: string;
  public: boolean;
};
