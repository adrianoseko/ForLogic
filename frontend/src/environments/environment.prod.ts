export interface Environment {
  production: boolean;
  baseApiUrl: string;
}

export const environment: Environment = {
  production: true,
  baseApiUrl: 'http://10.0.0.9:8000/'
};
