import argon2 from 'argon2';

export const hash = async (password: string) => {
  try {
    const hash = await argon2.hash(password);
    return hash;
  } catch (error) {
    throw error;
  }
};

export const verify = async (hash: string, password: string) => {
  try {
    const verify = await argon2.verify(hash, password);
    return verify;
  } catch (error) {
    throw error;
  }
};
