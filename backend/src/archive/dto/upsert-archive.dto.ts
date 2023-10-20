export type IArchiveEdition = {
  time: number;
  device: string;
  active?: true;
};

export type UpsertArchiveDto = {
  version: string;
  owner: string;
  idPerUser: string;
  title: string;
  wordCount: number;
  content: string;
  public: boolean;
  editionChain: IArchiveEdition[]
};
