export type PasswordLoginDto = {
  username: string;
  password: string;
};

export type EthereumLoginDto = {
  message: string;
  signature: string;
};

export type NonceResponseDto = {
  nonce: string;
  requestId: string;
};

export type LoginResponseDto = {
  token: string;
};
