export interface ConfigFile<T = unknown> {
    path: string;
    content: T;
}
