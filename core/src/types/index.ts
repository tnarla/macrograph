import { EnumType } from "./enum";
import { ListType } from "./list";
import { OptionType } from "./option";
import { BasePrimitiveType, PrimitiveType } from "./primitive";
import { StructType } from "./struct";
import { WildcardType } from "./wildcard";

export * from "./list";
export * from "./option";
export * from "./any";
export * from "./primitive";
export * from "./wildcard";
export * from "./enum";
export * from "./struct";
export * as t from "./t";

export type TypeVariant =
  | "primitive"
  | "list"
  | "option"
  | "wildcard"
  | "enum"
  | "struct";
// | "map"
// | "set"

export type AnyType =
  | PrimitiveType
  | ListType
  | OptionType<AnyType>
  | WildcardType
  | EnumType<any>
  | StructType<any>;

export function typesCanConnect(a: AnyType, b: AnyType): boolean {
  const aInner = a instanceof WildcardType ? a.wildcard.value.unwrapOr(a) : a;
  const bInner = b instanceof WildcardType ? b.wildcard.value.unwrapOr(b) : b;

  if (aInner instanceof WildcardType || bInner instanceof WildcardType)
    return true;

  if (
    aInner instanceof BasePrimitiveType &&
    bInner instanceof BasePrimitiveType
  )
    return aInner.primitiveVariant() === bInner.primitiveVariant();

  if (aInner instanceof ListType && bInner instanceof ListType)
    return typesCanConnect(aInner.inner, bInner.inner);

  if (aInner instanceof OptionType && bInner instanceof OptionType)
    return typesCanConnect(aInner.inner, bInner.inner);

  return false;
}
