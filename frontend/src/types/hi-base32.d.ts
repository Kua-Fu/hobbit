declare module 'hi-base32' {
    export function encode(input: string | ArrayBuffer | number[] | Uint8Array): string;
    export function decode(input: string): string;
}
