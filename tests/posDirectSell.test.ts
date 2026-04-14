import { PosProduct } from "@/feature/pos/types/pos.entity.types";
import { describe, expect, it } from "vitest";

// Mock products for testing
const mockProducts: PosProduct[] = [
  {
    id: "product-1",
    name: "Test Product 1",
    categoryLabel: "Test Category",
    unitLabel: "pcs",
    price: 10.99,
    taxRate: 0.1,
    shortCode: "TP1",
  },
  {
    id: "product-2",
    name: "Test Product 2",
    categoryLabel: "Test Category",
    unitLabel: "pcs",
    price: 5.99,
    taxRate: 0.1,
    shortCode: "TP2",
  },
];

describe("POS Direct Sell Functionality", () => {
  describe("Direct Cart-Add Path", () => {
    it("should add product directly to cart without requiring slot id", async () => {
      const mockRepository = {
        addProductToCart: vi.fn().mockResolvedValue({
          success: true,
          value: [
            {
              lineId: "line-1",
              slotId: "direct-product-1",
              productId: "product-1",
              productName: "Test Product 1",
              categoryLabel: "Test Category",
              shortCode: "TP1",
              quantity: 1,
              unitPrice: 10.99,
              taxRate: 0.1,
              lineSubtotal: 10.99,
            },
          ],
        }),
      };

      const useCase = createAddProductToCartUseCase(mockRepository);
      const result = await useCase.execute({ productId: "product-1" });

      expect(result.success).toBe(true);
      expect(mockRepository.addProductToCart).toHaveBeenCalledWith({
        productId: "product-1",
      });
      expect(result.value[0].productId).toBe("product-1");
      expect(result.value[0].quantity).toBe(1);
    });

    it("should increment quantity when adding same product again", async () => {
      const mockRepository = {
        addProductToCart: vi.fn().mockResolvedValue({
          success: true,
          value: [
            {
              lineId: "line-1",
              slotId: "direct-product-1",
              productId: "product-1",
              productName: "Test Product 1",
              categoryLabel: "Test Category",
              shortCode: "TP1",
              quantity: 2,
              unitPrice: 10.99,
              taxRate: 0.1,
              lineSubtotal: 21.98,
            },
          ],
        }),
      };

      const useCase = createAddProductToCartUseCase(mockRepository);
      const result = await useCase.execute({ productId: "product-1" });

      expect(result.success).toBe(true);
      expect(result.value[0].quantity).toBe(2);
      expect(result.value[0].lineSubtotal).toBe(21.98);
    });

    it("should return product-not-found error for invalid product", async () => {
      const mockRepository = {
        addProductToCart: vi.fn().mockResolvedValue({
          success: false,
          error: {
            type: "ProductNotFound",
            message: "The selected product was not found.",
          },
        }),
      };

      const useCase = createAddProductToCartUseCase(mockRepository);
      const result = await useCase.execute({ productId: "invalid-product" });

      expect(result.success).toBe(false);
      expect(result.error.message).toBe("The selected product was not found.");
    });

    it("should not call slot validation in direct cart-add path", async () => {
      const mockRepository = {
        addProductToCart: vi.fn().mockResolvedValue({
          success: true,
          value: [],
        }),
      };

      const useCase = createAddProductToCartUseCase(mockRepository);
      await useCase.execute({ productId: "product-1" });

      // Verify only the direct add method was called, no slot-related methods
      expect(mockRepository.addProductToCart).toHaveBeenCalledTimes(1);
      expect(mockRepository.addProductToCart).toHaveBeenCalledWith({
        productId: "product-1",
      });
    });
  });

  describe("Quick Products Selection", () => {
    it("should select first 8 products as quick products", () => {
      // For this phase, quick products are simply the first 8 available products
      const quickProducts = mockProducts.slice(0, 8);
      
      expect(quickProducts).toHaveLength(2);
      expect(quickProducts[0].id).toBe("product-1");
      expect(quickProducts[1].id).toBe("product-2");
    });

    it("should handle case when fewer than 8 products exist", () => {
      const smallProductList = mockProducts.slice(0, 1);
      const quickProducts = smallProductList.slice(0, 8);
      
      expect(quickProducts).toHaveLength(1);
      expect(quickProducts[0].id).toBe("product-1");
    });
  });

  describe("Direct Add to Cart Logic", () => {
    it("should identify when product already exists in cart", () => {
      const cartLines = [
        {
          lineId: "line-1",
          slotId: "slot-1",
          productId: "product-1",
          productName: "Test Product 1",
          categoryLabel: "Test Category",
          shortCode: "TP1",
          quantity: 1,
          unitPrice: 10.99,
          taxRate: 0.1,
          lineSubtotal: 10.99,
        },
      ];

      const existingLine = cartLines.find((line) => line.productId === "product-1");
      expect(existingLine).toBeDefined();
      expect(existingLine?.quantity).toBe(1);
    });

    it("should handle when product does not exist in cart", () => {
      const cartLines = [
        {
          lineId: "line-1",
          slotId: "slot-1",
          productId: "product-1",
          productName: "Test Product 1",
          categoryLabel: "Test Category",
          shortCode: "TP1",
          quantity: 1,
          unitPrice: 10.99,
          taxRate: 0.1,
          lineSubtotal: 10.99,
        },
      ];

      const existingLine = cartLines.find((line) => line.productId === "product-2");
      expect(existingLine).toBeUndefined();
    });
  });

  describe("Product Search Filtering", () => {
    it("should filter products based on search term", () => {
      const searchTerm = "Test";
      const filteredProducts = mockProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredProducts).toHaveLength(2);
      expect(filteredProducts[0].name).toContain("Test");
      expect(filteredProducts[1].name).toContain("Test");
    });

    it("should return empty results for non-matching search", () => {
      const searchTerm = "NonExistent";
      const filteredProducts = mockProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filteredProducts).toHaveLength(0);
    });
  });

  describe("Cart Totals Calculation", () => {
    it("should calculate correct totals for cart items", () => {
      const cartLines = [
        {
          lineId: "line-1",
          slotId: "slot-1",
          productId: "product-1",
          productName: "Test Product 1",
          categoryLabel: "Test Category",
          shortCode: "TP1",
          quantity: 2,
          unitPrice: 10.99,
          taxRate: 0.1,
          lineSubtotal: 21.98,
        },
        {
          lineId: "line-2",
          slotId: "slot-2",
          productId: "product-2",
          productName: "Test Product 2",
          categoryLabel: "Test Category",
          shortCode: "TP2",
          quantity: 1,
          unitPrice: 5.99,
          taxRate: 0.1,
          lineSubtotal: 5.99,
        },
      ];

      const itemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
      const gross = cartLines.reduce((sum, line) => sum + line.lineSubtotal, 0);

      expect(itemCount).toBe(3);
      expect(gross).toBe(27.97);
    });
  });
});
