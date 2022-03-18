export abstract class Scraper {
  readonly url: string;

  public abstract login(): Promise<void>;

  public abstract logout(): Promise<void>;
}
