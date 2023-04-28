export type ItemDetailModel = {
  id?: string;
  description: string;
  size: string;
  image?: string;
  tags?: string[];
  temperature: 0 | 30 | 40 | 50;
  dryerFriendly: boolean;
  ironingFriendly: boolean;
  whiteningFriendly: boolean;
};
