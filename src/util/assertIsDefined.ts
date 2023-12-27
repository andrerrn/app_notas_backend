export function assertIsDefined<T>(val:T): asserts val is NonNullable<T> {
    if (!val ) {
        throw Error("Esperado valor 'val' ser definido, mas foi recebido " + val);
    }
}