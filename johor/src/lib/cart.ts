import { getPackageSaleTierById } from "../data/package-details";

export const CART_STORAGE_KEY = "jhor_cart_items";
export const CART_UPDATED_EVENT = "jhor-cart:updated";
export const CART_TOAST_EVENT = "jhor-cart:toast";
export const CART_OPEN_EVENT = "jhor-cart:open";

export type PackageType = "identity" | "campaign";

export type CartItem = {
  id: string;
  packageId: string;
  packageTitle: string;
  tierId: string;
  tierName: string;
  previewImage?: string;
  price?: string;
  quantity: number;
  addedAt: string;
  packageType?: PackageType;
};

export type CartToastDetail = {
  message: string;
};

type AddCartItemInput = {
  packageId: string;
  packageTitle: string;
  tierId: string;
  tierName: string;
  previewImage?: string;
  price?: string;
  packageType?: PackageType;
};

export function hasIdentityPackage(items: CartItem[]): boolean {
  return items.some((item) => item.packageType === "identity");
}

export type PaymentSplit = {
  mode: "split" | "full";
  amountDueNow: number;
  amountDueLater: number;
};

export function computePaymentSplit(items: CartItem[], totalSAR: number): PaymentSplit {
  if (hasIdentityPackage(items)) {
    const amountDueNow = Math.round(totalSAR * 0.6 * 100) / 100;
    return { mode: "split", amountDueNow, amountDueLater: Math.round((totalSAR - amountDueNow) * 100) / 100 };
  }
  return { mode: "full", amountDueNow: totalSAR, amountDueLater: 0 };
}

function resolveCartItemPrice(item: CartItem): string | undefined {
  if (typeof item.price === "string" && item.price.trim()) {
    return item.price.trim();
  }

  const tier = getPackageSaleTierById(item.packageId, item.tierId);
  if (typeof tier?.price === "string" && tier.price.trim()) {
    return tier.price.trim();
  }

  return undefined;
}

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item): item is CartItem =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as { id?: unknown }).id === "string" &&
          typeof (item as { packageId?: unknown }).packageId === "string" &&
          typeof (item as { tierId?: unknown }).tierId === "string",
      )
      .map((item) => {
        const cartItem = { ...item, quantity: (item as CartItem).quantity ?? 1 };
        return {
          ...cartItem,
          price: resolveCartItemPrice(cartItem),
        };
      });
  } catch {
    return [];
  }
}

function persistCartItems(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: { items } }));
}

function emitToast(message: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<CartToastDetail>(CART_TOAST_EVENT, {
      detail: { message },
    }),
  );
}

export function requestOpenCart() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(CART_OPEN_EVENT));
}

export function addCartItem(input: AddCartItemInput) {
  if (typeof window === "undefined") {
    return { added: false };
  }

  const current = getCartItems();
  const id = `${input.packageId}:${input.tierId}`;
  const exists = current.some((item) => item.id === id);

  if (exists) {
    emitToast("هذه الباقة موجودة بالفعل في السلة.");
    return { added: false };
  }

  const nextItem: CartItem = {
    id,
    packageId: input.packageId,
    packageTitle: input.packageTitle,
    tierId: input.tierId,
    tierName: input.tierName,
    previewImage: input.previewImage,
    price: input.price,
    quantity: 1,
    addedAt: new Date().toISOString(),
    packageType: input.packageType,
  };

  const nextItems = [...current, nextItem];
  persistCartItems(nextItems);
  emitToast("تمت إضافة الباقة إلى السلة.");

  return { added: true };
}

export function removeCartItem(itemId: string) {
  if (typeof window === "undefined") {
    return { removed: false };
  }

  const current = getCartItems();
  const nextItems = current.filter((item) => item.id !== itemId);

  if (nextItems.length === current.length) {
    return { removed: false };
  }

  persistCartItems(nextItems);
  emitToast("تم حذف العنصر من السلة.");
  return { removed: true };
}

export function updateCartItemQuantity(itemId: string, quantity: number) {
  if (typeof window === "undefined") return;
  const current = getCartItems();
  const nextItems = current.map((item) =>
    item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item,
  );
  persistCartItems(nextItems);
}

export function clearCartItems() {
  if (typeof window === "undefined") {
    return { cleared: false };
  }

  const current = getCartItems();
  if (!current.length) {
    return { cleared: false };
  }

  persistCartItems([]);
  emitToast("تم تفريغ السلة.");
  return { cleared: true };
}
