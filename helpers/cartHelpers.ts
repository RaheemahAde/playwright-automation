import { Page } from '@playwright/test';

export async function addToCartByProductName(page: Page, productName: string) {
  const product = page.locator('[data-test="inventory-item"]', {
    hasText: productName,
  });
  await product.getByRole('button', { name: 'Add to cart' }).click();
}

export async function removeItemFromCart(page: Page, productId: string) {
  const remove = page.getByTestId(productId);
  await remove.click();
}
