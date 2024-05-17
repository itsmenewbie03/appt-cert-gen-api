import { database } from '../db/mongo';
import type { RefreshToken } from '../models/RefreshToken';
import type { Collection } from 'mongodb';
const add_new_refresh_token = async (refresh_token: RefreshToken) => {
  return await database.collection('refresh_tokens').insertOne(refresh_token);
};
const find_refresh_token_by = async (
  refresh_token_query: Partial<RefreshToken>,
) => {
  const refresh_tokens: Collection<RefreshToken> =
    database.collection('refresh_tokens');
  const refresh_token = await refresh_tokens
    .find({ ...refresh_token_query }, { projection: { _id: 0 } })
    .toArray();
  return refresh_token;
};

const delete_refresh_token_by = async (
  refresh_token_query: Partial<RefreshToken>,
) => {
  const refresh_tokens: Collection<RefreshToken> =
    database.collection('refresh_tokens');
  const delete_result = await refresh_tokens.deleteOne({
    ...refresh_token_query,
  });
  return delete_result;
};
export {
  add_new_refresh_token,
  find_refresh_token_by,
  delete_refresh_token_by,
};
