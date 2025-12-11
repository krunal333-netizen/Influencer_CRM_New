import { useState, useRef } from 'react';
import { Plus, Upload, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useProducts, ProductFilters } from '../hooks/useProducts';
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useImportProductsCsv,
} from '../hooks/useProducts';
import { Product } from '../types/models';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  asCode: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z
    .enum([
      'ELECTRONICS',
      'FASHION',
      'BEAUTY',
      'LIFESTYLE',
      'FITNESS',
      'HOME',
      'FOOD',
      'OTHER',
    ])
    .optional(),
  stock: z.coerce.number().min(0).optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  imageUrls: z.string().optional().nullable(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState('');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [importResults, setImportResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: response, isLoading, isError } = useProducts(filters);
  const products = response?.data || [];
  const pagination = response?.pagination;

  const { mutate: createProduct, isPending: isCreatePending } =
    useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdatePending } =
    useUpdateProduct();
  const { mutate: deleteProduct, isPending: isDeletePending } =
    useDeleteProduct();
  const { mutate: importCsv, isPending: isImportPending } =
    useImportProductsCsv();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: editingProduct
      ? {
          name: editingProduct.name,
          sku: editingProduct.sku,
          asCode: editingProduct.asCode || undefined,
          description: editingProduct.description || undefined,
          category: editingProduct.category,
          stock: editingProduct.stock || undefined,
          price: parseFloat(editingProduct.price),
          imageUrls: editingProduct.imageUrls?.join(', '),
        }
      : {},
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    handleFilterChange('search', value || undefined);
  };

  const onSubmit = (data: ProductFormData) => {
    const imageUrls = data.imageUrls
      ? data.imageUrls
          .split(',')
          .map((url) => url.trim())
          .filter(Boolean)
      : undefined;

    const payload = {
      ...data,
      imageUrls,
      price: data.price.toString(),
    };

    if (editingProduct) {
      updateProduct({ id: editingProduct.id, ...payload } as Product, {
        onSuccess: () => {
          handleCloseProductModal();
        },
      });
    } else {
      createProduct(
        payload as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
        {
          onSuccess: () => {
            handleCloseProductModal();
          },
        }
      );
    }
  };

  const handleCloseProductModal = () => {
    setEditingProduct(null);
    form.reset();
    setProductModalOpen(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importCsv(file, {
        onSuccess: (results) => {
          setImportResults(results);
        },
      });
    }
  };

  const ProductTable = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left font-semibold text-slate-900">
                Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">
                SKU
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">
                ASCode
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">
                Category
              </th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">
                Stock
              </th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">
                Price
              </th>
              <th className="px-4 py-3 text-center font-semibold text-slate-900">
                Campaigns
              </th>
              <th className="px-4 py-3 text-center font-semibold text-slate-900">
                Image
              </th>
              <th className="px-4 py-3 text-center font-semibold text-slate-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="px-4 py-3 text-slate-900 font-medium">
                  {product.name}
                </td>
                <td className="px-4 py-3 text-slate-600">{product.sku}</td>
                <td className="px-4 py-3 text-slate-600">
                  {product.asCode || '-'}
                </td>
                <td className="px-4 py-3">
                  {product.category ? (
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-800 rounded text-xs">
                      {product.category}
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">
                  {product.stock !== undefined && product.stock !== null
                    ? product.stock
                    : '-'}
                </td>
                <td className="px-4 py-3 text-right text-slate-600 font-medium">
                  ${parseFloat(product.price).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center text-slate-600">
                  {product.campaignProducts?.length || 0}
                </td>
                <td className="px-4 py-3 text-center">
                  {product.imageUrls && product.imageUrls.length > 0 ? (
                    <ImageIcon className="h-4 w-4 mx-auto text-blue-600" />
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setProductModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      disabled={isUpdatePending || isDeletePending}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      disabled={isDeletePending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.pages} ({pagination.total}{' '}
            total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleFilterChange('page', (filters.page || 1) - 1)
              }
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleFilterChange('page', (filters.page || 1) + 1)
              }
              disabled={pagination.page === pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Products</h2>
            <p className="text-slate-600">Manage your product catalog</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
            <Button
              onClick={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="grid gap-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Product name..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) =>
                    handleFilterChange('category', value || undefined)
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="ELECTRONICS">Electronics</SelectItem>
                    <SelectItem value="FASHION">Fashion</SelectItem>
                    <SelectItem value="BEAUTY">Beauty</SelectItem>
                    <SelectItem value="LIFESTYLE">Lifestyle</SelectItem>
                    <SelectItem value="FITNESS">Fitness</SelectItem>
                    <SelectItem value="HOME">Home</SelectItem>
                    <SelectItem value="FOOD">Food</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="limit">Results Per Page</Label>
                <Select
                  value={String(filters.limit || 10)}
                  onValueChange={(value) =>
                    handleFilterChange('limit', parseInt(value))
                  }
                >
                  <SelectTrigger id="limit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Products</CardTitle>
            <CardDescription>
              {pagination
                ? `${pagination.total} product${pagination.total !== 1 ? 's' : ''} total`
                : 'Loading products...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">
                Loading products...
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-red-600 bg-red-50 rounded-md">
                Error loading products
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No products found.</p>
                <p className="text-sm text-slate-400">
                  Try adjusting your filters or create a new product.
                </p>
              </div>
            ) : (
              <ProductTable />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Modal */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Update the product details below'
                : 'Create a new product'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="Product name"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input id="sku" placeholder="SKU" {...form.register('sku')} />
                  {form.formState.errors.sku && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.sku.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="asCode">ASCode</Label>
                  <Input
                    id="asCode"
                    placeholder="Alternative code"
                    {...form.register('asCode')}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Product description"
                  {...form.register('description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={form.watch('category') || ''}
                    onValueChange={(value) =>
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      form.setValue('category', value as any)
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ELECTRONICS">Electronics</SelectItem>
                      <SelectItem value="FASHION">Fashion</SelectItem>
                      <SelectItem value="BEAUTY">Beauty</SelectItem>
                      <SelectItem value="LIFESTYLE">Lifestyle</SelectItem>
                      <SelectItem value="FITNESS">Fitness</SelectItem>
                      <SelectItem value="HOME">Home</SelectItem>
                      <SelectItem value="FOOD">Food</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    {...form.register('stock')}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register('price')}
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="imageUrls">Image URLs</Label>
                <Input
                  id="imageUrls"
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  {...form.register('imageUrls')}
                />
                <p className="text-xs text-slate-500">
                  Comma-separated image URLs
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseProductModal}
                disabled={isCreatePending || isUpdatePending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatePending || isUpdatePending}
              >
                {isCreatePending || isUpdatePending
                  ? 'Saving...'
                  : editingProduct
                    ? 'Update Product'
                    : 'Create Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Products from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file with product data. Expected columns: name, sku,
              asCode, description, category, stock, price, imageUrls, metadata
            </DialogDescription>
          </DialogHeader>

          {!importResults ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImportPending}
                  className="text-slate-600 hover:text-slate-900 disabled:opacity-50"
                >
                  <Upload className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-slate-500">CSV files only</p>
                </button>
              </div>
              <Button
                onClick={() => setImportModalOpen(false)}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {importResults.successes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-green-700">
                    Successful Imports: {importResults.successes.length}
                  </h3>
                  <div className="space-y-1">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {importResults.successes.map(
                      (product: any, index: number) => (
                        <div
                          key={index}
                          className="text-sm p-2 bg-green-50 rounded text-green-700"
                        >
                          ✓ {product.name} ({product.sku})
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {importResults.errors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-red-700">
                    Errors: {importResults.errors.length}
                  </h3>
                  <div className="space-y-1">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {importResults.errors.map((error: any, index: number) => (
                      <div
                        key={index}
                        className="text-sm p-2 bg-red-50 rounded text-red-700"
                      >
                        ✗ Row {error.row}: {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  setImportResults(null);
                  setImportModalOpen(false);
                }}
                className="w-full"
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
